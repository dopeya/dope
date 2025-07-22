// Game variables
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const scoreElement = document.getElementById('score');
const livesElement = document.getElementById('lives');
const gameOverElement = document.getElementById('gameOver');
const startScreenElement = document.getElementById('startScreen');
const finalScoreElement = document.getElementById('finalScore');
const startBtn = document.getElementById('startBtn');
const restartBtn = document.getElementById('restartBtn');

// Game state
let gameState = 'start'; // 'start', 'playing', 'gameOver'
let score = 0;
let lives = 3;
let keys = {};

// Game objects
let player;
let bullets = [];
let enemies = [];
let particles = [];
let powerUps = [];

// Game settings
const PLAYER_SPEED = 5;
const BULLET_SPEED = 8;
const ENEMY_SPEED = 2;
const ENEMY_SPAWN_RATE = 0.02;
const POWERUP_SPAWN_RATE = 0.005;

// Player class
class Player {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.width = 30;
        this.height = 40;
        this.speed = PLAYER_SPEED;
        this.health = 100;
    }
    
    update() {
        // Movement
        if ((keys['ArrowLeft'] || keys['a'] || keys['A']) && this.x > 0) {
            this.x -= this.speed;
        }
        if ((keys['ArrowRight'] || keys['d'] || keys['D']) && this.x < canvas.width - this.width) {
            this.x += this.speed;
        }
        if ((keys['ArrowUp'] || keys['w'] || keys['W']) && this.y > 0) {
            this.y -= this.speed;
        }
        if ((keys['ArrowDown'] || keys['s'] || keys['S']) && this.y < canvas.height - this.height) {
            this.y += this.speed;
        }
        
        // Shooting
        if (keys[' '] || keys['Space']) {
            this.shoot();
        }
    }
    
    shoot() {
        // Limit shooting rate
        if (!this.lastShot || Date.now() - this.lastShot > 150) {
            bullets.push(new Bullet(this.x + this.width / 2, this.y, -BULLET_SPEED));
            this.lastShot = Date.now();
        }
    }
    
    draw() {
        // Draw player ship
        ctx.fillStyle = '#00ff88';
        ctx.fillRect(this.x, this.y, this.width, this.height);
        
        // Draw ship details
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(this.x + 5, this.y + 5, 5, 10);
        ctx.fillRect(this.x + 20, this.y + 5, 5, 10);
        ctx.fillRect(this.x + 12, this.y, 6, 15);
        
        // Draw engine glow
        ctx.fillStyle = '#ff4444';
        ctx.fillRect(this.x + 8, this.y + this.height, 4, 8);
        ctx.fillRect(this.x + 18, this.y + this.height, 4, 8);
    }
}

// Bullet class
class Bullet {
    constructor(x, y, speedY, isEnemy = false) {
        this.x = x;
        this.y = y;
        this.width = 3;
        this.height = 8;
        this.speedY = speedY;
        this.isEnemy = isEnemy;
    }
    
    update() {
        this.y += this.speedY;
    }
    
    draw() {
        ctx.fillStyle = this.isEnemy ? '#ff4444' : '#ffff00';
        ctx.fillRect(this.x, this.y, this.width, this.height);
        
        // Add glow effect
        ctx.shadowBlur = 10;
        ctx.shadowColor = this.isEnemy ? '#ff4444' : '#ffff00';
        ctx.fillRect(this.x, this.y, this.width, this.height);
        ctx.shadowBlur = 0;
    }
}

// Enemy class
class Enemy {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.width = 25;
        this.height = 25;
        this.speed = ENEMY_SPEED + Math.random() * 2;
        this.health = 1;
        this.lastShot = 0;
        this.shootRate = Math.random() * 2000 + 1000; // Random shoot rate
    }
    
    update() {
        this.y += this.speed;
        
        // Enemy shooting
        if (Date.now() - this.lastShot > this.shootRate) {
            bullets.push(new Bullet(this.x + this.width / 2, this.y + this.height, 4, true));
            this.lastShot = Date.now();
        }
    }
    
    draw() {
        // Draw enemy ship
        ctx.fillStyle = '#ff4444';
        ctx.fillRect(this.x, this.y, this.width, this.height);
        
        // Draw enemy details
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(this.x + 3, this.y + 3, 3, 3);
        ctx.fillRect(this.x + 19, this.y + 3, 3, 3);
        ctx.fillRect(this.x + 10, this.y + 8, 5, 8);
    }
}

