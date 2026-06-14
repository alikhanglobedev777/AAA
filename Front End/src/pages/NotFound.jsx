import React from 'react';
import { Link } from 'react-router-dom';
import './Login.css';

const NotFound = () => {
  return (
    <div className="login-container">
      <div className="login-form" style={{ textAlign: 'center' }}>
        <h2>404 - Page Not Found</h2>
        <p>Oops! The page you're looking for doesn't exist.</p>
        <div style={{ marginTop: '30px' }}>
          <Link to="/" className="login-button" style={{ display: 'inline-block', textDecoration: 'none' }}>
            Go to Home
          </Link>
        </div>
      </div>
    </div>
  );
};

export default NotFound;
