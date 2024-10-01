let outerMid = document.getElementsByClassName('outer-mid')[0];
let bird = document.getElementsByClassName('bird')[0];

// Get initial viewport dimensions
let viewportHeight = window.innerHeight;
let viewportWidth = window.innerWidth;

// Gravity and jump strength scaled according to viewport height for responsiveness
let gravity = viewportHeight * 0.0007; // Adjusted gravity strength
let jumpStrength = -viewportHeight * 0.015; // Adjusted jump strength

let isJumping = false; 
let ground = viewportHeight - bird.offsetHeight; // Dynamic ground level based on viewport height

let gameRunning = false; // Control game state
let gameHold = false;

// Resize event to update calculations when the viewport changes
window.addEventListener('resize', function() {
    viewportHeight = window.innerHeight;
    viewportWidth = window.innerWidth;

    // Recalculate gravity, jump strength, and other dynamic values
    gravity = viewportHeight * 0.0007;
    jumpStrength = -viewportHeight * 0.015;
    ground = viewportHeight - bird.offsetHeight;
    initialGap = viewportHeight * 0.3;
    minBarHeight = viewportHeight * 0.15;
    maxBarHeight = viewportHeight * 0.45;
    barVelocity = viewportWidth * 0.003; // Reduced bar velocity
    speedIncreaseFactor = viewportWidth * 0.00001; // Slower speed increase
});

document.addEventListener('keydown', function(event) {
    if (event.code === 'Space') {
        isJumping = true;
        velocity = jumpStrength;

        if (!gameRunning && !gameHold) {
            gameRunning = true;
            applyGravity();
            moveBars(right[0]);
        }
    }
});

document.addEventListener('touchstart', function(event) {
    isJumping = true;
    velocity = jumpStrength;

    if (!gameRunning && !gameHold) {
        gameRunning = true;
        applyGravity();
        moveBars(right[0]);
    }
});

document.addEventListener('keyup', function(event) {
    if (event.code === 'Space') {
        isJumping = false;
    }
});

document.addEventListener('touchend', function(event) {
    isJumping = false;
});

let outerTop = outerMid.getBoundingClientRect().top;

function applyGravity() {
    if (!gameRunning) return;

    if (!isJumping) {
        velocity += gravity; // Apply scaled gravity
    }

    let rect = bird.getBoundingClientRect();
    let newTop = rect.top - outerTop + velocity;

    // Prevent bird from going below ground or above the container
    if (newTop > ground) {
        newTop = ground;
        velocity = 0;
    } else if (newTop < 0) {
        newTop = 0;
        velocity = 0;
    }

    bird.style.top = newTop + 'px';

    requestAnimationFrame(applyGravity);
}

// Bar Movement
let bar1 = { a: document.getElementsByClassName('bar-1a')[0], b: document.getElementsByClassName('bar-1b')[0] };
let bar2 = { a: document.getElementsByClassName('bar-2a')[0], b: document.getElementsByClassName('bar-2b')[0] };
let bar3 = { a: document.getElementsByClassName('bar-3a')[0], b: document.getElementsByClassName('bar-3b')[0] };
let bar4 = { a: document.getElementsByClassName('bar-4a')[0], b: document.getElementsByClassName('bar-4b')[0] };

let right = [bar1, bar2, bar3, bar4];
let left = [];

let initialGap = viewportHeight * 0.3; // Scaled initial gap between bars
let gap = initialGap;
let minBarHeight = viewportHeight * 0.15; // Adjusted min bar height
let maxBarHeight = viewportHeight * 0.45; // Adjusted max bar height

let gapDecreaseFactor = viewportHeight * 0.0003; // Reduced gap decrease factor
let barVelocity = viewportWidth * 0.003;    // Reduced bar speed based on viewport width
let speedIncreaseFactor = viewportWidth * 0.00001; // Slower speed increase factor

function getRandomNumber() {
    return Math.floor(Math.random() * (maxBarHeight - minBarHeight + 1)) + minBarHeight;
}

