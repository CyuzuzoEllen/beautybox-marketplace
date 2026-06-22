import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import productService from '../services/productService';
import ProductCard from '../components/product/ProductCard';
import './Home.css';

const Home = () => {
  const [categories, setCategories] = useState([]);
  const [newArrivals, setNewArrivals] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        // Fetch categories and newest 4 products in parallel
        const [catData, prodData] = await Promise.all([
          productService.getCategories(),
          productService.getProducts({ sort: 'newest', limit: 4 })
        ]);
        
        setCategories(catData.categories || []);
        setNewArrivals(prodData.products || []);
      } catch (error) {
        console.error('Error fetching home data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleCategoryClick = (categoryId) => {
    // Navigate to products page with category filter applied
    // This assumes the products page can read URL query params.
    // If not, it's okay, they will just navigate to /products for now,
    // but ideally we'd pass state or query params.
    navigate(`/products?category=${categoryId}`);
  };

  return (
    <div className="home-container">
      {/* Hero Section */}
      <section className="hero-section">
        <div className="hero-content animate-slide-up">
          <h1>Discover Your True Beauty.</h1>
          <p>Explore the finest cosmetic brands and premium skincare products sourced globally just for you.</p>
          <div className="hero-actions">
            <Link to="/products" className="btn btn-primary">Shop Now</Link>
          </div>
        </div>
        <div className="hero-image animate-fade-in">
          <img src="/assets/hero_beauty.png" alt="Luxury Skincare and Makeup" className="hero-img-element" />
        </div>
      </section>

      {/* Featured Categories */}
      <section className="featured-categories">
        <h2>Shop by Category</h2>
        {loading ? (
          <p>Loading categories...</p>
        ) : (
          <div className="category-grid">
            {categories.map((cat) => (
              <div 
                key={cat.id} 
                className="category-card"
                onClick={() => handleCategoryClick(cat.id)}
              >
                <div 
                  className="category-card-bg"
                  style={{ backgroundImage: cat.image ? `url(${cat.image})` : 'none' }}
                ></div>
                <div className="category-card-overlay"></div>
                <div className="category-card-content">
                  <h3>{cat.name}</h3>
                  <span className="category-count">{cat.product_count} Products</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* New Arrivals Section */}
      <section className="new-arrivals-section">
        <div className="section-header">
          <h2>Trending Now</h2>
          <Link to="/products" className="view-all-link">View All</Link>
        </div>
        
        {loading ? (
          <p>Loading products...</p>
        ) : (
          <div className="products-grid">
            {newArrivals.map(product => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
};

export default Home;
