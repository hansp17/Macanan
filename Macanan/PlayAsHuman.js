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

// addButton.addEventListener('click', () => {
//     if (turn === 1 && uwongInHand > 0) {
//         isMovingUwong = false;
//         selectedUwong = null;
//         drawBoard();
//     }
// });

document.addEventListener('DOMContentLoaded', () => {
    if (!gameStarted && turn === 2) {
        initialMacanPlacement();
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

// Add this function to automatically move Macan after Uwong's move
function autoMoveMacan() {
    const macanPos = findMacanPosition();
    if (macanPos !== undefined) {
        const validMoves = getValidMacanMoves(macanPos, entities);
        
        if (validMoves.length > 0) {
            // Choose the first valid move (you can improve this with more strategic selection)
            const bestMove = validMoves[0];
            moveMacan(bestMove.target);
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

    // Cek koneksi langsung
    const directConnection = connections.some(([a, b]) => {
        return (a == startIndex && b == endIndex) || (b == startIndex && a == endIndex);
    });

    if (directConnection && !(endIndex in entities)) {
        return { valid: true, capturedPosition: null };
    }

    // Cek gerakan memakan
    const jumpResult = tryMacanJump(parseInt(startIndex), parseInt(endIndex), adjacencyList, points, entities);
    return jumpResult;
}

function tryMacanJump(currentPosition, targetIndex, adjacencyList, nodes, boardState) {
    // Hanya cek gerakan dalam garis lurus (horizontal, vertikal, atau diagonal)
    const startNode = nodes[currentPosition];
    const endNode = nodes[targetIndex];
    
    // Hitung arah gerakan
    const dx = endNode.x - startNode.x;
    const dy = endNode.y - startNode.y;
    
    // Pastikan gerakan dalam garis lurus
    if (Math.abs(dx) !== Math.abs(dy) && dx !== 0 && dy !== 0) {
        return { valid: false, capturedPosition: null };
    }
    
    // Cari titik tengah (posisi Uwong yang akan dimakan)
    const midX = (startNode.x + endNode.x) / 2;
    const midY = (startNode.y + endNode.y) / 2;
    
    // Cari index titik tengah
    let midIndex = -1;
    for (let i = 0; i < nodes.length; i++) {
        if (nodes[i].x === midX && nodes[i].y === midY) {
            midIndex = i;
            break;
        }
    }
    
    // Validasi gerakan melompat
    if (midIndex !== -1 && 
        boardState[midIndex] === "uwong" && // Harus ada Uwong di tengah
        !(targetIndex in boardState) && // Titik tujuan harus kosong
        adjacencyList[currentPosition].includes(midIndex) && // Harus terhubung ke titik tengah
        adjacencyList[midIndex].includes(parseInt(targetIndex))) { // Titik tengah harus terhubung ke tujuan
        
        return {
            valid: true,
            capturedPosition: midIndex.toString(),
            additionalCaptures: []
        };
    }
    
    return { valid: false, capturedPosition: null };
}

function findPossibleJumpPaths(start, target, adjacencyList, nodes, boardState) {
    const paths = [];
    const visited = new Set();
    
    function dfs(current, path) {
        if (current === target) {
            paths.push([...path]);
            return;
        }
        
        visited.add(current);
        
        for (const next of adjacencyList[current]) {
            if (!visited.has(next)) {
                const dx = nodes[next].x - nodes[current].x;
                const dy = nodes[next].y - nodes[current].y;
                
                // Cek apakah gerakan valid (lurus atau diagonal)
                if (Math.abs(dx) <= 100 && Math.abs(dy) <= 100) {
                    path.push(next);
                    dfs(next, path);
                    path.pop();
                }
            }
        }
        
        visited.delete(current);
    }
    
    dfs(start, [start]);
    return paths;
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

// Get valid moves for Macan
function getValidMacanMoves(macanPos, state) {
    const moves = [];
    macanPos = parseInt(macanPos);
    
    // Cek gerakan langsung (tanpa melompat)
    adjacencyList[macanPos].forEach(neighbor => {
        if (!(neighbor in state)) {
            moves.push({
                type: "move",
                target: neighbor
            });
        }
    });
    
    // Cek gerakan melompat
    points.forEach((_, targetIndex) => {
        if (targetIndex === macanPos || targetIndex in state) return;
        
        const jumpResult = tryMacanJump(macanPos, targetIndex, adjacencyList, points, state);
        if (jumpResult.valid) {
            moves.push({
                type: "jump",
                target: targetIndex,
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
    
    // Priority 1: Find multi-jump paths
    const multiJumpPaths = findMultiJumpPaths(macanPos, entities);
    if (multiJumpPaths.length > 0) {
        const bestMultiJumpPath = multiJumpPaths[0];
        
        // Execute multi-jump path
        let currentPos = macanPos;
        bestMultiJumpPath.path.slice(1).forEach(target => {
            const jumpMove = validMoves.find(move => 
                move.type === "jump" && 
                move.target === target
            );

            if (jumpMove) {
                delete entities[currentPos];
                entities[target] = "macan";
                delete entities[jumpMove.captured];
                currentPos = target;
                capturedUwong++;
                uwongOnBoard--;
            }
        });
    } 
    // Priority 2: Single capture moves
    else {
        const jumpMoves = validMoves.filter(move => move.type === "jump");
        if (jumpMoves.length > 0) {
            // Strategically choose capture near board edges or strategic points
            const strategicJumpMoves = jumpMoves.filter(move => {
                const target = points[move.target];
                const isNearEdge = 
                    target.x < 200 || 
                    target.x > 500 || 
                    target.y < 100 || 
                    target.y > 400;
                return isNearEdge;
            });

            const selectedMove = strategicJumpMoves.length > 0 
                ? strategicJumpMoves[0] 
                : jumpMoves[0];

            delete entities[macanPos];
            entities[selectedMove.target] = "macan";
            delete entities[selectedMove.captured];
            capturedUwong++;
            uwongOnBoard--;
        } 
        // Priority 3: Strategic positioning if no captures
        else {
            let bestMove = null;
            let bestScore = -Infinity;

            for (const move of validMoves) {
                const score = evaluatePosition(move.target, points) + 
                    evaluateSurroundings(move.target, entities) + 
                    evaluateMobility(move.target, entities);

                if (score > bestScore) {
                    bestScore = score;
                    bestMove = move;
                }
            }

            if (bestMove) {
                delete entities[macanPos];
                entities[bestMove.target] = "macan";
            }
        }
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
        if (!(index in entities)) {
            entities[index] = "macan";
            macanInHand--;
            turn = 1;
            gameStarted = true;
        }
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