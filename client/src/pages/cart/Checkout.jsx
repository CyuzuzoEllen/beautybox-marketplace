import React, { useContext, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { CartContext } from '../../context/CartContext';
import { AuthContext } from '../../context/AuthContext';
import { toast } from 'react-toastify';
import orderService from '../../services/orderService';
import './Cart.css'; // Reusing some layout from Cart

const Checkout = () => {
  const { cartItems, cartTotal, clearCart } = useContext(CartContext);
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();
  const [isProcessing, setIsProcessing] = useState(false);

  const [formData, setFormData] = useState({
    shippingAddress: user?.address || '',
    city: '',
    zipCode: '',
    paymentMethod: 'credit_card'
  });

  if (cartItems.length === 0) {
    return (
      <div className="cart-empty-container">
        <h2>Your cart is empty</h2>
        <Link to="/products" className="btn btn-primary mt-4">Return to Shop</Link>
      </div>
    );
  }

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleCheckout = async (e) => {
    e.preventDefault();
    setIsProcessing(true);
    
    try {
      const orderData = {
        shipping_address: `${formData.shippingAddress}, ${formData.city}, ${formData.zipCode}`,
        payment_method: formData.paymentMethod,
        items: cartItems.map(item => ({
          product_id: item.id,
          quantity: item.quantity
        }))
      };

      await orderService.createOrder(orderData);
      
      clearCart();
      toast.success('Order placed successfully! Thank you for shopping.');
      navigate('/orders'); 
    } catch (error) {
      console.error('Checkout error:', error);
      toast.error(error.response?.data?.message || 'Failed to place order. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  const tax = cartTotal * 0.08;
  const shipping = cartTotal > 50 ? 0 : 5.99;
  const finalTotal = cartTotal + tax + shipping;

  return (
    <div className="cart-page-container">
      <h1 className="page-title">Checkout</h1>
      
      <div className="cart-layout">
        <div className="cart-items-section animate-slide-up">
          
          <form onSubmit={handleCheckout} id="checkout-form">
            <div className="checkout-section">
              <h3>Shipping Information</h3>
              <div className="form-group" style={{marginTop: '1rem'}}>
                <label>Street Address</label>
                <input 
                  type="text" 
                  name="shippingAddress"
                  value={formData.shippingAddress}
                  onChange={handleChange}
                  required 
                  style={{width: '100%', padding: '0.75rem', border: '1px solid #e5e7eb', borderRadius: '4px'}}
                />
              </div>
              <div style={{display: 'flex', gap: '1rem', marginTop: '1rem'}}>
                <div className="form-group" style={{flex: 1}}>
                  <label>City</label>
                  <input 
                    type="text" 
                    name="city"
                    value={formData.city}
                    onChange={handleChange}
                    required 
                    style={{width: '100%', padding: '0.75rem', border: '1px solid #e5e7eb', borderRadius: '4px'}}
                  />
                </div>
                <div className="form-group" style={{flex: 1}}>
                  <label>Zip Code</label>
                  <input 
                    type="text" 
                    name="zipCode"
                    value={formData.zipCode}
                    onChange={handleChange}
                    required 
                    style={{width: '100%', padding: '0.75rem', border: '1px solid #e5e7eb', borderRadius: '4px'}}
                  />
                </div>
              </div>
            </div>

            <div className="checkout-section" style={{marginTop: '2rem'}}>
              <h3>Payment Method</h3>
              <div style={{marginTop: '1rem', display: 'flex', gap: '1rem'}}>
                <label style={{display: 'flex', alignItems: 'center', gap: '0.5rem'}}>
                  <input 
                    type="radio" 
                    name="paymentMethod" 
                    value="credit_card" 
                    checked={formData.paymentMethod === 'credit_card'}
                    onChange={handleChange}
                  />
                  Credit Card
                </label>
                <label style={{display: 'flex', alignItems: 'center', gap: '0.5rem'}}>
                  <input 
                    type="radio" 
                    name="paymentMethod" 
                    value="paypal" 
                    checked={formData.paymentMethod === 'paypal'}
                    onChange={handleChange}
                  />
                  PayPal
                </label>
              </div>
            </div>
          </form>
          
        </div>
        
        <div className="cart-summary-section animate-slide-up" style={{ animationDelay: '0.1s' }}>
          <div className="summary-card">
            <h3>Order Summary ({cartItems.length} items)</h3>
            
            <div className="summary-row">
              <span>Subtotal</span>
              <span>${cartTotal.toFixed(2)}</span>
            </div>
            <div className="summary-row">
              <span>Shipping</span>
              <span>{shipping === 0 ? 'Free' : `$${shipping}`}</span>
            </div>
            <div className="summary-row">
              <span>Tax</span>
              <span>${tax.toFixed(2)}</span>
            </div>
            
            <div className="summary-divider"></div>
            
            <div className="summary-row total">
              <span>Total</span>
              <span>${finalTotal.toFixed(2)}</span>
            </div>
            
            <button 
              type="submit" 
              form="checkout-form"
              className="btn btn-primary checkout-btn"
              disabled={isProcessing}
            >
              {isProcessing ? 'Processing...' : 'Place Order'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Checkout;
