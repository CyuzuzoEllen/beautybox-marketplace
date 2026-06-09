import React, { useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';
import { FiGrid, FiPackage, FiShoppingCart, FiEdit, FiTrash2, FiPlus, FiLogOut } from 'react-icons/fi';
import './SellerDashboard.css';

const ManageProducts = () => {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  // Mock products data
  const mockProducts = [
    { id: 1, name: 'Luminous Foundation', category: 'Makeup', price: 39.00, stock: 45, status: 'Active' },
    { id: 2, name: 'Matte Liquid Lipstick', category: 'Makeup', price: 24.00, stock: 12, status: 'Active' },
    { id: 3, name: 'Rose Water Toner', category: 'Skincare', price: 18.50, stock: 0, status: 'Draft' },
  ];

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
          <Link to="/seller/products" className="seller-nav-item active">
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

      <main className="seller-content animate-slide-up">
        <header className="seller-header">
          <h2>My Products</h2>
          <button className="btn btn-primary" style={{display: 'flex', alignItems: 'center', gap: '0.5rem'}}>
            <FiPlus /> Add Product
          </button>
        </header>

        <div className="dashboard-section">
          <div className="table-responsive">
            <table className="seller-table">
              <thead>
                <tr>
                  <th>Product</th>
                  <th>Category</th>
                  <th>Price</th>
                  <th>Stock</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {mockProducts.map(product => (
                  <tr key={product.id}>
                    <td>
                      <div className="product-cell-img">
                        <div className="product-mini-img"></div>
                        <strong>{product.name}</strong>
                      </div>
                    </td>
                    <td>{product.category}</td>
                    <td>${product.price.toFixed(2)}</td>
                    <td>{product.stock}</td>
                    <td>
                      <span className={`status-badge ${product.status === 'Active' ? 'status-active' : 'status-draft'}`}>
                        {product.status}
                      </span>
                    </td>
                    <td>
                      <div className="product-actions">
                        <button className="action-icon-btn" title="Edit"><FiEdit /></button>
                        <button className="action-icon-btn text-danger" title="Delete"><FiTrash2 color="var(--danger)" /></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </div>
  );
};

export default ManageProducts;
