import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import './Login.css'; // We reuse the login styles

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    // In a real app, we would call an API here
    // await authService.forgotPassword(email);
    
    // Simulate API call
    setTimeout(() => {
      setIsSubmitting(false);
      setIsSubmitted(true);
      toast.success('Password reset instructions sent!');
    }, 1500);
  };

  return (
    <div className="auth-container">
      <div className="auth-card animate-slide-up">
        <div className="auth-header">
          <h2>Reset Password</h2>
          <p>We'll send you instructions to reset your password</p>
        </div>
        
        {!isSubmitted ? (
          <form onSubmit={handleSubmit} className="auth-form">
            <div className="form-group">
              <label htmlFor="email">Email Address</label>
              <input 
                type="email" 
                id="email" 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email"
                required 
              />
            </div>
            
            <button type="submit" className="btn btn-primary auth-submit" disabled={isSubmitting}>
              {isSubmitting ? 'Sending...' : 'Send Reset Link'}
            </button>
          </form>
        ) : (
          <div className="success-message" style={{textAlign: 'center', margin: '2rem 0'}}>
            <div style={{fontSize: '3rem', color: 'var(--success)', marginBottom: '1rem'}}>✓</div>
            <p>Check your email (<strong>{email}</strong>) for a link to reset your password.</p>
          </div>
        )}
        
        <div className="auth-footer">
          <p>Remember your password? <Link to="/login">Back to Login</Link></p>
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;
