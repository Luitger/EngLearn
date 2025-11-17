from flask import Flask, render_template, request, jsonify, session
from flask_cors import CORS
from datetime import datetime, timedelta
import sqlite3
import hashlib
import secrets
import json
import os

app = Flask(__name__)

# Cloud Run için secret key (environment variable'dan al veya oluştur)
app.secret_key = os.environ.get('SECRET_KEY', secrets.token_hex(32))

# CORS ayarları
CORS(app, supports_credentials=True)

# Veritabanı yolu
DB_PATH = 'kelime_app.db'  # Basit yol, her yerde çalışır

# Veritabanı bağlantısı
def get_db_connection():
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    return conn

# Veritabanı başlatma
def init_db():
    conn = sqlite3.connect(DB_PATH)
    c = conn.cursor()
    
    # Kullanıcılar tablosu
    c.execute('''CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        username TEXT UNIQUE NOT NULL,
        password TEXT NOT NULL,
        email TEXT,
        avatar TEXT DEFAULT 'girl1',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )''')
    
    # Öğrenilen kelimeler
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
    
    # Test sonuçları
    c.execute('''CREATE TABLE IF NOT EXISTS test_results (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER,
        score INTEGER,
        total_questions INTEGER,
        completed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id)
    )''')
    
    # Günlük aktivite
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
    conn.close()

# Şifre hashleme
def hash_password(password):
    return hashlib.sha256(password.encode()).hexdigest()

# Kullanıcı kaydı
@app.route('/api/register', methods=['POST'])
def register():
    data = request.json
    username = data.get('username')
    password = data.get('password')
    email = data.get('email', '')
    avatar = data.get('avatar', 'girl1')
    
    if not username or not password:
        return jsonify({'success': False, 'message': 'Kullanıcı adı ve şifre gerekli'}), 400
    
    conn = get_db_connection()
    c = conn.cursor()
    
    try:
        c.execute('INSERT INTO users (username, password, email, avatar) VALUES (?, ?, ?, ?)',
                  (username, hash_password(password), email, avatar))
        conn.commit()
        user_id = c.lastrowid
        session['user_id'] = user_id
        session['username'] = username
        session['avatar'] = avatar
        return jsonify({'success': True, 'message': 'Kayıt başarılı', 'user_id': user_id, 'avatar': avatar})
    except sqlite3.IntegrityError:
        return jsonify({'success': False, 'message': 'Bu kullanıcı adı zaten kullanılıyor'}), 400
    finally:
        conn.close()

# Kullanıcı girişi
@app.route('/api/login', methods=['POST'])
def login():
    data = request.json
    username = data.get('username')
    password = data.get('password')
    
    conn = get_db_connection()
    c = conn.cursor()
    
    c.execute('SELECT id, username, avatar FROM users WHERE username = ? AND password = ?',
              (username, hash_password(password)))
    user = c.fetchone()
    conn.close()
    
    if user:
        session['user_id'] = user[0]
        session['username'] = user[1]
        session['avatar'] = user[2] if len(user) > 2 else 'girl1'
        return jsonify({'success': True, 'message': 'Giriş başarılı', 'username': user[1], 'avatar': session['avatar']})
    else:
        return jsonify({'success': False, 'message': 'Kullanıcı adı veya şifre hatalı'}), 401

# Çıkış
@app.route('/api/logout', methods=['POST'])
def logout():
    session.clear()
    return jsonify({'success': True, 'message': 'Çıkış yapıldı'})

# Mevcut kullanıcı bilgisi
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

# Avatar güncelleme
@app.route('/api/update-avatar', methods=['POST'])
def update_avatar():
    if 'user_id' not in session:
        return jsonify({'success': False, 'message': 'Giriş yapmalısınız'}), 401
    
    data = request.json
    avatar = data.get('avatar')
    user_id = session['user_id']
    
    conn = get_db_connection()
    c = conn.cursor()
    
    c.execute('UPDATE users SET avatar = ? WHERE id = ?', (avatar, user_id))
    conn.commit()
    conn.close()
    
    session['avatar'] = avatar
    return jsonify({'success': True, 'message': 'Avatar güncellendi', 'avatar': avatar})

