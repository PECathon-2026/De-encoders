import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import Counter from './Counter';
import { describe, it, expect, vi } from 'vitest';

describe('Counter Component', () => {
  const mockResetGame = vi.fn();

  it('displays score and shows reset button on game over', () => {
    render(<Counter score={5} gameOver={true} resetGame={mockResetGame} />);
    expect(screen.getByTestId('score-display')).toHaveTextContent('Score: 5');
    expect(screen.getByTestId('reset-button')).toBeInTheDocument();
  });

  it('calls resetGame when button is clicked', () => {
    render(<Counter score={0} gameOver={true} resetGame={mockResetGame} />);
    fireEvent.click(screen.getByTestId('reset-button'));
    expect(mockResetGame).toHaveBeenCalled();
  });
});