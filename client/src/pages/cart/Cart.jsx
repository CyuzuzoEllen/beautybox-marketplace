import React, { useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { CartContext } from '../../context/CartContext';
import { FiTrash2, FiMinus, FiPlus, FiArrowRight } from 'react-icons/fi';
import './Cart.css';

const Cart = () => {
  const { cartItems, cartTotal, removeFromCart, updateQuantity } = useContext(CartContext);
  const navigate = useNavigate();

  if (cartItems.length === 0) {
    return (
      <div className="cart-empty-container animate-fade-in">
        <div className="empty-cart-icon">🛒</div>
        <h2>Your cart is empty</h2>
        <p>Looks like you haven't added any beauty products to your cart yet.</p>
        <Link to="/products" className="btn btn-primary mt-4">Start Shopping</Link>
      </div>
    );
  }

  return (
    <div className="cart-page-container">
      <h1 className="page-title">Your Shopping Cart</h1>
      
      <div className="cart-layout">
        <div className="cart-items-section animate-slide-up">
          <div className="cart-header">
            <span>Product</span>
            <span>Quantity</span>
            <span>Total</span>
          </div>
          
          <div className="cart-items">
            {cartItems.map(item => (
              <div key={item.id} className="cart-item">
                <div className="item-details">
                  <div className="item-image">
                    {item.image ? (
                      <img src={item.image} alt={item.name} />
                    ) : (
                      <div className="placeholder-img">{item.name.substring(0, 2).toUpperCase()}</div>
                    )}
                  </div>
                  <div className="item-info">
                    <Link to={`/products/${item.id}`} className="item-name">{item.name}</Link>
                    <span className="item-price">${Number(item.price).toFixed(2)}</span>
                  </div>
                </div>
                
                <div className="item-quantity">
                  <button onClick={() => updateQuantity(item.id, item.quantity - 1)}><FiMinus /></button>
                  <span>{item.quantity}</span>
                  <button onClick={() => updateQuantity(item.id, item.quantity + 1)}><FiPlus /></button>
                </div>
                
                <div className="item-total-price">
                  <span>${(item.price * item.quantity).toFixed(2)}</span>
                  <button className="remove-btn" onClick={() => removeFromCart(item.id)} title="Remove item">
                    <FiTrash2 />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
        
        <div className="cart-summary-section animate-slide-up" style={{ animationDelay: '0.1s' }}>
          <div className="summary-card">
            <h3>Order Summary</h3>
            
            <div className="summary-row">
              <span>Subtotal</span>
              <span>${cartTotal.toFixed(2)}</span>
            </div>
            <div className="summary-row">
              <span>Shipping</span>
              <span>{cartTotal > 50 ? 'Free' : '$5.99'}</span>
            </div>
            <div className="summary-row">
              <span>Tax (Estimated)</span>
              <span>${(cartTotal * 0.08).toFixed(2)}</span>
            </div>
            
            <div className="summary-divider"></div>
            
            <div className="summary-row total">
              <span>Total</span>
              <span>${(cartTotal + (cartTotal > 50 ? 0 : 5.99) + (cartTotal * 0.08)).toFixed(2)}</span>
            </div>
            
            <button 
              className="btn btn-primary checkout-btn"
              onClick={() => navigate('/checkout')}
            >
              Proceed to Checkout <FiArrowRight />
            </button>
            
            <div className="summary-footer">
              <Link to="/products">Continue Shopping</Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Cart;
