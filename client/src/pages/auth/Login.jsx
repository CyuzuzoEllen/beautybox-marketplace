import React, { useState, useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';
import { toast } from 'react-toastify';
import { GoogleLogin } from '@react-oauth/google';
import './Login.css';

const Login = () => {
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [isLoading, setIsLoading] = useState(false);
  const { login, loginWithGoogle } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    
    const result = await login(formData.email, formData.password);
    
    if (result.success) {
      toast.success('Login successful!');
      navigate('/');
    } else {
      toast.error(result.message);
    }
    
    setIsLoading(false);
  };

  const handleGoogleSuccess = async (credentialResponse) => {
    setIsLoading(true);
    const result = await loginWithGoogle(credentialResponse.credential);
    
    if (result.success) {
      toast.success('Logged in with Google!');
      navigate('/');
    } else {
      toast.error(result.message);
    }
    setIsLoading(false);
  };

  return (
    <div className="auth-container">
      <div className="auth-card animate-slide-up">
        <div className="auth-header">
          <h2>Welcome Back</h2>
          <p>Login to your BeautyBox account</p>
        </div>
        
        <div className="google-auth-container">
          <GoogleLogin
            onSuccess={handleGoogleSuccess}
            onError={() => {
              toast.error('Google Sign In failed');
            }}
            useOneTap
            shape="rectangular"
            theme="filled_black"
            text="signin_with"
            size="large"
            width="100%"
          />
        </div>

        <div className="auth-divider">
          <span>Or continue with email</span>
        </div>

        <form onSubmit={handleSubmit} className="auth-form">
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
              placeholder="Enter your password"
              required 
            />
          </div>
          
          <div className="auth-options">
            <Link to="/forgot-password" className="forgot-link">Forgot Password?</Link>
          </div>
          
          <button type="submit" className="btn btn-primary auth-submit" disabled={isLoading}>
            {isLoading ? 'Logging in...' : 'Login'}
          </button>
        </form>
        
        <div className="auth-footer">
          <p>Don't have an account? <Link to="/register">Register here</Link></p>
        </div>
      </div>
    </div>
  );
};

export default Login;
