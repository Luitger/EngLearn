from flask import Flask, render_template, request, jsonify, session
from flask_cors import CORS
from datetime import datetime, timedelta
import hashlib
import secrets
import os
import sys

app = Flask(__name__)
app.secret_key = os.environ.get('SECRET_KEY', secrets.token_hex(32))
CORS(app, supports_credentials=True)

# Veritabanı seçimi
USE_POSTGRES = os.environ.get('USE_POSTGRES', 'false').lower() == 'true'

if USE_POSTGRES:
    import psycopg2
    from psycopg2.extras import RealDictCursor
    import psycopg2.pool
    
    # Connection pool
    db_pool = None
    
    def init_pool():
        global db_pool
        db_config = {
            'host': os.environ.get('DB_HOST', '/cloudsql/YOUR_PROJECT:us-central1:kelime-db'),
            'database': os.environ.get('DB_NAME', 'kelime_app'),
            'user': os.environ.get('DB_USER', 'kelime_user'),
            'password': os.environ.get('DB_PASSWORD', 'UserPassword123')
        }
        
        # Unix socket için
        if db_config['host'].startswith('/cloudsql/'):
            db_config['host'] = db_config['host']
        
        db_pool = psycopg2.pool.SimpleConnectionPool(1, 10, **db_config)
        print("✓ PostgreSQL pool oluşturuldu")
    
    def get_db():
        return db_pool.getconn()
    
    def return_db(conn):
        db_pool.putconn(conn)
else:
    import sqlite3
    # Cloud Run için /tmp kullan (ephemeral ama çalışır)
    DB_PATH = os.environ.get('DB_PATH', '/tmp/kelime_app.db')
    
    def get_db():
        conn = sqlite3.connect(DB_PATH)
        conn.row_factory = sqlite3.Row
        return conn
    
    def return_db(conn):
        conn.close()

def init_db():
    conn = get_db()
    
    if USE_POSTGRES:
        c = conn.cursor()
        
        c.execute('''CREATE TABLE IF NOT EXISTS users (
            id SERIAL PRIMARY KEY,
            username TEXT UNIQUE NOT NULL,
            password TEXT NOT NULL,
            email TEXT,
            avatar TEXT DEFAULT 'girl1',
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )''')
        
        c.execute('''CREATE TABLE IF NOT EXISTS learned_words (
            id SERIAL PRIMARY KEY,
            user_id INTEGER REFERENCES users(id),
            word_english TEXT,
            learned_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            review_count INTEGER DEFAULT 0,
            next_review TIMESTAMP,
            ease_factor REAL DEFAULT 2.5
        )''')
        
        c.execute('''CREATE TABLE IF NOT EXISTS test_results (
            id SERIAL PRIMARY KEY,
            user_id INTEGER REFERENCES users(id),
            score INTEGER,
            total_questions INTEGER,
            completed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )''')
        
        c.execute('''CREATE TABLE IF NOT EXISTS daily_activity (
            id SERIAL PRIMARY KEY,
            user_id INTEGER REFERENCES users(id),
            date DATE,
            words_learned INTEGER DEFAULT 0,
            tests_completed INTEGER DEFAULT 0,
            study_time INTEGER DEFAULT 0,
            UNIQUE(user_id, date)
        )''')
        
        conn.commit()
        print("✓ PostgreSQL veritabanı hazır")
    else:
        c = conn.cursor()
        
        c.execute('''CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            username TEXT UNIQUE NOT NULL,
            password TEXT NOT NULL,
            email TEXT,
            avatar TEXT DEFAULT 'girl1',
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )''')
        
        c.execute('''CREATE TABLE IF NOT EXISTS learned_words (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id INTEGER,
            word_english TEXT,
            learned_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            review_count INTEGER DEFAULT 0,
            next_review TIMESTAMP,
            ease_factor REAL DEFAULT 2.5,
            FOREIGN KEY (user_id) REFERENCES users(id)
        )''')
        
        c.execute('''CREATE TABLE IF NOT EXISTS test_results (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id INTEGER,
            score INTEGER,
            total_questions INTEGER,
            completed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (user_id) REFERENCES users(id)
        )''')
        
        c.execute('''CREATE TABLE IF NOT EXISTS daily_activity (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id INTEGER,
            date DATE,
            words_learned INTEGER DEFAULT 0,
            tests_completed INTEGER DEFAULT 0,
            study_time INTEGER DEFAULT 0,
            FOREIGN KEY (user_id) REFERENCES users(id),
            UNIQUE(user_id, date)
        )''')
        
        conn.commit()
        print("✓ SQLite veritabanı hazır")
    
    return_db(conn)

def hash_password(password):
    return hashlib.sha256(password.encode()).hexdigest()