// Particle class for explosions
class Particle {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.speedX = (Math.random() - 0.5) * 10;
        this.speedY = (Math.random() - 0.5) * 10;
        this.life = 30;
        this.maxLife = 30;
        this.size = Math.random() * 4 + 2;
    }
    
    update() {
        this.x += this.speedX;
        this.y += this.speedY;
        this.life--;
        this.speedX *= 0.98;
        this.speedY *= 0.98;
    }
    
    draw() {
        const alpha = this.life / this.maxLife;
        ctx.globalAlpha = alpha;
        ctx.fillStyle = `hsl(${Math.random() * 60 + 15}, 100%, 50%)`; // Orange to yellow
        ctx.fillRect(this.x, this.y, this.size, this.size);
        ctx.globalAlpha = 1;
    }
}

// PowerUp class
class PowerUp {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.width = 20;
        this.height = 20;
        this.speed = 1;
        this.type = Math.random() < 0.5 ? 'health' : 'multishot';
        this.rotation = 0;
    }
    
    update() {
        this.y += this.speed;
        this.rotation += 0.1;
    }
    
    draw() {
        ctx.save();
        ctx.translate(this.x + this.width / 2, this.y + this.height / 2);
        ctx.rotate(this.rotation);
        
        if (this.type === 'health') {
            ctx.fillStyle = '#00ff00';
            ctx.fillRect(-this.width / 2, -this.height / 2, this.width, this.height);
            ctx.fillStyle = '#ffffff';
            ctx.fillRect(-2, -8, 4, 16);
            ctx.fillRect(-8, -2, 16, 4);
        } else {
            ctx.fillStyle = '#0088ff';
            ctx.fillRect(-this.width / 2, -this.height / 2, this.width, this.height);
            ctx.fillStyle = '#ffffff';
            ctx.fillRect(-1, -8, 2, 16);
            ctx.fillRect(-8, -1, 16, 2);
            ctx.fillRect(-6, -6, 2, 2);
            ctx.fillRect(4, -6, 2, 2);
            ctx.fillRect(-6, 4, 2, 2);
            ctx.fillRect(4, 4, 2, 2);
        }
        
        ctx.restore();
    }
}

// Collision detection
function checkCollision(rect1, rect2) {
    return rect1.x < rect2.x + rect2.width &&
           rect1.x + rect1.width > rect2.x &&
           rect1.y < rect2.y + rect2.height &&
           rect1.y + rect1.height > rect2.y;
}

// Create explosion particles
function createExplosion(x, y, count = 10) {
    for (let i = 0; i < count; i++) {
        particles.push(new Particle(x, y));
    }
}

// Spawn enemies
function spawnEnemies() {
    if (Math.random() < ENEMY_SPAWN_RATE) {
        const x = Math.random() * (canvas.width - 25);
        enemies.push(new Enemy(x, -25));
    }
}

// Spawn power-ups
function spawnPowerUps() {
    if (Math.random() < POWERUP_SPAWN_RATE) {
        const x = Math.random() * (canvas.width - 20);
        powerUps.push(new PowerUp(x, -20));
    }
}

