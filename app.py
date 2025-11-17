from flask import Flask, render_template, request, jsonify, redirect, url_for
from flask_cors import CORS
import sqlite3
import hashlib
import os
from datetime import datetime

app = Flask(__name__)
CORS(app)

# SQLite veritabanı yolu
DB_PATH = '/tmp/users.db'

def init_db():
    """Veritabanını otomatik oluştur"""
    conn = sqlite3.connect(DB_PATH)
    c = conn.cursor()
    
    c.execute('''CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        username TEXT UNIQUE NOT NULL,
        email TEXT,
        password TEXT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )''')
    
    conn.commit()
    conn.close()
    print("✓ Veritabanı hazır")

def hash_password(password):
    return hashlib.sha256(password.encode()).hexdigest()

@app.route('/')
def index():
    return render_template('users.html')

@app.route('/api/users', methods=['GET'])
def get_users():
    """Tüm kullanıcıları listele"""
    conn = sqlite3.connect(DB_PATH)
    c = conn.cursor()
    c.execute('SELECT id, username, email, created_at FROM users ORDER BY created_at DESC')
    users = [{'id': row[0], 'username': row[1], 'email': row[2], 'created_at': row[3]} for row in c.fetchall()]
    conn.close()
    return jsonify({'success': True, 'users': users})

@app.route('/api/users', methods=['POST'])
def add_user():
    """Yeni kullanıcı ekle"""
    data = request.json
    username = data.get('username')
    email = data.get('email', '')
    password = data.get('password')
    
    if not username or not password:
        return jsonify({'success': False, 'message': 'Kullanıcı adı ve şifre gerekli'}), 400
    
    try:
        conn = sqlite3.connect(DB_PATH)
        c = conn.cursor()
        c.execute('INSERT INTO users (username, email, password) VALUES (?, ?, ?)',
                  (username, email, hash_password(password)))
        conn.commit()
        user_id = c.lastrowid
        conn.close()
        return jsonify({'success': True, 'message': 'Kullanıcı eklendi', 'user_id': user_id})
    except sqlite3.IntegrityError:
        return jsonify({'success': False, 'message': 'Bu kullanıcı adı zaten var'}), 400

@app.route('/api/users/<int:user_id>', methods=['DELETE'])
def delete_user(user_id):
    """Kullanıcı sil"""
    conn = sqlite3.connect(DB_PATH)
    c = conn.cursor()
    c.execute('DELETE FROM users WHERE id = ?', (user_id,))
    conn.commit()
    deleted = c.rowcount > 0
    conn.close()
    
    if deleted:
        return jsonify({'success': True, 'message': 'Kullanıcı silindi'})
    return jsonify({'success': False, 'message': 'Kullanıcı bulunamadı'}), 404

@app.route('/api/login', methods=['POST'])
def login():
    """Kullanıcı girişi"""
    data = request.json
    username = data.get('username')
    password = data.get('password')
    
    conn = sqlite3.connect(DB_PATH)
    c = conn.cursor()
    c.execute('SELECT id, username, email FROM users WHERE username = ? AND password = ?',
              (username, hash_password(password)))
    user = c.fetchone()
    conn.close()
    
    if user:
        return jsonify({'success': True, 'message': 'Giriş başarılı', 
                       'user': {'id': user[0], 'username': user[1], 'email': user[2]}})
    return jsonify({'success': False, 'message': 'Kullanıcı adı veya şifre hatalı'}), 401

if __name__ == '__main__':
    init_db()
    port = int(os.environ.get('PORT', 8080))
    print(f"🚀 Kullanıcı Yönetim Sistemi")
    print(f"🌐 Port: {port}")
    app.run(debug=False, host='0.0.0.0', port=port)
else:
    init_db()
