const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

// Game state variables
let uwongInHand = 21;
let uwongOnBoard = 0;
let macanInHand = 1;
let turn = 1;
let entities = {};
let gameStarted = false;
let capturedUwong = 0;
let selectedUwong = null;
let isMovingUwong = false;

// Canvas setup
canvas.width = 800;
canvas.height = 500;

// Create buttons container
const buttonContainer = document.createElement('div');
buttonContainer.style.marginBottom = '10px';
canvas.parentNode.insertBefore(buttonContainer, canvas);
buttonContainer.style.display = 'none';

// Load images
const humanImage = new Image();
const macanImage = new Image();
humanImage.src = '/Macanan/source/manusia.png';
macanImage.src = '/Macanan/source/macan.png';

// Constants
const IMAGE_SIZE = 30;
const MAX_DEPTH = 4;

// Define board points
const points = [
    { x: 150, y: 50 }, { x: 250, y: 50 }, { x: 350, y: 50 }, { x: 450, y: 50 }, { x: 550, y: 50 },
    { x: 150, y: 150 }, { x: 250, y: 150 }, { x: 350, y: 150 }, { x: 450, y: 150 }, { x: 550, y: 150 },
    { x: 150, y: 250 }, { x: 250, y: 250 }, { x: 350, y: 250 }, { x: 450, y: 250 }, { x: 550, y: 250 },
    { x: 150, y: 350 }, { x: 250, y: 350 }, { x: 350, y: 350 }, { x: 450, y: 350 }, { x: 550, y: 350 },
    { x: 150, y: 450 }, { x: 250, y: 450 }, { x: 350, y: 450 }, { x: 450, y: 450 }, { x: 550, y: 450 },
    { x: 75, y: 200 }, { x: 75, y: 250 }, { x: 75, y: 300 },
    { x: 0, y: 150 }, { x: 0, y: 250 }, { x: 0, y: 350 },
    { x: 625, y: 200 }, { x: 625, y: 250 }, { x: 625, y: 300 },
    { x: 700, y: 150 }, { x: 700, y: 250 }, { x: 700, y: 350 }
];

// Define valid connections between points
const connections = [
    [0, 1], [1, 2], [2, 3], [3, 4],
    [5, 6], [6, 7], [7, 8], [8, 9],
    [10, 11], [11, 12], [12, 13], [13, 14],
    [15, 16], [16, 17], [17, 18], [18, 19],
    [20, 21], [21, 22], [22, 23], [23, 24],
    [0, 5], [5, 10], [10, 15], [15, 20],
    [1, 6], [6, 11], [11, 16], [16, 21],
    [2, 7], [7, 12], [12, 17], [17, 22],
    [3, 8], [8, 13], [13, 18], [18, 23],
    [4, 9], [9, 14], [14, 19], [19, 24],
    [0, 6], [6, 12], [12, 18], [18, 24],
    [16, 20], [12, 16], [8, 12], [4, 8],
    [2, 6], [2, 8], [6, 10], [8, 14],
    [10, 16], [14, 18], [16, 22], [18, 22],
    [10, 25], [10, 26], [10, 27],
    [25, 28], [26, 29], [27, 30],
    [25, 26], [26, 27], [28, 29], [29, 30],
    [14, 31], [14, 32], [14, 33],
    [31, 34], [32, 35], [33, 36],
    [31, 32], [32, 33], [34, 35], [35, 36]
];

const macanStartingPoints = [25, 26, 27, 28, 29, 30, 31, 32, 33, 34, 35, 36];

// AI Functions
function evaluateBoard() {
    let score = 0;
    const macanPos = findMacanPosition();
    
    if (macanPos === -1) return -Infinity;
    
    // Count captured uwong
    score += capturedUwong * 100;
    
    // Count threatened uwong
    const threatenedUwong = countThreatenedUwong(macanPos);
    score += threatenedUwong * 50;
    
    // Mobility score
    const macanMoves = getValidMacanMoves(macanPos);
    score += macanMoves.length * 10;
    
    // Center control bonus
    const centerPositions = [6, 7, 8, 11, 12, 13, 16, 17, 18];
    if (centerPositions.includes(parseInt(macanPos))) {
        score += 30;
    }
    
    return score;
}

