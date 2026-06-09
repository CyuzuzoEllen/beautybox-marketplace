import React, { useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';
import { FiUser, FiPackage, FiHeart, FiSettings, FiLogOut, FiExternalLink } from 'react-icons/fi';
import './CustomerPages.css';

const OrderHistory = () => {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  // Mock data for demo
  const mockOrders = [
    {
      id: 'ORD-8923-1092',
      date: 'June 05, 2026',
      total: 124.99,
      status: 'delivered',
      statusText: 'Delivered',
      items: [
        { id: 1, name: 'Luminous Foundation', brand: 'Fenty', price: 39.00 }
      ]
    },
    {
      id: 'ORD-7621-9981',
      date: 'June 08, 2026',
      total: 68.50,
      status: 'processing',
      statusText: 'Processing',
      items: [
        { id: 2, name: 'Hydrating Night Cream', brand: 'CeraVe', price: 24.50 },
        { id: 3, name: 'Matte Liquid Lipstick', brand: 'MAC', price: 44.00 }
      ]
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
          <Link to="/orders" className="nav-item active"><FiPackage /> Order History</Link>
          <Link to="/wishlist" className="nav-item"><FiHeart /> Wishlist</Link>
          <button onClick={handleLogout} className="nav-item text-danger"><FiLogOut /> Logout</button>
        </nav>
      </div>

      <div className="dashboard-content animate-slide-up">
        <div className="content-header">
          <h2>Order History</h2>
        </div>

        {mockOrders.length === 0 ? (
          <div className="empty-state" style={{background: 'var(--surface)'}}>
            <h3>No orders yet</h3>
            <p>When you place orders, they will appear here.</p>
            <Link to="/products" className="btn btn-primary">Start Shopping</Link>
          </div>
        ) : (
          <div className="orders-list">
            {mockOrders.map(order => (
              <div key={order.id} className="order-card">
                <div className="order-header">
                  <div className="order-meta">
                    <div className="meta-item">
                      <span className="meta-label">Order Placed</span>
                      <span className="meta-value">{order.date}</span>
                    </div>
                    <div className="meta-item">
                      <span className="meta-label">Total</span>
                      <span className="meta-value">${order.total.toFixed(2)}</span>
                    </div>
                    <div className="meta-item">
                      <span className="meta-label">Order ID</span>
                      <span className="meta-value">{order.id}</span>
                    </div>
                  </div>
                  <div>
                    <span className={`order-status status-${order.status}`}>
                      {order.statusText}
                    </span>
                  </div>
                </div>
                <div className="order-items">
                  {order.items.map((item, idx) => (
                    <div key={idx} className="order-item-row">
                      <div className="order-item-img"></div>
                      <div className="order-item-info">
                        <h4>{item.name}</h4>
                        <p>{item.brand}</p>
                      </div>
                      <div style={{marginLeft: 'auto', fontWeight: '600'}}>
                        ${item.price.toFixed(2)}
                      </div>
                    </div>
                  ))}
                </div>
                <div style={{padding: '1rem 1.5rem', background: '#f9fafb', borderTop: '1px solid #e5e7eb', textAlign: 'right'}}>
                  <button className="btn btn-outline" style={{padding: '0.5rem 1rem', fontSize: '0.85rem'}}>
                    View Invoice <FiExternalLink style={{marginLeft: '0.5rem'}}/>
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default OrderHistory;
