const canvas = document.getElementById('canvas1')
const ctx = canvas.getContext('2d')
canvas.width = 500;
canvas.height = 350;
// global variables
const cellSize = 50;
const cellGap = 1;
const gameGrid=[];
const defenders = [];
let amountOfMoney = 650;
const enemies = [];
const enemiesPosition = [];
const boss = [];
let enemiesInterval = 600;
let frame = 0;
let gameOver = false;
const projectiles = [];
let score = 0;
const rooots= [];
let pickDefender = 0;
//mouse
const mouse = {
    x: undefined,
    y: undefined,
    width: 0.1,
    height: 0.1,
    clicked: false
}
canvas.addEventListener('mousedown', function(){
mouse.clicked = true;
});
canvas.addEventListener('mouseup', function(){
    mouse.clicked = false;
    });
let canvasPosition = canvas.getBoundingClientRect();
canvas.addEventListener("mousemove", function(e){
    mouse.x = e.x - canvasPosition.left;
    mouse.y = e.y - canvasPosition.top;
});
    canvas.addEventListener('mouseleave', function(){
        mouse.x = undefined;
        mouse.y = undefined;
});

//game board
const controlsBar = {
    width: canvas.width,
    height: cellSize,
}
class Cell {
    constructor(x, y){
        this.x = x;
        this.y = y;
        this.width = cellSize;
        this.height = cellSize;
    }
    draw (){        
        if (mouse.x && mouse.y && collision(this, mouse)){
            ctx.strokeStyle = 'gold';
            ctx.strokeRect(this.x, this.y, this.width, this.height);
        }       
    }   
}
function createGrid(){
    for(let y = cellSize; y < canvas.height; y += cellSize){
        for(let x = 0; x < canvas.width; x += cellSize){
            gameGrid.push(new Cell(x, y));
        }
    }
}
createGrid()
function handleGameGrid(){
    for(let i = 0; i< gameGrid.length; i++){
        gameGrid[i].draw();
    }
}
//projectiles
class Projectile{
    constructor(x, y,power){
        this.x = x,
        this.y = y;
        this.width = 10/2;
        this.height = 10/2;
        this.speed = 5;
        this.damage = power;
    }
    update(){
        this.x += this.speed;
    }
    draw(){
        ctx.fillStyle = '#2dea15'
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.width, 0, Math.PI *2);
        ctx.fill();
    }
}
function handleProjectiles(){
    for(let i= 0; i<projectiles.length; i++){
        projectiles[i].update();
        projectiles[i].draw();

        for(let j = 0; j < enemies.length; j++){
            if(enemies[j] && projectiles[i] && collision(projectiles[i], enemies[j])){
                enemies[j].health -= projectiles[i].damage;
                projectiles.splice(i, 1);
                i--;
            }
        }
        for(let j = 0; j < boss.length; j++){
            if(boss[j] && projectiles[i] && collision(projectiles[i], boss[j])){
                boss[j].health -= projectiles[i].damage;
                projectiles.splice(i, 1);
                i--;
            }
        }

        if(projectiles[i] && projectiles[i].x > canvas.width - cellSize){
            projectiles.splice(i, 1);
            i--;
        }
    }
}
//defenders
const defender1 = new Image()
defender1.src = './images/defender.png'
const defender2 = new Image()
defender2.src = './images/defender2.png'
class Defender{
    constructor(x, y, power){
        this.x = x;
        this.y = y;
        this.width = cellSize - cellGap *2;
        this.height = cellSize - cellGap *2;
        this.health = 100;
        this.projectiles = [];
        this.timer = 0;
        this.frameX = 0;
        this.frameY = 0;
        this.minFrame = 0;
        this.maxFrame = 9;
        this.spriteWidth = 130;
        this.spriteHeight = 130;
        this.pickedDefender = pickDefender;
        this.power1 = 15
        this.power2 = 50
    }
    draw(){
        //ctx.fillStyle = 'blue',
        //ctx.fillRect(this.x, this.y, this.width, this.height);
        ctx.fillStyle = 'green';
        ctx.font = "30px Arial";
        ctx.fillText(Math.floor(this.health), this.x + (20/2), this.y);
        //ctx.drawImage(img, sourceX, sourceY ,sourceW , sourceH, destinationX, destinationY, destinationH)
        if(this.pickedDefender === 1){
            ctx.drawImage(defender1,this.frameX * this.spriteWidth, 0, this.spriteWidth, this.spriteHeight, this.x, this.y, this.width, this.height)}
        else if(this.pickedDefender === 2){
            ctx.drawImage(defender2,this.frameX * this.spriteWidth, 0, this.spriteWidth, this.spriteHeight, this.x, this.y, this.width, this.height)}
    }
    update(){
        this.timer++;
        if(this.pickedDefender ===1){
            if(this.timer % 100 === 0){
                projectiles.push(new Projectile(this.x +(60/2), this.y+(60/2), this.power1))           
            }
        }
        if(this.pickedDefender ===2){
            if(this.timer % 100 === 0){
                projectiles.push(new Projectile(this.x +(60/2), this.y+(60/2), this.power2))           
            }
        }
        if(frame % 10 === 0){
            if(this.frameX < this.maxFrame) this.frameX ++;
            else this.frameX = this.minFrame;
        }
    }
}


