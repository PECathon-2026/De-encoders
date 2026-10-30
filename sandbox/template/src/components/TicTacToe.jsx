import React, { useState } from 'react';
import './TicTacToe.css';

const TicTacToe = () => {
  const [board, setBoard] = useState(Array(9).fill(null));
  const [xIsNext, setXIsNext] = useState(true);
  const [gameStatus, setGameStatus] = useState('Player X turn');
  const [isGameOver, setIsGameOver] = useState(false);

  const calculateWinner = (squares) => {
    const lines = [
      [0, 1, 2], [3, 4, 5], [6, 7, 8], // rows
      [0, 3, 6], [1, 4, 7], [2, 5, 8], // columns
      [0, 4, 8], [2, 4, 6]             // diagonals
    ];

    for (let i = 0; i < lines.length; i++) {
      const [a, b, c] = lines[i];
      if (squares[a] && squares[a] === squares[b] && squares[a] === squares[c]) {
        return squares[a];
      }
    }
    return null;
  };

  const handleClick = (i) => {
    if (board[i] !== null || isGameOver) return;

    const newBoard = board.slice();
    newBoard[i] = xIsNext ? 'X' : 'O';
    setBoard(newBoard);

    const winner = calculateWinner(newBoard);
    if (winner) {
      setGameStatus(`Player ${winner} wins!`);
      setIsGameOver(true);
    } else if (!newBoard.includes(null)) {
      setGameStatus("It's a draw!");
      setIsGameOver(true);
    } else {
      const nextTurn = !xIsNext;
      setXIsNext(nextTurn);
      setGameStatus(`Player ${nextTurn ? 'X' : 'O'} turn`);
    }
  };

  const resetGame = () => {
    setBoard(Array(9).fill(null));
    setXIsNext(true);
    setGameStatus('Player X turn');
    setIsGameOver(false);
  };

  return (
    <div className="tic-tac-toe-container" data-testid="tic-tac-toe-container">
      <div className="game-header">
        <h1>Tic-Tac-Toe</h1>
        <p className="status" data-testid="game-status">
          {gameStatus}
        </p>
      </div>

      <div className="game-grid" data-testid="tic-tac-toe-grid">
        {board.map((square, i) => (
          <button
            key={i}
            className="cell"
            data-testid={`cell-${i}`}
            onClick={() => handleClick(i)}
            disabled={isGameOver || square !== null}
          >
            {square}
          </button>
        ))}
      </div>

      <div className="game-footer">
        {isGameOver && <h2 data-testid="win-message">{gameStatus}</h2>}
        <button
          className="reset-button"
          data-testid="reset-button"
          onClick={resetGame}
        >
          Play Again
        </button>
      </div>
    </div>
  );
};

export default TicTacToe;