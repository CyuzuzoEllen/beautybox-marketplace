import React from 'react';
import { Link } from 'react-router-dom';
import { FiHeart, FiStar } from 'react-icons/fi';
import './ProductCard.css';

const ProductCard = ({ product }) => {
  // In a real app, images would be URLs from a cloud provider.
  // For now, we'll use a beautiful gradient placeholder if no image exists.
  const hasImage = product.image && product.image.length > 0;

  return (
    <div className="product-card animate-slide-up">
      <Link to={`/products/${product.id}`} className="product-image-container">
        {hasImage ? (
          <img src={`http://localhost:5000/uploads/${product.image}`} alt={product.name} />
        ) : (
          <div className="product-image-placeholder">
            <span>{product.name.substring(0, 2).toUpperCase()}</span>
          </div>
        )}
        <button className="wishlist-btn" onClick={(e) => {
          e.preventDefault();
          // Logic for wishlist will go here
        }}>
          <FiHeart />
        </button>
      </Link>
      
      <div className="product-info">
        <div className="product-category">{product.category_name || 'Beauty'}</div>
        <Link to={`/products/${product.id}`} className="product-title">
          <h3>{product.name}</h3>
        </Link>
        <p className="product-brand">{product.brand || 'Premium Brand'}</p>
        
        <div className="product-rating">
          <FiStar className="star-icon filled" />
          <span>{product.avg_rating || '5.0'}</span>
        </div>
        
        <div className="product-bottom">
          <span className="product-price">${Number(product.price).toFixed(2)}</span>
          <button className="btn btn-primary btn-sm add-cart-btn">
            Add to Cart
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProductCard;
