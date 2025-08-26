// // ========================================
// // JavaScript Logic for the Captcha Game
// // ========================================
//         // --- DOM Element References ---
//         const webcam = document.getElementById('webcam');
//         const canvas = document.getElementById('canvas');
//         const puzzlePiecesContainer = document.getElementById('puzzle-pieces');
//         const solutionGrid = document.getElementById('solution-grid');
//         const startBtn = document.getElementById('start-btn');
//         const resetBtn = document.getElementById('reset-btn');
//         const message = document.getElementById('message');
//         const gameArea = document.getElementById('game-area');

//         // --- Game Constants ---
//         const GRID_SIZE = 3;
//         const PUZZLE_DIMENSION = 300; // The dimension of the captured frame (300x300 px)

//         let stream; // To hold the webcam stream

//         // --- Event Listeners ---
//         startBtn.addEventListener('click', startCaptcha);
//         resetBtn.addEventListener('click', resetCaptcha);

//         /**
//          * @function startCaptcha
//          * Requests webcam access and starts the video stream.
//          * Once the stream is active, it captures a frame to create the puzzle.
//          */
//         async function startCaptcha() {
//             try {
//                 // Request access to the user's webcam
//                 stream = await navigator.mediaDevices.getUserMedia({ video: true });
//                 webcam.srcObject = stream;
//                 webcam.classList.remove('hidden');
//                 startBtn.disabled = true;
//                 startBtn.textContent = 'Capturing...';
                
//                 // When the video metadata is loaded, set canvas dimensions and capture frame
//                 webcam.onloadedmetadata = () => {
//                     setTimeout(() => {
//                         captureFrameAndCreatePuzzle();
//                     }, 1000); // Wait 1 second for the video to stabilize
//                 };

//             } catch (err) {
//                 console.error("Error accessing webcam:", err);
//                 message.textContent = "Could not access webcam. Please allow permission.";
//                 message.className = 'mt-6 text-center font-semibold text-lg h-8 text-red-400';
//             }
//         }

//         /**
//          * @function captureFrameAndCreatePuzzle
//          * Captures a single frame from the webcam, draws it to a canvas,
//          * and then initiates the puzzle creation process.
//          */
//         function captureFrameAndCreatePuzzle() {
//             canvas.width = PUZZLE_DIMENSION;
//             canvas.height = PUZZLE_DIMENSION;
//             const ctx = canvas.getContext('2d');
//             // Draw the current webcam frame onto the hidden canvas
//             ctx.drawImage(webcam, 0, 0, PUZZLE_DIMENSION, PUZZLE_DIMENSION);

//             // Stop the webcam stream and hide the video element
//             stream.getTracks().forEach(track => track.stop());
//             webcam.classList.add('hidden');

//             // Show the game area and reset/start buttons
//             gameArea.classList.remove('hidden');
//             startBtn.classList.add('hidden');
//             resetBtn.classList.remove('hidden');
//             startBtn.disabled = false;
//             startBtn.textContent = 'Start Captcha';

//             createPuzzlePieces();
//         }

//         /**
//          * @function createPuzzlePieces
//          * Slices the captured frame into a grid of pieces, scrambles them,
//          * and populates the puzzle and solution areas.
//          */
//         function createPuzzlePieces() {
//             puzzlePiecesContainer.innerHTML = '';
//             solutionGrid.innerHTML = '';
//             const pieceWidth = PUZZLE_DIMENSION / GRID_SIZE;
//             const pieceHeight = PUZZLE_DIMENSION / GRID_SIZE;

//             const pieces = [];
//             for (let i = 0; i < GRID_SIZE * GRID_SIZE; i++) {
//                 const x = (i % GRID_SIZE) * pieceWidth;
//                 const y = Math.floor(i / GRID_SIZE) * pieceHeight;
//                 pieces.push({ index: i, x, y });
//             }

//             // Scramble the pieces using Fisher-Yates shuffle algorithm
//             for (let i = pieces.length - 1; i > 0; i--) {
//                 const j = Math.floor(Math.random() * (i + 1));
//                 [pieces[i], pieces[j]] = [pieces[j], pieces[i]];
//             }

//             // Create and display the scrambled pieces and empty drop zones
//             pieces.forEach(pieceInfo => {
//                 const pieceCanvas = document.createElement('canvas');
//                 pieceCanvas.width = pieceWidth;
//                 pieceCanvas.height = pieceHeight;
//                 pieceCanvas.getContext('2d').drawImage(
//                     canvas,
//                     pieceInfo.x, pieceInfo.y, pieceWidth, pieceHeight,
//                     0, 0, pieceWidth, pieceHeight
//                 );
//                 pieceCanvas.className = "cursor-grab rounded-md shadow-lg";
//                 pieceCanvas.draggable = true;
//                 pieceCanvas.dataset.id = pieceInfo.index;
//                 pieceCanvas.addEventListener('dragstart', handleDragStart);
//                 puzzlePiecesContainer.appendChild(pieceCanvas);
//             });

