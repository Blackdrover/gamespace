const canvas = document.getElementById("myCanvas");
const ctx = canvas.getContext("2d");
const audio = document.getElementById('gifAudio');
const coinCollectSound = document.getElementById('coinSound');
const gameOverSound = document.getElementById('gameOver');

const playerWidth = 80;
const playerHeight = 75;
// Puedes ajustar este valor para un movimiento más suave (por ejemplo, 5 o 10)
const velocity = 5;
const fps = 60;
const minEnemiesVelocity = 1;
const maxEnemiesVelocity = 8;
let recordMaxCoins = 0;
let coins = 0;
let startInterval = false;
let intervalID = 0;
let playerPosition = { 
    x: canvas.width / 2 - playerWidth / 2, 
    y: canvas.height / 2 - playerHeight / 2
};
let paused = true; // Variable para controlar si el juego está pausado o no

let enemies = [];

// Objeto para llevar el control de las teclas presionadas
let keys = {};

// Escuchar cuando se presionan las teclas
document.addEventListener('keydown', (e) => {
    if (e.key === 'r' || e.key === 'R' && paused == true) {
        newGame();
    } else {
    keys[e.key] = true;
    }
});

// Escuchar cuando se sueltan las teclas
document.addEventListener('keyup', (e) => {
    keys[e.key] = false;
});

function newGame(){
    gameOverSound.pause();
    audio.currentTime = 0;
    audio.play();
    playerPosition = { 
        x: canvas.width / 2 - playerWidth / 2, 
        y: canvas.height / 2 - playerHeight / 2
    };
    clearInterval(intervalID);
    startInterval = false;
    enemies = [];
    keys = {};
    coins = 0;
    paused = false;

}

function drawPlayer() {
    const playerImage = new Image();
    playerImage.src = "assets/character.png"; 
    // Espera a que la imagen cargue para evitar errores de renderizado
    ctx.drawImage(playerImage, playerPosition.x, playerPosition.y, playerWidth, playerHeight);
    
    // También se podría pre-cargar la imagen para evitar tener que cargarla cada frame.
}

function checkCollision(obj1, obj2) {

    return obj1.x < obj2.x + obj2.w &&
           obj1.x + playerWidth > obj2.x &&
           obj1.y < obj2.y + obj2.h &&
           obj1.y + playerHeight > obj2.y;
}


function clearCanvas() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
}

function updateCoins(){
    ctx.font = "20px Arial";
    ctx.fillStyle = "red";
    ctx.fillText(`Record : ${recordMaxCoins}`, canvas.width - 160,40);
    ctx.fillText(`Puntos : ${coins}`, 40,40);
}
// Función para actualizar la posición del jugador según las teclas presionadas
function updatePlayerPosition() {
    // Mover a la izquierda
    if ((keys['a'] || keys['A'] || keys['ArrowLeft']) && playerPosition.x > 0) {
        playerPosition.x -= velocity;
    }
    // Mover a la derecha
    if ((keys['d'] || keys['D'] || keys['ArrowRight']) && playerPosition.x + playerWidth < canvas.width) {
        playerPosition.x += velocity;
    }
}

function gameLoop() {

    if (paused) {
        if(startInterval == false){
            ctx.font = "20px Arial";
            ctx.fillStyle = "red";
            ctx.fillText("Presiona (R) para comenzar", canvas.width / 2 - 120, canvas.height / 2);
        }else{
        audio.pause();
        ctx.font = "30px Arial";
        ctx.fillStyle = "red";
        ctx.fillText("GAME OVER", canvas.width / 2 - 80, canvas.height / 2);
        ctx.font = "20px Arial";
        ctx.fillStyle = "red";
        ctx.fillText("Presiona (R) para reiniciar", canvas.width / 2 - 105, canvas.height / 2 + 40);
        }
        requestAnimationFrame(gameLoop);
        return; // No actualizamos el estado del juego mientras está pausado
    }
    clearCanvas();
    updateCoins();
    updatePlayerPosition();
    drawPlayer();
    generateEnemies();
    requestAnimationFrame(gameLoop);
    
}

function getRandomIntInclusive(min, max) {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min + 1) + min);
}

function generateEnemies() {

    if(startInterval == false){
        intervalID = setInterval(() => {
            const isCoin = Math.random() < 0.9 ? 0 : 1;
            let randomPosition = isCoin ? getRandomIntInclusive(0, canvas.width - 20 ) : getRandomIntInclusive(-100, 100) + playerPosition.x;
            let enemy = { x: randomPosition, y: 0, w: 40, h: 40 ,isCoin: isCoin};
            enemies.push(enemy);
        }, 600);
        startInterval = true;
    }
    drawEnemies();
}

function drawEnemies() {
    enemies.forEach((enemy, index) => {
        // Actualiza la posición vertical del enemigo
        enemy.y += getRandomIntInclusive(minEnemiesVelocity, maxEnemiesVelocity);
        const enemyImage = new Image();
        enemyImage.src = enemy.isCoin ? "assets/coin.gif":"assets/enemies.png"; 
        ctx.drawImage(enemyImage, enemy.x, enemy.y, enemy.w, enemy.h);

        if (checkCollision(playerPosition, enemy)) {
            if(enemy.isCoin){
                coinCollectSound.currentTime = 0;
                coinCollectSound.play();
                enemies.splice(index, 1); 
                coins ++;
                recordMaxCoins = recordMaxCoins < coins ? coins : recordMaxCoins;
            }else{  
                gameOverSound.currentTime = 0;
                gameOverSound.play();
                paused = true;
            }
        }
    

        // Eliminar el enemigo si sale del canvas
        if (enemy.y > canvas.height) {
            enemies.splice(index, 1); 
        }
    });
}

// Inicia el ciclo del juego
gameLoop();