# Kelime öğrenildi olarak işaretle (Spaced Repetition)
@app.route('/api/learn-word', methods=['POST'])
def learn_word():
    if 'user_id' not in session:
        return jsonify({'success': False, 'message': 'Giriş yapmalısınız'}), 401
    
    data = request.json
    word_english = data.get('word')
    user_id = session['user_id']
    
    conn = get_db_connection()
    c = conn.cursor()
    
    # Kelime daha önce öğrenilmiş mi kontrol et
    c.execute('SELECT id, review_count, ease_factor FROM learned_words WHERE user_id = ? AND word_english = ?',
              (user_id, word_english))
    existing = c.fetchone()
    
    if existing:
        # Spaced Repetition algoritması (SM-2)
        review_count = existing[1] + 1
        ease_factor = existing[2]
        
        # Bir sonraki tekrar zamanını hesapla
        if review_count == 1:
            interval = 1  # 1 gün
        elif review_count == 2:
            interval = 6  # 6 gün
        else:
            interval = int(interval * ease_factor)
        
        next_review = datetime.now() + timedelta(days=interval)
        
        c.execute('UPDATE learned_words SET review_count = ?, next_review = ?, ease_factor = ? WHERE id = ?',
                  (review_count, next_review, ease_factor, existing[0]))
    else:
        # Yeni kelime ekle
        next_review = datetime.now() + timedelta(days=1)
        c.execute('INSERT INTO learned_words (user_id, word_english, next_review) VALUES (?, ?, ?)',
                  (user_id, word_english, next_review))
        
        # Günlük aktiviteyi güncelle
        today = datetime.now().date()
        c.execute('''INSERT INTO daily_activity (user_id, date, words_learned) 
                     VALUES (?, ?, 1)
                     ON CONFLICT(user_id, date) 
                     DO UPDATE SET words_learned = words_learned + 1''',
                  (user_id, today))
    
    conn.commit()
    conn.close()
    
    return jsonify({'success': True, 'message': 'Kelime kaydedildi'})

# Öğrenilen kelimeleri getir
@app.route('/api/learned-words', methods=['GET'])
def get_learned_words():
    if 'user_id' not in session:
        return jsonify({'success': False, 'message': 'Giriş yapmalısınız'}), 401
    
    user_id = session['user_id']
    conn = get_db_connection()
    c = conn.cursor()
    
    c.execute('''SELECT word_english, learned_at, review_count, next_review 
                 FROM learned_words 
                 WHERE user_id = ? 
                 ORDER BY learned_at DESC''', (user_id,))
    
    words = []
    for row in c.fetchall():
        words.append({
            'word': row[0],
            'learned_at': row[1],
            'review_count': row[2],
            'next_review': row[3]
        })
    
    conn.close()
    return jsonify({'success': True, 'words': words})

# Tekrar edilmesi gereken kelimeleri getir
@app.route('/api/review-words', methods=['GET'])
def get_review_words():
    if 'user_id' not in session:
        return jsonify({'success': False, 'message': 'Giriş yapmalısınız'}), 401
    
    user_id = session['user_id']
    conn = get_db_connection()
    c = conn.cursor()
    
    now = datetime.now()
    c.execute('''SELECT word_english, next_review 
                 FROM learned_words 
                 WHERE user_id = ? AND next_review <= ? 
                 ORDER BY next_review ASC''', (user_id, now))
    
    words = [{'word': row[0], 'next_review': row[1]} for row in c.fetchall()]
    
    conn.close()
    return jsonify({'success': True, 'words': words, 'count': len(words)})

# Test sonucunu kaydet
@app.route('/api/save-test', methods=['POST'])
def save_test():
    if 'user_id' not in session:
        return jsonify({'success': False, 'message': 'Giriş yapmalısınız'}), 401
    
    data = request.json
    score = data.get('score')
    total = data.get('total')
    user_id = session['user_id']
    
    conn = get_db_connection()
    c = conn.cursor()
    
    c.execute('INSERT INTO test_results (user_id, score, total_questions) VALUES (?, ?, ?)',
              (user_id, score, total))
    
    # Günlük aktiviteyi güncelle
    today = datetime.now().date()
    c.execute('''INSERT INTO daily_activity (user_id, date, tests_completed) 
                 VALUES (?, ?, 1)
                 ON CONFLICT(user_id, date) 
                 DO UPDATE SET tests_completed = tests_completed + 1''',
              (user_id, today))
    
    conn.commit()
    conn.close()
    
    return jsonify({'success': True, 'message': 'Test sonucu kaydedildi'})