//             for (let i = 0; i < GRID_SIZE * GRID_SIZE; i++) {
//                 const dropZone = document.createElement('div');
//                 dropZone.className = 'drop-zone rounded-md';
//                 dropZone.style.width = `${pieceWidth}px`;
//                 dropZone.style.height = `${pieceHeight}px`;
//                 dropZone.dataset.targetId = i;
//                 dropZone.addEventListener('dragover', handleDragOver);
//                 dropZone.addEventListener('dragleave', handleDragLeave);
//                 dropZone.addEventListener('drop', handleDrop);
//                 solutionGrid.appendChild(dropZone);
//             }
//         }

//         /**
//          * @function resetCaptcha
//          * Resets the game to its initial state.
//          */
//         function resetCaptcha() {
//             gameArea.classList.add('hidden');
//             startBtn.classList.remove('hidden');
//             resetBtn.classList.add('hidden');
//             puzzlePiecesContainer.innerHTML = '';
//             solutionGrid.innerHTML = '';
//             message.textContent = '';
//         }

//         // --- Drag and Drop Event Handlers ---

//         function handleDragStart(e) {
//             e.dataTransfer.setData('text/plain', e.target.dataset.id);
//             e.target.classList.add('dragging');
//         }

//         function handleDragOver(e) {
//             e.preventDefault(); // Necessary to allow dropping
//             e.target.classList.add('drag-over');
//         }
        
//         function handleDragLeave(e) {
//             e.target.classList.remove('drag-over');
//         }

//         function handleDrop(e) {
//             e.preventDefault();
//             e.target.classList.remove('drag-over');
            
//             const id = e.dataTransfer.getData('text/plain');
//             const draggableElement = document.querySelector(`[data-id='${id}']`);
//             draggableElement.classList.remove('dragging');

//             // Prevent dropping a piece on another piece
//             if (e.target.classList.contains('drop-zone') && !e.target.hasChildNodes()) {
//                 e.target.appendChild(draggableElement);
//             }

//             // Check for completion after every successful drop
//             checkSolution();
//         }
        
//         /**
//          * @function checkSolution
//          * Verifies if the puzzle has been solved correctly.
//          */
//         function checkSolution() {
//             const placedPieces = solutionGrid.querySelectorAll('canvas');
//             if (placedPieces.length !== GRID_SIZE * GRID_SIZE) {
//                 return; // Not all pieces have been placed yet
//             }

//             let isCorrect = true;
//             solutionGrid.childNodes.forEach((dropZone, index) => {
//                 const piece = dropZone.firstChild;
//                 if (!piece || parseInt(piece.dataset.id) !== index) {
//                     isCorrect = false;
//                 }
//             });

//             if (isCorrect) {
//                 message.textContent = 'Success! You are human.';
//                 message.className = 'mt-6 text-center font-semibold text-lg h-8 text-green-400';
//                 solutionGrid.style.border = '2px solid #34d399'; // green-400
//             } else {
//                 message.textContent = 'Incorrect. Please try again.';
//                 message.className = 'mt-6 text-center font-semibold text-lg h-8 text-red-400';
//             }
//         }


const videoElement = document.createElement('video');
const canvasElement = document.getElementById('puzzle-canvas');
const canvasCtx = canvasElement.getContext('2d');
const outputCanvas = document.getElementById('output-canvas');
const outputCtx = outputCanvas.getContext('2d');
const successOverlay = document.getElementById('success-overlay');
const continueBtn = document.getElementById('continue-btn');

const rows = 4, cols = 4, gridSize = rows * cols;
let puzzleState = Array.from({length: gridSize - 1}, (_, i) => i).concat(15); // 0-14 tiles, 15 blank
let blankPos = 15;
let prevPinchPos = null;
let selectedPos = null;
let tileWidth, tileHeight;
let videoWidth = 640, videoHeight = 480;

// Shuffle puzzle (ensure solvable)
function shufflePuzzle() {
    do {
        puzzleState = puzzleState.sort(() => Math.random() - 0.5);
    } while (!isSolvable(puzzleState));
    blankPos = puzzleState.indexOf(15);
}

function countInversions(arr) {
    let inversions = 0;
    const flat = arr.filter(x => x !== 15);
    for (let i = 0; i < flat.length; i++) {
        for (let j = i + 1; j < flat.length; j++) {
            if (flat[i] > flat[j]) inversions++;
        }
    }
    return inversions;
}

function isSolvable(puzzle) {
    const inversions = countInversions(puzzle);
    const blankRow = Math.floor(puzzle.indexOf(15) / cols);
    return (inversions + blankRow) % 2 === 1; // For 4x4
}

shufflePuzzle();

// MediaPipe Hands setup
const hands = new Hands({locateFile: (file) => `https://cdn.jsdelivr.net/npm/@mediapipe/hands@${file}`});
hands.setOptions({
    maxNumHands: 1,
    modelComplexity: 1,
    minDetectionConfidence: 0.7,
    minTrackingConfidence: 0.7
});
hands.onResults(onResults);

