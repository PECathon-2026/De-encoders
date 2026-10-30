import { configure, cleanup } from '@testing-library/react';
import '@testing-library/jest-dom';
import { afterEach, vi } from 'vitest';

// Universal Jest -> Vitest bridge:
// If any generated test or library references jest.*, seamlessly route to vi.*
if (typeof globalThis.jest === 'undefined') {
  globalThis.jest = vi;
}

configure({
  testIdAttribute: 'data-testid',
});

afterEach(() => {
  cleanup();
  vi.clearAllTimers();
});