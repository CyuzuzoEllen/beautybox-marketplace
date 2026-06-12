import React, { useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FiShoppingBag, FiUser, FiSearch, FiMenu, FiLogOut } from 'react-icons/fi';
import { AuthContext } from '../context/AuthContext';
import { CartContext } from '../context/CartContext';
import './Navbar.css';

const Navbar = () => {
  const { user, isAuthenticated, logout } = useContext(AuthContext);
  const { cartCount } = useContext(CartContext);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

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
          
          {isAuthenticated ? (
            <div className="user-menu" style={{display: 'flex', alignItems: 'center', gap: '1rem'}}>
              {user?.role === 'seller' && (
                <Link to="/seller/dashboard" className="action-btn" title="Seller Dashboard" style={{textDecoration: 'none', fontWeight: 'bold', fontSize: '0.9rem'}}>
                  Dashboard
                </Link>
              )}
              <Link to="/profile" className="action-btn" title="Profile">
                <FiUser size={22} />
              </Link>
              <button onClick={handleLogout} className="action-btn" style={{background: 'none', border: 'none', cursor: 'pointer'}} title="Logout">
                <FiLogOut size={22} />
              </button>
            </div>
          ) : (
            <Link to="/login" className="action-btn" title="Login">
              <FiUser size={22} />
            </Link>
          )}

          <Link to="/cart" className="action-btn cart-btn">
            <FiShoppingBag size={22} />
            {cartCount > 0 && <span className="cart-badge">{cartCount}</span>}
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
