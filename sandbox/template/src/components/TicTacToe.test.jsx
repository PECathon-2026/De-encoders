import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import TicTacToe from './TicTacToe';

describe('TicTacToe', () => {
  it('renders initial board', () => {
    render(<TicTacToe />);
    expect(screen.getByTestId('tic-tac-toe-container')).toBeInTheDocument();
    expect(screen.getByTestId('game-status')).toHaveTextContent('Player X turn');
    expect(screen.getAllByTestId(/cell-/).length).toBe(9);
  });

  it('handles cell clicks and alternates turns', () => {
    render(<TicTacToe />);
    const cells = screen.getAllByTestId(/cell-/);

    // X makes first move
    fireEvent.click(cells[0]);
    expect(screen.getByTestId('game-status')).toHaveTextContent('Player O turn');
    expect(cells[0]).toHaveTextContent('X');

    // O makes move
    fireEvent.click(cells[1]);
    expect(screen.getByTestId('game-status')).toHaveTextContent('Player X turn');
    expect(cells[1]).toHaveTextContent('O');
  });

  it('detects a win for X', () => {
    render(<TicTacToe />);
    const cells = screen.getAllByTestId(/cell-/);

    // X wins top row (0, 1, 2)
    fireEvent.click(cells[0]); // X
    fireEvent.click(cells[3]); // O
    fireEvent.click(cells[1]); // X
    fireEvent.click(cells[4]); // O
    fireEvent.click(cells[2]); // X

    expect(screen.getByTestId('game-status')).toHaveTextContent('Player X wins!');
    expect(screen.getByTestId('win-message')).toHaveTextContent('Player X wins!');
    expect(screen.getByTestId('reset-button')).toBeInTheDocument();
  });

  it('detects a win for O', () => {
    render(<TicTacToe />);
    const cells = screen.getAllByTestId(/cell-/);

    // O wins diagonal (2, 4, 6)
    fireEvent.click(cells[0]); // X
    fireEvent.click(cells[2]); // O
    fireEvent.click(cells[1]); // X
    fireEvent.click(cells[4]); // O
    fireEvent.click(cells[5]); // X
    fireEvent.click(cells[6]); // O

    expect(screen.getByTestId('game-status')).toHaveTextContent('Player O wins!');
    expect(screen.getByTestId('win-message')).toHaveTextContent('Player O wins!');
  });

  it('detects a draw', () => {
    render(<TicTacToe />);
    const cells = screen.getAllByTestId(/cell-/);

    // X O X
    // X O O
    // O X X
    fireEvent.click(cells[0]); // X
    fireEvent.click(cells[1]); // O
    fireEvent.click(cells[2]); // X
    fireEvent.click(cells[4]); // O
    fireEvent.click(cells[3]); // X
    fireEvent.click(cells[5]); // O
    fireEvent.click(cells[7]); // X
    fireEvent.click(cells[6]); // O
    fireEvent.click(cells[8]); // X

    expect(screen.getByTestId('game-status')).toHaveTextContent("It's a draw!");
    expect(screen.getByTestId('win-message')).toHaveTextContent("It's a draw!");
  });

  it('resets the game', () => {
    render(<TicTacToe />);
    const cells = screen.getAllByTestId(/cell-/);
    const resetButton = screen.getByTestId('reset-button');

    // Make moves to trigger win
    fireEvent.click(cells[0]); // X
    fireEvent.click(cells[3]); // O
    fireEvent.click(cells[1]); // X
    fireEvent.click(cells[4]); // O
    fireEvent.click(cells[2]); // X

    expect(screen.getByTestId('game-status')).toHaveTextContent('Player X wins!');

    // Reset the game
    fireEvent.click(resetButton);

    expect(screen.getByTestId('game-status')).toHaveTextContent('Player X turn');
    expect(screen.getAllByTestId(/cell-/).every(cell => cell.textContent === '')).toBe(true);
  });
});