function countThreatenedUwong(macanPos) {
    let count = 0;
    const moves = getValidMacanMoves(macanPos);
    moves.forEach(move => {
        if (move.capturedPosition !== null) {
            count++;
        }
    });
    return count;
}

function minimax(depth, alpha, beta, isMaximizing) {
    if (depth === 0) {
        return evaluateBoard();
    }
    
    if (isMaximizing) {
        let maxScore = -Infinity;
        const macanPos = findMacanPosition();
        const moves = getValidMacanMoves(macanPos);
        
        for (const move of moves) {
            // Make move
            const oldEntities = {...entities};
            entities[move.to] = "macan";
            delete entities[move.from];
            if (move.capturedPosition !== null) {
                delete entities[move.capturedPosition];
                capturedUwong++;
            }
            
            const score = minimax(depth - 1, alpha, beta, false);
            
            // Undo move
            entities = {...oldEntities};
            if (move.capturedPosition !== null) {
                capturedUwong--;
            }
            
            maxScore = Math.max(maxScore, score);
            alpha = Math.max(alpha, score);
            if (beta <= alpha) break;
        }
        return maxScore;
    } else {
        let minScore = Infinity;
        const uwongPositions = Object.keys(entities).filter(key => entities[key] === "uwong");
        
        for (const pos of uwongPositions) {
            const possibleMoves = getValidUwongMoves(parseInt(pos));
            for (const move of possibleMoves) {
                // Make move
                const oldEntities = {...entities};
                entities[move] = "uwong";
                delete entities[pos];
                
                const score = minimax(depth - 1, alpha, beta, true);
                
                // Undo move
                entities = {...oldEntities};
                
                minScore = Math.min(minScore, score);
                beta = Math.min(beta, score);
                if (beta <= alpha) break;
            }
        }
        return minScore;
    }
}

function getBestMacanMove() {
    let bestScore = -Infinity;
    let bestMove = null;
    const macanPos = findMacanPosition();
    const possibleMoves = getValidMacanMoves(macanPos);
    
    for (const move of possibleMoves) {
        // Make move
        const oldEntities = {...entities};
        entities[move.to] = "macan";
        delete entities[move.from];
        if (move.capturedPosition !== null) {
            delete entities[move.capturedPosition];
            capturedUwong++;
        }
        
        const score = minimax(MAX_DEPTH - 1, -Infinity, Infinity, false);
        
        // Undo move
        entities = {...oldEntities};
        if (move.capturedPosition !== null) {
            capturedUwong--;
        }
        
        if (score > bestScore) {
            bestScore = score;
            bestMove = move;
        }
    }
    
    return bestMove;
}

// Game Logic Functions
function handleAITurn() {
    if (turn === 2) {
        setTimeout(() => {
            if (macanInHand === 1 && !gameStarted) {
                // Initial placement
                const validStartingPoints = macanStartingPoints.filter(point => !(point in entities));
                const randomIndex = Math.floor(Math.random() * validStartingPoints.length);
                placeEntity(validStartingPoints[randomIndex]);
            } else {
                // Strategic move
                const bestMove = getBestMacanMove();
                if (bestMove) {
                    entities[bestMove.to] = "macan";
                    delete entities[bestMove.from];
                    if (bestMove.capturedPosition !== null) {
                        delete entities[bestMove.capturedPosition];
                        capturedUwong++;
                        uwongOnBoard--;
                    }
                    turn = 1;
                }
            }
            drawBoard();
        }, 500);
    }
}

function placeEntity(index) {
    if (turn === 1) {
        if (uwongInHand === 21) {
            placeUwongBlock(index);
        } else if (isMovingUwong) {
            handleUwongMovement(index);
        } else if (uwongInHand > 0 && !(index in entities)) {
            entities[index] = "uwong";
            uwongInHand--;
            uwongOnBoard++;
            turn = 2;
            handleAITurn();
        }
    }
    drawBoard();
}

function handleUwongMovement(index) {
    if (selectedUwong === null) {
        if (entities[index] === "uwong") {
            selectedUwong = index;
            drawBoard();
        }
    } else {
        if (isValidMoveUwong(selectedUwong, index) && !(index in entities)) {
            entities[index] = "uwong";
            delete entities[selectedUwong];
            selectedUwong = null;
            isMovingUwong = false;
            turn = 2;
            handleAITurn();
        } else if (entities[index] === "uwong") {
            selectedUwong = index;
            drawBoard();
        }
    }
}

