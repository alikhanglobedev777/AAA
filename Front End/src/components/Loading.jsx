import React from 'react';
import './Loading.css';

const Loading = () => {
  return (
    <div className="loading-container" role="status" aria-live="polite">
      <div className="loading-content">
        <div className="loading-spinner">
          <div className="spinner-ring"></div>
          <div className="spinner-ring"></div>
          <div className="spinner-ring"></div>
        </div>
        <div className="loading-text">
          <h3>Getting things ready</h3>
          <p>Preparing your experience</p>
        </div>
        <div className="loading-dots">
          <span className="dot"></span>
          <span className="dot"></span>
          <span className="dot"></span>
        </div>
      </div>
    </div>
  );
};

export default Loading;
