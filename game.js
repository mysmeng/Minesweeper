class Minesweeper {
    constructor() {
        this.board = [];
        this.revealed = [];
        this.flagged = [];
        this.gameOver = false;
        this.gameWon = false;
        this.firstClick = true;
        this.timer = 0;
        this.timerInterval = null;

        // 默认难度：简单
        this.rows = 8;
        this.cols = 8;
        this.mines = 10;

        this.init();
    }

    init() {
        this.setupEventListeners();
        this.initGame();
    }

    setupEventListeners() {
        // 难度选择按钮
        document.querySelectorAll('.difficulty .btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const level = e.target.dataset.level;
                this.setDifficulty(level);
                this.initGame();
            });
        });

        // 重新开始按钮
        document.getElementById('resetBtn').addEventListener('click', () => {
            this.initGame();
        });
    }

    setDifficulty(level) {
        switch (level) {
            case 'easy':
                this.rows = 8;
                this.cols = 8;
                this.mines = 10;
                break;
            case 'medium':
                this.rows = 16;
                this.cols = 16;
                this.mines = 40;
                break;
            case 'hard':
                this.rows = 16;
                this.cols = 30;
                this.mines = 99;
                break;
        }
    }

    initGame() {
        this.board = [];
        this.revealed = [];
        this.flagged = [];
        this.gameOver = false;
        this.gameWon = false;
        this.firstClick = true;
        this.timer = 0;

        // 清除定时器
        if (this.timerInterval) {
            clearInterval(this.timerInterval);
            this.timerInterval = null;
        }

        // 初始化数组
        for (let i = 0; i < this.rows; i++) {
            this.board[i] = [];
            this.revealed[i] = [];
            this.flagged[i] = [];
            for (let j = 0; j < this.cols; j++) {
                this.board[i][j] = 0;
                this.revealed[i][j] = false;
                this.flagged[i][j] = false;
            }
        }

        this.updateDisplay();
        this.renderBoard();
    }

    placeMines(excludeRow, excludeCol) {
        let minesPlaced = 0;
        while (minesPlaced < this.mines) {
            const row = Math.floor(Math.random() * this.rows);
            const col = Math.floor(Math.random() * this.cols);

            // 不在第一次点击的位置及其周围放置地雷
            if (Math.abs(row - excludeRow) <= 1 && Math.abs(col - excludeCol) <= 1) {
                continue;
            }

            if (this.board[row][col] !== -1) {
                this.board[row][col] = -1;
                minesPlaced++;

                // 更新周围格子的数字
                for (let i = -1; i <= 1; i++) {
                    for (let j = -1; j <= 1; j++) {
                        const newRow = row + i;
                        const newCol = col + j;
                        if (this.isValid(newRow, newCol) && this.board[newRow][newCol] !== -1) {
                            this.board[newRow][newCol]++;
                        }
                    }
                }
            }
        }
    }

    isValid(row, col) {
        return row >= 0 && row < this.rows && col >= 0 && col < this.cols;
    }

    revealCell(row, col) {
        if (!this.isValid(row, col) || this.revealed[row][col] || this.flagged[row][col]) {
            return;
        }

        // 第一次点击时放置地雷
        if (this.firstClick) {
            this.firstClick = false;
            this.placeMines(row, col);
            this.startTimer();
        }

        this.revealed[row][col] = true;

        // 点到地雷，游戏结束
        if (this.board[row][col] === -1) {
            this.gameOver = true;
            this.endGame(false);
            return;
        }

        // 如果是空格，递归揭开周围的格子
        if (this.board[row][col] === 0) {
            for (let i = -1; i <= 1; i++) {
                for (let j = -1; j <= 1; j++) {
                    this.revealCell(row + i, col + j);
                }
            }
        }

        this.checkWin();
        this.renderBoard();
    }

    toggleFlag(row, col) {
        if (!this.isValid(row, col) || this.revealed[row][col] || this.gameOver) {
            return;
        }

        this.flagged[row][col] = !this.flagged[row][col];
        this.updateDisplay();
        this.renderBoard();
    }

    checkWin() {
        let revealedCount = 0;
        for (let i = 0; i < this.rows; i++) {
            for (let j = 0; j < this.cols; j++) {
                if (this.revealed[i][j]) {
                    revealedCount++;
                }
            }
        }

        // 如果揭开的格子数等于总格子数减去地雷数，则获胜
        if (revealedCount === this.rows * this.cols - this.mines) {
            this.gameWon = true;
            this.endGame(true);
        }
    }

    endGame(won) {
        this.gameOver = true;
        clearInterval(this.timerInterval);

        // 揭开所有地雷
        for (let i = 0; i < this.rows; i++) {
            for (let j = 0; j < this.cols; j++) {
                if (this.board[i][j] === -1) {
                    this.revealed[i][j] = true;
                }
            }
        }

        this.renderBoard();

        const messageEl = document.getElementById('message');
        if (won) {
            messageEl.textContent = `🎉 恭喜你赢了！用时 ${this.timer} 秒`;
            messageEl.className = 'message win';
        } else {
            messageEl.textContent = '💥 游戏结束！踩到地雷了';
            messageEl.className = 'message lose';
        }
    }

    startTimer() {
        this.timerInterval = setInterval(() => {
            this.timer++;
            document.getElementById('timer').textContent = this.timer;
        }, 1000);
    }

    updateDisplay() {
        let flagCount = 0;
        for (let i = 0; i < this.rows; i++) {
            for (let j = 0; j < this.cols; j++) {
                if (this.flagged[i][j]) {
                    flagCount++;
                }
            }
        }

        document.getElementById('minesLeft').textContent = this.mines - flagCount;
        document.getElementById('timer').textContent = this.timer;
    }

    renderBoard() {
        const gameBoard = document.getElementById('gameBoard');
        gameBoard.innerHTML = '';
        gameBoard.style.gridTemplateColumns = `repeat(${this.cols}, 30px)`;
        gameBoard.style.gridTemplateRows = `repeat(${this.rows}, 30px)`;

        for (let i = 0; i < this.rows; i++) {
            for (let j = 0; j < this.cols; j++) {
                const cell = document.createElement('div');
                cell.className = 'cell';
                cell.dataset.row = i;
                cell.dataset.col = j;

                if (this.revealed[i][j]) {
                    cell.classList.add('revealed');
                    if (this.board[i][j] === -1) {
                        cell.textContent = '💣';
                        cell.classList.add('mine');
                    } else if (this.board[i][j] > 0) {
                        cell.textContent = this.board[i][j];
                        cell.classList.add(`number-${this.board[i][j]}`);
                    }
                } else if (this.flagged[i][j]) {
                    cell.textContent = '🚩';
                    cell.classList.add('flagged');
                }

                // 左键点击揭开格子
                cell.addEventListener('click', () => {
                    if (!this.gameOver) {
                        this.revealCell(i, j);
                    }
                });

                // 右键点击插旗
                cell.addEventListener('contextmenu', (e) => {
                    e.preventDefault();
                    if (!this.gameOver) {
                        this.toggleFlag(i, j);
                    }
                });

                gameBoard.appendChild(cell);
            }
        }

        // 清除消息
        if (!this.gameOver) {
            document.getElementById('message').textContent = '';
            document.getElementById('message').className = 'message';
        }
    }
}

// 初始化游戏
const game = new Minesweeper();