function handleDefenders(){
    for(let i = 0; i< defenders.length; i++){
        defenders[i].draw();
        defenders[i].update();
            for(let j = 0; j< enemies.length; j++){
            if(defenders[i] && collision(defenders[i], enemies[j])){
                enemies[j].movement = 0;
                defenders[i].health -= 1;
            }
            if(defenders[i] && defenders[i].health <= 0){
                defenders.splice(i, 1);
                i--;
                enemies[j].movement = enemies[j].speed;
            }
        }
    }
}
const rooting = new Image()
rooting.src = './images/roots.png'
class Roots{
    constructor(x, y){
        this.x = x;
        this.y = y;
        this.width = cellSize -cellGap *2;
        this.height = cellSize -cellGap *2;
        this.health = 200;
        this.timer = 0;
        this.frameX = 0;
        this.frameY = 0;
        this.minFrame = 0;
        this.maxFrame = 7;
        this.spriteWidth = 130;
        this.spriteHeight =130;
        this.generateMoney = 25;
    }
    draw(){
        //ctx.fillStyle = 'blue',
        //ctx.fillRect(this.x, this.y, this.width, this.height);
        ctx.fillStyle = 'green';
        ctx.font = "30px Arial";
        ctx.fillText(Math.floor(this.health), this.x +(20/2), this.y);
        //ctx.drawImage(img, sourceX, sourceY ,sourceW , sourceH, destinationX, destinationY, destinationH)
        ctx.drawImage(rooting,this.frameX * this.spriteWidth, 0, this.spriteWidth, this.spriteHeight, this.x, this.y, this.width, this.height)
    }
    update(){
        this.timer++;
        if(this.timer % 100 === 0){
            amountOfMoney += this.generateMoney;    
            floatingMessages.push(new FloatingMessage(this.generateMoney+'$', this.x+(15/2) ,this.y+(50/2) ,25/2,'gold',1))
        }
        if(frame % 10 === 0){
            if(this.frameX < this.maxFrame) this.frameX ++;
            else this.frameX = this.minFrame;
        }
    }
}


