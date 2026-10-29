import React, { useState, useEffect, useRef } from 'react';
import './App.css';

export default function App() {
  const [snake, setSnake] = useState([{ x: 10, y: 10 }]);
  const [food, setFood] = useState({ x: 5, y: 5 });
  const [direction, setDirection] = useState('RIGHT');
  const [gameOver, setGameOver] = useState(false);
  const [score, setScore] = useState(0);
  const [speed, setSpeed] = useState(150);
  const [highScore, setHighScore] = useState(0);

  const generateFood = () => {
    const newFood = {
      x: Math.floor(Math.random() * 20),
      y: Math.floor(Math.random() * 20),
    };
    if (snake.some(segment => segment.x === newFood.x && segment.y === newFood.y)) {
      return generateFood();
    }
    return newFood;
  };

  const resetGame = () => {
    setSnake([{ x: 10, y: 10 }]);
    setFood(generateFood());
    setDirection('RIGHT');
    setGameOver(false);
    setScore(0);
    setSpeed(150);
  };

  const moveSnake = () => {
    if (gameOver) return;

    const head = { ...snake[0] };
    let newHead;

    switch (direction) {
      case 'UP': newHead = { x: head.x, y: head.y - 1 }; break;
      case 'DOWN': newHead = { x: head.x, y: head.y + 1 }; break;
      case 'LEFT': newHead = { x: head.x - 1, y: head.y }; break;
      case 'RIGHT': newHead = { x: head.x + 1, y: head.y }; break;
      default: newHead = head;
    }

    if (
      newHead.x < 0 || newHead.x >= 20 ||
      newHead.y < 0 || newHead.y >= 20 ||
      snake.some(segment => segment.x === newHead.x && segment.y === newHead.y)
    ) {
      setGameOver(true);
      if (score > highScore) setHighScore(score);
      return;
    }

    const newSnake = [newHead, ...snake];
    if (newHead.x === food.x && newHead.y === food.y) {
      const newScore = score + 1;
      setScore(newScore);
      if (newScore > highScore) setHighScore(newScore);
      setFood(generateFood());
      if (newScore % 5 === 0 && speed > 50) {
        setSpeed(prev => prev - 10);
      }
    } else {
      newSnake.pop();
    }
    setSnake(newSnake);
  };

  useEffect(() => {
    const handleKeyDown = (e) => {
      switch (e.key) {
        case 'ArrowUp': if (direction !== 'DOWN') setDirection('UP'); break;
        case 'ArrowDown': if (direction !== 'UP') setDirection('DOWN'); break;
        case 'ArrowLeft': if (direction !== 'RIGHT') setDirection('LEFT'); break;
        case 'ArrowRight': if (direction !== 'LEFT') setDirection('RIGHT'); break;
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [direction]);

  useEffect(() => {
    const interval = setInterval(moveSnake, speed);
    return () => clearInterval(interval);
  }, [snake, direction, gameOver, speed]);

  return (
    <div className="snake-app">
      <header className="snake-header">
        <h1>🐍 Retro Snake Arcade</h1>
        <div className="scoreboard">
          <span>Score: <strong>{score}</strong></span>
          <span>High Score: <strong>{highScore}</strong></span>
        </div>
      </header>

      <main className="game-container">
        <div className="board">
          {Array.from({ length: 20 * 20 }).map((_, idx) => {
            const x = idx % 20;
            const y = Math.floor(idx / 20);
            const isSnakeHead = snake[0].x === x && snake[0].y === y;
            const isSnakeBody = snake.slice(1).some(seg => seg.x === x && seg.y === y);
            const isFood = food.x === x && food.y === y;

            let cellClass = 'cell';
            if (isSnakeHead) cellClass += ' snake-head';
            else if (isSnakeBody) cellClass += ' snake-body';
            else if (isFood) cellClass += ' food';

            return <div key={idx} className={cellClass} />;
          })}
        </div>

        {gameOver && (
          <div className="game-over-overlay">
            <h2>GAME OVER</h2>
            <p>Final Score: {score}</p>
            <button onClick={resetGame} className="restart-btn">Play Again</button>
          </div>
        )}
      </main>

      <footer className="controls-hint">
        <p>Use <strong>Arrow Keys</strong> to control the snake</p>
      </footer>
    </div>
  );
}
