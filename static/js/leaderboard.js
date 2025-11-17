// Liderlik Tablosu Yönetimi

async function loadSidebarLeaderboard() {
    const container = document.getElementById('sidebarLeaderboard');
    if (!container) return;
    
    try {
        const result = await api.getLeaderboard();
        
        if (result.success && result.leaderboard && result.leaderboard.length > 0) {
            container.innerHTML = result.leaderboard.map((user, index) => {
                const rankClass = index === 0 ? 'top-1' : index === 1 ? 'top-2' : index === 2 ? 'top-3' : '';
                const medal = index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : '';
                
                return `
                    <div class="leaderboard-item">
                        <div class="leaderboard-rank ${rankClass}">
                            ${medal || user.rank}
                        </div>
                        <div class="leaderboard-info">
                            <div class="leaderboard-name">${user.username}</div>
                            <div class="leaderboard-stats">
                                <span>📚 ${user.words_learned}</span>
                                <span>✨ %${user.avg_score}</span>
                            </div>
                        </div>
                    </div>
                `;
            }).join('');
        } else {
            container.innerHTML = `
                <div class="leaderboard-empty">
                    <div style="font-size: 3rem; margin-bottom: 10px;">👻</div>
                    <div>Henüz kimse yok!</div>
                    <div style="font-size: 0.9rem; margin-top: 8px;">İlk sen ol!</div>
                </div>
            `;
        }
    } catch (error) {
        console.error('Liderlik tablosu yüklenemedi:', error);
        container.innerHTML = `
            <div class="leaderboard-empty">
                <div style="font-size: 2rem; margin-bottom: 10px;">⚠️</div>
                <div>Yüklenemedi</div>
            </div>
        `;
    }
}

// Sayfa yüklendiğinde ve her 30 saniyede bir güncelle
if (typeof window !== 'undefined') {
    window.addEventListener('DOMContentLoaded', () => {
        loadSidebarLeaderboard();
        
        // Her 30 saniyede bir güncelle
        setInterval(loadSidebarLeaderboard, 30000);
    });
}

// Global fonksiyon olarak export et
window.loadSidebarLeaderboard = loadSidebarLeaderboard;