function handleRoots(){
    for(let i = 0; i< rooots.length; i++){
        rooots[i].draw();
        rooots[i].update();
            for(let j = 0; j< enemies.length; j++){
            if(rooots[i] && collision(rooots[i], enemies[j])){
                enemies[j].movement = 0;
                rooots[i].health -= 1;
            }
            if(rooots[i] && rooots[i].health <= 0){
                rooots.splice(i, 1);
                i--;
                enemies[j].movement = enemies[j].speed;
                
            }
        }
    }
}
const choose1 = {
    x:700/2,y:10/2,width:70/2,height:70/2
}
const choose2 = {
    x:800/2,y:10/2,width:70/2,height:70/2
}
const choose3 = {
    x:900/2,y:10/2,width:70/2,height:70/2
}
function chooseDefender(){
    let choose1stroke = 'red'
    let choose2stroke = 'red'
    let choose3stroke = 'red'
    if (collision(mouse, choose1)&& mouse.clicked){
        pickDefender = 1;
    }
    else if(collision(mouse, choose2)&& mouse.clicked){
        pickDefender = 2;
    }
    else if(collision(mouse, choose3)&& mouse.clicked){
        pickDefender = 3;
    }
    if(pickDefender ===1){
        choose1stroke = 'gold'
        choose2stroke = 'red'
        choose3stroke = 'red'
    }
    else if(pickDefender === 2){
        choose1stroke = 'red'
        choose2stroke = 'gold'
        choose3stroke = 'red'
    }
    else if(pickDefender === 3){
        choose1stroke = 'red'
        choose2stroke = 'red'
        choose3stroke = 'gold'
    }
    else{
            choose1stroke = 'red'
            choose2stroke = 'red'
            choose3stroke = 'red'
    }
    
    ctx.lineWidth = 1;
    ctx.fillStyle = 'gold';
    ctx.font = "20px Arial";
    ctx.fillText('100', choose1.x+(20/2), choose1.y+(90/2))
    ctx.fillStyle = 'rgba(0,0,0,0)'
    ctx.fillRect(choose1.x, choose1.y, choose1.width, choose1.width);
    ctx.strokeStyle = choose1stroke;
    ctx.strokeRect(choose1.x,choose1.y,choose1.width,choose1.height)
    ctx.drawImage(defender1, 0, 0, 130, 130,choose1.x,choose1.y,130/2,130/2);

    
    ctx.fillRect(choose2.x, choose2.y, choose2.width, choose2.width);
    ctx.strokeStyle = choose2stroke;
    ctx.fillStyle = 'gold'
    ctx.font = "20px Arial";
    ctx.fillText('400', choose2.x+(20/2), choose2.y+(90/2))
    ctx.fillStyle = 'rgba(0,0,0,0)'
    ctx.strokeRect(choose2.x,choose2.y,choose2.width,choose2.height)
    
    ctx.drawImage(defender2, 0, 0, 130, 130,choose2.x,choose2.y,130/2,130/2);

    ctx.fillRect(choose3.x, choose3.y, choose3.width, choose3.width);
    ctx.strokeStyle = choose3stroke;
    ctx.fillStyle = 'gold'
    ctx.font = "20px Arial";
    ctx.fillText('150', choose3.x+(20/2), choose3.y+(90/2))
    ctx.fillStyle = 'rgba(0,0,0,0)'
    ctx.strokeRect(choose3.x,choose3.y,choose3.width,choose3.height)
    
    ctx.drawImage(rooting, choose3.x, 0, 130, 130,choose3.x,choose3.y,130/2,130/2);
}

//enemies
const enemyArmy = [];
const rexato = new Image()
rexato.src = "./images/rexato.png"
const oneEye = new Image()
oneEye.src = "./images/walkingEye.png"
enemyArmy.push(rexato);//242
enemyArmy.push(oneEye)// 
class Enemy {
    constructor(verticalPosition){
        this.x = canvas.width;
        this.y = verticalPosition;
        this.width = cellSize - cellGap * 2;
        this.height = cellSize -cellGap *2;
        this.health = 100;
        this.speed = Math.random()* 0.2 + 0.4;
        this.movement = this.speed;
        this.maxHealth = this.health;
        this.enemyArmy = enemyArmy [Math.floor(Math.random()* enemyArmy.length)];
        this.frameX = 0;
        this.frameY = 0;
        this.minFrame = 0;
        this.maxFrame = 7;
        this.spriteWidth = 130;
        this.spriteHeight =130;

    }
    update (){
        this.x -= this.movement;
        if(frame % 8 === 0){
            if(this.frameX < this.maxFrame) this.frameX ++;
            else this.frameX = this.minFrame;
        }
    }
    draw(){
        //ctx.fillStyle = 'red',
        //ctx.fillRect(this.x, this.y, this.width, this.height);
        // ctx.fillStyle = 'gold';
        // ctx.font = "30px Arial";
        // ctx.fillText(Math.floor(this.health), this.x + 20, this.y);
        ctx.drawImage(this.enemyArmy, this.frameX * this.spriteWidth, 0, this.spriteWidth, this.spriteHeight, this.x, this.y, this.width, this.height)
    }
}