# İstatistikler
@app.route('/api/stats', methods=['GET'])
def get_stats():
    if 'user_id' not in session:
        return jsonify({'success': False, 'message': 'Giriş yapmalısınız'}), 401
    
    user_id = session['user_id']
    conn = get_db_connection()
    c = conn.cursor()
    
    # Toplam öğrenilen kelime
    c.execute('SELECT COUNT(*) FROM learned_words WHERE user_id = ?', (user_id,))
    total_words = c.fetchone()[0]
    
    # Toplam test sayısı
    c.execute('SELECT COUNT(*) FROM test_results WHERE user_id = ?', (user_id,))
    total_tests = c.fetchone()[0]
    
    # Ortalama test skoru
    c.execute('SELECT AVG(CAST(score AS FLOAT) / total_questions * 100) FROM test_results WHERE user_id = ?', (user_id,))
    avg_score = c.fetchone()[0] or 0
    
    # Son 7 günlük aktivite
    seven_days_ago = (datetime.now() - timedelta(days=7)).date()
    c.execute('''SELECT date, words_learned, tests_completed 
                 FROM daily_activity 
                 WHERE user_id = ? AND date >= ? 
                 ORDER BY date DESC''', (user_id, seven_days_ago))
    
    daily_stats = []
    for row in c.fetchall():
        daily_stats.append({
            'date': row[0],
            'words_learned': row[1],
            'tests_completed': row[2]
        })
    
    # Günlük seri (streak)
    c.execute('''SELECT date FROM daily_activity 
                 WHERE user_id = ? 
                 ORDER BY date DESC''', (user_id,))
    
    dates = [row[0] for row in c.fetchall()]
    streak = 0
    if dates:
        current_date = datetime.now().date()
        for date_str in dates:
            date = datetime.strptime(date_str, '%Y-%m-%d').date()
            if date == current_date or date == current_date - timedelta(days=streak):
                streak += 1
                current_date = date
            else:
                break
    
    conn.close()
    
    return jsonify({
        'success': True,
        'total_words': total_words,
        'total_tests': total_tests,
        'avg_score': round(avg_score, 1),
        'streak': streak,
        'daily_stats': daily_stats
    })

# Liderlik tablosu
@app.route('/api/leaderboard', methods=['GET'])
def get_leaderboard():
    conn = get_db_connection()
    c = conn.cursor()
    
    c.execute('''SELECT u.username, COUNT(lw.id) as word_count, 
                 AVG(CAST(tr.score AS FLOAT) / tr.total_questions * 100) as avg_score
                 FROM users u
                 LEFT JOIN learned_words lw ON u.id = lw.user_id
                 LEFT JOIN test_results tr ON u.id = tr.user_id
                 GROUP BY u.id
                 ORDER BY word_count DESC, avg_score DESC
                 LIMIT 10''')
    
    leaderboard = []
    for i, row in enumerate(c.fetchall(), 1):
        leaderboard.append({
            'rank': i,
            'username': row[0],
            'words_learned': row[1],
            'avg_score': round(row[2] or 0, 1)
        })
    
    conn.close()
    return jsonify({'success': True, 'leaderboard': leaderboard})

# Ana sayfa
@app.route('/')
def index():
    return render_template('index.html')

if __name__ == '__main__':
    init_db()
    port = int(os.environ.get('PORT', 5000))
    print("� Kelitme Öğrenme Uygulaması Başlatılıyor...")
    print(f"📊 Veritabanı: {DB_PATH}")
    print(f"🌐 Port: {port}")
    app.run(debug=False, host='0.0.0.0', port=port)

# Cloud Run için veritabanını başlat
init_db()

