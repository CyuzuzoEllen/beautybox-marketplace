import React, { useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';
import { FiPieChart, FiUsers, FiBox, FiShoppingBag, FiLogOut } from 'react-icons/fi';
import './AdminDashboard.css';

const ManageAllOrders = () => {
  const { logout } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const mockOrders = [
    { id: 'ORD-8923', customer: 'Jessica Wong', seller: 'Glamour Inc.', amount: 124.99, status: 'delivered', date: 'Today' },
    { id: 'ORD-8924', customer: 'David Smith', seller: 'Beauty Boutique', amount: 45.00, status: 'processing', date: 'Today' },
    { id: 'ORD-8925', customer: 'Emily Davis', seller: 'Glamour Inc.', amount: 210.50, status: 'shipped', date: 'Yesterday' }
  ];

  return (
    <div className="admin-dashboard">
      <aside className="admin-sidebar">
        <div className="admin-brand">
          <div className="admin-avatar">A</div>
          <h3>BeautyBox Admin</h3>
          <span className="badge-admin">Super Admin</span>
        </div>

        <nav className="admin-nav">
          <Link to="/admin/dashboard" className="admin-nav-item">
            <FiPieChart /> Overview
          </Link>
          <Link to="/admin/users" className="admin-nav-item">
            <FiUsers /> Manage Users
          </Link>
          <Link to="/admin/products" className="admin-nav-item">
            <FiBox /> All Products
          </Link>
          <Link to="/admin/orders" className="admin-nav-item active">
            <FiShoppingBag /> All Orders
          </Link>
          <button onClick={handleLogout} className="admin-nav-item text-danger" style={{background: 'transparent', border: 'none', width: '100%', textAlign: 'left', cursor: 'pointer'}}>
            <FiLogOut /> Logout
          </button>
        </nav>
      </aside>

      <main className="admin-content animate-slide-up">
        <header className="admin-header">
          <h2>Global Order Tracker</h2>
        </header>

        <div className="admin-panel">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Order ID</th>
                <th>Date</th>
                <th>Customer</th>
                <th>Seller</th>
                <th>Total</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {mockOrders.map(o => (
                <tr key={o.id}>
                  <td><strong>{o.id}</strong></td>
                  <td>{o.date}</td>
                  <td>{o.customer}</td>
                  <td>{o.seller}</td>
                  <td>${o.amount.toFixed(2)}</td>
                  <td>
                    <span className={`badge-customer`} style={{
                      background: o.status === 'delivered' ? '#dcfce7' : o.status === 'shipped' ? '#fef3c7' : '#dbeafe',
                      color: o.status === 'delivered' ? '#15803d' : o.status === 'shipped' ? '#b45309' : '#1d4ed8'
                    }}>
                      {o.status.charAt(0).toUpperCase() + o.status.slice(1)}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </main>
    </div>
  );
};

export default ManageAllOrders;
