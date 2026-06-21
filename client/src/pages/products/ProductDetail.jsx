import React, { useState, useEffect, useContext } from 'react';
import { useParams, Link } from 'react-router-dom';
import productService from '../../services/productService';
import reviewService from '../../services/reviewService';
import { CartContext } from '../../context/CartContext';
import { AuthContext } from '../../context/AuthContext';
import { FiHeart, FiStar, FiTruck, FiShield, FiMinus, FiPlus, FiMessageSquare } from 'react-icons/fi';
import { toast } from 'react-toastify';
import { formatRWF } from '../../utils/currency';
import './ProductDetail.css';

const ProductDetail = () => {
  const { addToCart } = useContext(CartContext);
  const { user } = useContext(AuthContext);
  const { id } = useParams();
  
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  
  // Review state
  const [reviewsData, setReviewsData] = useState({ reviews: [], average_rating: 0, total_reviews: 0 });
  const [reviewForm, setReviewForm] = useState({ rating: 5, comment: '' });
  const [isSubmittingReview, setIsSubmittingReview] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [productRes, reviewsRes] = await Promise.all([
          productService.getProductById(id),
          reviewService.getProductReviews(id).catch(err => {
            console.error('Failed to fetch reviews', err);
            return { reviews: [], average_rating: 0, total_reviews: 0 };
          })
        ]);
        
        setProduct(productRes.product);
        setReviewsData(reviewsRes);
      } catch (error) {
        console.error('Failed to fetch product data', error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [id]);

  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    if (!user) {
      toast.error('Please log in to leave a review.');
      return;
    }
    
    if (user.role === 'seller' && product.seller_id === user.id) {
      toast.error('You cannot review your own product.');
      return;
    }

    setIsSubmittingReview(true);
    try {
      const newReview = await reviewService.createReview({
        product_id: product.id,
        rating: reviewForm.rating,
        comment: reviewForm.comment
      });

      // Update local state to show the new review instantly
      const updatedReviews = [
        {
          ...newReview.review,
          customer_name: user.name,
          customer_avatar: user.avatar
        },
        ...reviewsData.reviews
      ];
      
      const newTotal = reviewsData.total_reviews + 1;
      const newAvg = ((reviewsData.average_rating * reviewsData.total_reviews) + reviewForm.rating) / newTotal;

      setReviewsData({
        reviews: updatedReviews,
        total_reviews: newTotal,
        average_rating: newAvg
      });

      setReviewForm({ rating: 5, comment: '' });
      toast.success('Thank you for your review!');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to submit review.');
    } finally {
      setIsSubmittingReview(false);
    }
  };

  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString('en-US', options);
  };

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
  
  // Check if user already reviewed
  const hasUserReviewed = user && reviewsData.reviews.some(r => r.customer_id === user.id);
  const canReview = user && user.role === 'customer' && !hasUserReviewed && product.seller_id !== user.id;

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
                <FiStar key={star} className={star <= Math.round(reviewsData.average_rating) ? 'filled' : ''} />
              ))}
            </div>
            <span>
              {reviewsData.average_rating > 0 ? reviewsData.average_rating.toFixed(1) : 'No rating'} 
              {' '}({reviewsData.total_reviews} review{reviewsData.total_reviews !== 1 ? 's' : ''})
            </span>
          </div>
          
          <h2 className="price">{formatRWF(product.price)}</h2>
          
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
      
      {/* Customer Reviews Section */}
      <div className="product-reviews-section">
        <div className="reviews-header">
          <h2>Customer Reviews</h2>
          <div className="reviews-overview">
            <div className="big-rating">
              <span className="rating-number">{reviewsData.average_rating > 0 ? reviewsData.average_rating.toFixed(1) : '0.0'}</span>
              <div className="stars lg">
                {[1,2,3,4,5].map(star => (
                  <FiStar key={star} className={star <= Math.round(reviewsData.average_rating) ? 'filled' : ''} />
                ))}
              </div>
              <span className="review-count">Based on {reviewsData.total_reviews} reviews</span>
            </div>
          </div>
        </div>

        <div className="reviews-content">
          {/* Review Form */}
          <div className="write-review-container">
            <h3>Write a Review</h3>
            {canReview ? (
              <form className="review-form" onSubmit={handleReviewSubmit}>
                <div className="rating-input">
                  <label>Overall Rating</label>
                  <div className="star-selector">
                    {[1,2,3,4,5].map(star => (
                      <FiStar 
                        key={star} 
                        className={star <= reviewForm.rating ? 'filled active' : ''}
                        onClick={() => setReviewForm({...reviewForm, rating: star})}
                        onMouseEnter={(e) => {
                          const stars = e.currentTarget.parentElement.children;
                          for(let i=0; i<stars.length; i++) {
                            stars[i].classList.toggle('hover', i < star);
                          }
                        }}
                        onMouseLeave={(e) => {
                          const stars = e.currentTarget.parentElement.children;
                          for(let i=0; i<stars.length; i++) {
                            stars[i].classList.remove('hover');
                          }
                        }}
                      />
                    ))}
                  </div>
                </div>
                
                <div className="form-group">
                  <label htmlFor="comment">Your Review</label>
                  <textarea 
                    id="comment"
                    rows="4" 
                    placeholder="What did you like or dislike? How did this product work for you?"
                    value={reviewForm.comment}
                    onChange={(e) => setReviewForm({...reviewForm, comment: e.target.value})}
                    required
                  ></textarea>
                </div>
                
                <button 
                  type="submit" 
                  className="btn btn-primary submit-review-btn"
                  disabled={isSubmittingReview}
                >
                  {isSubmittingReview ? 'Submitting...' : 'Post Review'}
                </button>
              </form>
            ) : !user ? (
              <div className="review-auth-prompt">
                <FiMessageSquare className="prompt-icon" />
                <p>Please log in to leave a review.</p>
                <Link to="/login" className="btn btn-outline">Log In</Link>
              </div>
            ) : hasUserReviewed ? (
              <div className="review-auth-prompt success">
                <p>You have already reviewed this product. Thank you!</p>
              </div>
            ) : (
              <div className="review-auth-prompt">
                <p>Only customers can leave reviews.</p>
              </div>
            )}
          </div>

          {/* Review List */}
          <div className="reviews-list">
            {reviewsData.reviews.length === 0 ? (
              <div className="empty-reviews">
                <p>No reviews yet. Be the first to review this product!</p>
              </div>
            ) : (
              reviewsData.reviews.map(review => (
                <div key={review.id} className="review-card">
                  <div className="review-card-header">
                    <div className="reviewer-info">
                      <div className="reviewer-avatar">
                        {review.customer_avatar ? (
                          <img src={review.customer_avatar} alt={review.customer_name} />
                        ) : (
                          <span>{(review.customer_name || 'U').charAt(0).toUpperCase()}</span>
                        )}
                      </div>
                      <div className="reviewer-details">
                        <span className="reviewer-name">{review.customer_name}</span>
                        <span className="review-date">{formatDate(review.created_at)}</span>
                      </div>
                    </div>
                    <div className="stars sm">
                      {[1,2,3,4,5].map(star => (
                        <FiStar key={star} className={star <= review.rating ? 'filled' : ''} />
                      ))}
                    </div>
                  </div>
                  <div className="review-body">
                    <p>{review.comment}</p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetail;
