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

//tombol reset
const resetButton = document.createElement('button')
resetButton.textContent = 'Reset Game';
resetButton.style.marginLeft = '10px';
resetButton.style.padding = '5px 10px';
// buttonContainer.appendChild(resetButton);

// resetButton.addEventListener('click', resetGame);

// function resetGame() {
//     uwongInHand = 21;
//     uwongOnBoard = 0;
//     macanInHand = 1;
//     turn = 1;
//     entities = {};
//     gameStarted = false;
//     capturedUwong = 0;
//     selectedUwong = null;
//     isMovingUwong = false;
//     drawBoard();
// }

function moveUwongAI() {
    const depth = 3 //kedalaman pencarian
    const maximizingPlayer = true // AI sebagai MAX
    let bestMove = null;
    let alpha = -Infinity;
    let beta = Infinity

    for (const move of getAllUwongMoves()) {
        const newEntities = simulateMove(move,entities) //simulasi langkah
        const score = miimax(newEntities, depth - 1, alpha, beta, !maximizingPlayer);

        if(score > alpha) {
            alpha = score;
            bestMove = move
        }
    }

    if (bestMove) {
        const { from, to } = bestMove
        entities[to] = "uwong";
        delete entities[from];
        turn = 2;
    }
}

function minimaax (currentEntities, depth, alpha, beta, maximizingPlayer) {
    if(depth === 0 || isGameOver(currentEntities)) {
        return evaluateBoard(currentEntities);
    }

    if (maximizingPlayer) {
        let maxEval = -Infinity
        for (const move of getAllUwongMoves(currentEntities)){
            const newEntities = simulateMovev(move,currentEntities)
            const eval = minimax(newEntities, depth - 1, alpha, beta, false)
            maxEval = Math.max(maxEval, eval)
            alpha = Math.max(alpha, eval)
            if(beta <= alpa) break
        }
    } else {
        let minEval = Infinity
        for (const move of getAllMacanMoves(currentEntities)) {
            const newEntities = simulateMove(move, currentEntities)
            const eval = minimax(newEntities, depth - 1, alpha, beta, true)
            minEval = Math.min(minEval,eval);
            beta = Math.min(beta,eval);
            if(beta <= alpha) break
        }
        return minEval
    }
}

function getAllUwongMoves(currentEntities = entities) {
    const uwongPositions = Object.keys(currentEntities).filter(
        (key) => currentEntities[key] === "uwong"
    )
    const moves = []

    uwongPositions.forEach((uwongPosition) => {
        const uwongIndex = parseInt(uwongPosition)

        connections.forEach(([a,b]) => {
            const target = a === uwongIndex ? b : b === uwongIndex ? a : null

            if(target !== null && !currentEntities[target] && isValidMoveUwong(uwongIndex, target)) {
                moves.push({ from: uwongIndex, to: target })
            }
        })
    })
    return moves;
}

function getAllMacanMoves(currentEntities = entities) {
    const macanPostition = Object.keys(currentEntities).find(
        (key) => currentEntities[key] === "macan"
    )
    const macanIndex = parseInt(macanPostition)
    const moves = []

    connections.forEach(([a,b]) => {
        const target = a === macanIndex ? b : b === macanIndex ? a : null

        if(target !== null && !currentEntities[target] && isValidMoveMacan(macanIndex, target)) {
            moves.push({ from: macanIndex, to: target })
        }
    })
    return moves;
}

function simulateMove(move, currentEntities) {
    const newEntities = { ...currentEntities };
    newEntities[move.to] = newEntities[move.from];
    delete newEntities[move.from];
    return newEntities;
}

function evaluateBoard(currentEntities) {
    const macanPosition = Object.keys(currentEntities).find(
        (key) => currentEntities[key] === "macan"
    );
    const uwongPositions = Object.keys(currentEntities).filter(
        (key) => currentEntities[key] === "uwong"
    );

    // Skor didasarkan pada jarak rata-rata uwong ke macan
    const macanRow = Math.floor(macanPosition / 5);
    const macanCol = macanPosition % 5;

    const totalDistance = uwongPositions.reduce((acc, uwongPosition) => {
        const uwongRow = Math.floor(uwongPosition / 5);
        const uwongCol = uwongPosition % 5;
        return (
            acc + Math.abs(uwongRow - macanRow) + Math.abs(uwongCol - macanCol)
        );
    }, 0);

    return -totalDistance; // Semakin kecil jarak, semakin baik
}

function isGameOver(currentEntities) {
    // Periksa apakah macan telah terkepung
    const macanPosition = Object.keys(currentEntities).find(
        (key) => currentEntities[key] === "macan"
    );
    const macanIndex = parseInt(macanPosition);

    return connections
        .filter(([a, b]) => a === macanIndex || b === macanIndex)
        .every(([a, b]) => {
            const target = a === macanIndex ? b : a;
            return currentEntities[target];
        });
}

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
    if (turn === 1 && uwongInHand < 21) {
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

// Define starting points for macan
const macanStartingPoints = [25, 26, 27, 28, 29, 30, 31, 32, 33, 34, 35, 36];

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
    
    // Show/hide mode selection buttons
    buttonContainer.style.display = (turn === 1 && uwongInHand < 21 && uwongInHand > 0) ? 'block' : 'none';
}

function placeEntity(index) {
    // Handle initial macan placement
    if (macanInHand === 1 && turn === 2 && !gameStarted) {
        if (macanStartingPoints.includes(parseInt(index))) {
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
        } else if (isMovingUwong) {
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

function handleUwongMovement(index) {
    if (selectedUwong === null) {
        // Select an uwong to move
        if (entities[index] === "uwong") {
            selectedUwong = index;
            drawBoard();
        }
    } else {
        // Move the selected uwong
        if (isValidMoveUwong(selectedUwong, index) && !(index in entities)) {
            entities[index] = "uwong";
            delete entities[selectedUwong];
            selectedUwong = null;
            isMovingUwong = false;
            turn = 2;
            drawBoard();
        } else {
            // If click on another uwong, select it instead
            if (entities[index] === "uwong") {
                selectedUwong = index;
                drawBoard();
            }
        }
    }
}

function moveMacan(index) {
    const currentPosition = findMacanPosition();
    if (currentPosition !== -1) {
        const moveResult = isValidMoveMacan(currentPosition, index);
        if (moveResult.valid) {
            entities[index] = "macan";
            delete entities[currentPosition];
            
            // Remove captured uwong if any
            if (moveResult.capturedPosition !== null) {
                delete entities[moveResult.capturedPosition];
                capturedUwong++;
                uwongOnBoard--;
            }

            checkMacanWin()            
            turn = 1;
            moveHumanAI();
        }
    }
}

function findMacanPosition() {
    return Object.keys(entities).find(index => entities[index] === "macan");
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

    // Check for direct connection
    const directConnection = connections.some(([a, b]) => {
        return (a == startIndex && b == endIndex) || (b == startIndex && a == endIndex);
    });

    if (directConnection) {
        return { valid: true, capturedPosition: null };
    }

    // Check for jump over uwong
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

drawBoard();