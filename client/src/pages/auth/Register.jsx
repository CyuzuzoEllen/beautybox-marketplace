import React, { useState, useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';
import { toast } from 'react-toastify';
import './Login.css'; // We reuse the login styles

const Register = () => {
  const [formData, setFormData] = useState({ 
    name: '', 
    email: '', 
    password: '', 
    confirmPassword: '',
    role: 'customer'
  });
  const [isLoading, setIsLoading] = useState(false);
  const { register } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Basic validation
    if (formData.password !== formData.confirmPassword) {
      return toast.error("Passwords don't match");
    }
    
    setIsLoading(true);
    
    const result = await register({
      name: formData.name,
      email: formData.email,
      password: formData.password,
      role: formData.role
    });
    
    if (result.success) {
      toast.success('Registration successful! Welcome to BeautyBox.');
      navigate('/');
    } else {
      toast.error(result.message);
    }
    
    setIsLoading(false);
  };

  return (
    <div className="auth-container">
      <div className="auth-card animate-slide-up" style={{maxWidth: '500px'}}>
        <div className="auth-header">
          <h2>Create an Account</h2>
          <p>Join BeautyBox Marketplace today</p>
        </div>
        
        <form onSubmit={handleSubmit} className="auth-form">
          <div className="form-group">
            <label htmlFor="name">Full Name</label>
            <input 
              type="text" 
              id="name" 
              name="name" 
              value={formData.name}
              onChange={handleChange}
              placeholder="Enter your full name"
              required 
            />
          </div>

          <div className="form-group">
            <label htmlFor="email">Email Address</label>
            <input 
              type="email" 
              id="email" 
              name="email" 
              value={formData.email}
              onChange={handleChange}
              placeholder="Enter your email"
              required 
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="password">Password</label>
            <input 
              type="password" 
              id="password" 
              name="password" 
              value={formData.password}
              onChange={handleChange}
              placeholder="Create a password (min 6 chars)"
              required 
              minLength="6"
            />
          </div>

          <div className="form-group">
            <label htmlFor="confirmPassword">Confirm Password</label>
            <input 
              type="password" 
              id="confirmPassword" 
              name="confirmPassword" 
              value={formData.confirmPassword}
              onChange={handleChange}
              placeholder="Confirm your password"
              required 
            />
          </div>

          <div className="form-group">
            <label>I want to:</label>
            <div className="role-selection">
              <div className="role-option">
                <input 
                  type="radio" 
                  id="role-customer" 
                  name="role" 
                  value="customer"
                  checked={formData.role === 'customer'}
                  onChange={handleChange}
                />
                <label htmlFor="role-customer">Buy Products</label>
              </div>
              <div className="role-option">
                <input 
                  type="radio" 
                  id="role-seller" 
                  name="role" 
                  value="seller"
                  checked={formData.role === 'seller'}
                  onChange={handleChange}
                />
                <label htmlFor="role-seller">Sell Products</label>
              </div>
            </div>
          </div>
          
          <button type="submit" className="btn btn-primary auth-submit" disabled={isLoading}>
            {isLoading ? 'Creating Account...' : 'Register'}
          </button>
        </form>
        
        <div className="auth-footer">
          <p>Already have an account? <Link to="/login">Login here</Link></p>
        </div>
      </div>
    </div>
  );
};

export default Register;
