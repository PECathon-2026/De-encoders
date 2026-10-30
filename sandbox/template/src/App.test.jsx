import React, { act } from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import App from './App';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

describe('Snake Game', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('renders snake, food, and score', () => {
    render(<App />);
    expect(screen.getByTestId('game-container')).toBeInTheDocument();
    expect(screen.getByTestId('score-display')).toBeInTheDocument();
    expect(screen.getAllByTestId('snake-segment').length).toBe(3);
    expect(screen.getAllByTestId('food').length).toBe(1);
  });

  it('moves snake on timer tick in direction', () => {
    render(<App />);
    // Advance 1 tick in initial RIGHT direction
    act(() => {
      vi.advanceTimersByTime(100);
    });
    const snakeHeads = screen.getAllByTestId('snake-segment');
    expect(snakeHeads[0]).toHaveStyle('left: 220px');
  });

  it('game over on collision with wall', () => {
    render(<App />);
    // Advance 11 ticks right until wall collision
    for (let i = 0; i < 12; i++) {
      act(() => {
        vi.advanceTimersByTime(100);
      });
    }
    expect(screen.getByText(/Game Over/i)).toBeInTheDocument();
  });

  it('resets game after game over', () => {
    render(<App />);
    for (let i = 0; i < 12; i++) {
      act(() => {
        vi.advanceTimersByTime(100);
      });
    }
    expect(screen.getByText(/Game Over/i)).toBeInTheDocument();

    const resetButton = screen.getByTestId('reset-button');
    act(() => {
      fireEvent.click(resetButton);
    });
    expect(screen.queryByText(/Game Over/i)).not.toBeInTheDocument();
  });
});