let outerMid = document.getElementsByClassName('outer-mid')[0];
let outerRect = outerMid.getBoundingClientRect();




let bird = document.getElementsByClassName('bird')[0];

const gravity = 0.2; // Gravity strength

const jumpStrength = -outerMid.offsetHeight * 0.01; // Jump strength

let isJumping = false; 
const ground = 450; // Ground level

let gameRunning = false; // Control game state

let gameHold = false;
document.addEventListener('keydown', function(event) {

    if (event.code === 'Space') {
        isJumping = true;
        velocity = jumpStrength;

        if(!gameRunning && !gameHold){
            gameRunning = true;
            applyGravity();
            moveBars(right[0]);
        }
    }
});




let outerTop = outerRect.top;

function applyGravity() {
    if (!gameRunning) return;
    if (!isJumping) {
        velocity += gravity; 
    }

    let rect = bird.getBoundingClientRect();
    let newTop = rect.top - outerTop + velocity;

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


let intitialGap = 200; // Initial Gap
let gap = intitialGap;
let min = 20;
let max = 280;

let gapDecreaseFactor = 0.1; // Gap Decrease Factor

let initialBarVelocity = 2; // Initial bar velocity
let barVelocity = initialBarVelocity;
let speedIncreaseFactor = 0.01 ; // Speed increase factor



function getRandomNumber() {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

function setgap(bar) {
    let random = getRandomNumber();
    bar.a.style.height = `${random}px`;
    bar.b.style.height = `${500 - gap - random}px`;
    return bar;
}

function moveBars(bar) {
    if (!gameRunning) return; 

    detectCollision(bar);
    bar = setgap(bar);

    left.push(bar);
    right.shift();

    let barPos = 500;  // Bar Starting Pos
    let first1 = true;

    function updatebars() {
        if (!gameRunning) return;

        if (barPos <= -30) {
            bar.a.style.left = "520px";
            bar.b.style.left = "520px";
            right.push(bar);
            left.shift();
            return; 
        }

        if (barPos <= 300 && first1) {
            first1 = false;
            moveBars(right[0]);
        }

        barPos -= barVelocity; 
        bar.a.style.left = `${barPos}px`;
        bar.b.style.left = `${barPos}px`;

        requestAnimationFrame(updatebars);
    }

    updatebars();
}

// Gradually increase bar speed during gameplay
function increaseBarSpeed() {
    barVelocity += speedIncreaseFactor;
}
function decreaseGap() {
    gap -= gapDecreaseFactor; 
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
                bird.style.top = '450px'; 
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

    gap = intitialGap; 

    document.getElementById('game-over').style.display = 'none';

    bird.style.opacity = '1';
    bird.style.transition = ''; 

    bird.style.top = '200px'; 
    velocity = 0; 
    isJumping = false;
    gameRunning = false; 

    barVelocity = initialBarVelocity;
}

// Reset Bar Positions
function resetBars() {
    right = [bar1, bar2, bar3, bar4];

    bar1.a.style.left = "500px";
    bar1.b.style.left = "500px";

    bar2.a.style.left = "500px";
    bar2.b.style.left = "500px";

    bar3.a.style.left = "500px";
    bar3.b.style.left = "500px";

    bar4.a.style.left = "500px";
    bar4.b.style.left = "500px";
}

document.addEventListener('keydown', function(event) {
    if (event.code === 'Space' && !gameRunning) {
        resetGame(); 
    }
});
