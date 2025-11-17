// Sesli Telaffuz Fonksiyonu - Web Speech API ile Kadın Sesi (Garantili)

let isSpeaking = false;
let femaleVoice = null;
let voicesLoaded = false;

// Kadın sesini yükle - Akıllı seçim
function loadFemaleVoice() {
    return new Promise((resolve) => {
        const voices = window.speechSynthesis.getVoices();
        
        if (voices.length === 0) {
            console.log('⚠ Sesler henüz yüklenmedi');
            resolve(null);
            return;
        }
        
        console.log('📋 Tüm sesler:', voices.map(v => `${v.name} (${v.lang}) [${v.gender || 'unknown'}]`).join(', '));
        
        // Platform tespiti
        const isWindows = navigator.platform.toLowerCase().includes('win');
        const isMac = navigator.platform.toLowerCase().includes('mac');
        const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
        const isAndroid = /Android/.test(navigator.userAgent);
        
        console.log('💻 Platform:', isWindows ? 'Windows' : isMac ? 'Mac' : isIOS ? 'iOS' : isAndroid ? 'Android' : 'Diğer');
        
        // ERKEK SESLERİ BLACKLIST
        const maleBlacklist = ['David', 'Mark', 'George', 'James'];
        
        // KADIN SESLERİ - Platform bazlı öncelik
        let femaleNames = [];
        
        if (isWindows) {
            femaleNames = [
                'Microsoft Zira',
                'Microsoft Hazel',
                'Microsoft Susan',
                'Google UK English Female',
                'Google US English Female'
            ];
        } else if (isMac || isIOS) {
            femaleNames = [
                'Samantha',
                'Victoria', 
                'Karen',
                'Moira',
                'Tessa',
                'Fiona',
                'Serena'
            ];
        } else if (isAndroid) {
            femaleNames = [
                'Google UK English Female',
                'Google US English Female',
                'en-gb-x-gba-local',
                'en-gb-x-gba-network'
            ];
        } else {
            femaleNames = [
                'Google UK English Female',
                'Google US English Female',
                'Samantha',
                'Victoria'
            ];
        }
        
        // Erkek sesleri filtrele
        const filteredVoices = voices.filter(v => {
            const isMale = maleBlacklist.some(male => v.name.includes(male));
            if (isMale) {
                console.log('❌ Erkek ses atlandı:', v.name);
            }
            return !isMale;
        });
        
        console.log('✅ Filtrelenmiş sesler:', filteredVoices.map(v => v.name).join(', '));
        
        // Öncelikli kadın seslerini ara
        for (const name of femaleNames) {
            const voice = filteredVoices.find(v => v.name.includes(name));
            if (voice) {
                femaleVoice = voice;
                console.log('✓ Kadın sesi bulundu:', voice.name);
                voicesLoaded = true;
                resolve(voice);
                return;
            }
        }
        
        // 'female' içeren herhangi bir ses
        const anyFemale = filteredVoices.find(v => 
            v.name.toLowerCase().includes('female') ||
            v.name.toLowerCase().includes('woman')
        );
        
        if (anyFemale) {
            femaleVoice = anyFemale;
            console.log('✓ Kadın sesi bulundu (female keyword):', anyFemale.name);
            voicesLoaded = true;
            resolve(anyFemale);
            return;
        }
        
        // en-GB (İngiliz İngilizcesi) - genelde kadın
        const enGB = filteredVoices.find(v => v.lang === 'en-GB' || v.lang.startsWith('en-GB'));
        if (enGB) {
            femaleVoice = enGB;
            console.log('✓ İngiliz İngilizcesi sesi bulundu:', enGB.name);
            voicesLoaded = true;
            resolve(enGB);
            return;
        }
        
        // Son çare: ilk filtrelenmiş ses + yüksek pitch
        if (filteredVoices.length > 0) {
            femaleVoice = filteredVoices[0];
            console.log('⚠ İlk filtrelenmiş ses kullanılacak (yüksek pitch ile):', filteredVoices[0].name);
            voicesLoaded = true;
            resolve(filteredVoices[0]);
            return;
        }
        
        console.log('❌ Hiçbir uygun ses bulunamadı');
        resolve(null);
    });
}

function speakWord(word) {
    try {
        console.log('🔊 Ses çalınıyor:', word);
        
        // Zaten konuşuyorsa, durdur
        if (isSpeaking) {
            console.log('⚠ Zaten konuşuluyor, atlanıyor...');
            return;
        }
        
        // Web Speech API kontrolü
        if (!window.speechSynthesis) {
            console.error('❌ Web Speech API desteklenmiyor');
            alert('Tarayıcınız sesli telaffuzu desteklemiyor.');
            return;
        }
        
        // Önceki konuşmayı durdur
        if (window.speechSynthesis.speaking) {
            console.log('⚠ Önceki konuşma durduruluyor...');
            window.speechSynthesis.cancel();
            
            // Cancel işleminin tamamlanması için bekle
            setTimeout(() => {
                startSpeaking(word);
            }, 150);
            return;
        }
        
        startSpeaking(word);
        
    } catch (error) {
        console.error('❌ Sesli telaffuz hatası:', error);
        isSpeaking = false;
    }
}

