var config = {
    type: Phaser.AUTO,
    width: 800,
    height: 600,
    physics: {
        default: 'arcade',
        arcade: {
            gravity: false
        }
    },
    scene: {
        preload: preload,
        create: create,
        update: update
    }
};

var game = new Phaser.Game(config);
var gameWidth = 800;
var gameHeight = 600;

var paddle;
var ball;
var blocks;
var blockScheme = [
    '01100111100110',
    '01001111110010',
    '10011111111001',
    '01001111110010',
    '01100111100110',
    ];

var score = 0;
var scoreText;
var lifes;
var lifesText;
var mainText;

var cursors;
var enterKey;

var gameState;

function preload () {
    this.load.image('background', 'public/images/assets/background.png');
    this.load.image('paddle', 'public/images/assets/paddle.png');
    this.load.image('ball', 'public/images/assets/ball.png');
    this.load.image('block', 'public/images/assets/block.png');
}

function create () {
    this.add.image(400, 300, 'background');

    paddle = this.physics.add.image(400, 500, 'paddle');
    paddle.setCollideWorldBounds(true);
    paddle.body.immovable = true;

    ball = this.physics.add.image(400, 478, 'ball');
    ball.setVelocity(100, -500);
    ball.setCollideWorldBounds(true);
    ball.setBounce(1,1);

    blocks = this.physics.add.group();

    this.physics.world.checkCollision.down = false;

    generateBlocks();

    scoreText = this.add.text(15, 15, 'score: 0', {fontSize:
            '32px', fill: '#fff'});
    lifesText = this.add.text(15, 550, `lifes: ${lifes}`,
        {fontSize: '32px', fill: '#fff'});
    mainText = this.add.text(gameWidth / 2, gameHeight / 2,
        'Press SPACE', {fontSize: '50px', fill: '#fff'});

    mainText.setOrigin(0.5);

    cursors = this.input.keyboard.createCursorKeys();
    enterKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.ENTER);

    this.physics.add.collider(ball, paddle, collideBallPaddle);
    this.physics.add.collider(ball, blocks, collideBallBlock);

    gameInit();
    gameReady();
}

function update () {
    paddle.setVelocityX(0);
    if (cursors.left.isDown) {
        paddle.setVelocityX(-400);
    } else if (cursors.right.isDown) {
        paddle.setVelocityX(400);
    }

    if (gameState == 1) {
        ball.setX(paddle.x);
        if (cursors.space.isDown) {
            gameProcess();
        }
    } else if (gameState == 2) {
        if (ball.body.y > gameHeight) {
            lifes--;
            lifesText.setText(`Lifes: ${lifes}`);
            if (lifes > 0) {
                gameReady();
            } else {
                gameFinish('Game is over');
            }
        } else if (blocks.countActive() == 0) {
            gameFinish('You won!');
        }
    } else if (gameState == 3) {
        if (enterKey.isDown) {
            gameInit();
            gameReady();
        }
    }
}

function generateBlocks() {
    var cols = blockScheme[0].length;
    var rows = blockScheme.length;
    var blockSize = 32;
    var groupWidth = blockSize * cols;
    var offsetX = (gameWidth - groupWidth + blockSize) / 2;
    var offsetY = gameHeight * 0.1;
    for (var i = 0; i < rows; i++) {
        for (var j = 0; j < cols; j++) {
            if (blockScheme[i][j] == 1) {
                blocks.create(blockSize * j + offsetX,
                    blockSize * i + offsetY, 'block');
            }
        }
    }
    blocks.children.iterate(function(child) {
        child.body.immovable = true;
    });
}

function collideBallPaddle(ball, paddle) {
    var newVelocity = ball.body.velocity.x +
        paddle.body.velocity.x;
    if (Math.abs(newVelocity) > 200) {
        newVelocity = paddle.body.velocity.x;
    }
    var loss = paddle.body.velocity.x * (Math.random() * 20 /
        100);
    newVelocity -= loss;

    ball.setVelocityX(newVelocity);
}
function collideBallBlock(ball, block) {
    block.disableBody(true, true);
    score++;
    scoreText.setText(`Score: ${score}`);
}

function gameInit() {
    score = 0;
    scoreText.setText(`Score: ${score}`);
    lifes = 3;
    lifesText.setText(`Lifes: ${lifes}`);
    blocks.children.iterate(function(child) {
        child.enableBody(true, child.x, child.y, true, true);
    });
    ball.enableBody(true, 0, 0, true, true);
}
function gameReady() {
    gameState = 1;
    ball.setVelocity(0, 0);
    ball.setX(paddle.x);
    ball.setY(paddle.y - paddle.body.height / 2 -
        ball.body.height / 2);
    mainText.setText('Press SPACE');
    mainText.setVisible(true);
}
function gameProcess() {
    gameState = 2;
    ball.setVelocity(10, -400);
    mainText.setVisible(false);
}
function gameFinish(text) {
    gameState = 3;
    mainText.setText(text);
    mainText.setVisible(true);
    ball.disableBody(true, true);
}