function handleEnemies(){
    for (let i = 0; i< enemies.length; i++){
        enemies[i].update();
        enemies[i].draw();
    if(enemies[i].x < 0){
        gameOver = true;
    }
    if(enemies[i].health <= 0){
        let earningMoney = enemies[i].maxHealth/4;
        amountOfMoney += earningMoney;
        score += earningMoney;
        const findEnemiesVerticalIndex = enemiesPosition.indexOf(enemies[i].y);
        enemiesPosition.splice(findEnemiesVerticalIndex, 1);
        enemies.splice(i, 1);
        i--;
    }
    }   
    if(frame % enemiesInterval === 0){
        let verticalPosition = Math.floor(Math.random()* 6 + 1) * cellSize;
        enemies.push(new Enemy(verticalPosition));
        enemiesPosition.push(verticalPosition)
        if(enemiesInterval > 120) {
            enemiesInterval -= 50
        };
    }
}
//utilities
const floatingMessages = [];
class FloatingMessage{
    constructor(input, x, y, size, color, speed){
        this.input = input;
        this.x = x;
        this.y = y;
        this. size = size;
        this.color = color;
        this.timer = 0;
        this.fading = 2;     
        this.speed = speed
    } 
    update (){
            this.y -= 0.3;
            this.timer += this.speed;
            if(this.fading > 0.3) this.fading -= 0.05;
    }
    draw(){
        ctx.globalAlpha= this.fading;
        ctx.fillStyle = this.color;
        ctx.font = this.size +'Arial';
        ctx.fillText(this.input, this.x, this.y)
        ctx.globalAlpha = 1
    }
}
function handleFloatingMessages(){
    for(let i = 0; i < floatingMessages.length; i++){
        floatingMessages[i].update();
        floatingMessages[i].draw();
        if(floatingMessages[i].timer >= 50){
            floatingMessages.splice(i, 1);
            i--;
        }
    }
}
let bossEncounter1 = new Image()
bossEncounter1.src = './images/boss1.png'//228
let bossEncounter2 = new Image()
bossEncounter2.src = './images/boss2.png'//305
class Boss {
    constructor(health, speed,){
        this.x = canvas.width;
        this.y = 100/2;
        this.width = cellSize * 2;
        this.height = cellSize *5;
        this.health = health;
        this.speed = speed;
        this.movement = this.speed;
        this.maxHealth = this.health;
        this.bossEncounter = bossEncounter1;
        this.frameX = 0;
        this.frameY = 0;
        this.minFrame = 0;
        this.maxFrame = 7;
        this.spriteWidth = 228;
        this.spriteHeight =228;
    }
    update (){
        this.x -= this.movement;
        if(frame % 8 === 0){
            if(this.frameX < this.maxFrame) this.frameX ++;
            else this.frameX = this.minFrame;
        }
    }
    draw(){
        // ctx.fillStyle = '#ba26d9',
        // ctx.fillRect(this.x, this.y, this.width, this.height);
        ctx.fillStyle = 'red';
        ctx.font = "30px Arial";
        ctx.fillText(Math.floor(this.health), this.x + (70/2), this.y+(30/2));
        if(score < 1200 ){
            ctx.drawImage(bossEncounter1,this.frameX * this.spriteWidth, 0, this.spriteWidth, this.spriteHeight+50, this.x, this.y-20, this.width+30, this.height)
        }
        else if(score > 1200 ){
            ctx.drawImage(bossEncounter2,this.frameX * (this.spriteWidth+77), 0, this.spriteWidth+77 , this.spriteHeight+77, this.x, this.y, this.width, this.height)
        }
    }
        
}
    