const camera = new Camera(videoElement, {
    onFrame: async () => {
        await hands.send({image: videoElement});
    },
    width: videoWidth,
    height: videoHeight
});
camera.start();

function onResults(results) {
    outputCanvas.width = videoWidth;
    outputCanvas.height = videoHeight;
    outputCtx.save();
    outputCtx.clearRect(0, 0, videoWidth, videoHeight);
    outputCtx.drawImage(results.image, 0, 0, videoWidth, videoHeight);

    let isPinch = false;
    let pinchPos = null;
    if (results.multiHandLandmarks && results.multiHandLandmarks.length > 0) {
        const landmarks = results.multiHandLandmarks[0];
        const thumb = landmarks[4];
        const index = landmarks[8];
        const dist = Math.hypot(thumb.x - index.x, thumb.y - index.y, thumb.z - index.z);
        if (dist < 0.04) {
            isPinch = true;
            pinchPos = {x: index.x, y: index.y}; // Use index tip
            drawSparks(outputCtx, pinchPos.x * videoWidth, pinchPos.y * videoHeight);
        }
    }

    // Gesture logic
    if (isPinch) {
        const gridX = Math.floor(pinchPos.x * cols);
        const gridY = Math.floor(pinchPos.y * rows);
        const currentPos = gridY * cols + gridX;

        if (!prevPinchPos) {
            if (puzzleState[currentPos] !== 15) selectedPos = currentPos;
        } else {
            const deltaX = pinchPos.x - prevPinchPos.x;
            const deltaY = pinchPos.y - prevPinchPos.y;
            if (Math.abs(deltaX) + Math.abs(deltaY) > 0.02) {
                const dirX = Math.abs(deltaX) > Math.abs(deltaY) ? (deltaX > 0 ? 1 : -1) : 0;
                const dirY = dirX === 0 ? (deltaY > 0 ? 1 : -1) : 0;
                const targetPos = selectedPos + dirX + dirY * cols;
                if (targetPos === blankPos) {
                    // Slide
                    puzzleState[selectedPos] = 15;
                    puzzleState[targetPos] = puzzleState[selectedPos];
                    animateSlide(selectedPos, targetPos);
                    blankPos = selectedPos;
                    selectedPos = targetPos;
                }
            }
        }
        prevPinchPos = pinchPos;
    } else {
        prevPinchPos = null;
        selectedPos = null;
    }

    outputCtx.restore();

    // Render puzzle on main canvas
    canvasElement.width = videoWidth;
    canvasElement.height = videoHeight;
    tileWidth = videoWidth / cols;
    tileHeight = videoHeight / rows;
    for (let i = 0; i < gridSize; i++) {
        const piece = puzzleState[i];
        if (piece !== 15) {
            const sx = (piece % cols) * tileWidth;
            const sy = Math.floor(piece / cols) * tileHeight;
            const dx = (i % cols) * tileWidth;
            const dy = Math.floor(i / cols) * tileHeight;
            canvasCtx.drawImage(outputCanvas, sx, sy, tileWidth, tileHeight, dx, dy, tileWidth, tileHeight);
        }
    }

    if (isSolved()) {
        successOverlay.style.display = 'block';
        continueBtn.disabled = false;
        setTimeout(resetPuzzle, 3000);
    }
}

function drawSparks(ctx, x, y) {
    for (let i = 0; i < 5; i++) {
        const offsetX = Math.random() * 20 - 10;
        const offsetY = Math.random() * 20 - 10;
        const radius = Math.random() * 3 + 2;
        ctx.beginPath();
        ctx.arc(x + offsetX, y + offsetY, radius, 0, 2 * Math.PI);
        ctx.fillStyle = 'orange';
        ctx.fill();
    }
}

function animateSlide(fromPos, toPos) {
    // Simple JS animation: Could use requestAnimationFrame for smooth slide
    // For simplicity, just swap after delay
    setTimeout(() => {
        // Redraw already handles it
    }, 300);
}

function isSolved() {
    for (let i = 0; i < gridSize - 1; i++) {
        if (puzzleState[i] !== i) return false;
    }
    return puzzleState[gridSize - 1] === 15;
}

function resetPuzzle() {
    successOverlay.style.display = 'none';
    continueBtn.disabled = true;
    shufflePuzzle();
}

// Keyboard fallback (arrows move blank)
document.addEventListener('keydown', (e) => {
    const directions = {ArrowUp: [0, -1], ArrowDown: [0, 1], ArrowLeft: [-1, 0], ArrowRight: [1, 0]};
    if (directions[e.key]) {
        const [dx, dy] = directions[e.key];
        const targetX = (blankPos % cols) + dx;
        const targetY = Math.floor(blankPos / cols) + dy;
        if (targetX >= 0 && targetX < cols && targetY >= 0 && targetY < rows) {
            const targetPos = targetY * cols + targetX;
            puzzleState[blankPos] = puzzleState[targetPos];
            puzzleState[targetPos] = 15;
            animateSlide(targetPos, blankPos);
            blankPos = targetPos;
        }
    }
});