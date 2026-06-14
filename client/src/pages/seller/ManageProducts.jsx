import React, { useContext, useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';
import { FiGrid, FiPackage, FiShoppingCart, FiEdit, FiTrash2, FiPlus, FiLogOut } from 'react-icons/fi';
import api from '../../services/api';
import AddProductModal from '../../components/AddProductModal';
import { toast } from 'react-toastify';
import './SellerDashboard.css';

const ManageProducts = () => {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const [products, setProducts] = useState([]);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      // Need to fetch products for the specific seller
      const response = await api.get('/products');
      // For now, if /products returns all products, filter by user.id if needed, 
      // or ideally we have an endpoint like /api/products/seller.
      // But assuming the backend doesn't have a specific seller route, we filter locally:
      const sellerProducts = response.data.products.filter(p => p.seller_id === user?.id);
      setProducts(sellerProducts);
    } catch (error) {
      console.error('Failed to fetch products:', error);
      toast.error('Failed to load your products');
    }
  };

  const handleDelete = async (productId) => {
    if (window.confirm('Are you sure you want to delete this product?')) {
      try {
        await api.delete(`/products/${productId}`);
        toast.success('Product deleted successfully');
        fetchProducts(); // Refresh list
      } catch (error) {
        toast.error('Failed to delete product');
      }
    }
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
          <button className="btn btn-primary" style={{display: 'flex', alignItems: 'center', gap: '0.5rem'}} onClick={() => setIsAddModalOpen(true)}>
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
                {products.length === 0 ? (
                  <tr>
                    <td colSpan="6" style={{textAlign: 'center', padding: '2rem'}}>
                      You haven't added any products yet. Click "Add Product" to get started!
                    </td>
                  </tr>
                ) : (
                  products.map(product => (
                    <tr key={product.id}>
                      <td>
                        <div className="product-cell-img">
                          <div className="product-mini-img">
                            {product.image && <img src={product.image} alt={product.name} style={{width: '100%', height: '100%', objectFit: 'cover', borderRadius: '4px'}} />}
                          </div>
                          <strong>{product.name}</strong>
                        </div>
                      </td>
                      <td>{product.category_name || 'Uncategorized'}</td>
                      <td>${parseFloat(product.price).toFixed(2)}</td>
                      <td>{product.stock}</td>
                      <td>
                        <span className={`status-badge ${product.is_active ? 'status-active' : 'status-draft'}`}>
                          {product.is_active ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                      <td>
                        <div className="product-actions">
                          <button className="action-icon-btn text-danger" title="Delete" onClick={() => handleDelete(product.id)}><FiTrash2 color="var(--danger)" /></button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </main>

      <AddProductModal 
        isOpen={isAddModalOpen} 
        onClose={() => setIsAddModalOpen(false)} 
        onSuccess={fetchProducts} 
      />
    </div>
  );
};

export default ManageProducts;
