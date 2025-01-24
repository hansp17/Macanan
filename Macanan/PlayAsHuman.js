const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

let uwongInHand = 21;
let uwongOnBoard = 0;
let macanInHand = 1;
let turn = 1;
let entities = {};
let gameStarted = false;
let capturedUwong = 0;
let selectedUwong = null;
let isMovingUwong = false;
let gameOver = false;
let winner = null;

// Create buttons for mode selection
const buttonContainer = document.createElement('div');
buttonContainer.style.marginBottom = '10px';

const moveButton = document.createElement('button');
moveButton.textContent = 'Move Existing Human';
moveButton.style.marginRight = '10px';
moveButton.style.padding = '5px 10px';

const addButton = document.createElement('button');
addButton.textContent = 'Add New Human';
addButton.style.padding = '5px 10px';

buttonContainer.appendChild(moveButton);
buttonContainer.appendChild(addButton);
canvas.parentNode.insertBefore(buttonContainer, canvas);

buttonContainer.style.display = 'none';

moveButton.addEventListener('click', () => {
    if (turn === 1 && uwongInHand === 0) {
        isMovingUwong = true;
        selectedUwong = null;
        drawBoard();
    }
});

document.addEventListener('DOMContentLoaded', () => {
    if (!gameStarted && turn === 2) {
        initialMacanPlacement();
    }
});

// Create image objects
const humanImage = new Image();
const macanImage = new Image();
humanImage.src = '/Macanan/source/uwong.png';
macanImage.src = '/Macanan/source/macan.png';

// Set image size
const IMAGE_SIZE = 30;

// Wait for images to load before starting
Promise.all([
    new Promise(resolve => humanImage.onload = resolve),
    new Promise(resolve => macanImage.onload = resolve)
]).then(() => {
    drawBoard();
});


const points = [
    { x: 40 +150, y: 50 }, { x: 40 +250, y: 50 }, { x: 40 +350, y: 50 }, { x: 40 +450, y: 50 }, { x: 40 +550, y: 50 },
        { x: 40 +150, y: 150 }, { x: 40 +250, y: 150 }, { x: 40 +350, y: 150 }, { x: 40 +450, y: 150 }, { x: 40 +550, y: 150 },
        { x: 40 +150, y: 250 }, { x: 40 +250, y: 250 }, { x: 40 +350, y: 250 }, { x: 40 +450, y: 250 }, { x: 40 +550, y: 250 },
        { x: 40 +150, y: 350 }, { x: 40 +250, y: 350 }, { x: 40 +350, y: 350 }, { x: 40 +450, y: 350 }, { x: 40 +550, y: 350 },
        { x: 40 +150, y: 450 }, { x: 40 +250, y: 450 }, { x: 40 +350, y: 450 }, { x: 40 +450, y: 450 }, { x: 40 +550, y: 450 },
        { x: 40 +75, y: 200 }, { x: 40 +75, y: 250 }, { x: 40 +75, y: 300 },
        { x: 40 +0, y: 150 }, { x: 40 +0, y: 250 }, { x: 40 +0, y: 350 },
        { x: 40 +625, y: 200 }, { x: 40 +625, y: 250 }, { x: 40 +625, y: 300 },
        { x: 40 +700, y: 150 }, { x: 40 +700, y: 250 }, { x: 40 +700, y: 350 },
];


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
        [2, 6], [2, 8],
        [6, 10], [8, 14],
        [10, 16], [14, 18],
        [16, 22], [18, 22],
        [10, 25], [10, 26], [10, 27],
        [25, 28], [26, 29], [27, 30],
        [25, 26], [26, 27],
        [28, 29], [29, 30],
        [14, 31], [14, 32], [14, 33],
        [31, 34], [32, 35], [33, 36],
        [31, 32], [32, 33],
        [34, 35], [35, 36]
];


// Create adjacency list from connections
const adjacencyList = Array(points.length).fill().map(() => []);
connections.forEach(([from, to]) => {
    adjacencyList[from].push(to);
    adjacencyList[to].push(from);
});

