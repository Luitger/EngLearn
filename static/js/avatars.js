// Avatar listesi - Halloween Temalı
if (typeof window.avatars === 'undefined') {
    window.avatars = {
    // Kız karakterler - Halloween
    girl1: {
        name: 'Witch Luna',
        theme: 'Witch',
        gender: 'female',
        emoji: '🧙‍♀️',
        color: '#8B4789'
    },
    girl2: {
        name: 'Ghost Aria',
        theme: 'Ghost',
        gender: 'female',
        emoji: '👻',
        color: '#E8E8E8'
    },
    girl3: {
        name: 'Vampire Nova',
        theme: 'Vampire',
        gender: 'female',
        emoji: '🧛‍♀️',
        color: '#8B0000'
    },
    girl4: {
        name: 'Cat Zara',
        theme: 'Black Cat',
        gender: 'female',
        emoji: '🐱',
        color: '#2C2C2C'
    },
    girl5: {
        name: 'Pumpkin Maya',
        theme: 'Pumpkin',
        gender: 'female',
        emoji: '🎃',
        color: '#FF8C00'
    },
    
    // Erkek karakterler - Halloween
    boy1: {
        name: 'Zombie Leo',
        theme: 'Zombie',
        gender: 'male',
        emoji: '🧟',
        color: '#7CFC00'
    },
    boy2: {
        name: 'Skeleton Max',
        theme: 'Skeleton',
        gender: 'male',
        emoji: '💀',
        color: '#F5F5DC'
    },
    boy3: {
        name: 'Werewolf Alex',
        theme: 'Werewolf',
        gender: 'male',
        emoji: '🐺',
        color: '#8B4513'
    },
    boy4: {
        name: 'Demon Ryan',
        theme: 'Demon',
        gender: 'male',
        emoji: '😈',
        color: '#DC143C'
    },
    boy5: {
        name: 'Mummy Jake',
        theme: 'Mummy',
        gender: 'male',
        emoji: '🧟‍♂️',
        color: '#F5DEB3'
    }
    };
}

const avatars = window.avatars;

// Avatar'ı PNG olarak döndür (geriye uyumluluk için)
function getAvatarSVG(avatarId) {
    const avatar = avatars[avatarId] || avatars.girl1;
    // PNG resim kullanıyoruz
    return `<img src="/static/avatars/${avatarId}.png" alt="${avatar.name}" style="width: 100%; height: 100%; object-fit: cover; border-radius: 50%;">`;
}

// Avatar'ı data URL olarak döndür
function getAvatarDataURL(avatarId) {
    return `/static/avatars/${avatarId}.png`;
}

// Avatar resim URL'ini döndür
function getAvatarImageURL(avatarId) {
    return `/static/avatars/${avatarId}.png`;
}

// Tüm avatarları listele
function getAllAvatars() {
    return Object.keys(avatars).map(id => ({
        id,
        ...avatars[id]
    }));
}

// Cinsiyete göre avatarları filtrele
function getAvatarsByGender(gender) {
    return Object.keys(avatars)
        .filter(id => avatars[id].gender === gender)
        .map(id => ({
            id,
            ...avatars[id]
        }));
}
