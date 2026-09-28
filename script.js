// Стан гри
let score = parseInt(localStorage.getItem('dudec_score')) || 1;
let currentSkin = localStorage.getItem('dudec_skin') || 'classic';
let currentSkel = localStorage.getItem('dudec_skel') || 'classic';
let currentMusic = localStorage.getItem('dudec_music') || 'dudec';
let globalVolume = parseFloat(localStorage.getItem('dudec_vol')) || 0.5;

let isGameActive = false; // Чекаємо на перший тап
let spawnerTimeout = null;
let inactivityTimeout = null;
let noteTimeout = null;
let lastTiltLeft = false;

// Елементи
const scoreDisplay = document.getElementById('score');
const dudecImg = document.getElementById('dudec-img');
const dudecBox = document.getElementById('dudec-box');

const modalSkins = document.getElementById('modal-skins');
const modalSettings = document.getElementById('modal-settings');
const modalGameOver = document.getElementById('modal-gameover');
const finalScoreDisplay = document.getElementById('final-score');

// Ресурси
const skins = { 'classic': 'dudec.png', 'gold': 'dudec_gold.png', 'phonk': 'ret.png' };
const skels = { 'classic': 'sa.png', 'gold': 'fer.png', 'phonk': 'ger.png' };
const musicFiles = { 'dudec': 'dudec.mp3', 'das': 'das.mp3', '1doot': '1doot.mp3' };

let musicAudio = new Audio(musicFiles[currentMusic] || 'dudec.mp3');
musicAudio.loop = true;

// Ініціалізація
scoreDisplay.textContent = score;
dudecImg.src = skins[currentSkin] || skins['classic'];

// Блокуємо спливання тапу з усіх модальних вікон, селектів та інтерфейсу
document.querySelectorAll('.modal, select, input, .top-bar').forEach(element => {
    element.addEventListener('pointerdown', (e) => {
        e.stopPropagation();
    });
});

// Тап по Дудецю
dudecBox.addEventListener('pointerdown', (e) => {
    e.preventDefault();

    // Запускаємо гру при першому тапі
    if (!isGameActive) {
        isGameActive = true;
        startSkeletonSpawner();
    }

    // Оновлюємо таймер бездіяльності (6 секунд без тапів = програш)
    resetInactivityTimer();

    score++;
    scoreDisplay.textContent = score;
    localStorage.setItem('dudec_score', score);

    // Анімація качання
    dudecImg.classList.remove('tilt-left', 'tilt-right');
    if (lastTiltLeft) {
        dudecImg.classList.add('tilt-right');
    } else {
        dudecImg.classList.add('tilt-left');
    }
    lastTiltLeft = !lastTiltLeft;

    setTimeout(() => {
        dudecImg.classList.remove('tilt-left', 'tilt-right');
    }, 100);

    triggerDootSoundAndNotes();
});

// Таймер бездіяльності
function resetInactivityTimer() {
    clearTimeout(inactivityTimeout);
    if (!isGameActive) return;

    inactivityTimeout = setTimeout(() => {
        if (isGameActive) {
            triggerGameOver();
        }
    }, 1000);
}

// Керування звуком та нотами при тапі
function triggerDootSoundAndNotes() {
    musicAudio.volume = globalVolume;

    if (musicAudio.paused) {
        musicAudio.play().catch(() => {});
    }

    dudecBox.classList.add('dancing');

    clearTimeout(noteTimeout);
    noteTimeout = setTimeout(() => {
        dudecBox.classList.remove('dancing');
        musicAudio.pause();
    }, 400);
}

// Модалки
document.getElementById('btn-skins').addEventListener('click', () => {
    document.getElementById('select-skin').value = currentSkin;
    document.getElementById('select-skel').value = currentSkel;
    document.getElementById('select-music').value = currentMusic;
    modalSkins.classList.remove('hidden');
});