function drawBoard() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.strokeStyle = "#555";
    ctx.lineWidth = 3;

    // Draw connections
    connections.forEach(([start, end]) => {
        const pointA = points[start];
        const pointB = points[end];
        ctx.beginPath();
        ctx.moveTo(pointA.x, pointA.y);
        ctx.lineTo(pointB.x, pointB.y);
        ctx.stroke();
    });

    // Draw points
    points.forEach((point, index) => {
        ctx.beginPath();
        ctx.arc(point.x, point.y, 10, 0, Math.PI * 2);
        ctx.fillStyle = "#777";
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
            ctx.arc(point.x, point.y, 20, 0, Math.PI * 2);
            ctx.strokeStyle = "green";
            ctx.lineWidth = 3;
            ctx.stroke();
            ctx.strokeStyle = "#555";
            ctx.lineWidth = 3;
        }

        ctx.drawImage(
            image,
            point.x - IMAGE_SIZE / 2,
            point.y - IMAGE_SIZE / 2,
            IMAGE_SIZE,
            IMAGE_SIZE
        );
    }

    // Draw game info
    ctx.font = "20px Arial";
    ctx.fillStyle = "#333";
    ctx.fillText(`Captured Uwong: ${capturedUwong}`, 700, 30);
    ctx.fillText(`Uwong in Hand: ${uwongInHand}`, 700, 60);
    ctx.fillText(`Turn: ${turn === 1 ? 'Uwong' : 'Macan'}`, 700, 90);

    if (gameOver) {
        ctx.fillStyle = "rgba(0, 0, 0, 0.7)";
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        ctx.font = "40px Arial";
        ctx.fillStyle = "white";
        ctx.textAlign = "center";
        ctx.fillText(`Game Over!`, canvas.width / 2, canvas.height / 2 - 30);
        ctx.fillText(`${winner} Wins!`, canvas.width / 2, canvas.height / 2 + 30);

        buttonContainer.style.display = 'none';
    }
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
            
            // Check win conditions after Uwong's move
            if (!checkMacanValidMoves()) {
                gameOver = true;
                winner = "Uwong";
                drawBoard();
                return;
            }
            
            // Trigger Macan's move
            setTimeout(() => {
                autoMoveMacan();
            }, 100);
            
            drawBoard();
        } else {
            if (entities[index] === "uwong") {
                selectedUwong = index;
                drawBoard();
            }
        }
    }
}

function findMacanPosition(state = entities) {
    return Object.keys(state).find(index => state[index] === "macan");
}

function isValidMoveUwong(startIndex, endIndex) {
    const connection = connections.some(([a, b]) => {
        return (a == startIndex && b == endIndex) || (b == startIndex && a == endIndex);
    });
    return connection;
}

function isValidMoveMacan(startIndex, endIndex) {
    if (startIndex === endIndex || endIndex in entities) {
        return { valid: false, capturedPosition: null };
    }

    // Check direct connection
    const directConnection = connections.some(([a, b]) => {
        return (a == startIndex && b == endIndex) || (b == startIndex && a == endIndex);
    });

    if (directConnection && !(endIndex in entities)) {
        return { valid: true, capturedPosition: null };
    }

    // Check jump move
    const jumpResult = tryMacanJump(parseInt(startIndex), parseInt(endIndex), adjacencyList, points, entities);
    return jumpResult;
}
// Get valid moves for Macan
function getValidMacanMoves(macanPos, boardState) {
    const validMoves = [];

    // Check for simple adjacent moves
    adjacencyList[macanPos].forEach((neighbor) => {
        if (!(neighbor in boardState)) {
            validMoves.push({ 
                target: neighbor, 
                type: "move",
                jump: false 
            });
        }
    });

    // Check for jump moves
    for (let i = 0; i < points.length; i++) {
        const jumpResult = tryMacanJump(macanPos, i, adjacencyList, points, entities);
        
        if (jumpResult.valid) {
            const moveDetails = {
                target: i,
                type: "jump",
                jump: true,
                capturedPosition: jumpResult.capturedPosition,
                additionalCaptures: jumpResult.additionalCaptures
            };

            // Add captured position if exists
            if (jumpResult.capturedPosition !== null) {
                moveDetails.midPoint = jumpResult.capturedPosition;
            }

            validMoves.push(moveDetails);
        }
    }

    return validMoves;
}

