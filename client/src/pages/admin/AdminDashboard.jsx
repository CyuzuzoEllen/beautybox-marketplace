import React, { useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';
import { FiPieChart, FiUsers, FiBox, FiShoppingBag, FiStar, FiLogOut } from 'react-icons/fi';
import './AdminDashboard.css';

const AdminDashboard = () => {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  // Mock global stats
  const stats = {
    totalRevenue: 124500.00,
    totalUsers: 1450,
    totalSellers: 42,
    totalProducts: 350
  };

  return (
    <div className="admin-dashboard">
      <aside className="admin-sidebar">
        <div className="admin-brand">
          <div className="admin-avatar">
            A
          </div>
          <h3>BeautyBox Admin</h3>
          <span className="badge-admin">Super Admin</span>
        </div>

        <nav className="admin-nav">
          <Link to="/admin/dashboard" className="admin-nav-item active">
            <FiPieChart /> Overview
          </Link>
          <Link to="/admin/users" className="admin-nav-item">
            <FiUsers /> Manage Users
          </Link>
          <Link to="/admin/products" className="admin-nav-item">
            <FiBox /> All Products
          </Link>
          <Link to="/admin/orders" className="admin-nav-item">
            <FiShoppingBag /> All Orders
          </Link>
          <button onClick={handleLogout} className="admin-nav-item text-danger" style={{background: 'transparent', border: 'none', width: '100%', textAlign: 'left', cursor: 'pointer'}}>
            <FiLogOut /> Logout
          </button>
        </nav>
      </aside>

      <main className="admin-content animate-slide-up">
        <header className="admin-header">
          <h2>Platform Overview</h2>
        </header>

        <div className="admin-stats-grid">
          <div className="admin-stat-card">
            <div className="stat-value text-primary">${stats.totalRevenue.toLocaleString()}</div>
            <div className="stat-label">Total Platform Revenue</div>
          </div>
          <div className="admin-stat-card">
            <div className="stat-value">{stats.totalUsers}</div>
            <div className="stat-label">Registered Users</div>
          </div>
          <div className="admin-stat-card">
            <div className="stat-value">{stats.totalSellers}</div>
            <div className="stat-label">Active Sellers</div>
          </div>
          <div className="admin-stat-card">
            <div className="stat-value">{stats.totalProducts}</div>
            <div className="stat-label">Total Products</div>
          </div>
        </div>

        <div className="admin-panels">
          <div className="admin-panel">
            <div className="panel-header">
              <h3>Recent Signups</h3>
              <Link to="/admin/users">View All</Link>
            </div>
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Role</th>
                  <th>Date</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>Jessica Wong</td>
                  <td><span className="badge-customer">Customer</span></td>
                  <td>Today</td>
                </tr>
                <tr>
                  <td>Glamour Inc.</td>
                  <td><span className="badge-seller">Seller</span></td>
                  <td>Yesterday</td>
                </tr>
                <tr>
                  <td>David Smith</td>
                  <td><span className="badge-customer">Customer</span></td>
                  <td>Jun 07</td>
                </tr>
              </tbody>
            </table>
          </div>

          <div className="admin-panel">
            <div className="panel-header">
              <h3>System Alerts</h3>
            </div>
            <div className="alerts-list">
              <div className="alert-item warning">
                <strong>Pending Seller Approvals:</strong> 3 new sellers require verification.
              </div>
              <div className="alert-item info">
                <strong>System Update:</strong> Scheduled maintenance at 2 AM EST.
              </div>
              <div className="alert-item danger">
                <strong>Reported Reviews:</strong> 2 reviews have been flagged for inappropriate content.
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default AdminDashboard;
