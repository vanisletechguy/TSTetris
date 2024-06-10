const canvas = document.getElementById('tetrisCanvas') as HTMLCanvasElement;
const ctx = canvas.getContext('2d') as CanvasRenderingContext2D;
const grid = 30;
const tetrominoSequence: string[] = [];
const playfield: number[][] = [];

// Fill playfield with empty squares
for (let row = -2; row < 20; row++) {
    playfield[row] = [];
    for (let col = 0; col < 10; col++) {
        playfield[row][col] = 0;
    }
}

// These are the different tetrominoes shapes
const tetrominoes: { [key: string]: number[][] } = {
    'I': [
        [0, 0, 0, 0],
        [1, 1, 1, 1],
        [0, 0, 0, 0],
        [0, 0, 0, 0]
    ],
    'J': [
        [1, 0, 0],
        [1, 1, 1],
        [0, 0, 0]
    ],
    'L': [
        [0, 0, 1],
        [1, 1, 1],
        [0, 0, 0]
    ],
    'O': [
        [1, 1],
        [1, 1]
    ],
    'S': [
        [0, 1, 1],
        [1, 1, 0],
        [0, 0, 0]
    ],
    'Z': [
        [1, 1, 0],
        [0, 1, 1],
        [0, 0, 0]
    ],
    'T': [
        [0, 1, 0],
        [1, 1, 1],
        [0, 0, 0]
    ]
};

// Unique color for each tetromino
const colors: { [key: string]: string } = {
    'I': '#00F0F0',
    'O': '#F0F000',
    'T': '#A000F0',
    'S': '#00F000',
    'Z': '#F00000',
    'J': '#0000F0',
    'L': '#F0A000'
};

// Tetromino type
interface Tetromino {
    name: string;
    matrix: number[][];
    row: number;
    col: number;
}

// Generate a new random tetromino sequence
function generateSequence() {
    const pieces = ['I', 'J', 'L', 'O', 'S', 'T', 'Z'];
    while (pieces.length) {
        const rand = Math.floor(Math.random() * pieces.length);
        const name = pieces.splice(rand, 1)[0];
        tetrominoSequence.push(name);
    }
}

// Get the next tetromino
function getNextTetromino(): Tetromino {
    if (tetrominoSequence.length === 0) {
        generateSequence();
    }

    const name = tetrominoSequence.pop() as string;
    const matrix = tetrominoes[name];
    const col = Math.floor(playfield[0].length / 2 - Math.ceil(matrix[0].length / 2));
    const row = name === 'I' ? -1 : -2;

    return {
        name: name,
        matrix: matrix,
        row: row,
        col: col
    };
}

// Rotate the tetromino matrix 90 degrees clockwise
function rotate(matrix: number[][]): number[][] {
    const N = matrix.length - 1;
    const result = matrix.map((row, i) => row.map((val, j) => matrix[N - j][i]));
    return result;
}

// Check if the matrix can be placed at the given position
function isValidMove(matrix: number[][], cellRow: number, cellCol: number): boolean {
    for (let row = 0; row < matrix.length; row++) {
        for (let col = 0; col < matrix[row].length; col++) {
            if (matrix[row][col] && (
                cellCol + col < 0 ||
                cellCol + col >= playfield[0].length ||
                cellRow + row >= playfield.length ||
                playfield[cellRow + row][cellCol + col])
            ) {
                return false;
            }
        }
    }
    return true;
}

// Place the tetromino on the playfield
function placeTetromino() {
    for (let row = 0; row < tetromino.matrix.length; row++) {
        for (let col = 0; col < tetromino.matrix[row].length; col++) {
            if (tetromino.matrix[row][col]) {
                if (tetromino.row + row < 0) {
                    return showGameOver();
                }
                playfield[tetromino.row + row][tetromino.col + col] = tetromino.name.charCodeAt(0);
            }
        }
    }

    for (let row = playfield.length - 1; row >= 0;) {
        if (playfield[row].every(cell => !!cell)) {
            for (let r = row; r >= 0; r--) {
                for (let c = 0; c < playfield[r].length; c++) {
                    playfield[r][c] = playfield[r - 1][c];
                }
            }
        } else {
            row--;
        }
    }

    tetromino = getNextTetromino();
}

// Show Game Over screen
function showGameOver() {
    cancelAnimationFrame(rAF);
    ctx.fillStyle = 'black';
    ctx.globalAlpha = 0.75;
    ctx.fillRect(0, canvas.height / 2 - 30, canvas.width, 60);
    ctx.globalAlpha = 1;
    ctx.fillStyle = 'white';
    ctx.font = '36px monospace';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('GAME OVER!', canvas.width / 2, canvas.height / 2);
}

// Game loop
function loop() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    for (let row = 0; row < 20; row++) {
        for (let col = 0; col < 10; col++) {
            if (playfield[row][col]) {
                const name = String.fromCharCode(playfield[row][col]);
                ctx.fillStyle = colors[name];
                ctx.fillRect(col * grid, row * grid, grid - 1, grid - 1);
            }
        }
    }

    if (tetromino) {
        if (++count > 35) {
            tetromino.row++;
            count = 0;

            if (!isValidMove(tetromino.matrix, tetromino.row, tetromino.col)) {
                tetromino.row--;
                placeTetromino();
            }
        }

        ctx.fillStyle = colors[tetromino.name];
        for (let row = 0; row < tetromino.matrix.length; row++) {
            for (let col = 0; col < tetromino.matrix[row].length; col++) {
                if (tetromino.matrix[row][col]) {
                    ctx.fillRect((tetromino.col + col) * grid, (tetromino.row + row) * grid, grid - 1, grid - 1);
                }
            }
        }

        // Check if the tetromino should land
        if (!isValidMove(tetromino.matrix, tetromino.row + 1, tetromino.col)) {
            placeTetromino();
        }
    }
    rAF = requestAnimationFrame(loop);
}

document.addEventListener('keydown', (e) => {
    if (gameOver) return;

    if (e.key === 'ArrowLeft' || e.key === 'ArrowRight') {
        const col = e.key === 'ArrowLeft'
            ? tetromino.col - 1
            : tetromino.col + 1;

        if (isValidMove(tetromino.matrix, tetromino.row, col)) {
            tetromino.col = col;
        }
    }

    if (e.key === 'ArrowUp') {
        const matrix = rotate(tetromino.matrix);

        if (isValidMove(matrix, tetromino.row, tetromino.col)) {
            tetromino.matrix = matrix;
        }
    }

    if (e.key === 'ArrowDown') {
        const row = tetromino.row + 1;

        if (!isValidMove(tetromino.matrix, row, tetromino.col)) {
            tetromino.row--;
            placeTetromino();
            return;
        }

        tetromino.row = row;
    }
});

let rAF: number;
let count = 0;
let tetromino = getNextTetromino();
let gameOver = false;

rAF = requestAnimationFrame(loop);
