import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import App from './App';

describe('App', () => {
  it('renders TicTacToe and Counter', () => {
    render(<App />);
    expect(screen.getByTestId('game-container')).toBeInTheDocument();
    expect(screen.getByTestId('tic-tac-toe-container')).toBeInTheDocument();
    expect(screen.getByTestId('score-display')).toBeInTheDocument();
  });
});