// Utility Functions
function findMacanPosition() {
    return Object.keys(entities).find(index => entities[index] === "macan");
}

function getValidMacanMoves(position) {
    const moves = [];
    points.forEach((_, index) => {
        const result = isValidMoveMacan(position, index);
        if (result.valid) {
            moves.push({
                from: position,
                to: index,
                capturedPosition: result.capturedPosition
            });
        }
    });
    return moves;
}

function getValidUwongMoves(position) {
    const moves = [];
    points.forEach((_, index) => {
        if (isValidMoveUwong(position, index) && !(index in entities)) {
            moves.push(index);
        }
    });
    return moves;
}

function isValidMoveUwong(startIndex, endIndex) {
    if (endIndex in entities) return false;
    
    return connections.some(([a, b]) => {
        return (a == startIndex && b == endIndex) || (b == startIndex && a == endIndex);
    });
}

function isValidMoveMacan(startIndex, endIndex) {
    if (startIndex === endIndex || endIndex in entities) {
        return { valid: false, capturedPosition: null };
    }

    // Direct move
    const directConnection = connections.some(([a, b]) => {
        return (a == startIndex && b == endIndex) || (b == startIndex && a == endIndex);
    });

    if (directConnection) {
        return { valid: true, capturedPosition: null };
    }

    // Capture move
    let capturedPosition = null;
    const possibleJumps = connections.reduce((jumps, [a, b]) => {
        if (a == startIndex || b == startIndex) {
            const midpoint = a == startIndex ? b : a;
            if (entities[midpoint] === "uwong") {
                connections.forEach(([c, d]) => {
                    if ((c == midpoint && d == endIndex) || (d == midpoint && c == endIndex)) {
                        jumps.push(true);
                        capturedPosition = midpoint.toString();
                    }
                });
            }
        }
        return jumps;
    }, []);

    return { 
        valid: possibleJumps.length > 0,
        capturedPosition: capturedPosition
    };
}

function placeUwongBlock(index) {
    const row = Math.floor(index / 5);
    const col = index % 5;
    let canPlace = true;
    
    if ((index >= 0 && index < 3) || (index >= 5 && index < 8) || (index >= 10 && index < 13)) {
        for (let i = 0; i < 3; i++) {
            for (let j = 0; j < 3; j++) {
                const newIndex = (row + i) * 5 + (col + j);
                if (newIndex in entities) {
                    canPlace = false;
                    break;
                }
            }
        }
        
        if (canPlace) {
            for (let i = 0; i < 3; i++) {
                for (let j = 0; j < 3; j++) {
                    const newIndex = (row + i) * 5 + (col + j);
                    entities[newIndex] = "uwong";
                    uwongInHand--;
                    uwongOnBoard++;
                }
            }
            turn = 2;
            handleAITurn();
        }
    }
}

// Drawing Functions
function drawBoard() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.strokeStyle = "black";
    ctx.lineWidth = 2;
// Continue from drawBoard function
connections.forEach(([start, end]) => {
    const pointA = points[start];
    const pointB = points[end];
    ctx.beginPath();
    ctx.moveTo(pointA.x, pointA.y);
    ctx.lineTo(pointB.x, pointB.y);
    ctx.stroke();
});

// Highlight starting points for macan
if (!gameStarted && macanInHand === 1) {
    macanStartingPoints.forEach(index => {
        const point = points[index];
        ctx.beginPath();
        ctx.arc(point.x, point.y, 12, 0, Math.PI * 2);
        ctx.strokeStyle = "red";
        ctx.stroke();
        ctx.strokeStyle = "black";
    });
}

// Draw points
points.forEach((point, index) => {
    ctx.beginPath();
    ctx.arc(point.x, point.y, 8, 0, Math.PI * 2);
    ctx.fillStyle = "black";
    ctx.fill();
});

// Draw entities
for (let index in entities) {
    const entity = entities[index];
    const point = points[index];
    const image = entity === "macan" ? macanImage : humanImage;
    
    // Highlight selected uwong
    if (isMovingUwong && selectedUwong === index) {
        ctx.beginPath();
        ctx.arc(point.x, point.y, 15, 0, Math.PI * 2);
        ctx.strokeStyle = "green";
        ctx.stroke();
        ctx.strokeStyle = "black";
    }
    
    ctx.drawImage(
        image,
        point.x - IMAGE_SIZE/2,
        point.y - IMAGE_SIZE/2,
        IMAGE_SIZE,
        IMAGE_SIZE
    );
}

