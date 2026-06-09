import React, { useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';
import { FiGrid, FiPackage, FiShoppingCart, FiTrendingUp, FiDollarSign, FiLogOut } from 'react-icons/fi';
import './SellerDashboard.css';

const SellerDashboard = () => {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  // Mock dashboard stats
  const stats = {
    totalRevenue: 4580.50,
    totalOrders: 124,
    activeProducts: 18,
    averageRating: 4.8
  };

  return (
    <div className="seller-dashboard">
      {/* Sidebar Navigation */}
      <aside className="seller-sidebar">
        <div className="seller-brand">
          <div className="seller-avatar">
            {(user?.name || 'Seller').charAt(0).toUpperCase()}
          </div>
          <h3>{user?.name || 'Beauty Boutique'}</h3>
          <span className="badge-seller">Seller Account</span>
        </div>

        <nav className="seller-nav">
          <Link to="/seller/dashboard" className="seller-nav-item active">
            <FiGrid /> Dashboard
          </Link>
          <Link to="/seller/products" className="seller-nav-item">
            <FiPackage /> My Products
          </Link>
          <Link to="/seller/orders" className="seller-nav-item">
            <FiShoppingCart /> Customer Orders
          </Link>
          <button onClick={handleLogout} className="seller-nav-item text-danger" style={{background: 'transparent', border: 'none', width: '100%', textAlign: 'left', cursor: 'pointer'}}>
            <FiLogOut /> Logout
          </button>
        </nav>
      </aside>

      {/* Main Content Area */}
      <main className="seller-content animate-slide-up">
        <header className="seller-header">
          <h2>Overview</h2>
          <Link to="/seller/products" className="btn btn-primary">+ Add New Product</Link>
        </header>

        {/* Stats Grid */}
        <div className="stats-grid">
          <div className="stat-card">
            <div className="stat-icon bg-primary-light">
              <FiDollarSign className="text-primary" size={24} />
            </div>
            <div className="stat-info">
              <p className="stat-label">Total Revenue</p>
              <h3 className="stat-value">${stats.totalRevenue.toLocaleString(undefined, {minimumFractionDigits: 2})}</h3>
            </div>
          </div>
          
          <div className="stat-card">
            <div className="stat-icon" style={{background: '#dcfce7'}}>
              <FiShoppingCart color="#22c55e" size={24} />
            </div>
            <div className="stat-info">
              <p className="stat-label">Total Orders</p>
              <h3 className="stat-value">{stats.totalOrders}</h3>
            </div>
          </div>
          
          <div className="stat-card">
            <div className="stat-icon" style={{background: '#fef08a'}}>
              <FiPackage color="#ca8a04" size={24} />
            </div>
            <div className="stat-info">
              <p className="stat-label">Active Products</p>
              <h3 className="stat-value">{stats.activeProducts}</h3>
            </div>
          </div>
          
          <div className="stat-card">
            <div className="stat-icon" style={{background: '#e0e7ff'}}>
              <FiTrendingUp color="#6366f1" size={24} />
            </div>
            <div className="stat-info">
              <p className="stat-label">Average Rating</p>
              <h3 className="stat-value">{stats.averageRating} <span style={{fontSize: '1rem', color: '#64748b'}}>★</span></h3>
            </div>
          </div>
        </div>

        {/* Recent Activity Section */}
        <div className="dashboard-section mt-4">
          <div className="section-header">
            <h3>Recent Orders</h3>
            <Link to="/seller/orders" className="view-all-link">View All</Link>
          </div>
          <div className="table-responsive">
            <table className="seller-table">
              <thead>
                <tr>
                  <th>Order ID</th>
                  <th>Date</th>
                  <th>Customer</th>
                  <th>Status</th>
                  <th>Total</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>ORD-8923</td>
                  <td>Today, 10:23 AM</td>
                  <td>Sarah Jenkins</td>
                  <td><span className="status-badge status-processing">Processing</span></td>
                  <td>$89.99</td>
                </tr>
                <tr>
                  <td>ORD-8922</td>
                  <td>Yesterday</td>
                  <td>Michael Chen</td>
                  <td><span className="status-badge status-shipped">Shipped</span></td>
                  <td>$124.50</td>
                </tr>
                <tr>
                  <td>ORD-8910</td>
                  <td>Jun 07, 2026</td>
                  <td>Emily Davis</td>
                  <td><span className="status-badge status-delivered">Delivered</span></td>
                  <td>$45.00</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </div>
  );
};

export default SellerDashboard;
