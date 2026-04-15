// Game State
let score = 0;
let combo = 0;
let highscore = localStorage.getItem('mathChallengeHighscore') || 0;
let level = 'Easy';
let gameActive = true;
let timerInterval;
let timeLeft = 60;
let currentProblem = '';
let correctAnswer = 0;
let lives = 3; // 3 lives before game over

// DOM Elements
const scoreEl = document.getElementById('score');
const comboEl = document.getElementById('combo');
const highscoreEl = document.getElementById('highscore');
const levelEl = document.getElementById('level');
const problemEl = document.getElementById('problem');
const answerInput = document.getElementById('answer-input');
const submitBtn = document.getElementById('submit-btn');
const timerProgress = document.getElementById('timer-progress');
const timerText = document.getElementById('timer-text');
const restartBtn = document.getElementById('restart-btn');
const gameOverOverlay = document.getElementById('game-over-overlay');
const finalScoreEl = document.getElementById('final-score-value');
const playAgainBtn = document.getElementById('play-again-btn');

// Canvas for particles
const canvas = document.getElementById('particles-canvas');
const ctx = canvas.getContext('2d');
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

// Audio Context for sounds
let audioCtx;

// Init Game
function init() {
    gameOverOverlay.classList.add('hidden');
    gameActive = true;
    lives = 3;
    updateUI();
    generateProblem();
    answerInput.focus();
    startParticles();
    initAudio();
    // Event listeners
    submitBtn.addEventListener('click', checkAnswer);
    answerInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') checkAnswer();
    });
    restartBtn.addEventListener('click', restart);
    playAgainBtn.addEventListener('click', restart);
    window.addEventListener('resize', () => {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
    });
    // Show photos even if no img (keep hearts/names)
    document.querySelectorAll('.photo-heart img').forEach(img => {
        img.onerror = () => {
            img.style.display = 'none';
        };
    });
}

// Update UI
function updateUI() {
    scoreEl.textContent = score;
    comboEl.textContent = combo;
    highscoreEl.textContent = highscore;
    levelEl.textContent = level;
}

// Generate random math problem respecting PEMDAS: a op1 b op2 c op3 d
function generateProblem() {
    const ops = ['+', '-', '×'];
    // Scale ranges by level
    let maxNum = 10;
    if (level === 'Medium') maxNum = 20;
    if (level === 'Hard') maxNum = 50;
    
    const a = Math.floor(Math.random() * maxNum) + 1;
    const b = Math.floor(Math.random() * maxNum) + 1;
    const c = Math.floor(Math.random() * maxNum) + 1;
    const d = Math.floor(Math.random() * maxNum) + 1;
    
    const op1 = ops[Math.floor(Math.random() * ops.length)];
    const op2 = ops[Math.floor(Math.random() * ops.length)];
    const op3 = ops[Math.floor(Math.random() * ops.length)];
    
    // Build expression string and compute safe answer
    const exprStr = `${a} ${op1} ${b} ${op2} ${c} ${op3} ${d}`;
    
    // Safe evaluation (manual calc for safety, but using eval with sanitized input)
    // Replace × with *, evaluate
    let calcStr = exprStr.replace(/×/g, '*');
    correctAnswer = eval(calcStr); // Safe since only numbers/ops
    
    currentProblem = exprStr;
    problemEl.textContent = currentProblem;
    
    answerInput.value = '';
    answerInput.focus();
    startTimer();
}

// Start timer
function startTimer() {
    timeLeft = 60;
        const minutes = Math.floor(timeLeft / 60);
        const seconds = timeLeft % 60;
        timerText.textContent = `${minutes}:${seconds.toString().padStart(2, '0')}`;
        timerProgress.style.width = '100%';
    
    timerInterval = setInterval(() => {
        timeLeft--;
        const progress = (timeLeft / 1) * 1;
        timerProgress.style.width = `${progress}%`;
        const minutes = Math.floor(timeLeft / 60);
        const seconds = timeLeft % 60;
        timerText.textContent = `${minutes}:${seconds.toString().padStart(2, '0')}`;
        // Urgency colors
        timerProgress.className = '';
        if (timeLeft <= 10) {
            timerProgress.classList.add('timer-danger');
            timerText.style.color = '#ff4444';
        } else if (timeLeft <= 8) {
            timerProgress.classList.add('timer-warning');
            timerText.style.color = '#ffaa00';
        }
        
        if (timeLeft <= 0) {
            clearInterval(timerInterval);
            wrongAnswer();
        }
    }, 1000);
}

