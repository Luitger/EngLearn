from flask import Flask, render_template
from flask_cors import CORS
import os

app = Flask(__name__)
CORS(app)

@app.route('/')
def index():
    return render_template('index.html')

if __name__ == '__main__':
    port = int(os.environ.get('PORT', 8080))
    print(f"🚀 Kelime Öğrenme Uygulaması")
    print(f"🌐 Port: {port}")
    app.run(debug=False, host='0.0.0.0', port=port)