function setgap(bar) {
    let random = getRandomNumber();
    bar.a.style.height = `${random}px`;
    bar.b.style.height = `${viewportHeight - gap - random}px`;
    return bar;
}

let score = 0; // Initial score
let scoreElement = document.getElementById('score'); // Reference to the score element

function updateScore() {
    scoreElement.innerHTML = `Score: ${score}`;
}

function moveBars(bar) {
    if (!gameRunning) return;

    detectCollision(bar);
    bar = setgap(bar);

    left.push(bar);
    right.shift();

    let barPos = viewportWidth; // Bar starting position scaled to viewport width
    let first1 = true;
    let hasScored = false; // Track if the score has already been counted for this bar

    function updatebars() {
        if (!gameRunning) return;

        if (barPos <= -30) {
            bar.a.style.left = `${viewportWidth + 20}px`;
            bar.b.style.left = `${viewportWidth + 20}px`;
            right.push(bar);
            left.shift();
            return;
        }

        if (barPos <= viewportWidth * 0.55 && first1) {
            first1 = false;
            moveBars(right[0]);
        }

        let birdRect = bird.getBoundingClientRect();
        if (!hasScored && barPos + bar.a.offsetWidth < birdRect.left) {
            score++;
            updateScore();
            hasScored = true;
        }

        barPos -= barVelocity; // Move bar with scaled velocity
        bar.a.style.left = `${barPos}px`;
        bar.b.style.left = `${barPos}px`;

        requestAnimationFrame(updatebars);
    }

    updatebars();
}

setInterval(function() {
    if (gameRunning) {
        barVelocity += speedIncreaseFactor; // Gradually increase bar speed
        gap -= gapDecreaseFactor; // Decrease the gap between bars
    }
}, 100);

// Collision Detection
function detectCollision(bar) {
    let tobreak = true;

    function checkCollision() {
        if (!tobreak || !gameRunning) return;

        let birdRect = bird.getBoundingClientRect();
        let bar1Rect = bar.a.getBoundingClientRect();
        let bar2Rect = bar.b.getBoundingClientRect();

        if (birdRect.left < bar1Rect.right) {
            if ((birdRect.right > bar1Rect.left && birdRect.top < bar1Rect.bottom) ||
                (birdRect.bottom > bar2Rect.top && birdRect.right > bar2Rect.left)) {
                gameRunning = false;
                tobreak = false;

                const outerElement = document.querySelector('.outer');
                outerElement.classList.add('shake');

                let gameOver = document.getElementById('game-over');
                gameOver.style.display = 'block';
                gameOver.style.opacity = '0';

                setTimeout(() => {
                    gameOver.style.transition = 'opacity 1s ease';
                    gameOver.style.opacity = '1';
                }, 100);

                setTimeout(() => {
                    outerElement.classList.remove('shake');
                }, 500);

                bird.style.transition = 'top 2s ease, opacity 2s ease';
                bird.style.top = `${ground}px`;
                bird.style.opacity = '0';

                gameHold = true;
                setTimeout(resetGame, 2000);
                setTimeout(() => {
                    gameHold = false;
                }, 2000);
            }
        }

        if (gameRunning) {
            requestAnimationFrame(checkCollision);
        }
    }

    checkCollision();
}

// Reset Game
function resetGame() {
    resetBars();
    gap = initialGap;
    document.getElementById('game-over').style.display = 'none';
    bird.style.opacity = '1';
    bird.style.transition = '';
    bird.style.top = `${viewportHeight * 0.4}px`; // Reset bird position
    velocity = 0;
    isJumping = false;
    gameRunning = false;
    barVelocity = viewportWidth * 0.003; // Reset bar velocity
    score = 0;
    updateScore();
}

function resetBars() {
    right = [bar1, bar2, bar3, bar4];
    right.forEach(bar => {
        bar.a.style.left = `${viewportWidth}px`;
        bar.b.style.left = `${viewportWidth}px`;
    });
}