// Check answer
function checkAnswer() {
    if (!gameActive) return;
    
    const userAnswer = parseInt(answerInput.value);
    clearInterval(timerInterval);
    
    if (userAnswer === correctAnswer) {
        correctAnswerAnim();
        playSound(523.25, 0.2); // C note
        score += 10 + (combo * 2);
        combo++;
        updateComboBonus();
        checkLevelUp();
        updateUI();
        setTimeout(generateProblem, 800);
    } else {
        wrongAnswer();
    }
}

function wrongAnswer() {
    lives--;
    combo = 0;
    problemEl.textContent = `Errado! Era ${correctAnswer}`;
    wrongAnim();
    playSound(130.81, 0.3); // Low C
    answerInput.style.borderColor = '#ff4444';
    
    updateUI();
    
    if (lives <= 0) {
        gameOver();
    } else {
        setTimeout(() => {
            generateProblem();
        }, 1500);
    }
}

// Animations
function correctAnswerAnim() {
    problemEl.classList.add('correct');
    setTimeout(() => problemEl.classList.remove('correct'), 500);
}

function wrongAnim() {
    document.querySelector('.problem-container').classList.add('wrong');
    setTimeout(() => document.querySelector('.problem-container').classList.remove('wrong'), 500);
}

// Update combo bonus
function updateComboBonus() {
    if (combo >= 5) score += 10;
    else if (combo >= 3) score += 5;
}

// Check level up
function checkLevelUp() {
    if (score > highscore) {
        highscore = score;
        localStorage.setItem('mathChallengeHighscore', highscore);
    }
    
    if (score >= 100 && level === 'Easy') {
        level = 'Medium';
    } else if (score >= 250 && level === 'Medium') {
        level = 'Hard';
    }
}

// Game Over
function gameOver() {
    gameActive = false;
    finalScoreEl.textContent = score;
    gameOverOverlay.classList.remove('hidden');
}

// Restart
function restart() {
    gameActive = true;
    score = 0;
    combo = 0;
    lives = 3;
    level = 'Easy';
    gameOverOverlay.classList.add('hidden');
    clearInterval(timerInterval);
    updateUI();
    generateProblem();
}

// Particles Background
let particles = [];

function startParticles() {
    for (let i = 0; i < 100; i++) {
        particles.push({
            x: Math.random() * canvas.width,
            y: Math.random() * canvas.height,
            vx: (Math.random() - 0.5) * 0.5,
            vy: (Math.random() - 0.5) * 0.5,
            radius: Math.random() * 2 + 1,
            alpha: Math.random() * 0.5 + 0.2,
            color: `hsl(${Math.random() * 60 + 270}, 100%, ${Math.random() * 40 + 50}%)` // Blues/purples
        });
    }
    animateParticles();
}

function animateParticles() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    particles.forEach(p => {
        ctx.save();
        ctx.globalAlpha = p.alpha;
        ctx.fillStyle = p.color;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
        
        p.x += p.vx;
        p.y += p.vy;
        p.alpha += (Math.random() - 0.5) * 0.02;
        
        if (p.x < 0 || p.x > canvas.width) p.vx *= -1;
        if (p.y < 0 || p.y > canvas.height) p.vy *= -1;
    });
    
    requestAnimationFrame(animateParticles);
}

// Simple Audio
function initAudio() {
    audioCtx = new (window.AudioContext || window.webkitAudioContext)();
}

function playSound(frequency, duration) {
    const oscillator = audioCtx.createOscillator();
    const gainNode = audioCtx.createGain();
    
    oscillator.connect(gainNode);
    gainNode.connect(audioCtx.destination);
    
    oscillator.frequency.value = frequency;
    oscillator.type = 'sine';
    
    gainNode.gain.setValueAtTime(0.3, audioCtx.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + duration);
    
    oscillator.start(audioCtx.currentTime);
    oscillator.stop(audioCtx.currentTime + duration);
}

// Start game
window.addEventListener('load', init);

