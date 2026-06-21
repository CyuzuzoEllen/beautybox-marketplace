import React, { useState, useEffect, useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';
import orderService from '../../services/orderService';
import { toast } from 'react-toastify';
import { FiGrid, FiPackage, FiShoppingCart, FiLogOut, FiLoader, FiInbox } from 'react-icons/fi';
import './SellerDashboard.css';

const SellerOrders = () => {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();

  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState(null);
  const [filter, setFilter] = useState('all');

  // Fetch seller orders on mount
  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const data = await orderService.getSellerOrders();
        setOrders(data.orders || []);
      } catch (error) {
        console.error('Error fetching seller orders:', error);
        toast.error('Failed to load orders. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, []);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  // Handle status change from the dropdown
  const handleStatusChange = async (orderId, newStatus) => {
    if (!newStatus || newStatus === '') return;

    setUpdatingId(orderId);
    try {
      await orderService.updateOrderStatus(orderId, newStatus);

      // Update local state instantly so the UI reflects the change
      setOrders(prev =>
        prev.map(order =>
          order.order_id === orderId
            ? { ...order, status: newStatus }
            : order
        )
      );

      toast.success(`Order #${orderId} updated to "${newStatus}"!`);
    } catch (error) {
      console.error('Error updating order status:', error);
      toast.error('Failed to update order status. Please try again.');
    } finally {
      setUpdatingId(null);
    }
  };

  // Format date nicely
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now - date;
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));

    if (diffHours < 1) return 'Just now';
    if (diffHours < 24) return `${diffHours}h ago`;

    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  // Get status badge class
  const getStatusClass = (status) => {
    switch (status) {
      case 'pending': return 'status-pending';
      case 'processing': return 'status-processing';
      case 'shipped': return 'status-shipped';
      case 'delivered': return 'status-delivered';
      case 'cancelled': return 'status-cancelled';
      default: return 'status-pending';
    }
  };

  // Get the next logical statuses a seller can set
  const getAvailableStatuses = (currentStatus) => {
    const flow = {
      pending: ['processing', 'cancelled'],
      processing: ['shipped', 'cancelled'],
      shipped: ['delivered'],
      delivered: [],
      cancelled: []
    };
    return flow[currentStatus] || [];
  };

  // Filter orders
  const filteredOrders = filter === 'all'
    ? orders
    : orders.filter(order => order.status === filter);

  // Count orders per status for the filter tabs
  const statusCounts = orders.reduce((acc, order) => {
    acc[order.status] = (acc[order.status] || 0) + 1;
    return acc;
  }, {});

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
          <span className="order-count-badge">{orders.length} total order{orders.length !== 1 ? 's' : ''}</span>
        </header>

        {/* Filter Tabs */}
        <div className="order-filter-tabs">
          <button
            className={`filter-tab ${filter === 'all' ? 'active' : ''}`}
            onClick={() => setFilter('all')}
          >
            All <span className="filter-count">{orders.length}</span>
          </button>
          {['pending', 'processing', 'shipped', 'delivered', 'cancelled'].map(status => (
            <button
              key={status}
              className={`filter-tab ${filter === status ? 'active' : ''}`}
              onClick={() => setFilter(status)}
            >
              {status.charAt(0).toUpperCase() + status.slice(1)}
              {statusCounts[status] > 0 && (
                <span className="filter-count">{statusCounts[status]}</span>
              )}
            </button>
          ))}
        </div>

        <div className="dashboard-section">
          {loading ? (
            <div className="orders-loading">
              <FiLoader className="spinner-icon" />
              <p>Loading your orders...</p>
            </div>
          ) : filteredOrders.length === 0 ? (
            <div className="orders-empty">
              <FiInbox className="empty-icon" />
              <h3>No orders {filter !== 'all' ? `with status "${filter}"` : 'yet'}</h3>
              <p>{filter === 'all' ? 'When customers purchase your products, their orders will appear here.' : 'Try selecting a different filter above.'}</p>
            </div>
          ) : (
            <div className="table-responsive">
              <table className="seller-table">
                <thead>
                  <tr>
                    <th>Order ID</th>
                    <th>Date</th>
                    <th>Products</th>
                    <th>Customer</th>
                    <th>Total</th>
                    <th>Status</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredOrders.map((order) => {
                    const availableStatuses = getAvailableStatuses(order.status);
                    const isUpdating = updatingId === order.order_id;

                    return (
                      <tr key={order.order_id} className="order-row">
                        <td>
                          <span className="order-id-cell">#{order.order_id}</span>
                        </td>
                        <td>{formatDate(order.order_date)}</td>
                        <td>
                          <div className="order-products-cell">
                            {order.items && order.items.map((item, idx) => (
                              <div key={idx} className="order-product-item">
                                {item.product_image && (
                                  <img
                                    src={item.product_image}
                                    alt={item.product_name}
                                    className="product-mini-img"
                                  />
                                )}
                                <div>
                                  <span className="product-name-text">{item.product_name}</span>
                                  <span className="product-qty-text">× {item.quantity}</span>
                                </div>
                              </div>
                            ))}
                          </div>
                        </td>
                        <td>
                          <div className="customer-cell">
                            <span className="customer-name">{order.customer_name}</span>
                            <span className="customer-email">{order.customer_email}</span>
                          </div>
                        </td>
                        <td>
                          <span className="order-total-cell">
                            ${parseFloat(order.seller_total).toFixed(2)}
                          </span>
                        </td>
                        <td>
                          <span className={`status-badge ${getStatusClass(order.status)}`}>
                            {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                          </span>
                        </td>
                        <td>
                          {availableStatuses.length > 0 ? (
                            <select
                              className="status-select"
                              disabled={isUpdating}
                              defaultValue=""
                              onChange={(e) => handleStatusChange(order.order_id, e.target.value)}
                            >
                              <option value="" disabled>
                                {isUpdating ? 'Updating...' : 'Update Status'}
                              </option>
                              {availableStatuses.map(s => (
                                <option key={s} value={s}>
                                  Mark {s.charAt(0).toUpperCase() + s.slice(1)}
                                </option>
                              ))}
                            </select>
                          ) : (
                            <span className="no-action-text">
                              {order.status === 'delivered' ? '✓ Complete' : '✕ Cancelled'}
                            </span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default SellerOrders;
