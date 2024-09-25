let outerMid = document.getElementsByClassName('outer-mid')[0];
let outerRect = outerMid.getBoundingClientRect();

let bird = document.getElementsByClassName('bird')[0];

// Gravity and jump strength scaled to outerMid height for responsiveness
const gravity = outerMid.offsetHeight * 0.0005; // Scaled gravity
const jumpStrength = -outerMid.offsetHeight * 0.01; // Scaled jump strength

let isJumping = false; 
const ground = outerMid.offsetHeight - bird.offsetHeight; // Dynamic ground level based on container height

let gameRunning = false; // Control game state
let gameHold = false;

document.addEventListener('keydown' , function(event) {
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

document.addEventListener('touchstart' , function(event) {
    isJumping = true;
    velocity = jumpStrength;

    if (!gameRunning && !gameHold) {
        gameRunning = true;
        applyGravity();
        moveBars(right[0]);
    }
});

let outerTop = outerRect.top;

function applyGravity() {
    if (!gameRunning) return;

    if (!isJumping) {
        velocity += gravity; // Apply gravity
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

document.addEventListener('keyup', function(event) {
    if (event.code === 'Space') {
        isJumping = false;
    }
});

// Bar Movement

let bar1 = {
    a: document.getElementsByClassName('bar-1a')[0],
    b: document.getElementsByClassName('bar-1b')[0]
};

let bar2 = {
    a: document.getElementsByClassName('bar-2a')[0],
    b: document.getElementsByClassName('bar-2b')[0]
};

let bar3 = {
    a: document.getElementsByClassName('bar-3a')[0],
    b: document.getElementsByClassName('bar-3b')[0]
};

let bar4 = {
    a: document.getElementsByClassName('bar-4a')[0],
    b: document.getElementsByClassName('bar-4b')[0]
};

let right = [bar1, bar2, bar3, bar4];
let left = [];

let initialGap = outerMid.offsetHeight * 0.4; // Scaled initial gap between bars
let gap = initialGap;
let min = outerMid.offsetHeight * 0.2; // Scaled min bar height
let max = outerMid.offsetHeight * 0.6; // Scaled max bar height

let gapDecreaseFactor = outerMid.offsetHeight * 0.0005; // Scale gap decrease factor
let initialBarVelocity = outerMid.offsetWidth * 0.004; // Scale bar speed based on container width

let barVelocity = initialBarVelocity;   


let speedIncreaseFactor = outerMid.offsetWidth * 0.00003; // Scale speed increase factor

function getRandomNumber() {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

function setgap(bar) {
    let random = getRandomNumber();
    bar.a.style.height = `${random}px`;
    bar.b.style.height = `${outerMid.offsetHeight - gap - random}px`;
    return bar;
}

function moveBars(bar) {
    if (!gameRunning) return;

    detectCollision(bar);
    bar = setgap(bar);

    left.push(bar);
    right.shift();

    let barPos = outerMid.offsetWidth; // Bar starting position is scaled to container width
    let first1 = true;

    function updatebars() {
        if (!gameRunning) return;

        if (barPos <= -30) {
            bar.a.style.left = `${outerMid.offsetWidth + 20}px`;
            bar.b.style.left = `${outerMid.offsetWidth + 20}px`;
            right.push(bar);
            left.shift();
            return;
        }

        if (barPos <= outerMid.offsetWidth * 0.6 && first1) {
            first1 = false;
            moveBars(right[0]);
        }

        barPos -= barVelocity; // Move bar with scaled velocity
        bar.a.style.left = `${barPos}px`;
        bar.b.style.left = `${barPos}px`;

        requestAnimationFrame(updatebars);
    }

    updatebars();
}

// Gradually increase bar speed during gameplay
function increaseBarSpeed() {
    barVelocity += speedIncreaseFactor; // Increase speed over time
}

function decreaseGap() {
    gap -= gapDecreaseFactor; // Decrease the gap between bars
}

setInterval(function() {
    if (gameRunning) {
        increaseBarSpeed();
        decreaseGap();
    }
}, 100);

// Detecting Collision

function detectCollision(bar) {
    let tobreak = true;

    function checkCollision() {
        if (!tobreak || !gameRunning) return;

        let birdRect = bird.getBoundingClientRect();
        let bar1Rect = bar.a.getBoundingClientRect();
        let bar2Rect = bar.b.getBoundingClientRect();

        if (birdRect.left < bar1Rect.right) {
            if (
                (birdRect.right > bar1Rect.left && birdRect.top < bar1Rect.bottom) ||
                (birdRect.bottom > bar2Rect.top && birdRect.right > bar2Rect.left)
            ) {
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

// Reset Game Function
function resetGame() {
    resetBars();

    gap = initialGap; // Reset the gap

    document.getElementById('game-over').style.display = 'none';

    bird.style.opacity = '1';
    bird.style.transition = '';

    bird.style.top = `${outerMid.offsetHeight * 0.4}px`; // Reset bird position
    velocity = 0;
    isJumping = false;
    gameRunning = false;

    barVelocity = initialBarVelocity; // Reset bar velocity
}

// Reset Bar Positions
function resetBars() {
    right = [bar1, bar2, bar3, bar4];

    right.forEach(bar => {
        bar.a.style.left = `${outerMid.offsetWidth}px`;
        bar.b.style.left = `${outerMid.offsetWidth}px`;
    });
}


