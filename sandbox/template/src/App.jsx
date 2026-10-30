import React from 'react';
import './App.css';
import TicTacToe from './components/TicTacToe';
import Counter from './components/Counter';

export default function App() {
  return (
    <div className="game-container" data-testid="game-container">
      <div className="game-header">
        <h1>Tic-Tac-Toe</h1>
        <Counter />
      </div>
      <TicTacToe />
    </div>
  );
}