import React, { useContext, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';
import { FiUser, FiPackage, FiHeart, FiSettings, FiLogOut } from 'react-icons/fi';
import { toast } from 'react-toastify';
import './CustomerPages.css';

const Profile = () => {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();
  
  // Local state for editing profile
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: user?.name || 'Customer User',
    email: user?.email || 'customer@beautybox.com',
    phone: user?.phone || '',
    address: user?.address || ''
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSave = (e) => {
    e.preventDefault();
    // Simulate API call
    toast.success('Profile updated successfully!');
    setIsEditing(false);
  };

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <div className="customer-dashboard">
      <div className="dashboard-sidebar">
        <div className="user-profile-summary">
          <div className="avatar-placeholder">
            {formData.name.charAt(0).toUpperCase()}
          </div>
          <h3>{formData.name}</h3>
          <p className="user-role badge-customer">Customer</p>
        </div>

        <nav className="dashboard-nav">
          <Link to="/profile" className="nav-item active"><FiSettings /> Account Settings</Link>
          <Link to="/orders" className="nav-item"><FiPackage /> Order History</Link>
          <Link to="/wishlist" className="nav-item"><FiHeart /> Wishlist</Link>
          <button onClick={handleLogout} className="nav-item text-danger"><FiLogOut /> Logout</button>
        </nav>
      </div>

      <div className="dashboard-content animate-fade-in">
        <div className="content-header">
          <h2>Account Settings</h2>
          {!isEditing && (
            <button className="btn btn-outline" onClick={() => setIsEditing(true)}>
              Edit Profile
            </button>
          )}
        </div>

        <div className="profile-card">
          {isEditing ? (
            <form onSubmit={handleSave} className="profile-form">
              <div className="form-row">
                <div className="form-group">
                  <label>Full Name</label>
                  <input type="text" name="name" value={formData.name} onChange={handleChange} required />
                </div>
                <div className="form-group">
                  <label>Email Address</label>
                  <input type="email" name="email" value={formData.email} onChange={handleChange} required />
                </div>
              </div>
              
              <div className="form-group">
                <label>Phone Number</label>
                <input type="tel" name="phone" value={formData.phone} onChange={handleChange} placeholder="Optional" />
              </div>

              <div className="form-group">
                <label>Shipping Address</label>
                <textarea 
                  name="address" 
                  value={formData.address} 
                  onChange={handleChange} 
                  rows="3" 
                  placeholder="Enter your default shipping address"
                ></textarea>
              </div>

              <div className="form-actions">
                <button type="button" className="btn btn-outline" onClick={() => setIsEditing(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary">Save Changes</button>
              </div>
            </form>
          ) : (
            <div className="profile-details">
              <div className="detail-group">
                <span className="detail-label">Full Name</span>
                <span className="detail-value">{formData.name}</span>
              </div>
              <div className="detail-group">
                <span className="detail-label">Email Address</span>
                <span className="detail-value">{formData.email}</span>
              </div>
              <div className="detail-group">
                <span className="detail-label">Phone Number</span>
                <span className="detail-value">{formData.phone || 'Not provided'}</span>
              </div>
              <div className="detail-group">
                <span className="detail-label">Shipping Address</span>
                <span className="detail-value">{formData.address || 'No default address saved'}</span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Profile;
