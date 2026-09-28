let score = 0;
let isPlaying = true;
let tapTimeout = null;
const stopDelay = 800; // Пауза до Game Over
let flipLeft = false;

// Елементи
const scoreDisplay = document.getElementById('score');
const dudecImg = document.getElementById('dudec-img');
const tapArea = document.getElementById('tap-area');
const notesContainer = document.getElementById('notes-container');
const bgMusic = document.getElementById('bg-music');

const btnRestart = document.getElementById('btn-restart');
const btnSettings = document.getElementById('btn-settings');
const btnShop = document.getElementById('btn-shop');

const modalSettings = document.getElementById('modal-settings');
const btnCloseSettings = document.getElementById('btn-close-settings');
const volumeSlider = document.getElementById('volume');

const modalShop = document.getElementById('modal-shop');
const btnCloseShop = document.getElementById('btn-close-shop');
const selectSkin = document.getElementById('select-skin');
const selectTrack = document.getElementById('select-track');

const modalGameOver = document.getElementById('modal-gameover');
const finalScoreDisplay = document.getElementById('final-score');
const btnModalRestart = document.getElementById('btn-modal-restart');

const notesList = ['🎵', '🎶'];

// Виліт ноти з труби
function spawnNote() {
    const note = document.createElement('div');
    note.className = 'music-note';
    note.textContent = notesList[Math.floor(Math.random() * notesList.length)];

    const startX = flipLeft ? 40 : 160;
    const startY = 120;

    note.style.left = `${startX}px`;
    note.style.top = `${startY}px`;

    const dx = (Math.random() * 80 - 40) + (flipLeft ? -50 : 50);
    const dy = -(Math.random() * 80 + 50);
    const dr = (Math.random() * 60 - 30) + 'deg';

    note.style.setProperty('--dx', `${dx}px`);
    note.style.setProperty('--dy', `${dy}px`);
    note.style.setProperty('--dr', dr);

    notesContainer.appendChild(note);

    setTimeout(() => {
        note.remove();
    }, 600);
}

// Клік / Тап
function handleTap(e) {
    if (e) e.preventDefault();
    if (!isPlaying) return;

    score++;
    scoreDisplay.textContent = score;

    if (bgMusic.paused) {
        bgMusic.play().catch(err => console.log(err));
    }

    clearTimeout(tapTimeout);
    tapTimeout = setTimeout(() => {
        if (isPlaying && score > 0) {
            triggerGameOver();
        }
    }, stopDelay);

    // Поворот вліво / вправо
    if (flipLeft) {
        dudecImg.className = 'flip-left';
    } else {
        dudecImg.className = 'flip-right';
    }
    
    spawnNote();
    flipLeft = !flipLeft;

    setTimeout(() => {
        dudecImg.className = '';
    }, 60);
}

// Екран зупинки
function triggerGameOver() {
    isPlaying = false;
    bgMusic.pause();
    bgMusic.currentTime = 0;

    finalScoreDisplay.textContent = score;
    modalGameOver.classList.remove('hidden');
}

// Скидання
function resetGame() {
    clearTimeout(tapTimeout);
    score = 0;
    scoreDisplay.textContent = score;
    isPlaying = true;
    bgMusic.pause();
    bgMusic.currentTime = 0;
    dudecImg.className = '';
    notesContainer.innerHTML = '';
    modalGameOver.classList.add('hidden');
}

// Події
tapArea.addEventListener('touchstart', handleTap, { passive: false });
tapArea.addEventListener('mousedown', handleTap);

btnRestart.addEventListener('click', (e) => {
    e.stopPropagation();
    resetGame();
});

btnModalRestart.addEventListener('click', resetGame);

// Магазин / Вибір скінів
btnShop.addEventListener('click', (e) => {
    e.stopPropagation();
    modalShop.classList.remove('hidden');
});

btnCloseShop.addEventListener('click', () => {
    modalShop.classList.add('hidden');
});

selectSkin.addEventListener('change', (e) => {
    dudecImg.src = e.target.value;
});

selectTrack.addEventListener('change', (e) => {
    bgMusic.src = e.target.value;
    bgMusic.currentTime = 0;
});

// Налаштування
btnSettings.addEventListener('click', (e) => {
    e.stopPropagation();
    modalSettings.classList.remove('hidden');
});

btnCloseSettings.addEventListener('click', () => {
    modalSettings.classList.add('hidden');
});

volumeSlider.addEventListener('input', (e) => {
    bgMusic.volume = e.target.value;
});
