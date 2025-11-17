// API Base URL
const API_URL = window.API_URL || 'http://localhost:5000/api';
window.API_URL = API_URL;

// API Helper Functions
const api = {
    // Kullanıcı kaydı
    async register(username, password, email = '', avatar = 'girl1') {
        const response = await fetch(`${API_URL}/register`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'include',
            body: JSON.stringify({ username, password, email, avatar })
        });
        return await response.json();
    },

    // Kullanıcı girişi
    async login(username, password) {
        const response = await fetch(`${API_URL}/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'include',
            body: JSON.stringify({ username, password })
        });
        return await response.json();
    },

    // Çıkış
    async logout() {
        const response = await fetch(`${API_URL}/logout`, {
            method: 'POST',
            credentials: 'include'
        });
        return await response.json();
    },

    // Mevcut kullanıcı bilgisi
    async getUser() {
        const response = await fetch(`${API_URL}/user`, {
            credentials: 'include'
        });
        return await response.json();
    },

    // Kelime öğrenildi olarak işaretle
    async learnWord(word) {
        const response = await fetch(`${API_URL}/learn-word`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'include',
            body: JSON.stringify({ word })
        });
        return await response.json();
    },

    // Öğrenilen kelimeleri getir
    async getLearnedWords() {
        const response = await fetch(`${API_URL}/learned-words`, {
            credentials: 'include'
        });
        return await response.json();
    },

    // Tekrar edilmesi gereken kelimeleri getir
    async getReviewWords() {
        const response = await fetch(`${API_URL}/review-words`, {
            credentials: 'include'
        });
        return await response.json();
    },

    // Test sonucunu kaydet
    async saveTest(score, total) {
        const response = await fetch(`${API_URL}/save-test`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'include',
            body: JSON.stringify({ score, total })
        });
        return await response.json();
    },

    // İstatistikleri getir
    async getStats() {
        const response = await fetch(`${API_URL}/stats`, {
            credentials: 'include'
        });
        return await response.json();
    },

    // Liderlik tablosunu getir
    async getLeaderboard() {
        const response = await fetch(`${API_URL}/leaderboard`, {
            credentials: 'include'
        });
        return await response.json();
    },

    // Avatar güncelle
    async updateAvatar(avatar) {
        const response = await fetch(`${API_URL}/update-avatar`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'include',
            body: JSON.stringify({ avatar })
        });
        return await response.json();
    }
};

// Kullanıcı durumunu kontrol et
async function checkUserStatus() {
    const user = await api.getUser();
    if (user.logged_in) {
        showUserInfo(user);
        loadUserStats();
    } else {
        showLoginPrompt();
    }
}

// Kullanıcı bilgilerini göster
function showUserInfo(user) {
    const userInfoDiv = document.getElementById('userInfo');
    if (userInfoDiv) {
        userInfoDiv.innerHTML = `
            <div class="avatar-container">
                <span style="font-weight: 600; color: var(--md-primary); font-size: 1.1rem;">${user.username}</span>
            </div>
        `;
    }
    
    // Avatar menüsünü göster
    const avatarMenuContainer = document.getElementById('avatarMenuContainer');
    const avatarImage = document.getElementById('avatarImage');
    if (avatarMenuContainer && avatarImage) {
        avatarMenuContainer.style.display = 'block';
        avatarImage.src = `/static/avatars/${user.avatar || 'girl1'}.png`;
    }
    
    // Liderlik tablosunu göster
    const leaderboardSidebar = document.getElementById('leaderboardSidebar');
    if (leaderboardSidebar) {
        leaderboardSidebar.style.display = 'block';
    }
    
    // Kelime öğrenme arayüzünü göster
    showWordLearningInterface();
}

// Giriş istemi göster
function showLoginPrompt() {
    const userInfoDiv = document.getElementById('userInfo');
    if (userInfoDiv) {
        // Header'ı temiz tut, butonlar welcome ekranında
        userInfoDiv.innerHTML = '';
    }
    
    // Avatar menüsünü gizle
    const avatarMenuContainer = document.getElementById('avatarMenuContainer');
    if (avatarMenuContainer) {
        avatarMenuContainer.style.display = 'none';
    }
    
    // Liderlik tablosunu gizle
    const leaderboardSidebar = document.getElementById('leaderboardSidebar');
    if (leaderboardSidebar) {
        leaderboardSidebar.style.display = 'none';
    }
    
    // Kelime öğrenme arayüzünü gizle
    hideWordLearningInterface();
}

// Kelime öğrenme arayüzünü gizle
function hideWordLearningInterface() {
    const cardContainer = document.querySelector('.card-container');
    const controls = document.querySelector('.controls');
    const welcomeMessage = document.getElementById('welcomeMessage');
    const userStats = document.getElementById('userStats');
    
    if (cardContainer) cardContainer.style.display = 'none';
    if (controls) controls.style.display = 'none';
    if (welcomeMessage) welcomeMessage.style.display = 'block';
    if (userStats) userStats.style.display = 'none';
}

// Kelime öğrenme arayüzünü göster
function showWordLearningInterface() {
    const cardContainer = document.querySelector('.card-container');
    const controls = document.querySelector('.controls');
    const welcomeMessage = document.getElementById('welcomeMessage');
    const userStats = document.getElementById('userStats');
    
    if (cardContainer) cardContainer.style.display = 'block';
    if (controls) controls.style.display = 'flex';
    if (welcomeMessage) welcomeMessage.style.display = 'none';
    if (userStats) userStats.style.display = 'flex';
}

// Kullanıcı istatistiklerini yükle
async function loadUserStats() {
    const stats = await api.getStats();
    if (stats.success) {
        updateStatsDisplay(stats);
    }
}

// İstatistikleri güncelle
function updateStatsDisplay(stats) {
    const statsDiv = document.getElementById('userStats');
    if (statsDiv) {
        statsDiv.innerHTML = `
            <div class="stat-card">
                <div class="stat-number">${stats.total_tests}</div>
                <div class="stat-label">Tamamlanan Test</div>
            </div>
            <div class="stat-card">
                <div class="stat-number">%${stats.avg_score}</div>
                <div class="stat-label">Ortalama Başarı</div>
            </div>
        `;
    }
}

// Çıkış işlemi (global)
window.handleLogout = async function() {
    const result = await api.logout();
    if (result.success) {
        location.reload();
    }
}

// Sayfa yüklendiğinde kullanıcı durumunu kontrol et
if (typeof window !== 'undefined') {
    window.addEventListener('DOMContentLoaded', checkUserStatus);
}
