import React from 'react';
import './BusinessAvatar.css';

const BusinessAvatar = ({ 
  businessName, 
  imageUrl, 
  size = 'medium', 
  className = '',
  showBorder = true 
}) => {
  // Get the first letter of the business name
  const getInitial = (name) => {
    if (!name) return '?';
    return name.charAt(0).toUpperCase();
  };

  // Generate a consistent color based on the business name
  const getAvatarColor = (name) => {
    if (!name) return '#228B22';
    
    const colors = [
      '#228B22', // Forest Green
      '#32CD32', // Lime Green
      '#006400', // Dark Green
      '#90EE90', // Light Green
      '#228B22', // Forest Green
      '#32CD32', // Lime Green
      '#006400', // Dark Green
      '#90EE90', // Light Green
      '#228B22', // Forest Green
      '#32CD32'  // Lime Green
    ];
    
    // Simple hash function to get consistent color for same name
    let hash = 0;
    for (let i = 0; i < name.length; i++) {
      hash = name.charCodeAt(i) + ((hash << 5) - hash);
    }
    return colors[Math.abs(hash) % colors.length];
  };

  // If we have an image, display it
  if (imageUrl) {
    return (
      <img
        src={imageUrl}
        alt={businessName || 'Business'}
        className={`business-avatar business-avatar--${size} ${className}`}
        onError={(e) => {
          // If image fails to load, hide it and show the fallback
          e.target.style.display = 'none';
          e.target.nextSibling.style.display = 'flex';
        }}
      />
    );
  }

  // Fallback: display first letter in a colored circle
  return (
    <div 
      className={`business-avatar business-avatar--${size} business-avatar--fallback ${className}`}
      title={businessName || 'Business'}
    >
      <span className="business-avatar__initial">
        {getInitial(businessName)}
      </span>
    </div>
  );
};

export default BusinessAvatar;