function tryMacanJump(currentPosition, targetIndex, adjacencyList, nodes, boardState) {
    // Define the 8 possible directions (horizontal, vertical, diagonal)
    const directions = [
        // Horizontal right
        (node) => adjacencyList[node].find(neighbor => 
            nodes[neighbor].x === nodes[node].x + 100 && nodes[neighbor].y === nodes[node].y) || 
            adjacencyList[node].find(neighbor => 
            nodes[neighbor].x === nodes[node].x + 75 && nodes[neighbor].y === nodes[node].y) || null,
        
        // Horizontal left
        (node) => adjacencyList[node].find(neighbor => 
            nodes[neighbor].x === nodes[node].x - 100 && nodes[neighbor].y === nodes[node].y) ||
            adjacencyList[node].find(neighbor => 
            nodes[neighbor].x === nodes[node].x - 75 && nodes[neighbor].y === nodes[node].y) || null,
        
        // Vertical down
        (node) => adjacencyList[node].find(neighbor => 
            nodes[neighbor].y === nodes[node].y + 100 && nodes[neighbor].x === nodes[node].x) ||
            adjacencyList[node].find(neighbor => 
            nodes[neighbor].y === nodes[node].y + 50 && nodes[neighbor].x === nodes[node].x) || null,
        
        // Vertical up
        (node) => adjacencyList[node].find(neighbor => 
            nodes[neighbor].y === nodes[node].y - 100 && nodes[neighbor].x === nodes[node].x) ||
            adjacencyList[node].find(neighbor => 
            nodes[neighbor].y === nodes[node].y - 50 && nodes[neighbor].x === nodes[node].x) || null,
        
        // Diagonal right-down
        (node) => adjacencyList[node].find(neighbor => 
            nodes[neighbor].x === nodes[node].x + 100 && nodes[neighbor].y === nodes[node].y + 100) ||
            adjacencyList[node].find(neighbor => 
            nodes[neighbor].x === nodes[node].x + 75 && nodes[neighbor].y === nodes[node].y + 50) || null,
        
        // Diagonal left-up
        (node) => adjacencyList[node].find(neighbor => 
            nodes[neighbor].x === nodes[node].x - 100 && nodes[neighbor].y === nodes[node].y - 100) ||
            adjacencyList[node].find(neighbor => 
            nodes[neighbor].x === nodes[node].x - 75 && nodes[neighbor].y === nodes[node].y - 50) || null,
        
        // Diagonal right-up
        (node) => adjacencyList[node].find(neighbor => 
            nodes[neighbor].x === nodes[node].x + 100 && nodes[neighbor].y === nodes[node].y - 100) ||
            adjacencyList[node].find(neighbor => 
            nodes[neighbor].x === nodes[node].x + 75 && nodes[neighbor].y === nodes[node].y - 50) || null,
        
        // Diagonal left-down
        (node) => adjacencyList[node].find(neighbor => 
            nodes[neighbor].x === nodes[node].x - 100 && nodes[neighbor].y === nodes[node].y + 100) ||
            adjacencyList[node].find(neighbor => 
            nodes[neighbor].x === nodes[node].x - 75 && nodes[neighbor].y === nodes[node].y + 50) || null,
    ];

    // Get path in a specific direction
    const getPath = (start, dirFn) => {
        const path = [];
        let current = start;
        while (true) {
            const next = dirFn(current);
            if (next == null) break;
            path.push(next);
            current = next;
        }
        return path;
    };

    let capturedUwongs = [];
    let validDirection = null;

    // Check each direction for a valid jump
    for (const dirFn of directions) {
        if (validDirection) break;

        const path = getPath(currentPosition, dirFn);
        
        // Skip if first node in path is empty (must jump over at least one uwong)
        if (path[0] !== undefined && boardState[path[0]] === null) {
            continue;
        }

        const targetPos = path.indexOf(targetIndex);
        if (targetPos !== -1) {
            const pathToTarget = path.slice(0, targetPos + 1);
            const middleNodes = pathToTarget.slice(1, -1);
            
            // Check if all middle nodes are uwong
            if (middleNodes.every(idx => boardState[idx] === "uwong")) {
                const uwongsInPath = pathToTarget.filter(i => boardState[i] === "uwong");
                // Valid jump only if odd number of uwongs
                if (uwongsInPath.length % 2 === 1) {
                    capturedUwongs = uwongsInPath;
                    validDirection = dirFn;
                }
            }
        }
    }

    if (!validDirection) {
        return { valid: false, capturedPosition: null };
    }

    // Ensure the target point is empty
    if (boardState[targetIndex] !== undefined) {
        return { valid: false, capturedPosition: null };
    }

    // Return the middle uwong position for capture
    const middleIndex = Math.floor(capturedUwongs.length / 2);
    return {
        valid: true,
        capturedPosition: capturedUwongs[middleIndex].toString(),
        additionalCaptures: capturedUwongs
            .filter((_, index) => index !== middleIndex)
            .map(pos => pos.toString())
    };
}

