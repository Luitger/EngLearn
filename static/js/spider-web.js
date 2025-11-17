// Gelişmiş Örümcek Ağı Animasyonu
class SpiderWeb {
    static instance = null;
    constructor(canvasId) {
        this.canvas = document.getElementById(canvasId);
        this.ctx = this.canvas.getContext('2d');
        this.webs = [];
        this.particles = [];
        this.mousePos = { x: 0, y: 0 };
        this.touchPos = { x: 0, y: 0 };
        this.isTouch = false;
        
        this.resize();
        this.init();
        this.setupEventListeners();
        this.animate();
    }
    
    resize() {
        this.canvas.width = window.innerWidth;
        this.canvas.height = window.innerHeight;
    }
    
    init() {
        // Sadece sol üst köşede örümcek ağı oluştur
        const corner = { x: 0, y: 0, angle: Math.PI * 0.25 };
        this.createWeb(corner);
    }
    
    createWeb(corner) {
        const web = {
            center: { x: corner.x, y: corner.y },
            baseAngle: corner.angle,
            radialLines: [],
            circularLines: [],
            particles: [],
            regenerateTime: 0,
            opacity: 1,
            broken: false
        };
        
        // Radyal çizgiler (merkez noktadan dışarı)
        const numRadial = 12;
        const maxRadius = 200;
        
        for (let i = 0; i < numRadial; i++) {
            const angle = (Math.PI * 2 / numRadial) * i + corner.angle;
            const line = {
                angle: angle,
                points: [],
                broken: false,
                opacity: 1
            };
            
            // Her radyal çizgide noktalar oluştur
            for (let r = 20; r <= maxRadius; r += 20) {
                line.points.push({
                    x: corner.x + Math.cos(angle) * r,
                    y: corner.y + Math.sin(angle) * r,
                    radius: r,
                    broken: false,
                    wobble: Math.random() * Math.PI * 2,
                    wobbleSpeed: 0.02 + Math.random() * 0.03
                });
            }
            
            web.radialLines.push(line);
        }
        
        // Dairesel çizgiler (halka halka)
        const numCircular = 10;
        for (let i = 1; i <= numCircular; i++) {
            const radius = (maxRadius / numCircular) * i;
            const circle = {
                radius: radius,
                segments: [],
                broken: false,
                opacity: 1
            };
            
            // Her daireyi segmentlere böl
            const numSegments = 36;
            for (let j = 0; j < numSegments; j++) {
                const angle = (Math.PI * 2 / numSegments) * j + corner.angle;
                circle.segments.push({
                    angle: angle,
                    x: corner.x + Math.cos(angle) * radius,
                    y: corner.y + Math.sin(angle) * radius,
                    broken: false,
                    wobble: Math.random() * Math.PI * 2,
                    wobbleSpeed: 0.01 + Math.random() * 0.02
                });
            }
            
            web.circularLines.push(circle);
        }
        
        // Merkeze örümcek ekle
        web.spider = {
            x: corner.x,
            y: corner.y,
            size: 4,
            legs: []
        };
        
        // Örümcek bacakları
        for (let i = 0; i < 8; i++) {
            const angle = (Math.PI * 2 / 8) * i;
            web.spider.legs.push({
                angle: angle,
                length: 8,
                wobble: Math.random() * Math.PI * 2
            });
        }
        
        this.webs.push(web);
    }
    
    setupEventListeners() {
        window.addEventListener('resize', () => {
            this.resize();
            this.webs = [];
            this.init();
        });
        
        // Fare hareketi - window'dan dinle
        window.addEventListener('mousemove', (e) => {
            this.mousePos = { x: e.clientX, y: e.clientY };
            this.isTouch = false;
            this.checkWebInteraction(this.mousePos);
        });
        
        // Dokunmatik destek - window'dan dinle
        window.addEventListener('touchmove', (e) => {
            if (e.touches.length > 0) {
                const touch = e.touches[0];
                this.touchPos = { x: touch.clientX, y: touch.clientY };
                this.isTouch = true;
                this.checkWebInteraction(this.touchPos);
            }
        }, { passive: true });
        
        window.addEventListener('touchstart', (e) => {
            if (e.touches.length > 0) {
                const touch = e.touches[0];
                this.touchPos = { x: touch.clientX, y: touch.clientY };
                this.isTouch = true;
            }
        }, { passive: true });
    }
    