document.getElementById('btn-settings').addEventListener('click', () => {
    document.getElementById('volume-range').value = globalVolume;
    modalSettings.classList.remove('hidden');
});

// Скидання очок
document.getElementById('btn-reset').addEventListener('click', () => {
    if (confirm("Скинути очки в 0?")) {
        score = 0;
        scoreDisplay.textContent = score;
        localStorage.setItem('dudec_score', 0);
    }
});

// Збереження Скінів
document.getElementById('save-skins').addEventListener('click', () => {
    currentSkin = document.getElementById('select-skin').value;
    currentSkel = document.getElementById('select-skel').value;
    currentMusic = document.getElementById('select-music').value;

    localStorage.setItem('dudec_skin', currentSkin);
    localStorage.setItem('dudec_skel', currentSkel);
    localStorage.setItem('dudec_music', currentMusic);

    dudecImg.src = skins[currentSkin];

    musicAudio.pause();
    musicAudio = new Audio(musicFiles[currentMusic] || 'dudec.mp3');
    musicAudio.loop = true;

    modalSkins.classList.add('hidden');
});

// Збереження Налаштувань
document.getElementById('save-settings').addEventListener('click', () => {
    globalVolume = parseFloat(document.getElementById('volume-range').value);
    localStorage.setItem('dudec_vol', globalVolume);
    modalSettings.classList.add('hidden');
});

// Кнопка ЗНОВУ
document.getElementById('restart-btn').addEventListener('click', () => {
    modalGameOver.classList.add('hidden');
    isGameActive = false;
});

// Game Over (тільки від таймауту бездіяльності)
function triggerGameOver() {
    isGameActive = false;
    clearTimeout(spawnerTimeout);
    clearTimeout(inactivityTimeout);
    spawnerTimeout = false;

    document.querySelectorAll('.moving-skeleton').forEach(skel => skel.remove());

    musicAudio.pause();
    dudecBox.classList.remove('dancing');

    finalScoreDisplay.textContent = score;
    modalGameOver.classList.remove('hidden');
}

// Спавнер скелетів (бонусні цілі)
function spawnSkeleton() {
    if (!isGameActive) return;

    const skeleton = document.createElement('img');
    skeleton.src = skels[currentSkel] || 'dudec.png';
    skeleton.classList.add('moving-skeleton');

    const padding = 80;
    const maxX = window.innerWidth - padding;
    const maxY = window.innerHeight - padding;

    const startX = Math.floor(Math.random() * (maxX - padding)) + padding / 2;
    const startY = Math.floor(Math.random() * (maxY - padding)) + padding / 2;

    const endX = Math.floor(Math.random() * (maxX - padding)) + padding / 2;
    const endY = Math.floor(Math.random() * (maxY - padding)) + padding / 2;

    skeleton.style.left = `${startX}px`;
    skeleton.style.top = `${startY}px`;

    // Тап по бонусному скелету
    skeleton.addEventListener('pointerdown', (e) => {
        e.stopPropagation();
        e.preventDefault();

        if (!isGameActive) return;

        score += 10;
        scoreDisplay.textContent = score;
        localStorage.setItem('dudec_score', score);

        resetInactivityTimer();
        triggerDootSoundAndNotes();
        skeleton.remove();
    });

    document.body.appendChild(skeleton);

    setTimeout(() => {
        skeleton.style.left = `${endX}px`;
        skeleton.style.top = `${endY}px`;
    }, 50);

    // Скелет просто пролітає та зникає (БЕЗ викликання Game Over)
    setTimeout(() => {
        if (document.body.contains(skeleton)) {
            skeleton.remove();
        }
    }, 4000);
}

function startSkeletonSpawner() {
    if (!isGameActive) return;
    const randomDelay = Math.floor(Math.random() * 2500) + 2000;
    spawnerTimeout = setTimeout(() => {
        if (isGameActive) {
            spawnSkeleton();
            startSkeletonSpawner();
        }
    }, randomDelay);
}
