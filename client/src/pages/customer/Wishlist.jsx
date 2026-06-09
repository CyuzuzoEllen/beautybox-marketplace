import React, { useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';
import { FiUser, FiPackage, FiHeart, FiSettings, FiLogOut } from 'react-icons/fi';
import ProductCard from '../../components/product/ProductCard';
import './CustomerPages.css';

const Wishlist = () => {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  // Mock wishlist data
  const mockWishlist = [
    {
      id: 1,
      name: 'Luminous Foundation',
      brand: 'Fenty Beauty',
      price: 39.00,
      category_name: 'Makeup',
      avg_rating: 4.8,
      stock: 50
    },
    {
      id: 2,
      name: 'Vitamin C Serum',
      brand: 'Drunk Elephant',
      price: 78.00,
      category_name: 'Skincare',
      avg_rating: 4.9,
      stock: 12
    }
  ];

  return (
    <div className="customer-dashboard">
      <div className="dashboard-sidebar">
        <div className="user-profile-summary">
          <div className="avatar-placeholder">
            {(user?.name || 'C').charAt(0).toUpperCase()}
          </div>
          <h3>{user?.name || 'Customer'}</h3>
          <p className="user-role badge-customer">Customer</p>
        </div>

        <nav className="dashboard-nav">
          <Link to="/profile" className="nav-item"><FiSettings /> Account Settings</Link>
          <Link to="/orders" className="nav-item"><FiPackage /> Order History</Link>
          <Link to="/wishlist" className="nav-item active"><FiHeart /> Wishlist</Link>
          <button onClick={handleLogout} className="nav-item text-danger"><FiLogOut /> Logout</button>
        </nav>
      </div>

      <div className="dashboard-content animate-slide-up">
        <div className="content-header">
          <h2>My Wishlist</h2>
          <span>{mockWishlist.length} items</span>
        </div>

        {mockWishlist.length === 0 ? (
          <div className="empty-state" style={{background: 'var(--surface)'}}>
            <FiHeart size={48} style={{color: '#e5e7eb', marginBottom: '1rem'}} />
            <h3>Your wishlist is empty</h3>
            <p>Save items you love to your wishlist to easily find them later.</p>
            <Link to="/products" className="btn btn-primary">Discover Products</Link>
          </div>
        ) : (
          <div className="wishlist-grid">
            {mockWishlist.map(product => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Wishlist;
