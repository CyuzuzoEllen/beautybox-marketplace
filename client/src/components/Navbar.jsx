import React from 'react';
import { Link } from 'react-router-dom';
import { FiShoppingBag, FiUser, FiSearch, FiMenu } from 'react-icons/fi';
import './Navbar.css';

const Navbar = () => {
  return (
    <nav className="navbar">
      <div className="navbar-container">
        <Link to="/" className="navbar-logo">
          BeautyBox<span>.</span>
        </Link>
        
        <div className="navbar-links">
          <Link to="/">Home</Link>
          <Link to="/products">Shop</Link>
          <Link to="/categories">Categories</Link>
          <Link to="/about">About</Link>
        </div>

        <div className="navbar-actions">
          <div className="search-bar">
            <input type="text" placeholder="Search products..." />
            <FiSearch className="search-icon" />
          </div>
          <Link to="/login" className="action-btn">
            <FiUser size={22} />
          </Link>
          <Link to="/cart" className="action-btn cart-btn">
            <FiShoppingBag size={22} />
            <span className="cart-badge">0</span>
          </Link>
          <button className="mobile-menu-btn">
            <FiMenu size={24} />
          </button>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
