import React, { useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';
import { FiGrid, FiPackage, FiShoppingCart, FiLogOut } from 'react-icons/fi';
import './SellerDashboard.css';

const SellerOrders = () => {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <div className="seller-dashboard">
      <aside className="seller-sidebar">
        <div className="seller-brand">
          <div className="seller-avatar">
            {(user?.name || 'Seller').charAt(0).toUpperCase()}
          </div>
          <h3>{user?.name || 'Beauty Boutique'}</h3>
          <span className="badge-seller">Seller Account</span>
        </div>

        <nav className="seller-nav">
          <Link to="/seller/dashboard" className="seller-nav-item">
            <FiGrid /> Dashboard
          </Link>
          <Link to="/seller/products" className="seller-nav-item">
            <FiPackage /> My Products
          </Link>
          <Link to="/seller/orders" className="seller-nav-item active">
            <FiShoppingCart /> Customer Orders
          </Link>
          <button onClick={handleLogout} className="seller-nav-item text-danger" style={{background: 'transparent', border: 'none', width: '100%', textAlign: 'left', cursor: 'pointer'}}>
            <FiLogOut /> Logout
          </button>
        </nav>
      </aside>

      <main className="seller-content animate-slide-up">
        <header className="seller-header">
          <h2>Customer Orders</h2>
        </header>

        <div className="dashboard-section">
          <div className="table-responsive">
            <table className="seller-table">
              <thead>
                <tr>
                  <th>Order ID</th>
                  <th>Date</th>
                  <th>Product</th>
                  <th>Qty</th>
                  <th>Customer</th>
                  <th>Status</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>ORD-8923</td>
                  <td>Today, 10:23 AM</td>
                  <td>Luminous Foundation</td>
                  <td>1</td>
                  <td>Sarah Jenkins</td>
                  <td><span className="status-badge status-processing">Processing</span></td>
                  <td>
                    <select style={{padding: '0.25rem', borderRadius: '4px', border: '1px solid #e5e7eb'}}>
                      <option>Update Status</option>
                      <option value="shipped">Mark Shipped</option>
                      <option value="delivered">Mark Delivered</option>
                    </select>
                  </td>
                </tr>
                <tr>
                  <td>ORD-8922</td>
                  <td>Yesterday</td>
                  <td>Matte Liquid Lipstick</td>
                  <td>2</td>
                  <td>Michael Chen</td>
                  <td><span className="status-badge status-shipped">Shipped</span></td>
                  <td>
                    <select style={{padding: '0.25rem', borderRadius: '4px', border: '1px solid #e5e7eb'}}>
                      <option>Update Status</option>
                      <option value="shipped">Mark Shipped</option>
                      <option value="delivered">Mark Delivered</option>
                    </select>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </div>
  );
};

export default SellerOrders;
