// Game canvas setup
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
let isAIEnabled = true;
let aiDifficulty = 3;

// UI Setup
const buttonContainer = document.createElement('div');
buttonContainer.style.marginBottom = '10px';

const difficultySelect = document.createElement('select');
difficultySelect.style.padding = '5px 10px';
difficultySelect.style.marginRight = '10px';
['Easy (Depth 2)', 'Medium (Depth 3)', 'Hard (Depth 4)'].forEach((level, index) => {
    const option = document.createElement('option');
    option.value = index + 2;
    option.text = level;
    difficultySelect.appendChild(option);
});

const resetButton = document.createElement('button');
resetButton.textContent = 'Reset Game';
resetButton.addEventListener('click', resetGame);
buttonContainer.appendChild(resetButton);

difficultySelect.addEventListener('change', (e) => {
    aiDifficulty = parseInt(e.target.value);
    console.log(`AI difficulty set to depth ${aiDifficulty}`);
});

// Image loading
const humanImage = new Image();
const macanImage = new Image();
humanImage.src = '/Macanan/source/uwong.png';
macanImage.src = '/Macanan/source/macan.png';
const IMAGE_SIZE = 30;

// Game board setup
const macanStartingPoints = [25, 26, 27, 28, 29, 30, 31, 32, 33, 34, 35, 36];

// Points and connections setup
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

let gameWinner = null;


// MinimaxAI Class
class MinimaxAI {
    constructor(maxDepth = 3) {
        this.maxDepth = maxDepth;
    }

    getBestMove(gameState) {
        if (gameState.uwongInHand === 0) {
            return this.getBestUwongMovement(gameState);
        }
    
        if (gameState.uwongInHand === 21) {
            return this.getInitialBlockPlacement(gameState);
        } else if (gameState.uwongInHand > 0) {
            return this.getBestPlacement(gameState);
        }
    }

    getBestUwongMovement(gameState) {
        let bestScore = -Infinity;
        let bestMove = null;
        
        const uwongPositions = Object.entries(gameState.entities)
            .filter(([_, type]) => type === "uwong")
            .map(([index, _]) => parseInt(index));

        for (const fromIndex of uwongPositions) {
            for (const toIndex of points.keys()) {
                if (!(toIndex in gameState.entities) && this.isValidMoveUwong(fromIndex, toIndex)) {
                    const newState = this.simulateUwongMovement(gameState, fromIndex, toIndex);
                    const score = this.evaluateUwongMove(newState, fromIndex, toIndex);
                    
                    if (score > bestScore) {
                        bestScore = score;
                        bestMove = { 
                            type: 'move', 
                            from: fromIndex, 
                            to: toIndex 
                        };
                    }
                }
            }
        }
        
        return bestMove;
    }

    evaluateUwongMove(gameState, fromIndex, toIndex) {
        let score = 0;
        
        const fromPoint = points[fromIndex];
        const toPoint = points[toIndex];
        
        const centerX = 350;
        const centerY = 250;
        const distanceToCenter = Math.sqrt(
            Math.pow(toPoint.x - centerX, 2) + 
            Math.pow(toPoint.y - centerY, 2)
        );
        score += (700 - distanceToCenter) / 50;

        const connectedUwongCount = this.getConnectedUwongCount(toIndex, gameState);
        score += connectedUwongCount * 5;

        const macanPos = this.findMacanPosition(gameState);
        if (macanPos !== -1) {
            const distanceToMacan = this.getDistance(toIndex, macanPos);
            
            if (distanceToMacan > 200 && distanceToMacan < 400) {
                score += 10;
            }
            if (distanceToMacan < 100) {
                score -= 20;
            }
        }

        const defensivePositions = [0, 1, 5, 6, 10, 11, 25, 26, 27];
        if (defensivePositions.includes(toIndex)) {
            score += 8;
        }

        const movementDistance = Math.sqrt(
            Math.pow(toPoint.x - fromPoint.x, 2) + 
            Math.pow(toPoint.y - fromPoint.y, 2)
        );
        score += Math.min(movementDistance / 50, 5);

        return score;
    }

    simulateUwongMovement(gameState, fromIndex, toIndex) {
        const newState = this.cloneGameState(gameState);
        
        newState.entities[toIndex] = "uwong";
        delete newState.entities[fromIndex];
        
        return newState;
    }

