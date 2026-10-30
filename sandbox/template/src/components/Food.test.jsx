import React from 'react';
import { render } from '@testing-library/react';
import Food from './Food';
import { describe, it, expect } from 'vitest';

describe('Food Component', () => {
  it('renders food at correct position', () => {
    const position = { x: 5, y: 5 };

    const { container } = render(<Food position={position} />);
    const foodElement = container.querySelector('.food');

    expect(foodElement).toHaveStyle('left: 100px');
    expect(foodElement).toHaveStyle('top: 100px');
  });
});