function startSpeaking(word) {
    isSpeaking = true;
    
    const utterance = new SpeechSynthesisUtterance(word);
    
    // Kadın sesini kullan
    if (femaleVoice) {
        utterance.voice = femaleVoice;
        utterance.lang = femaleVoice.lang;
        console.log('✓ Kullanılan ses:', femaleVoice.name, `(${femaleVoice.lang})`);
    } else {
        // Ses henüz yüklenmediyse, İngiliz İngilizcesi kullan
        utterance.lang = 'en-GB';
        console.log('⚠ Ses henüz yüklenmedi, en-GB kullanılıyor');
    }
    
    // Ses ayarları - Kadın sesi için optimize
    utterance.rate = 0.75;   // Yavaş
    utterance.pitch = 1.3;   // Yüksek pitch (kadın sesi)
    utterance.volume = 1.0;  // Maksimum
    
    console.log('🎵 Ses ayarları: Rate=0.75, Pitch=1.3, Volume=1.0');
    
    utterance.onstart = () => {
        console.log('✓ Ses çalmaya başladı');
    };
    
    utterance.onend = () => {
        console.log('✓ Ses bitti');
        isSpeaking = false;
    };
    
    utterance.onerror = (e) => {
        console.error('❌ Ses hatası:', e.error, e);
        isSpeaking = false;
        
        if (e.error === 'not-allowed') {
            alert('🔊 Ses izni gerekiyor. Lütfen tarayıcı ayarlarından ses iznini verin.');
        } else if (e.error === 'interrupted') {
            console.log('⚠ Ses kesildi (normal)');
        } else {
            console.error('⚠ Beklenmeyen hata:', e.error);
        }
    };
    
    // Sesi çal
    window.speechSynthesis.speak(utterance);
}

// Sesli telaffuz butonunu ayarla
function setupSpeechButton() {
    const speakBtn = document.getElementById('speakBtn');
    if (speakBtn) {
        console.log('✓ Speak butonu bulundu, event listener ekleniyor');
        
        speakBtn.addEventListener('click', (e) => {
            console.log('🔊 Speak butonuna tıklandı!');
            e.stopPropagation(); // Kartın çevrilmesini engelle
            
            const wordElement = document.getElementById('wordEnglish');
            if (wordElement) {
                const word = wordElement.textContent.trim();
                console.log('📝 Okunacak kelime:', word);
                speakWord(word);
                
                // Buton animasyonu
                speakBtn.style.transform = 'scale(0.95)';
                setTimeout(() => {
                    speakBtn.style.transform = 'scale(1)';
                }, 100);
            } else {
                console.error('❌ wordEnglish elementi bulunamadı');
            }
        });
    } else {
        console.error('❌ speakBtn butonu bulunamadı!');
    }
}

// Sesleri yükle
function initVoices() {
    if (!window.speechSynthesis) {
        console.error('❌ Web Speech API desteklenmiyor');
        return;
    }
    
    console.log('🔄 Sesler yükleniyor...');
    
    // Sesler hemen yüklenmeyebilir, event listener ekle
    if (speechSynthesis.onvoiceschanged !== undefined) {
        speechSynthesis.onvoiceschanged = () => {
            console.log('🔄 Sesler güncellendi');
            loadFemaleVoice();
        };
    }
    
    // Hemen dene
    loadFemaleVoice();
    
    // Birden fazla kez dene (bazı tarayıcılarda geç yüklenir)
    const delays = [100, 500, 1000, 2000];
    delays.forEach(delay => {
        setTimeout(() => {
            if (!voicesLoaded) {
                console.log(`🔄 Sesler tekrar yükleniyor (${delay}ms)...`);
                loadFemaleVoice();
            }
        }, delay);
    });
}

// Sayfa yüklendiğinde
if (typeof window !== 'undefined') {
    // Sesleri hemen yükle
    initVoices();
    
    window.addEventListener('DOMContentLoaded', () => {
        console.log('✓ Speech.js yüklendi (Web Speech API - Kadın Sesi - Pitch 1.3)');
        
        // Butonu ayarla
        setupSpeechButton();
        console.log('✓ Sesli telaffuz butonu hazır');
        
        // Sesleri tekrar yükle
        initVoices();
    });
}

// Global fonksiyon olarak export et
window.speakWord = speakWord;
window.loadFemaleVoice = loadFemaleVoice;