    checkWebInteraction(pos) {
        this.webs.forEach(web => {
            if (web.broken) return;
            
            const dist = Math.hypot(pos.x - web.center.x, pos.y - web.center.y);
            
            // Ağa yakınsa iplikler kopsun
            if (dist < 200) {
                const breakChance = 1 - (dist / 200);
                
                // Radyal çizgileri kır
                web.radialLines.forEach(line => {
                    line.points.forEach(point => {
                        const pointDist = Math.hypot(pos.x - point.x, pos.y - point.y);
                        if (pointDist < 30 && Math.random() < breakChance * 0.5) {
                            point.broken = true;
                            this.createBreakParticles(point.x, point.y);
                        }
                    });
                });
                
                // Dairesel çizgileri kır
                web.circularLines.forEach(circle => {
                    circle.segments.forEach(segment => {
                        const segDist = Math.hypot(pos.x - segment.x, pos.y - segment.y);
                        if (segDist < 30 && Math.random() < breakChance * 0.5) {
                            segment.broken = true;
                            this.createBreakParticles(segment.x, segment.y);
                        }
                    });
                });
                
                // Çok fazla kopma varsa ağı yeniden oluştur
                const totalPoints = web.radialLines.reduce((sum, line) => 
                    sum + line.points.filter(p => p.broken).length, 0);
                const totalSegments = web.circularLines.reduce((sum, circle) => 
                    sum + circle.segments.filter(s => s.broken).length, 0);
                
                if (totalPoints + totalSegments > 50) {
                    web.broken = true;
                    web.regenerateTime = Date.now() + 2000 + Math.random() * 2000;
                }
            }
        });
    }
    
    createBreakParticles(x, y) {
        for (let i = 0; i < 3; i++) {
            this.particles.push({
                x: x,
                y: y,
                vx: (Math.random() - 0.5) * 2,
                vy: (Math.random() - 0.5) * 2,
                life: 1,
                decay: 0.02
            });
        }
    }
    
    regenerateWebs() {
        const now = Date.now();
        this.webs.forEach((web, index) => {
            if (web.broken && now >= web.regenerateTime) {
                // Eski ağı sil ve yenisini oluştur
                const corner = {
                    x: web.center.x,
                    y: web.center.y,
                    angle: web.baseAngle
                };
                this.webs[index] = this.createWebObject(corner);
            }
        });
    }
    
    createWebObject(corner) {
        const web = {
            center: { x: corner.x, y: corner.y },
            baseAngle: corner.angle,
            radialLines: [],
            circularLines: [],
            particles: [],
            regenerateTime: 0,
            opacity: 1,
            broken: false
        };
        
        const numRadial = 12;
        const maxRadius = 200;
        
        for (let i = 0; i < numRadial; i++) {
            const angle = (Math.PI * 2 / numRadial) * i + corner.angle;
            const line = {
                angle: angle,
                points: [],
                broken: false,
                opacity: 1
            };
            
            for (let r = 20; r <= maxRadius; r += 20) {
                line.points.push({
                    x: corner.x + Math.cos(angle) * r,
                    y: corner.y + Math.sin(angle) * r,
                    radius: r,
                    broken: false,
                    wobble: Math.random() * Math.PI * 2,
                    wobbleSpeed: 0.02 + Math.random() * 0.03
                });
            }
            
            web.radialLines.push(line);
        }
        
        const numCircular = 10;
        for (let i = 1; i <= numCircular; i++) {
            const radius = (maxRadius / numCircular) * i;
            const circle = {
                radius: radius,
                segments: [],
                broken: false,
                opacity: 1
            };
            
            const numSegments = 36;
            for (let j = 0; j < numSegments; j++) {
                const angle = (Math.PI * 2 / numSegments) * j + corner.angle;
                circle.segments.push({
                    angle: angle,
                    x: corner.x + Math.cos(angle) * radius,
                    y: corner.y + Math.sin(angle) * radius,
                    broken: false,
                    wobble: Math.random() * Math.PI * 2,
                    wobbleSpeed: 0.01 + Math.random() * 0.02
                });
            }
            
            web.circularLines.push(circle);
        }
        
        web.spider = {
            x: corner.x,
            y: corner.y,
            size: 4,
            legs: []
        };
        
        for (let i = 0; i < 8; i++) {
            const angle = (Math.PI * 2 / 8) * i;
            web.spider.legs.push({
                angle: angle,
                length: 8,
                wobble: Math.random() * Math.PI * 2
            });
        }
        
        return web;
    }
    
