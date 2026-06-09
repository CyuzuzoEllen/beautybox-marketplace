import React, { useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';
import { FiPieChart, FiUsers, FiBox, FiShoppingBag, FiLogOut } from 'react-icons/fi';
import './AdminDashboard.css';

const ManageAllProducts = () => {
  const { logout } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const mockProducts = [
    { id: 101, name: 'Luminous Foundation', seller: 'Glamour Inc.', price: 39.00, status: 'Active' },
    { id: 102, name: 'Vitamin C Serum', seller: 'Beauty Boutique', price: 78.00, status: 'Active' },
    { id: 103, name: 'Counterfeit Lip Gloss', seller: 'Scam Store', price: 5.00, status: 'Flagged' }
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
          <Link to="/admin/products" className="admin-nav-item active">
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
          <h2>Global Product Directory</h2>
        </header>

        <div className="admin-panel">
          <table className="admin-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Product Name</th>
                <th>Seller</th>
                <th>Price</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {mockProducts.map(p => (
                <tr key={p.id}>
                  <td>#{p.id}</td>
                  <td><strong>{p.name}</strong></td>
                  <td>{p.seller}</td>
                  <td>${p.price.toFixed(2)}</td>
                  <td>
                    <span style={{color: p.status === 'Flagged' ? '#ef4444' : '#10b981', fontWeight: 600}}>
                      {p.status}
                    </span>
                  </td>
                  <td>
                    <button className="admin-action-btn btn-delete">Remove Product</button>
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

export default ManageAllProducts;
