// DOM Fetching
const bird = document.getElementById("bird");
const pipes = document.querySelectorAll(".pipe");
const scoreDisplay = document.getElementById("score");
const startMenu = document.getElementById("start-menu");
const gameOverMenu = document.getElementById("game-over-menu");
const pauseMenu = document.getElementById("pause-menu");
const startButton = document.getElementById("start-button");
const restartButton = document.getElementById("restart-button");
const finalScoreDisplay = document.getElementById("final-score");
const highScoreDisplay = document.getElementById("high-score");
const finalHighScoreDisplay = document.getElementById("high-score-gameover");

// Sound Effects
const jumpSound = new Audio('sounds/jump.mp3');
const scoreSound = new Audio('sounds/score.mp3');
const hitSound = new Audio('sounds/hit.mp3');
const ambienceSound = new Audio('sounds/ambience.mp3');
ambienceSound.loop = true;
ambienceSound.volume = 0.1;
jumpSound.volume = 0.15;
scoreSound.volume = 0.2;
hitSound.volume = 0.3;

// Game Settings
let birdTop = 30;
let birdLeft = 20;
const BASE_GRAVITY = 0.2;
const MAX_GRAVITY = 0.4;
let gravity = BASE_GRAVITY;
const jumpPower = 10;
let batRotation = 0;
const BASE_GAME_SPEED = 0.3;
let gameSpeed = BASE_GAME_SPEED;
let isGameOver = true;
let isPaused = false;
let score = 0;
let highScore = 0;

// Pipe Settings
const PIPE_WIDTH_VW = 10;
const BASE_GAP_HEIGHT = 30;
const MIN_GAP_HEIGHT = 15;
let GAP_HEIGHT = BASE_GAP_HEIGHT;
const TOTAL_SCREEN_HEIGHT_VH = 100;

function startGame() {
    startMenu.style.display = 'none';
    gameOverMenu.style.display = 'none';
    ambienceSound.play();
    initializeGame();
    resetAllPipes();
}

// Start Game
function initializeGame() {
    birdTop = 30;
    isGameOver = false;
    isPaused = false;
    score = 0;
    gameSpeed = BASE_GAME_SPEED;
    gravity = BASE_GRAVITY;
    GAP_HEIGHT = BASE_GAP_HEIGHT;
    scoreDisplay.innerText = score;
    batRotation = 0;
    bird.style.transform = `rotate(${batRotation}deg)`;
    bird.style.top = birdTop + "vh";
    bird.style.left = birdLeft + "vw";
    document.removeEventListener("keydown", jump);
    document.addEventListener("keydown", jump);
}

// Jump
function jump() {
    if (isGameOver || isPaused) return;
    jumpSound.currentTime = 0;
    jumpSound.play();
    birdTop -= jumpPower;
    batRotation = -40;
    bird.style.top = birdTop + "vh";
    bird.style.transform = `rotate(${batRotation}deg)`;
}

// Gravity
function applyGravity() {
    if (isGameOver) return;
    birdTop += gravity;
    if (batRotation < 0) {
        batRotation += 4;
    } else if (batRotation < 70) {
        batRotation += 1.5;
    }
    bird.style.top = birdTop + "vh";
    bird.style.transform = `rotate(${batRotation}deg)`;
}

// Move Pipes
function movePipes() {
    const birdRect = bird.getBoundingClientRect();
    pipes.forEach((pipe, index) => {
        let pipeLeftPx = parseFloat(getComputedStyle(pipe).left);
        let pipeLeftVw = (pipeLeftPx / window.innerWidth) * 100;
        pipe.style.left = (pipeLeftVw - gameSpeed) + "vw";
        if (index % 2 === 0) {
            const pipeRect = pipe.getBoundingClientRect();
            if (pipeRect.right < birdRect.left && pipe.dataset.passed !== "true") {
                pipe.dataset.passed = "true";
                incrementScore();
            }
        }
        if (index % 2 === 0 && pipeLeftVw < -10) {
            const topPipe = pipe;
            const bottomPipe = pipes[index + 1];
            resetPipePair(topPipe, bottomPipe);
        }
    });
}

