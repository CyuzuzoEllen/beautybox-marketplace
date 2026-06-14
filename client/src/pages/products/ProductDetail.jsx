import React, { useState, useEffect, useContext } from 'react';
import { useParams, Link } from 'react-router-dom';
import productService from '../../services/productService';
import { CartContext } from '../../context/CartContext';
import { FiHeart, FiStar, FiTruck, FiShield, FiMinus, FiPlus } from 'react-icons/fi';
import './ProductDetail.css';

const ProductDetail = () => {
  const { addToCart } = useContext(CartContext);
  const { id } = useParams();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const data = await productService.getProductById(id);
        setProduct(data.product);
      } catch (error) {
        console.error('Failed to fetch product', error);
      } finally {
        setLoading(false);
      }
    };
    fetchProduct();
  }, [id]);

  if (loading) {
    return <div className="detail-loading">Loading product details...</div>;
  }

  if (!product) {
    return (
      <div className="detail-error">
        <h2>Product not found</h2>
        <Link to="/products" className="btn btn-primary">Back to Shop</Link>
      </div>
    );
  }

  const hasImage = product.image && product.image.length > 0;

  return (
    <div className="product-detail-page">
      <div className="product-detail-container">
        
        {/* Left: Image Gallery */}
        <div className="product-gallery">
          <div className="main-image">
            {hasImage ? (
              <img src={product.image} alt={product.name} />
            ) : (
              <div className="image-placeholder">
                <span>{product.name.substring(0, 2).toUpperCase()}</span>
              </div>
            )}
          </div>
        </div>

        {/* Right: Product Info */}
        <div className="product-info-panel animate-slide-up">
          <div className="breadcrumb">
            <Link to="/products">Shop</Link> &gt; <span>{product.category_name || 'Beauty'}</span>
          </div>
          
          <p className="brand-name">{product.brand || 'Premium Brand'}</p>
          <h1>{product.name}</h1>
          
          <div className="rating-summary">
            <div className="stars">
              {[1,2,3,4,5].map(star => (
                <FiStar key={star} className={star <= (product.avg_rating || 5) ? 'filled' : ''} />
              ))}
            </div>
            <span>{product.avg_rating || '5.0'} (128 reviews)</span>
          </div>
          
          <h2 className="price">${Number(product.price).toFixed(2)}</h2>
          
          <div className="description">
            <p>{product.description || 'Experience the ultimate beauty treatment with this premium product. Formulated with the finest ingredients to give you the perfect glow.'}</p>
          </div>
          
          <div className="stock-status">
            {product.stock > 0 ? (
              <span className="in-stock">In Stock ({product.stock} available)</span>
            ) : (
              <span className="out-of-stock">Out of Stock</span>
            )}
          </div>

          <div className="purchase-actions">
            <div className="quantity-selector">
              <button onClick={() => setQuantity(Math.max(1, quantity - 1))}><FiMinus /></button>
              <span>{quantity}</span>
              <button onClick={() => setQuantity(Math.min(product.stock, quantity + 1))}><FiPlus /></button>
            </div>
            
            <button 
              className="btn btn-primary add-to-cart-lg" 
              disabled={product.stock === 0}
              onClick={() => addToCart(product, quantity)}
            >
              Add to Cart
            </button>
            
            <button className="btn btn-outline wishlist-lg">
              <FiHeart size={20} />
            </button>
          </div>

          <div className="trust-badges">
            <div className="badge">
              <FiTruck size={24} color="var(--primary)" />
              <div>
                <strong>Free Shipping</strong>
                <p>On orders over $50</p>
              </div>
            </div>
            <div className="badge">
              <FiShield size={24} color="var(--primary)" />
              <div>
                <strong>Authentic</strong>
                <p>100% Genuine Products</p>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Reviews section placeholder */}
      <div className="product-reviews-section">
        <h2>Customer Reviews</h2>
        <div className="empty-reviews">
          <p>No reviews yet. Be the first to review this product!</p>
        </div>
      </div>
    </div>
  );
};

export default ProductDetail;