function isGameOver(state) {
    const macanPos = findMacanPosition(state);
    if (!macanPos) return true;
    
    // Check if Macan has no valid moves
    const validMoves = getValidMacanMoves(macanPos, state);
    if (validMoves.length === 0) return true;
    
    // Check if too few Uwongs remain
    const uwongCount = Object.values(state).filter(v => v === "uwong").length;
    if (uwongCount < 2) return true;
    
    return false;
}

// Evaluate the board state
function evaluateState(state) {
    const macanPos = findMacanPosition(state);
    let score = 0;
    
    if (!macanPos) return -Infinity;
    
    // Bonus besar untuk setiap Uwong yang dimakan
    const capturedScore = capturedUwong * 1000;
    score += capturedScore;
    
    // Evaluasi gerakan yang memungkinkan memakan Uwong
    const jumpMoves = getValidMacanMoves(macanPos, state).filter(move => move.type === "jump");
    const jumpScore = jumpMoves.length * 500;  // Bonus besar untuk kemungkinan memakan
    score += jumpScore;
    
    // Evaluasi posisi strategis
    const centerX = 350;
    const centerY = 250;
    const position = points[macanPos];
    const distanceToCenter = Math.sqrt(
        Math.pow(position.x - centerX, 2) + 
        Math.pow(position.y - centerY, 2)
    );
    const positionScore = 1000 / (distanceToCenter + 1);
    score += positionScore;
    
    // Evaluasi Uwong di sekitar
    const surroundingUwongs = adjacencyList[macanPos]
        .filter(neighbor => state[neighbor] === "uwong")
        .length;
    score += surroundingUwongs * 200;
    
    return score;
}





// Helper functions for evaluation
function evaluatePosition(pos, points) {
    // Prioritaskan posisi tengah board
    const centerX = 350;
    const centerY = 250;
    const point = points[pos];
    const distance = Math.sqrt(
        Math.pow(point.x - centerX, 2) + 
        Math.pow(point.y - centerY, 2)
    );
    return 1000 / (distance + 1);
}




// Simulate Macan's move
function applyMove(state, macanPos, move) {
    const newState = { ...state };

    // Apply the move
    if (move.type === "move") {
        newState[move.target] = "macan";
        delete newState[macanPos];
    } else if (move.type === "jump") {
        newState[move.target] = "macan";
        delete newState[macanPos];

        // Remove captured Uwong(s)
        delete newState[move.captured];
        if (move.additionalCaptures) {
            move.additionalCaptures.forEach(pos => {
                delete newState[pos];
            });
        }
    }

    return newState;
}

// Get valid moves for Uwong
function getValidUwongMoves(state) {
    const moves = [];

    Object.keys(state).forEach(pos => {
        if (state[pos] === "uwong") {
            adjacencyList[pos].forEach(neighbor => {
                if (!state[neighbor]) {
                    moves.push({ from: pos, to: neighbor });
                }
            });
        }
    });

    return moves;
}

// Simulate Uwong's move
function applyUwongMove(state, move) {
    const newState = { ...state };

    // Apply the Uwong move
    newState[move.to] = "uwong";
    delete newState[move.from];

    return newState;
}
function checkMacanValidMoves() {
    const macanPos = findMacanPosition();
    if (macanPos === undefined) return false;
    
    // Periksa semua titik untuk kemungkinan gerakan
    for (let i = 0; i < points.length; i++) {
        if (i === parseInt(macanPos)) continue; // Konversi ke integer untuk perbandingan yang benar
        
        // Periksa gerakan langsung
        const directMove = isValidMoveMacan(parseInt(macanPos), i);
        if (directMove.valid) {
            return true;
        }
    }
    return false;
}
function initialMacanPlacement() {
    // Cari posisi yang valid (tidak ada Uwong) untuk penempatan awal
    let validPositions = [];
    
    // Cek posisi-posisi yang mungkin untuk penempatan awal
    for (let i = 0; i < points.length; i++) {
        if (!(i in entities)) { // Hanya posisi kosong
            validPositions.push(i);
        }
    }
    
    if (validPositions.length > 0 && macanInHand === 1 && !gameStarted) {
        // Pilih posisi tengah yang valid
        const centerPositions = [12, 11, 13, 7, 17]; // Prioritas posisi tengah
        let chosenPosition = null;
        
        // Coba pilih dari posisi tengah yang tersedia
        for (const pos of centerPositions) {
            if (validPositions.includes(pos)) {
                chosenPosition = pos;
                break;
            }
        }
        
        // Jika tidak ada posisi tengah yang tersedia, pilih random dari yang valid
        if (chosenPosition === null) {
            const randomIndex = Math.floor(Math.random() * validPositions.length);
            chosenPosition = validPositions[randomIndex];
        }
        
        entities[chosenPosition] = "macan";
        macanInHand--;
        turn = 1;
        gameStarted = true;
        drawBoard();
    }
}