// Update game objects
function updateGame() {
    if (gameState !== 'playing') return;
    
    // Update player
    player.update();
    
    // Update bullets
    bullets.forEach((bullet, index) => {
        bullet.update();
        
        // Remove bullets that are off screen
        if (bullet.y < -10 || bullet.y > canvas.height + 10) {
            bullets.splice(index, 1);
        }
    });
    
    // Update enemies
    enemies.forEach((enemy, enemyIndex) => {
        enemy.update();
        
        // Remove enemies that are off screen
        if (enemy.y > canvas.height) {
            enemies.splice(enemyIndex, 1);
        }
        
        // Check collision with player
        if (checkCollision(player, enemy)) {
            createExplosion(enemy.x + enemy.width / 2, enemy.y + enemy.height / 2);
            enemies.splice(enemyIndex, 1);
            lives--;
            updateLives();
            
            if (lives <= 0) {
                gameOver();
            }
        }
        
        // Check collision with player bullets
        bullets.forEach((bullet, bulletIndex) => {
            if (!bullet.isEnemy && checkCollision(bullet, enemy)) {
                createExplosion(enemy.x + enemy.width / 2, enemy.y + enemy.height / 2);
                bullets.splice(bulletIndex, 1);
                enemies.splice(enemyIndex, 1);
                score += 10;
                updateScore();
            }
        });
    });
    
    // Check enemy bullets hitting player
    bullets.forEach((bullet, index) => {
        if (bullet.isEnemy && checkCollision(bullet, player)) {
            createExplosion(bullet.x, bullet.y);
            bullets.splice(index, 1);
            lives--;
            updateLives();
            
            if (lives <= 0) {
                gameOver();
            }
        }
    });
    
    // Update particles
    particles.forEach((particle, index) => {
        particle.update();
        if (particle.life <= 0) {
            particles.splice(index, 1);
        }
    });
    
    // Update power-ups
    powerUps.forEach((powerUp, index) => {
        powerUp.update();
        
        // Remove power-ups that are off screen
        if (powerUp.y > canvas.height) {
            powerUps.splice(index, 1);
        }
        
        // Check collision with player
        if (checkCollision(player, powerUp)) {
            if (powerUp.type === 'health') {
                lives = Math.min(lives + 1, 5);
                updateLives();
            }
            powerUps.splice(index, 1);
            score += 5;
            updateScore();
        }
    });
    
    // Spawn enemies and power-ups
    spawnEnemies();
    spawnPowerUps();
}

// Render game
function render() {
    // Clear canvas
    ctx.fillStyle = 'rgba(0, 4, 40, 0.1)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Draw stars background
    drawStars();
    
    if (gameState === 'playing') {
        // Draw game objects
        player.draw();
        
        bullets.forEach(bullet => bullet.draw());
        enemies.forEach(enemy => enemy.draw());
        particles.forEach(particle => particle.draw());
        powerUps.forEach(powerUp => powerUp.draw());
    }
}

// Draw animated stars background
let stars = [];
function initStars() {
    for (let i = 0; i < 100; i++) {
        stars.push({
            x: Math.random() * canvas.width,
            y: Math.random() * canvas.height,
            speed: Math.random() * 2 + 0.5,
            size: Math.random() * 2 + 1
        });
    }
}

function drawStars() {
    ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
    stars.forEach(star => {
        ctx.fillRect(star.x, star.y, star.size, star.size);
        star.y += star.speed;
        
        if (star.y > canvas.height) {
            star.y = -star.size;
            star.x = Math.random() * canvas.width;
        }
    });
}

// Update UI
function updateScore() {
    scoreElement.textContent = score;
}

function updateLives() {
    livesElement.textContent = lives;
}

// Game states
function startGame() {
    gameState = 'playing';
    score = 0;
    lives = 3;
    bullets = [];
    enemies = [];
    particles = [];
    powerUps = [];
    
    player = new Player(canvas.width / 2 - 15, canvas.height - 60);
    
    updateScore();
    updateLives();
    
    startScreenElement.classList.add('hidden');
    gameOverElement.classList.add('hidden');
}

function gameOver() {
    gameState = 'gameOver';
    finalScoreElement.textContent = score;
    gameOverElement.classList.remove('hidden');
}

function restartGame() {
    startGame();
}

// Event listeners
document.addEventListener('keydown', (e) => {
    keys[e.key] = true;
    
    if (e.key === 'r' || e.key === 'R') {
        if (gameState === 'gameOver') {
            restartGame();
        }
    }
});

document.addEventListener('keyup', (e) => {
    keys[e.key] = false;
});

startBtn.addEventListener('click', startGame);
restartBtn.addEventListener('click', restartGame);

// Game loop
function gameLoop() {
    updateGame();
    render();
    requestAnimationFrame(gameLoop);
}

// Initialize game
function init() {
    initStars();
    gameLoop();
}

// Start the game
init();
