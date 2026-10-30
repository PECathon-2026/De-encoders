import React from 'react';
import './Food.css';

const Food = ({ position }) => {
  return (
    <div
      className="food"
      data-testid="food"
      style={{
        left: `${position.x * 20}px`,
        top: `${position.y * 20}px`
      }}
    />
  );
};

export default Food;