import React, { useState, useEffect, useCallback } from 'react';
import './App.css';
import Snake from './components/Snake';
import Food from './components/Food';
import Counter from './components/Counter';

const GRID_SIZE = 20;
const CELL_SIZE = 20;

export default function App() {
  const [snake, setSnake] = useState([
    { x: 10, y: 10 },
    { x: 9, y: 10 },
    { x: 8, y: 10 },
  ]);
  const [food, setFood] = useState({ x: 5, y: 5 });
  const [direction, setDirection] = useState('RIGHT');
  const [gameOver, setGameOver] = useState(false);
  const [score, setScore] = useState(0);

  const generateFood = useCallback(() => {
    const newFood = {
      x: Math.floor(Math.random() * GRID_SIZE),
      y: Math.floor(Math.random() * GRID_SIZE),
    };
    if (snake.some(segment => segment.x === newFood.x && segment.y === newFood.y)) {
      return generateFood();
    }
    return newFood;
  }, [snake]);

  const moveSnake = useCallback(() => {
    if (gameOver) return;

    const head = { ...snake[0] };
    const newHead = { ...head };

    switch (direction) {
      case 'UP':
        newHead.y -= 1;
        break;
      case 'DOWN':
        newHead.y += 1;
        break;
      case 'LEFT':
        newHead.x -= 1;
        break;
      case 'RIGHT':
        newHead.x += 1;
        break;
    }

    // Check collision with walls
    if (
      newHead.x < 0 || newHead.x >= GRID_SIZE ||
      newHead.y < 0 || newHead.y >= GRID_SIZE
    ) {
      setGameOver(true);
      return;
    }

    // Check collision with self
    if (snake.some(segment => segment.x === newHead.x && segment.y === newHead.y)) {
      setGameOver(true);
      return;
    }

    const newSnake = [newHead, ...snake];
    setSnake(newSnake);

    // Check if food eaten
    if (newHead.x === food.x && newHead.y === food.y) {
      setScore(prev => prev + 1);
      setFood(generateFood());
    } else {
      setSnake(newSnake.slice(0, -1));
    }
  }, [snake, direction, food, gameOver, generateFood]);

  useEffect(() => {
    const handleKeyDown = (e) => {
      switch (e.key) {
        case 'ArrowUp':
          if (direction !== 'DOWN') setDirection('UP');
          break;
        case 'ArrowDown':
          if (direction !== 'UP') setDirection('DOWN');
          break;
        case 'ArrowLeft':
          if (direction !== 'RIGHT') setDirection('LEFT');
          break;
        case 'ArrowRight':
          if (direction !== 'LEFT') setDirection('RIGHT');
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [direction]);

  useEffect(() => {
    const interval = setInterval(moveSnake, 100);
    return () => clearInterval(interval);
  }, [moveSnake]);

  const resetGame = () => {
    setSnake([
      { x: 10, y: 10 },
      { x: 9, y: 10 },
      { x: 8, y: 10 },
    ]);
    setFood(generateFood());
    setDirection('RIGHT');
    setGameOver(false);
    setScore(0);
  };

  return (
    <div className="game-container" data-testid="game-container">
      <div className="game-header">
        <h1>Snake Game</h1>
        <Counter score={score} gameOver={gameOver} resetGame={resetGame} />
      </div>
      <div
        className="game-grid"
        style={{ gridTemplateColumns: `repeat(${GRID_SIZE}, ${CELL_SIZE}px)` }}
        data-testid="game-grid"
      >
        <Snake segments={snake} />
        <Food position={food} />
      </div>
      {gameOver && (
        <div className="game-over">
          <h2>Game Over</h2>
          <button onClick={resetGame}>Play Again</button>
        </div>
      )}
    </div>
  );
}