// Detect Collison
function detectCollision() {
    let birdPaddingVertical;
    let birdPaddingHorizontal;

    
    if (batRotation > 25) { 
        birdPaddingVertical = 47;   
        birdPaddingHorizontal = 48; 
    } else if (batRotation < -10) { 
        birdPaddingVertical =35;
        birdPaddingHorizontal = 35;
    } else { 
        birdPaddingVertical = 35;
        birdPaddingHorizontal = 30;
    }


    const PIPE_PADDING = 10; 
    const birdRect = bird.getBoundingClientRect();


    const birdHitbox = {
        left: birdRect.left + birdPaddingHorizontal,
        right: birdRect.right - birdPaddingHorizontal,
        top: birdRect.top + birdPaddingVertical,
        bottom: birdRect.bottom - birdPaddingVertical
    };

    pipes.forEach(pipe => {
        const pipeRect = pipe.getBoundingClientRect();
        const pipeHitbox = {
            left: pipeRect.left + PIPE_PADDING,
            right: pipeRect.right - PIPE_PADDING,
            top: pipeRect.top,
            bottom: pipeRect.bottom
        };
        const hit =
            birdHitbox.right > pipeHitbox.left &&
            birdHitbox.left < pipeHitbox.right &&
            birdHitbox.bottom > pipeHitbox.top &&
            birdHitbox.top < pipeHitbox.bottom;
        if (hit) endGame();
    });

    if (birdRect.top <= 0 || birdRect.bottom >= window.innerHeight) {
        endGame();
    }
}

// Game Over
function endGame() {
    if (isGameOver) return;
    hitSound.play();
    ambienceSound.pause();
    isGameOver = true;
    if (score > highScore) {
        highScore = score;
        localStorage.setItem('flappyHighScore', highScore);
    }
    finalScoreDisplay.innerText = score;
    updateHighScoreDisplay();
    gameOverMenu.style.display = 'flex';
}

// Random Gap
function getRandomGapTop() {
    const MAX_GAP_TOP = TOTAL_SCREEN_HEIGHT_VH - GAP_HEIGHT - 5;
    const MIN_GAP_TOP = 5;
    return Math.floor(Math.random() * (MAX_GAP_TOP - MIN_GAP_TOP + 1)) + MIN_GAP_TOP;
}

function resetPipePair(topPipe, bottomPipe) {
    const gapTop = getRandomGapTop();
    topPipe.style.height = gapTop + "vh";
    topPipe.style.top = "0vh";
    const bottomPipeTop = gapTop + GAP_HEIGHT;
    const bottomPipeHeight = TOTAL_SCREEN_HEIGHT_VH - bottomPipeTop;
    bottomPipe.style.height = bottomPipeHeight + "vh";
    bottomPipe.style.top = bottomPipeTop + "vh";
    const offset = PIPE_WIDTH_VW / 2;
    topPipe.style.left = "100vw";
    bottomPipe.style.left = (100 + offset) + "vw";
    topPipe.dataset.passed = "false";
    bottomPipe.dataset.passed = "false";
}

// Reset Pipe
function resetAllPipes() {
    for (let i = 0; i < pipes.length; i += 2) {
        const topPipe = pipes[i];
        const bottomPipe = pipes[i + 1];
        if (topPipe && bottomPipe) {
            resetPipePair(topPipe, bottomPipe);
        }
    }
}

// Increment Score
function incrementScore() {
    score++;
    scoreSound.currentTime = 0;
    scoreSound.play();
    scoreDisplay.innerText = score;
    gameSpeed += 0.01;
    if (score > 0 && score % 5 === 0) {
        if (GAP_HEIGHT > MIN_GAP_HEIGHT) {
            GAP_HEIGHT -= 1;
        }
        if (gravity < MAX_GRAVITY) {
            gravity += 0.02;
        }
    }
}

function togglePause() {
    if (isGameOver) return;
    isPaused = !isPaused;
    if (isPaused) {
        ambienceSound.pause();
        pauseMenu.style.display = 'flex';
    } else {
        ambienceSound.play();
        pauseMenu.style.display = 'none';
    }
}

// High Score
function loadHighScore() {
    const savedHighScore = localStorage.getItem('flappyHighScore');
    if (savedHighScore) {
        highScore = parseInt(savedHighScore, 10);
    }
    updateHighScoreDisplay();
}

function updateHighScoreDisplay() {
    highScoreDisplay.innerText = highScore;
    finalHighScoreDisplay.innerText = highScore;
}

// Loop
function gameLoop() {
    if (!isGameOver && !isPaused) {
        applyGravity();
        movePipes();
        detectCollision();
    }
    requestAnimationFrame(gameLoop);
}

// Boot
document.addEventListener("DOMContentLoaded", () => {
    startButton.addEventListener('click', startGame);
    restartButton.addEventListener('click', startGame);
    window.addEventListener('keydown', (e) => {
        if (e.key.toLowerCase() === 'p') {
            togglePause();
        }
    });
    loadHighScore();
    startMenu.style.display = 'flex';
    requestAnimationFrame(gameLoop);
});

