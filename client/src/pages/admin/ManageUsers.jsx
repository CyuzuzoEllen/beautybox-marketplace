import React, { useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';
import { FiPieChart, FiUsers, FiBox, FiShoppingBag, FiLogOut } from 'react-icons/fi';
import './AdminDashboard.css';

const ManageUsers = () => {
  const { logout } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const mockUsers = [
    { id: 1, name: 'Jessica Wong', email: 'jess@example.com', role: 'customer', status: 'active', date: 'Today' },
    { id: 2, name: 'Glamour Inc.', email: 'hello@glamour.com', role: 'seller', status: 'active', date: 'Yesterday' },
    { id: 3, name: 'Spam Bot 3000', email: 'spam@bot.net', role: 'customer', status: 'suspended', date: 'Jun 05' }
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
          <Link to="/admin/users" className="admin-nav-item active">
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
          <h2>User Management</h2>
        </header>

        <div className="admin-panel">
          <table className="admin-table">
            <thead>
              <tr>
                <th>User ID</th>
                <th>Name / Email</th>
                <th>Role</th>
                <th>Status</th>
                <th>Joined</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {mockUsers.map(u => (
                <tr key={u.id}>
                  <td>#{u.id}</td>
                  <td>
                    <strong>{u.name}</strong>
                    <div style={{fontSize: '0.8rem', color: '#64748b'}}>{u.email}</div>
                  </td>
                  <td>
                    <span className={u.role === 'seller' ? 'badge-seller' : 'badge-customer'}>
                      {u.role.charAt(0).toUpperCase() + u.role.slice(1)}
                    </span>
                  </td>
                  <td>
                    <span style={{color: u.status === 'suspended' ? '#ef4444' : '#10b981', fontWeight: 600}}>
                      {u.status.charAt(0).toUpperCase() + u.status.slice(1)}
                    </span>
                  </td>
                  <td>{u.date}</td>
                  <td>
                    <div style={{display: 'flex', gap: '0.5rem'}}>
                      <button className="admin-action-btn btn-suspend">
                        {u.status === 'suspended' ? 'Unsuspend' : 'Suspend'}
                      </button>
                      <button className="admin-action-btn btn-delete">Delete</button>
                    </div>
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

export default ManageUsers;
