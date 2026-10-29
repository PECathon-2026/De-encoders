import React, { useState } from 'react';
import './Counter.css';

const Counter = () => {
  const [count, setCount] = useState(0);

  const increment = () => setCount(count + 1);
  const decrement = () => setCount(count - 1);
  const reset = () => setCount(0);

  return (
    <div className="counter-container">
      <h2 className="counter-title">Counter</h2>
      <div className="counter-display">{count}</div>
      <div className="counter-buttons">
        <button className="counter-btn decrement-btn" onClick={decrement}>
          -
        </button>
        <button className="counter-btn reset-btn" onClick={reset}>
          Reset
        </button>
        <button className="counter-btn increment-btn" onClick={increment}>
          +
        </button>
      </div>
    </div>
  );
};

export default Counter;