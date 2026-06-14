import React from 'react';
import { Link } from 'react-router-dom';
import './CategoryCard.css';

const CategoryCard = ({ category }) => {
  return (
    <Link 
      to={category.link || '/services'} 
      className="category-card-link"
      style={{ textDecoration: 'none' }}
    >
      <div 
        className="category-card" 
        style={{ background: category.gradient }}
        role="button"
        tabIndex={0}
      >
        <div className="category-image" style={{ backgroundImage: `url(${category.image})` }}>
          <div className="category-content">
            <div className="category-icon-wrapper">
              <i className={category.icon} style={{ color: category.iconColor }}></i>
            </div>
            <h3 className="category-name">{category.name}</h3>
            <div className="category-overlay">
              <span className="explore-text">Explore Services</span>
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
};

export default CategoryCard;