    draw() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        
        // Ağları çiz
        this.webs.forEach(web => {
            if (web.broken) return;
            
            const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
            const webColor = isDark ? 'rgba(200, 200, 200, 0.15)' : 'rgba(150, 150, 150, 0.2)';
            const glowColor = isDark ? 'rgba(200, 200, 200, 0.05)' : 'rgba(150, 150, 150, 0.1)';
            
            // Radyal çizgileri çiz
            web.radialLines.forEach(line => {
                this.ctx.beginPath();
                let firstPoint = true;
                
                line.points.forEach((point, i) => {
                    if (point.broken) {
                        firstPoint = true;
                        return;
                    }
                    
                    // Hafif sallanma efekti
                    point.wobble += point.wobbleSpeed;
                    const wobbleX = Math.sin(point.wobble) * 0.5;
                    const wobbleY = Math.cos(point.wobble) * 0.5;
                    
                    const x = point.x + wobbleX;
                    const y = point.y + wobbleY;
                    
                    if (firstPoint) {
                        this.ctx.moveTo(x, y);
                        firstPoint = false;
                    } else {
                        this.ctx.lineTo(x, y);
                    }
                });
                
                this.ctx.strokeStyle = webColor;
                this.ctx.lineWidth = 1.5;
                this.ctx.stroke();
                
                // Parlama efekti
                this.ctx.strokeStyle = glowColor;
                this.ctx.lineWidth = 3;
                this.ctx.stroke();
            });
            
            // Dairesel çizgileri çiz
            web.circularLines.forEach(circle => {
                this.ctx.beginPath();
                let firstSegment = true;
                
                circle.segments.forEach((segment, i) => {
                    if (segment.broken) {
                        firstSegment = true;
                        return;
                    }
                    
                    segment.wobble += segment.wobbleSpeed;
                    const wobbleX = Math.sin(segment.wobble) * 0.3;
                    const wobbleY = Math.cos(segment.wobble) * 0.3;
                    
                    const x = segment.x + wobbleX;
                    const y = segment.y + wobbleY;
                    
                    if (firstSegment) {
                        this.ctx.moveTo(x, y);
                        firstSegment = false;
                    } else {
                        this.ctx.lineTo(x, y);
                    }
                });
                
                this.ctx.strokeStyle = webColor;
                this.ctx.lineWidth = 1;
                this.ctx.stroke();
            });
            
            // Örümceği çiz
            const spider = web.spider;
            
            // Örümcek gövdesi
            this.ctx.beginPath();
            this.ctx.arc(spider.x, spider.y, spider.size, 0, Math.PI * 2);
            this.ctx.fillStyle = isDark ? 'rgba(100, 100, 100, 0.6)' : 'rgba(50, 50, 50, 0.7)';
            this.ctx.fill();
            
            // Örümcek bacakları
            spider.legs.forEach(leg => {
                leg.wobble += 0.05;
                const wobble = Math.sin(leg.wobble) * 0.1;
                const angle = leg.angle + wobble;
                
                this.ctx.beginPath();
                this.ctx.moveTo(spider.x, spider.y);
                
                // Bacak 2 segmentli
                const midX = spider.x + Math.cos(angle) * leg.length;
                const midY = spider.y + Math.sin(angle) * leg.length;
                this.ctx.lineTo(midX, midY);
                
                const endX = midX + Math.cos(angle + 0.5) * leg.length;
                const endY = midY + Math.sin(angle + 0.5) * leg.length;
                this.ctx.lineTo(endX, endY);
                
                this.ctx.strokeStyle = isDark ? 'rgba(100, 100, 100, 0.6)' : 'rgba(50, 50, 50, 0.7)';
                this.ctx.lineWidth = 1.5;
                this.ctx.stroke();
            });
        });
        
        // Partikülleri çiz
        this.particles = this.particles.filter(particle => {
            particle.x += particle.vx;
            particle.y += particle.vy;
            particle.life -= particle.decay;
            
            if (particle.life > 0) {
                this.ctx.beginPath();
                this.ctx.arc(particle.x, particle.y, 2, 0, Math.PI * 2);
                this.ctx.fillStyle = `rgba(200, 200, 200, ${particle.life})`;
                this.ctx.fill();
                return true;
            }
            return false;
        });
    }
    
    animate() {
        this.regenerateWebs();
        this.draw();
        requestAnimationFrame(() => this.animate());
    }
}

