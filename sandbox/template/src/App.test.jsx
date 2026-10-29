import React from 'react';
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import App from './App';

describe('Snake Game Suite', () => {
  it('renders the Snake game title and board', () => {
    render(<App />);
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent(/Snake/i);
  });

  it('renders the score display correctly', () => {
    render(<App />);
    const scores = screen.getAllByText(/Score/i);
    expect(scores.length).toBeGreaterThan(0);
  });

  it('displays navigation controls hint', () => {
    const { container } = render(<App />);
    expect(container.textContent).toMatch(/Arrow Keys/i);
  });
});