function findMultiJumpPaths(macanPos, state) {
    const paths = [];
    const visited = new Set();

    function dfs(current, path, capturedUwongs) {
        const validMoves = getValidMacanMoves(current, state);
        const jumpMoves = validMoves.filter(move => move.type === "jump");

        if (jumpMoves.length === 0) {
            // No more jumps possible, record the path
            if (path.length > 1) {
                paths.push({
                    path: path,
                    captures: capturedUwongs
                });
            }
            return;
        }

        for (const move of jumpMoves) {
            if (!visited.has(move.target)) {
                const newState = { ...state };
                delete newState[current];
                newState[move.target] = "macan";
                delete newState[move.captured];

                visited.add(move.target);
                dfs(
                    move.target, 
                    [...path, move.target], 
                    [...capturedUwongs, move.captured]
                );
                visited.delete(move.target);
            }
        }
    }

    dfs(macanPos, [macanPos], []);
    return paths.sort((a, b) => b.captures.length - a.captures.length);
}

// Automatically move Macan
function autoMoveMacan() {
    const macanPos = findMacanPosition(entities);
    if (!macanPos) return;

    const validMoves = getValidMacanMoves(macanPos, entities);

    let bestMove = null;
    let bestScore = -Infinity;

    for (const move of validMoves) {
        const newState = { ...entities };
        delete newState[macanPos];
        if (move.jump) {
            delete newState[move.capturedPosition]; // Remove the jumped uwong
        }
        newState[move.target] = "macan";

        const score = minimax(newState, 3, false, -Infinity, Infinity);

        if (score > bestScore) {
            bestScore = score;
            bestMove = move;
        }
    }

    if (bestMove) {
        console.log("masuk sini");
        
        delete entities[macanPos];

        if (bestMove.jump) {
            delete entities[bestMove.capturedPosition]; // Remove the jumped uwong
            capturedUwong++; // Increment captured uwong count
            bestMove.additionalCaptures.forEach(capture => {
                console.log(capture); // Log capture positions for debugging
                delete entities[capture]; // Remove any additional captured uwongs
                capturedUwong++; // Increment captured uwong count
            });
        }

        entities[bestMove.target] = "macan"; // Move Macan to the new position
    }

    if (checkWinConditions()) {
        gameOver = true;
        winner = "Macan";
        drawBoard();
        return;
    }

    turn = 1;
    drawBoard();
}




function simulateMove(state, start, move) {
    const newState = { ...state };
    delete newState[start];
    newState[move.target] = state[start];

    if (move.captured) {
        delete newState[move.captured];
    }

    return newState;
}

function executeMove(start, move) {
    delete entities[start];
    entities[move.target] = "macan";

    if (move.captured) {
        delete entities[move.captured];
        capturedUwong++;
        uwongOnBoard--;
    }

    if (move.additionalCaptures) {
        move.additionalCaptures.forEach(pos => {
            delete entities[pos];
            capturedUwong++;
            uwongOnBoard--;
        });
    }
}

function minimax(state, depth, isMaximizing, alpha, beta) {
    if (depth === 0 || checkWinConditions()) {
        return evaluateBoard(state);
    }

    if (isMaximizing) {
        // Simulasi gerakan Macan
        const macanPos = findMacanPosition(state);
        const validMoves = getValidMacanMoves(macanPos, state);

        let maxEval = -Infinity;
        for (const move of validMoves) {
            const newState = { ...state };
            delete newState[macanPos];
            if (move.jump) {
                delete newState[move.capturedPosition];
            }
            newState[move.target] = "macan";

            const eval = minimax(newState, depth - 1, false, alpha, beta);
            maxEval = Math.max(maxEval, eval);
            alpha = Math.max(alpha, eval);

            if (beta <= alpha) {
                break;
            }
        }
        return maxEval;
    } else {
        // Simulasi gerakan Uwong
        const validMoves = getValidUwongMoves(state);

        let minEval = Infinity;
        for (const move of validMoves) {
            const newState = { ...state };
            newState[move.to] = "uwong";
            delete newState[move.from];

            const eval = minimax(newState, depth - 1, true, alpha, beta);
            minEval = Math.min(minEval, eval);
            beta = Math.min(beta, eval);

            if (beta <= alpha) {
                break;
            }
        }
        return minEval;
    }
}
function getValidUwongMoves(state) {
    const moves = [];
    for (let index in state) {
        if (state[index] === "uwong") {
            adjacencyList[index].forEach(neighbor => {
                if (!(neighbor in state)) {
                    moves.push({ from: index, to: neighbor });
                }
            });
        }
    }
    return moves;
}