    minimax(gameState, depth, alpha, beta, isMaximizing) {
        if (depth === 0 || this.isGameOver(gameState)) {
            return this.evaluatePosition(gameState);
        }
    
        if (isMaximizing) {
            let maxScore = -Infinity;
            const moves = this.getAllPossibleMoves(gameState, true);
    
            for (const move of moves) {
                const newState = this.simulateMove(gameState, move);
                const score = this.minimax(newState, depth - 1, alpha, beta, false);
                maxScore = Math.max(maxScore, score);
                alpha = Math.max(alpha, score);
                if (beta <= alpha) break; // Alpha-Beta Pruning
            }
    
            return maxScore;
        } else {
            let minScore = Infinity;
            const moves = this.getAllPossibleMoves(gameState, false);
    
            for (const move of moves) {
                const newState = this.simulateMove(gameState, move);
                const score = this.minimax(newState, depth - 1, alpha, beta, true);
                minScore = Math.min(minScore, score);
                beta = Math.min(beta, score);
                if (beta <= alpha) break; // Alpha-Beta Pruning
            }
    
            return minScore;
        }
    }

    evaluatePosition(gameState) {
        let score = 0;
    
        const uwongCount = Object.values(gameState.entities)
            .filter(type => type === "uwong").length;
        score += uwongCount * 10;
        score -= gameState.capturedUwong * 15;
    
        Object.entries(gameState.entities).forEach(([index, type]) => {
            if (type === "uwong") {
                const connectedUwong = this.getConnectedUwongCount(index, gameState);
                score += connectedUwong * 3;
    
                const macanPos = this.findMacanPosition(gameState);
                if (macanPos !== -1) {
                    const distanceToMacan = this.getDistance(parseInt(index), macanPos);
                    score += Math.min(distanceToMacan / 100, 5);
                }
    
                const point = points[index];
                const distanceToCenter = Math.abs(point.x - 350) + Math.abs(point.y - 250);
                score += (700 - distanceToCenter) / 100;
            }
        });
    
        return score;
    }

    getConnectedUwongCount(index, gameState) {
        return connections.reduce((count, [a, b]) => {
            if ((a == index && gameState.entities[b] === "uwong") ||
                (b == index && gameState.entities[a] === "uwong")) {
                count++;
            }
            return count;
        }, 0);
    }

    findMacanPosition(gameState) {
        const macanEntry = Object.entries(gameState.entities)
            .find(([_, type]) => type === "macan");
        return macanEntry ? parseInt(macanEntry[0]) : -1;
    }

    getDistance(index1, index2) {
        const point1 = points[index1];
        const point2 = points[index2];
        return Math.sqrt(
            Math.pow(point2.x - point1.x, 2) + 
            Math.pow(point2.y - point1.y, 2)
        );
    }

    cloneGameState(gameState) {
        return {
            entities: { ...gameState.entities },
            uwongInHand: gameState.uwongInHand,
            uwongOnBoard: gameState.uwongOnBoard,
            capturedUwong: gameState.capturedUwong
        };
    }

    simulateMove(gameState, move) {
        const newState = this.cloneGameState(gameState);
        
        if (move.capture !== undefined && move.capture !== null) {
            delete newState.entities[move.capture];
            newState.capturedUwong++;
        }
        
        newState.entities[move.to] = newState.entities[move.from];
        delete newState.entities[move.from];
        
        return newState;
    }

    isGameOver(gameState) {
        if (gameState.capturedUwong >= 8) {
            return true;
        }
    
        const macanMoves = this.getAllPossibleMoves(gameState, false);
        if (macanMoves.length === 0) {
            return true;
        }
    
        return false;
    }

    getAllPossibleMoves(gameState, isUwong) {
        const moves = [];
        const pieces = Object.entries(gameState.entities)
            .filter(([_, type]) => type === (isUwong ? "uwong" : "macan"));

        for (const [fromIndex, _] of pieces) {
            points.forEach((_, toIndex) => {
                if (!(toIndex in gameState.entities)) {
                    if (isUwong) {
                        if (this.isValidMoveUwong(fromIndex, toIndex)) {
                            moves.push({ from: fromIndex, to: toIndex });
                        }
                    } else {
                        const moveResult = this.isValidMoveMacan(fromIndex, toIndex, gameState);
                        if (moveResult.valid) {
                            moves.push({ 
                                from: fromIndex,
                                to: toIndex, 
                                capture: moveResult.capturedPosition 
                            });
                        }
                    }
                }
            });
        }
        return moves;
    }

    isValidMoveUwong(startIndex, endIndex) {
        return connections.some(([a, b]) => 
            (a == startIndex && b == endIndex) || (b == startIndex && a == endIndex));
    }

