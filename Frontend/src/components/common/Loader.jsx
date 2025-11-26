// src/components/Loader.jsx
import React from 'react';
import './Loader.css'; // We'll create this next

const Loader = ({ size = 'medium', message = 'Loading...' }) => {
  return (
    <div className="loader-container">
      <div className={`loader loader-${size}`}>
        <div className="loader-inner"></div>
        <div className="loader-inner"></div>
        <div className="loader-inner"></div>
      </div>
      {message && <p className="loader-message">{message}</p>}
    </div>
  );
};

export default Loader;