// Avatar menü toggle
function setupAvatarMenu() {
    const avatarButton = document.getElementById('avatarButton');
    const avatarDropdown = document.getElementById('avatarDropdown');
    
    if (avatarButton && avatarDropdown) {
        avatarButton.addEventListener('click', (e) => {
            e.stopPropagation();
            avatarDropdown.classList.toggle('show');
        });
        
        document.addEventListener('click', () => {
            avatarDropdown.classList.remove('show');
        });
        
        avatarDropdown.addEventListener('click', (e) => {
            e.stopPropagation();
        });
    }
}

// Avatar değiştirme modalı
window.showAvatarChangeModal = function() {
    const modal = document.getElementById('registerModal');
    if (modal) {
        const modalHeader = modal.querySelector('.modal-header');
        const registerBtn = document.getElementById('registerBtn');
        const usernameInput = document.getElementById('registerUsername');
        const emailInput = document.getElementById('registerEmail');
        const passwordInput = document.getElementById('registerPassword');
        const avatarSelector = document.getElementById('avatarSelector');
        
        if (modalHeader) modalHeader.textContent = '🎭 Avatar Değiştir';
        if (registerBtn) registerBtn.textContent = 'Avatar Güncelle';
        
        if (usernameInput) usernameInput.closest('.md-input-group').style.display = 'none';
        if (emailInput) emailInput.closest('.md-input-group').style.display = 'none';
        if (passwordInput) passwordInput.closest('.md-input-group').style.display = 'none';
        
        modal.classList.add('active');
        
        // Avatar seçiciyi oluştur - aynı avatarları kullan
        if (avatarSelector && typeof getAllAvatars === 'function') {
            const allAvatars = getAllAvatars();
            avatarSelector.innerHTML = '';
            
            // Mevcut kullanıcının avatarını al
            let currentAvatar = 'girl1';
            const avatarImage = document.getElementById('avatarImage');
            if (avatarImage && avatarImage.src) {
                const match = avatarImage.src.match(/\/([^/]+)\.png$/);
                if (match) currentAvatar = match[1];
            }
            
            allAvatars.forEach(avatar => {
                const option = document.createElement('div');
                option.className = 'avatar-option';
                option.dataset.avatar = avatar.id;
                if (avatar.id === currentAvatar) {
                    option.classList.add('selected');
                }
                option.innerHTML = `<img src="/static/avatars/${avatar.id}.png" alt="${avatar.name}" style="width: 100%; height: 100%; object-fit: cover;">`;
                option.onclick = () => {
                    document.querySelectorAll('.avatar-option').forEach(el => el.classList.remove('selected'));
                    option.classList.add('selected');
                };
                avatarSelector.appendChild(option);
            });
        }
        
        // Butona özel handler
        const originalOnClick = registerBtn.onclick;
        registerBtn.onclick = async function() {
            const selectedAvatar = document.querySelector('.avatar-option.selected');
            if (selectedAvatar) {
                const avatarId = selectedAvatar.dataset.avatar;
                const result = await api.updateAvatar(avatarId);
                
                if (result.success) {
                    const avatarImage = document.getElementById('avatarImage');
                    if (avatarImage) {
                        avatarImage.src = `/static/avatars/${avatarId}.png`;
                    }
                    
                    modal.classList.remove('active');
                    showSnackbar('Avatar güncellendi! ✨');
                    
                    // Modalı sıfırla
                    setTimeout(() => {
                        if (modalHeader) modalHeader.textContent = '📝 Kayıt Ol';
                        if (registerBtn) {
                            registerBtn.textContent = 'Kayıt Ol';
                            registerBtn.onclick = originalOnClick;
                        }
                        if (usernameInput) usernameInput.closest('.md-input-group').style.display = 'block';
                        if (emailInput) emailInput.closest('.md-input-group').style.display = 'block';
                        if (passwordInput) passwordInput.closest('.md-input-group').style.display = 'block';
                    }, 300);
                }
            }
        };
    }
};

// Snackbar göster
function showSnackbar(message) {
    const snackbar = document.createElement('div');
    snackbar.className = 'md-snackbar show';
    snackbar.textContent = message;
    document.body.appendChild(snackbar);
    
    setTimeout(() => {
        snackbar.classList.remove('show');
        setTimeout(() => snackbar.remove(), 300);
    }, 3000);
}

// Sayfa yüklendiğinde
if (typeof window !== 'undefined') {
    window.addEventListener('DOMContentLoaded', () => {
        if (!SpiderWeb.instance) {
            SpiderWeb.instance = new SpiderWeb('spiderWebCanvas');
            setupAvatarMenu();
        }
    });
}