    isValidMoveMacan(startIndex, endIndex, gameState) {
        if (startIndex === endIndex || endIndex in gameState.entities) {
            return { valid: false, capturedPosition: null };
        }

        const directConnection = connections.some(([a, b]) => 
            (a == startIndex && b == endIndex) || (b == startIndex && a == endIndex));

        if (directConnection) {
            return { valid: true, capturedPosition: null };
        }

        let capturedPosition = null;
        
        const possibleJumps = connections.reduce((jumps, [a, b]) => {
            if (a == startIndex || b == startIndex) {
                const midpoint = a == startIndex ? b : a;
                if (gameState.entities[midpoint] === "uwong") {
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

    getBestPlacement(gameState) {
        let bestScore = -Infinity;
        let bestMove = null;
        
        for (let i = 0; i < points.length; i++) {
            if (!(i in gameState.entities)) {
                const newState = this.simulatePlacement(gameState, i);
                const score = this.minimax(newState, this.maxDepth, -Infinity, Infinity, false);
                
                if (score > bestScore) {
                    bestScore = score;
                    bestMove = { type: 'place', position: i };
                }
            }
        }
        
        return bestMove;
    }

    getInitialBlockPlacement(gameState) {
        const optimalStartPositions = [0, 1, 5, 6, 10, 11];
        for (let pos of optimalStartPositions) {
            if (this.isValidBlockPlacement(pos, gameState)) {
                return { type: 'block', position: pos };
            }
        }
        return null;
    }

    simulatePlacement(gameState, position) {
        const newState = this.cloneGameState(gameState);
        newState.entities[position] = "uwong";
        newState.uwongInHand--;
        newState.uwongOnBoard++;
        return newState;
    }

    isValidBlockPlacement(index, gameState) {
        const row = Math.floor(index / 5);
        const col = index % 5;
        
        if (!((index >= 0 && index < 3) || (index >= 5 && index < 8) || (index >= 10 && index < 13))) {
            return false;
        }

        for (let i = 0; i < 3; i++) {
            for (let j = 0; j < 3; j++) {
                const newIndex = (row + i) * 5 + (col + j);
                if (newIndex in gameState.entities) return false;
            }
        }
        
        return true;
    }
}

function checkGameResult() {
    // Check if Macan has captured 8 Uwong pieces
    if (capturedUwong >= 8) {
        gameWinner = "macan";
        alert("Macan wins by capturing 8 Uwong!");
        return true;
    }

    // Find Macan's current position
    const macanPosition = findMacanPosition();
    
    // If no Macan on board, game continues
    if (macanPosition === undefined) {
        return false;
    }

    // Check if Macan has any valid moves
    const macanMoves = getAllMacanMoves(macanPosition);

    // If Macan has no possible moves, Uwong wins
    if (macanMoves.length === 0) {
        gameWinner = "uwong";
        alert("Uwong wins by blocking Macan's movement!");
        return true;
    }

    // Check if there are any Uwong left on the board
    const uwongCount = Object.values(entities).filter(type => type === "uwong").length;
    if (uwongCount === 0) {
        gameWinner = "macan";
        alert("Macan wins by eliminating all Uwong!");
        return true;
    }

    return false;
}

function getAllMacanMoves(macanPosition) {
    const validMoves = [];
    
    // Check all board points for valid Macan moves
    for (let i = 0; i < points.length; i++) {
        const moveResult = isValidMoveMacan(macanPosition, i);
        if (moveResult.valid) {
            validMoves.push(i);
        }
    }
    
    return validMoves;
}

// Initialize AI
const ai = new MinimaxAI(3);

// Drawing functions
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
    Object.entries(entities).forEach(([index, type]) => {
        const point = points[index];
        const image = type === "macan" ? macanImage : humanImage;
        
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
    });

    // Draw game info
    ctx.font = "20px Arial";
    ctx.fillStyle = "black";
    ctx.fillText(`Captured Uwong: ${capturedUwong}`, 10, 30);
    ctx.fillText(`Uwong in Hand: ${uwongInHand}`, 10, 60);
    
    buttonContainer.style.display = (turn === 1 && uwongInHand < 21 && uwongInHand > 0) ? 'block' : 'none';
}

// Game mechanics functions
function placeEntity(index) {
    // Prevent moves after game is over
    if (gameWinner) return;

    if (macanInHand === 1 && turn === 2 && !gameStarted) {
        // Remove the macanStartingPoints check, allowing placement on any empty point
        if (!(index in entities)) {
            entities[index] = "macan";
            macanInHand--;
            turn = 1;
            gameStarted = true;
        }
    }
    else if (macanInHand === 0 && turn === 2 && gameStarted) {
        moveMacan(index);
    }
    else if (turn === 1) {
        if (uwongInHand === 21) {
            placeUwongBlock(index);
        } else if (isMovingUwong) {
            handleUwongMovement(index);
        } else if (uwongInHand > 0 && !(index in entities)) {
            entities[index] = "uwong";
            uwongInHand--;
            uwongOnBoard++;
            turn = 2;
        } else if (uwongInHand === 0) {
            // Implement movement of existing uwong when no uwong in hand
            if (entities[index] === "uwong") {
                selectedUwong = index;
                isMovingUwong = true;
                drawBoard();
            }
        }
    }

    // Check game result after each move
    if (checkGameResult()) {
        return;
    }
    
    // Trigger AI move if it's AI's turn
    if (turn === 1 && isAIEnabled) {
        makeBotMove();
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
            drawBoard();
        } else if (entities[index] === "uwong") {
            selectedUwong = index;
            drawBoard();
        }
    }
}

function resetGame() {
    entities = {};
    uwongInHand = 21;
    uwongOnBoard = 0;
    macanInHand = 1;
    turn = 1;
    gameStarted = false;
    capturedUwong = 0;
    gameWinner = null;
    selectedUwong = null;
    isMovingUwong = false;
    drawBoard();
}

function moveMacan(index) {
    const currentPosition = findMacanPosition();
    if (currentPosition !== -1) {
        const moveResult = isValidMoveMacan(currentPosition, index);
        if (moveResult.valid) {
            entities[index] = "macan";
            delete entities[currentPosition];
            
            // Remove captured uwong(s)
            if (moveResult.capturedPosition !== null) {
                delete entities[moveResult.capturedPosition];
                if (moveResult.additionalCaptures) {
                    moveResult.additionalCaptures.forEach(pos => {
                        delete entities[pos];
                        capturedUwong++;
                    });
                }
                capturedUwong++;
                uwongOnBoard--;
            }
            
            // Always check game result after Macan's move
            if (checkGameResult()) {
                drawBoard();
                return;
            }
            
            turn = 1;
        }
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

function isValidMoveUwong(startIndex, endIndex) {
    return connections.some(([a, b]) =>
        (a == startIndex && b == endIndex) || (b == startIndex && a == endIndex));
}

// Update isValidMoveMacan function
function findMacanPosition() {
    return Object.keys(entities).find(index => entities[index] === "macan");
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

function tryMacanJump(currentPosition, targetIndex, adjacencyList, nodes, boardState) {
    // Find all paths from current position towards target
    function findPaths(start, target, maxLength = 5) {
        const paths = [];
        const visited = new Set();

        function dfs(current, path) {
            if (path.length > maxLength) return;
            if (current === target) {
                paths.push(path);
                return;
            }

            visited.add(current);
            
            for (const neighbor of adjacencyList[current]) {
                if (!visited.has(neighbor)) {
                    dfs(neighbor, [...path, neighbor]);
                }
            }
            
            visited.delete(current);
        }

        dfs(start, [start]);
        return paths;
    }

    // Find all possible paths
    const possiblePaths = findPaths(currentPosition, targetIndex);

    // Validate each path for 3-Uwong jump
    for (const path of possiblePaths) {
        // Full path including start and target
        const fullPath = [currentPosition, ...path, targetIndex];
        
        // Find Uwong positions in the path
        const uwongPositions = fullPath.filter(pos => boardState[pos] === "uwong");
        
        // Check for exactly 3 Uwong
        if (uwongPositions.length === 3) {
            // Middle Uwong is the capture point
            const middleUwongIndex = uwongPositions[1];
            const sideUwongIndexes = [uwongPositions[0], uwongPositions[2]];

            return {
                valid: true,
                capturedPosition: middleUwongIndex.toString(),
                additionalCaptures: sideUwongIndexes.map(String)
            };
        }
    }

    // No valid 3-Uwong jump found
    return { valid: false, capturedPosition: null };
}

const adjacencyList = Array(points.length).fill().map(() => []);
connections.forEach(([from, to]) => {
    adjacencyList[from].push(to);
    adjacencyList[to].push(from);
});

function placeUwongBlock(index) {
    const row = Math.floor(index / 5);
    const col = index % 5;
    
    if ((index >= 0 && index < 3) || (index >= 5 && index < 8) || (index >= 10 && index < 13)) {
        let canPlace = true;
        
        // Check if all required positions are empty
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
        }
    }
}

function makeBotMove() {
    if (!isAIEnabled || turn !== 1) return;

    const gameState = {
        entities: { ...entities },
        uwongInHand: uwongInHand,
        uwongOnBoard: uwongOnBoard,
        capturedUwong: capturedUwong
    };

    ai.maxDepth = aiDifficulty;
    const move = ai.getBestMove(gameState);

    if (move) {
        setTimeout(() => {
            if (move.type === 'block') {
                placeUwongBlock(move.position);
            } else if (move.type === 'place') {
                placeEntity(move.position);
            } else if (move.type === 'move') {
                handleBotUwongMovement(move.from, move.to);
            }
        }, 500);
    }
}

function handleBotUwongMovement(fromIndex, toIndex) {
    entities[toIndex] = "uwong";
    delete entities[fromIndex];
    turn = 2;
    drawBoard();
}

// Event listener for canvas clicks
canvas.addEventListener("click", (event) => {
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

// Start the game
Promise.all([
    new Promise(resolve => humanImage.onload = resolve),
    new Promise(resolve => macanImage.onload = resolve)
]).then(() => {
    drawBoard();
});