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

addButton.addEventListener('click', () => {
    if (turn === 1 && uwongInHand > 0) {
        isMovingUwong = false;
        selectedUwong = null;
        drawBoard();
    }
});

// Create image objects
const humanImage = new Image();
const macanImage = new Image();
humanImage.src = '/Macanan/source/manusia.png';
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
    { x: 150, y: 50 }, { x: 250, y: 50 }, { x: 350, y: 50 }, { x: 450, y: 50 }, { x: 550, y: 50 },
        { x: 150, y: 150 }, { x: 250, y: 150 }, { x: 350, y: 150 }, { x: 450, y: 150 }, { x: 550, y: 150 },
        { x: 150, y: 250 }, { x: 250, y: 250 }, { x: 350, y: 250 }, { x: 450, y: 250 }, { x: 550, y: 250 },
        { x: 150, y: 350 }, { x: 250, y: 350 }, { x: 350, y: 350 }, { x: 450, y: 350 }, { x: 550, y: 350 },
        { x: 150, y: 450 }, { x: 250, y: 450 }, { x: 350, y: 450 }, { x: 450, y: 450 }, { x: 550, y: 450 },
        { x: 75, y: 200 }, { x: 75, y: 250 }, { x: 75, y: 300 },
        { x: 0, y: 150 }, { x: 0, y: 250 }, { x: 0, y: 350 },
        { x: 625, y: 200 }, { x: 625, y: 250 }, { x: 625, y: 300 },
        { x: 700, y: 150 }, { x: 700, y: 250 }, { x: 700, y: 350 },
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
    ctx.strokeStyle = "black";
    ctx.lineWidth = 2;

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
            point.x - IMAGE_SIZE / 2,
            point.y - IMAGE_SIZE / 2,
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

    if (gameOver) {
        ctx.fillStyle = "rgba(0, 0, 0, 0.5)";
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
            
            // Trigger Macan's move after Uwong's move
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

function isValidMoveMacan(startIndex, endIndex) {
    if (startIndex === endIndex || endIndex in entities) {
        return { valid: false, capturedPosition: null };
    }

    // Check for direct connection first
    const directConnection = connections.some(([a, b]) => {
        return (a == startIndex && b == endIndex) || (b == startIndex && a == endIndex);
    });

    if (directConnection) {
        return { valid: true, capturedPosition: null };
    }

    // Try jump move
    return tryMacanJump(startIndex, endIndex, adjacencyList, points, entities);
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
// Minimax logic
// Minimax algorithm with Alpha-Beta Pruning for Macan
function minimax(state, depth, isMaximizing, alpha, beta, lastCapture = null) {
    if (depth === 0 || isGameOver(state)) {
        return evaluateState(state);
    }

    if (isMaximizing) {
        let maxEval = -Infinity;
        const macanPos = findMacanPosition(state);
        const validMoves = getValidMacanMoves(macanPos, state);

        for (const move of validMoves) {
            // Create a new state by copying the current one
            const newState = { ...state };
            
            // Simulate the move
            if (move.type === "jump") {
                // Add bonus for capturing moves
                const captureBonus = (1 + (move.additionalCaptures ? move.additionalCaptures.length : 0)) * 100;
                delete newState[macanPos];
                newState[move.target] = "macan";
                delete newState[move.captured];
                if (move.additionalCaptures) {
                    move.additionalCaptures.forEach(pos => delete newState[pos]);
                }
                
                const eval = minimax(newState, depth - 1, false, alpha, beta) + captureBonus;
                maxEval = Math.max(maxEval, eval);
            } else {
                // Regular move
                delete newState[macanPos];
                newState[move.target] = "macan";
                const eval = minimax(newState, depth - 1, false, alpha, beta);
                maxEval = Math.max(maxEval, eval);
            }
            
            alpha = Math.max(alpha, maxEval);
            if (beta <= alpha) break; // Alpha-beta pruning
        }
        return maxEval;
    } else {
        let minEval = Infinity;
        const uwongPositions = Object.entries(state)
            .filter(([_, value]) => value === "uwong")
            .map(([key]) => parseInt(key));

        for (const uwongPos of uwongPositions) {
            const validMoves = getValidUwongMoves(uwongPos, state);
            
            for (const move of validMoves) {
                const newState = { ...state };
                delete newState[uwongPos];
                newState[move] = "uwong";
                
                const eval = minimax(newState, depth - 1, true, alpha, beta);
                minEval = Math.min(minEval, eval);
                
                beta = Math.min(beta, minEval);
                if (beta <= alpha) break; // Alpha-beta pruning
            }
        }
        return minEval;
    }
}

// Evaluate the board state
function evaluateState(state) {
    const macanPos = findMacanPosition(state);
    let score = 0;
    
    if (!macanPos) return -Infinity; // Macan lost
    
    // 1. Position evaluation
    const centerScore = evaluatePosition(parseInt(macanPos), points);
    score += centerScore * 10;
    
    // 2. Surrounding Uwongs evaluation (potential captures)
    const surroundingScore = evaluateSurroundings(parseInt(macanPos), state);
    score += surroundingScore * 50;
    
    // 3. Mobility evaluation
    const mobilityScore = evaluateMobility(parseInt(macanPos), state);
    score += mobilityScore * 30;
    
    // 4. Captured Uwongs bonus
    const uwongCount = Object.values(state).filter(v => v === "uwong").length;
    const capturedScore = (21 - uwongCount) * 100;
    score += capturedScore;
    
    return score;
}

function evaluateSurroundings(pos, state) {
    let score = 0;
    const neighbors = adjacencyList[pos];
    
    // Count surrounding Uwongs
    const surroundingUwongs = neighbors.filter(n => state[n] === "uwong").length;
    score += surroundingUwongs * 20;
    
    // Check for capture opportunities
    for (const neighbor of neighbors) {
        const jumpResult = tryMacanJump(pos, neighbor, adjacencyList, points, state);
        if (jumpResult.valid) {
            score += 50; // Bonus for each possible capture
            if (jumpResult.additionalCaptures) {
                score += jumpResult.additionalCaptures.length * 30; // Extra bonus for multiple captures
            }
        }
    }
    
    return score;
}

function evaluateMobility(pos, state) {
    // Count number of possible moves
    const validMoves = getValidMacanMoves(pos, state);
    return validMoves.length * 10;
}


// Helper functions for evaluation
function evaluatePosition(pos, points) {
    // Prefer central positions
    const centerX = 350;
    const centerY = 250;
    const distance = Math.sqrt(
        Math.pow(points[pos].x - centerX, 2) + 
        Math.pow(points[pos].y - centerY, 2)
    );
    return 1000 / (distance + 1); // Higher score for central positions
}

// Get valid moves for Macan
function getValidMacanMoves(macanPos, state) {
    const moves = [];

    // Check direct moves
    adjacencyList[macanPos].forEach(neighbor => {
        if (!state[neighbor]) {
            moves.push({ type: "move", target: neighbor });
        }
    });

    // Check jump moves
    adjacencyList[macanPos].forEach(neighbor => {
        const jumpResult = tryMacanJump(macanPos, neighbor, adjacencyList, points, state);
        if (jumpResult.valid) {
            moves.push({
                type: "jump",
                target: neighbor,
                captured: jumpResult.capturedPosition,
                additionalCaptures: jumpResult.additionalCaptures
            });
        }
    });

    return moves;
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
// Automatically move Macan
function autoMoveMacan() {
    const macanPos = findMacanPosition(entities);
    if (!macanPos) return;
    
    const validMoves = getValidMacanMoves(macanPos, entities);
    let bestMove = null;
    let bestValue = -Infinity;
    
    for (const move of validMoves) {
        const newState = { ...entities };
        
        if (move.type === "jump") {
            delete newState[macanPos];
            newState[move.target] = "macan";
            delete newState[move.captured];
            if (move.additionalCaptures) {
                move.additionalCaptures.forEach(pos => delete newState[pos]);
            }
        } else {
            delete newState[macanPos];
            newState[move.target] = "macan";
        }
        
        const value = minimax(newState, 4, false, -Infinity, Infinity);
        if (value > bestValue) {
            bestValue = value;
            bestMove = move;
        }
    }
    
    // Execute the best move
    if (bestMove) {
        if (bestMove.type === "jump") {
            delete entities[macanPos];
            entities[bestMove.target] = "macan";
            delete entities[bestMove.captured];
            capturedUwong++;
            uwongOnBoard--;
            
            if (bestMove.additionalCaptures) {
                bestMove.additionalCaptures.forEach(pos => {
                    delete entities[pos];
                    capturedUwong++;
                    uwongOnBoard--;
                });
            }
        } else {
            delete entities[macanPos];
            entities[bestMove.target] = "macan";
        }
        
        // Check win conditions
        if (checkWinConditions()) {
            gameOver = true;
            winner = "Macan";
            drawBoard();
            return;
        }
        
        turn = 1;
        drawBoard();
    }
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
    // Handle macan placement (first move)
    if (macanInHand === 1 && turn === 2 && !gameStarted) {
        if (!(index in entities)) {
            entities[index] = "macan";
            macanInHand--;
            turn = 1;
            gameStarted = true;
        }
    }
    // Handle uwong placement and movement
    else if (turn === 1) {
        if (uwongInHand === 21) {
            placeUwongBlock(index);
            if (turn === 2) {  // If turn changed to Macan
                setTimeout(() => {
                    autoMoveMacan();
                }, 100);
            }
        } else if (isMovingUwong && uwongInHand === 0) {
            handleUwongMovement(index);
            if (turn === 2) {  // If turn changed to Macan
                setTimeout(() => {
                    autoMoveMacan();
                }, 100);
            }
        } else if (uwongInHand > 0 && !(index in entities)) {
            entities[index] = "uwong";
            uwongInHand--;
            uwongOnBoard++;
            turn = 2;
            setTimeout(() => {  // Trigger Macan's move after Uwong placement
                autoMoveMacan();
            }, 100);
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