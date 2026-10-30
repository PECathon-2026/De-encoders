import React from 'react';
import { render } from '@testing-library/react';
import Snake from './Snake';
import { describe, it, expect } from 'vitest';

describe('Snake Component', () => {
  it('renders snake segments correctly', () => {
    const segments = [
      { x: 10, y: 10 },
      { x: 9, y: 10 },
      { x: 8, y: 10 }
    ];

    const { container } = render(<Snake segments={segments} />);
    const snakeSegments = container.querySelectorAll('.snake-segment');

    expect(snakeSegments.length).toBe(3);
    expect(snakeSegments[0]).toHaveStyle('left: 200px');
    expect(snakeSegments[0]).toHaveStyle('top: 200px');
    expect(snakeSegments[1]).toHaveStyle('left: 180px');
    expect(snakeSegments[1]).toHaveStyle('top: 200px');
  });
});