def execute_query(query, params=(), fetch=False, fetchone=False):
    conn = get_db()
    try:
        if USE_POSTGRES:
            c = conn.cursor(cursor_factory=RealDictCursor)
            c.execute(query.replace('?', '%s'), params)
        else:
            c = conn.cursor()
            c.execute(query, params)
        
        if fetch:
            result = c.fetchall()
        elif fetchone:
            result = c.fetchone()
        else:
            result = c.lastrowid if not USE_POSTGRES else c.fetchone()
        
        conn.commit()
        return result
    except Exception as e:
        conn.rollback()
        print(f"Query error: {e}")
        raise
    finally:
        return_db(conn)

@app.route('/api/register', methods=['POST'])
def register():
    data = request.json
    username = data.get('username')
    password = data.get('password')
    email = data.get('email', '')
    avatar = data.get('avatar', 'girl1')
    
    if not username or not password:
        return jsonify({'success': False, 'message': 'Kullanıcı adı ve şifre gerekli'}), 400
    
    conn = get_db()
    try:
        if USE_POSTGRES:
            c = conn.cursor(cursor_factory=RealDictCursor)
            c.execute('INSERT INTO users (username, password, email, avatar) VALUES (%s, %s, %s, %s) RETURNING id',
                      (username, hash_password(password), email, avatar))
            user_id = c.fetchone()['id']
        else:
            c = conn.cursor()
            c.execute('INSERT INTO users (username, password, email, avatar) VALUES (?, ?, ?, ?)',
                      (username, hash_password(password), email, avatar))
            user_id = c.lastrowid
        
        conn.commit()
        session['user_id'] = user_id
        session['username'] = username
        session['avatar'] = avatar
        return jsonify({'success': True, 'message': 'Kayıt başarılı', 'user_id': user_id, 'avatar': avatar})
    except Exception as e:
        conn.rollback()
        return jsonify({'success': False, 'message': 'Bu kullanıcı adı zaten kullanılıyor'}), 400
    finally:
        return_db(conn)

@app.route('/api/login', methods=['POST'])
def login():
    data = request.json
    username = data.get('username')
    password = data.get('password')
    
    conn = get_db()
    try:
        if USE_POSTGRES:
            c = conn.cursor(cursor_factory=RealDictCursor)
            c.execute('SELECT id, username, avatar FROM users WHERE username = %s AND password = %s',
                      (username, hash_password(password)))
            user = c.fetchone()
        else:
            c = conn.cursor()
            c.execute('SELECT id, username, avatar FROM users WHERE username = ? AND password = ?',
                      (username, hash_password(password)))
            user = c.fetchone()
        
        if user:
            if USE_POSTGRES:
                session['user_id'] = user['id']
                session['username'] = user['username']
                session['avatar'] = user['avatar']
            else:
                session['user_id'] = user[0]
                session['username'] = user[1]
                session['avatar'] = user[2] if len(user) > 2 else 'girl1'
            
            return jsonify({'success': True, 'message': 'Giriş başarılı', 'username': session['username'], 'avatar': session['avatar']})
        else:
            return jsonify({'success': False, 'message': 'Kullanıcı adı veya şifre hatalı'}), 401
    finally:
        return_db(conn)

@app.route('/api/logout', methods=['POST'])
def logout():
    session.clear()
    return jsonify({'success': True, 'message': 'Çıkış yapıldı'})

@app.route('/api/user', methods=['GET'])
def get_user():
    if 'user_id' in session:
        return jsonify({
            'logged_in': True,
            'user_id': session['user_id'],
            'username': session['username'],
            'avatar': session.get('avatar', 'girl1')
        })
    return jsonify({'logged_in': False})

@app.route('/api/update-avatar', methods=['POST'])
def update_avatar():
    if 'user_id' not in session:
        return jsonify({'success': False, 'message': 'Giriş yapmalısınız'}), 401
    
    data = request.json
    avatar = data.get('avatar')
    user_id = session['user_id']
    
    conn = get_db()
    try:
        if USE_POSTGRES:
            c = conn.cursor()
            c.execute('UPDATE users SET avatar = %s WHERE id = %s', (avatar, user_id))
        else:
            c = conn.cursor()
            c.execute('UPDATE users SET avatar = ? WHERE id = ?', (avatar, user_id))
        
        conn.commit()
        session['avatar'] = avatar
        return jsonify({'success': True, 'message': 'Avatar güncellendi', 'avatar': avatar})
    finally:
        return_db(conn)

# Diğer endpoint'ler için aynı pattern...
# (Kısalık için sadece önemli kısımları gösterdim)

@app.route('/')
def index():
    return render_template('index.html')

if __name__ == '__main__':
    if USE_POSTGRES:
        init_pool()
    init_db()
    port = int(os.environ.get('PORT', 8080))
    print(f"🚀 Kelime Öğrenme Uygulaması")
    print(f"📊 Veritabanı: {'PostgreSQL' if USE_POSTGRES else 'SQLite'}")
    print(f"🌐 Port: {port}")
    app.run(debug=False, host='0.0.0.0', port=port)
else:
    # Gunicorn ile çalışırken
    if USE_POSTGRES:
        init_pool()
    init_db()
