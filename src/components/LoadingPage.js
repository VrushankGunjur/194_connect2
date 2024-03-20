// LoadingPage.js
import React from 'react';
import '../styles/LoadingPage.css'; // Make sure this points to the correct CSS file

const LoadingPage = () => {
  return (
    <div className="loading-page">
      <div className="loading-text">Loading...</div>
      <div className="loading-circle"></div> 
    </div>
  );
};

export default LoadingPage;
