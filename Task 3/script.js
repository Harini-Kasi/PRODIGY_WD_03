let board = Array(9).fill(null);
let currentPlayer = 'X';
let isGameOver = false;
let isPvAI = false;
const cells = document.querySelectorAll('.cell');
const messageEl = document.getElementById('message');
const turnEl = document.getElementById('turn-indicator');
const resetBtn = document.getElementById('reset');
const pvpBtn = document.getElementById('pvp');
const pvaiBtn = document.getElementById('pvai');

// Event listeners
cells.forEach(cell => cell.addEventListener('click', handleClick));
resetBtn.addEventListener('click', resetGame);
pvpBtn.addEventListener('click', () => setMode(false));
pvaiBtn.addEventListener('click', () => setMode(true));

function setMode(aiMode) {
    isPvAI = aiMode;
    pvpBtn.classList.toggle('active', !aiMode);
    pvaiBtn.classList.toggle('active', aiMode);
    resetGame();
}

// Initialize in PvP mode
setMode(false);

function handleClick(e) {
    const cell = e.target;
    const index = parseInt(cell.dataset.index);
    if (board[index] !== null || isGameOver || (isPvAI && currentPlayer === 'O')) {
        return;
    }

    // Place marker
    board[index] = currentPlayer;
    cell.textContent = currentPlayer;
    cell.classList.add(currentPlayer, 'occupied');

    // Check for win
    const winningLine = checkWin();
    if (winningLine) {
        isGameOver = true;
        messageEl.textContent = `${currentPlayer} wins!`;
        messageEl.classList.remove('draw');
        highlightWin(winningLine);
        return;
    }

    // Check for draw
    if (board.every(val => val !== null)) {
        isGameOver = true;
        messageEl.textContent = "It's a draw!";
        messageEl.classList.add('draw');
        return;
    }

    // Switch player
    currentPlayer = currentPlayer === 'X' ? 'O' : 'X';
    turnEl.textContent = `Current turn: ${currentPlayer}`;

    // AI move if applicable
    if (isPvAI && currentPlayer === 'O' && !isGameOver) {
        setTimeout(aiMove, 500); // Small delay for better UX
    }
}

function aiMove() {
    let moveIndex = getBestMove();
    if (moveIndex === -1) return; // No move available

    board[moveIndex] = 'O';
    cells[moveIndex].textContent = 'O';
    cells[moveIndex].classList.add('O', 'occupied');

    // Check for win
    const winningLine = checkWin();
    if (winningLine) {
        isGameOver = true;
        messageEl.textContent = 'AI (O) wins!';
        messageEl.classList.remove('draw');
        highlightWin(winningLine);
        turnEl.textContent = `Current turn: X`;
        return;
    }

    // Check for draw
    if (board.every(val => val !== null)) {
        isGameOver = true;
        messageEl.textContent = "It's a draw!";
        messageEl.classList.add('draw');
        return;
    }

    // Switch back to player
    currentPlayer = 'X';
    turnEl.textContent = `Current turn: ${currentPlayer}`;
}

function getBestMove() {
    const emptyIndices = board.map((val, idx) => (val === null ? idx : null)).filter(idx => idx !== null);
    if (emptyIndices.length === 0) return -1;

    // Strategy 1: Check for AI win
    for (let index of emptyIndices) {
        board[index] = 'O';
        if (checkWin()) {
            board[index] = null; // Undo
            return index;
        }
        board[index] = null;
    }

    // Strategy 2: Block player win
    for (let index of emptyIndices) {
        board[index] = 'X';
        if (checkWin()) {
            board[index] = null; // Undo
            return index;
        }
        board[index] = null;
    }

    // Strategy 3: Take center if available
    if (emptyIndices.includes(4)) {
        return 4;
    }

    // Strategy 4: Take a corner if available
    const corners = [0, 2, 6, 8];
    for (let corner of corners) {
        if (emptyIndices.includes(corner)) {
            return corner;
        }
    }

    // Strategy 5: Random move
    return emptyIndices[Math.floor(Math.random() * emptyIndices.length)];
}

function checkWin() {
    const winningCombinations = [
        [0, 1, 2], [3, 4, 5], [6, 7, 8], // Rows
        [0, 3, 6], [1, 4, 7], [2, 5, 8], // Columns
        [0, 4, 8], [2, 4, 6] // Diagonals
    ];

    for (let combination of winningCombinations) {
        const [a, b, c] = combination;
        if (board[a] && board[a] === board[b] && board[a] === board[c]) {
            return combination;
        }
    }
    return null;
}

function highlightWin(line) {
    line.forEach(index => {
        cells[index].classList.add('winner');
    });
}

function resetGame() {
    board = Array(9).fill(null);
    currentPlayer = 'X';
    isGameOver = false;
    turnEl.textContent = `Current turn: ${currentPlayer}`;
    messageEl.textContent = '';
    messageEl.classList.remove('draw');
    cells.forEach(cell => {
        cell.textContent = '';
        cell.classList.remove('X', 'O', 'winner', 'occupied');
    });
}