function spawnBoss(){
    for (let i = 0; i< boss.length; i++){
        boss[i].update();
        boss[i].draw();
    if(boss[i].x < 0){boss
        gameOver = true;
    }
    if(boss[i].health <= 0){
        let earningMoney = boss[i].maxHealth/4;
        amountOfMoney += earningMoney;
        score += earningMoney;
        boss.splice(i, 1);
        i--;
        }
    
    }   
    
}
function handleGameStatus(){
    ctx.fillStyle = 'gold';
    ctx.font = '15 px Arial';
    ctx.fillText('Cash:' + amountOfMoney + '$', 20/2, 55/2);
    ctx.fillText('Score' + score , 350/2, 55/2);
    if (gameOver == true){
        console.log("Game Over")
        ctx.fillStyle = 'gold';
        ctx.font = "45px Arial";
        ctx.fillText('GAME OVER', 135/2, 330/2);
    }
}

canvas.addEventListener("click", function(){
    const gridPositionX = mouse.x - (mouse.x % cellSize) + cellGap;
    const gridPositionY = mouse.y -(mouse.y % cellSize) + cellGap;
    if(gridPositionY < cellSize) return;
    for (let i =0; i<defenders.length; i++){
        if(defenders[i].x === gridPositionX && defenders[i].y === gridPositionY) 
        return;
    }
    if(pickDefender === 1){
        let defenderCost = 100;
        if(amountOfMoney >= defenderCost){
            defenders.push(new Defender(gridPositionX, gridPositionY,pickDefender,));
            amountOfMoney -= defenderCost;
        }
        else{
            floatingMessages.push(new FloatingMessage('need more Cash $$$', mouse.x ,mouse.y ,25,'gold',1))
        }
    }
    if(pickDefender === 2){
        let defenderCost = 400;
        if(amountOfMoney >= defenderCost){
            defenders.push(new Defender(gridPositionX, gridPositionY,pickDefender));
            amountOfMoney -= defenderCost;
        }else{
            floatingMessages.push(new FloatingMessage('need more Cash $$$', mouse.x ,mouse.y ,25,'gold',1))
        }
    }
    if(pickDefender === 3){
        let rootsCost = 150;
        if(amountOfMoney >= rootsCost){
            defenders.push(new Roots(gridPositionX, gridPositionY));
            amountOfMoney -= rootsCost;
        }else{
            floatingMessages.push(new FloatingMessage('need more Cash $$$', mouse.x ,mouse.y ,25,'gold',1))
        }
    }
})

function animate(){
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    // ctx.fillStyle ='';
    // ctx.fillRect(0, 0, controlsBar.width, controlsBar.height);
    handleGameGrid(); 
    handleDefenders();
    handleProjectiles();
    handleEnemies();
    chooseDefender();
    if(score / 700 === 1 && boss.length <1 ){
        floatingMessages.push(new FloatingMessage('BOSS INCOMING', 450/2, 300/2, 50/2, 'red',0.2))
        boss.push(new Boss(4000, 0.4,));
    }
    if(score / 1800 === 1 && boss.length <1 ){
        floatingMessages.push(new FloatingMessage('FAST BOSS INCOMING', 450/2, 300/2, 50/2, 'red',0.2))
        boss.push(new Boss(3400, 4));   
    }
    spawnBoss()
    handleGameStatus();
    handleFloatingMessages();
    frame ++;
    if (!gameOver)requestAnimationFrame(animate);    
}
animate();

function collision(first, second){
    if(   !(first.x > second.x + second.width||
            first.x + first.width < second.x||
            first.y > second.y + second.height||
            first.y + first.height< second.y)
    ){
        return true;
    }
}
window.addEventListener('resize', function(){
canvasPosition = canvas.getBoundingClientRect();
})

