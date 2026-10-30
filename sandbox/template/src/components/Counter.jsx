import React from 'react';
import './Counter.css';

const Counter = ({ score, gameOver, resetGame }) => {
  return (
    <div className="counter">
      <span data-testid="score-display">Score: {score}</span>
      {gameOver && (
        <button
          className="reset-button"
          onClick={resetGame}
          data-testid="reset-button"
        >
          Play Again
        </button>
      )}
    </div>
  );
};

export default Counter;