// Draw game info
ctx.font = "20px Arial";
ctx.fillStyle = "black";
ctx.fillText(`Captured Uwong: ${capturedUwong}`, 10, 30);
ctx.fillText(`Uwong in Hand: ${uwongInHand}`, 10, 60);
ctx.fillText(`Turn: ${turn === 1 ? 'Uwong' : 'Macan'}`, 10, 90);

// Show/hide mode selection buttons
buttonContainer.style.display = (turn === 1 && uwongInHand < 21 && uwongInHand > 0) ? 'block' : 'none';

// Check game end conditions
checkGameEnd();
}

function checkGameEnd() {
if (capturedUwong >= 15) {
    showGameEndMessage("Macan wins by capturing 15 uwong!");
    return true;
} else if (uwongInHand === 0 && isMacanTrapped()) {
    showGameEndMessage("Uwong wins by trapping the macan!");
    return true;
}
return false;
}

function isMacanTrapped() {
const macanPos = findMacanPosition();
if (macanPos === -1) return false;
return getValidMacanMoves(macanPos).length === 0;
}

function showGameEndMessage(message) {
ctx.fillStyle = "rgba(0, 0, 0, 0.7)";
ctx.fillRect(0, 0, canvas.width, canvas.height);

ctx.font = "30px Arial";
ctx.fillStyle = "white";
ctx.textAlign = "center";
ctx.fillText(message, canvas.width/2, canvas.height/2);

// Show restart button
ctx.font = "20px Arial";
ctx.fillText("Press 'R' to restart", canvas.width/2, canvas.height/2 + 40);

// Disable further moves
canvas.style.pointerEvents = "none";
}

function resetGame() {
uwongInHand = 21;
uwongOnBoard = 0;
macanInHand = 1;
turn = 1;
entities = {};
gameStarted = false;
capturedUwong = 0;
selectedUwong = null;
isMovingUwong = false;
canvas.style.pointerEvents = "auto";
drawBoard();
}

// Event Listeners
canvas.addEventListener("click", (event) => {
const rect = canvas.getBoundingClientRect();
const x = event.clientX - rect.left;
const y = event.clientY - rect.top;

let closestIndex = -1;
let minDist = 20; // Click tolerance
points.forEach((point, index) => {
    const dist = Math.hypot(point.x - x, point.y - y);
    if (dist < minDist) {
        minDist = dist;
        closestIndex = index;
    }
});

if (closestIndex !== -1 && turn === 1) {
    placeEntity(closestIndex);
}
});

document.addEventListener("keydown", (event) => {
if (event.key === "r" || event.key === "R") {
    resetGame();
} else if (event.key === "m" || event.key === "M") {
    // Toggle uwong movement mode
    if (turn === 1 && uwongInHand === 0) {
        isMovingUwong = !isMovingUwong;
        selectedUwong = null;
        drawBoard();
    }
}
});

// Add touch support for mobile devices
canvas.addEventListener("touchstart", (event) => {
event.preventDefault();
const touch = event.touches[0];
const rect = canvas.getBoundingClientRect();
const x = touch.clientX - rect.left;
const y = touch.clientY - rect.top;

let closestIndex = -1;
let minDist = 20;
points.forEach((point, index) => {
    const dist = Math.hypot(point.x - x, point.y - y);
    if (dist < minDist) {
        minDist = dist;
        closestIndex = index;
    }
});

if (closestIndex !== -1 && turn === 1) {
    placeEntity(closestIndex);
}
});

// Initialize game when images are loaded
Promise.all([
new Promise(resolve => humanImage.onload = resolve),
new Promise(resolve => macanImage.onload = resolve)
]).then(() => {
resetGame();
});

// Add helper text
const helpText = document.createElement('div');
helpText.innerHTML = `
<p>Controls:</p>
<ul>
    <li>Click to place/move pieces</li>
    <li>Press 'M' to toggle uwong movement mode</li>
    <li>Press 'R' to restart game</li>
</ul>
`;
helpText.style.marginTop = '10px';
canvas.parentNode.insertBefore(helpText, canvas.nextSibling);