function evaluateBoard(state) {
    const macanPos = findMacanPosition(state);
    const uwongPositions = Object.keys(state).filter(idx => state[idx] === "uwong");

    // Count captured Uwong
    const capturedCount = 21 - uwongPositions.length;

    // Base score components
    let score = 0;

    // Uwong count penalty
    score -= uwongPositions.length * 10;

    // Capture bonus
    if (capturedCount === 1) {
        score += 100;
    } else if (capturedCount > 1) {
        score += 100 * capturedCount;
    }

    // Mobility bonus
    const validMoves = getValidMacanMoves(macanPos, state);
    score += validMoves.length * 10;

    // Position evaluation
    const positionScore = evaluatePosition(macanPos, points);
    score += positionScore;

    // Surrounding evaluation
    const mobilityScore = evaluateMobility(macanPos, state);
    score += mobilityScore;

    return score;
}

function evaluatePosition(pos, points) {
    // Prioritize central positions
    const centerX = 350;
    const centerY = 250;
    const point = points[pos];
    const distance = Math.sqrt(
        Math.pow(point.x - centerX, 2) + 
        Math.pow(point.y - centerY, 2)
    );
    return 1000 / (distance + 1);
}

function evaluateMobility(position, boardState) {
    let mobility = 0;
    connections.forEach(([a, b]) => {
        if ((a == position && !(b in boardState)) || (b == position && !(a in boardState))) {
            mobility += 1;
        }
    });
    return mobility * 5; // Slightly reduced mobility bonus
}

// Call autoMoveMacan whenever it's Macan's turn
function moveMacan(index) {
    if (turn === 2 && !gameOver) {
        setTimeout(() => {  // Add small delay for better visualization
            autoMoveMacan();
        }, 100);
    }
}
function checkWinConditions() {
    // Check if Uwong wins (Macan has no valid moves)
    if (!checkMacanValidMoves()) {
        gameOver = true;
        winner = "Uwong";
        return true;
    }
    
    // Check if Macan wins (captured 8 or more Uwong)
    if (capturedUwong >= 8) {
        gameOver = true;
        winner = "Macan";
        return true;
    }
    
    return false;
}
canvas.addEventListener("click", (event) => {
    if (gameOver) return;
    
    const rect = canvas.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;
    
    let closestIndex = -1;
    let minDist = 20;
    points.forEach((point, index) => {
        const dist = Math.hypot(point.x - x, point.y - y);
        if (dist < minDist) {
            minDist = dist;
            closestIndex = index;
        }
    });
    
    if (closestIndex !== -1) {
        placeEntity(closestIndex);
    }
});

function placeEntity(index) {
    // Handle macan placement
    if (macanInHand === 1 && turn === 2 && !gameStarted) {
        // if (!(index in entities)) {
        //     entities[index] = "macan";
        //     macanInHand--;
        //     turn = 1;
        //     gameStarted = true;
        // }
        initialMacanPlacement();
    }
    // Handle macan movement after placement
    else if (macanInHand === 0 && turn === 2 && gameStarted) {
        moveMacan(index);
    }
    // Handle uwong placement and movement
    else if (turn === 1) {
        if (uwongInHand === 21) {
            placeUwongBlock(index);
        } else if (uwongInHand === 0) { // Allow movement when no uwong in hand
            isMovingUwong = true;
            handleUwongMovement(index);
        } else if (uwongInHand > 0 && !(index in entities)) {
            entities[index] = "uwong";
            uwongInHand--;
            uwongOnBoard++;
            turn = 2;
        }
    }
    
    drawBoard();
}
function placeUwongBlock(index) {
    const row = Math.floor(index / 5);
    const col = index % 5;
    let canPlace = true;
    
    if ((index >= 0 && index < 3) || (index >= 5 && index < 8) || (index >= 10 && index < 13)) {
        canPlace = true;
    } else {
        canPlace = false;
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
    }
}

drawBoard();