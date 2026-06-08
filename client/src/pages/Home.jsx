import React from 'react';
import { Link } from 'react-router-dom';
import './Home.css';

const Home = () => {
  return (
    <div className="home-container">
      {/* Hero Section */}
      <section className="hero-section">
        <div className="hero-content animate-slide-up">
          <h1>Discover Your True Beauty.</h1>
          <p>Explore the finest cosmetic brands and premium skincare products sourced globally just for you.</p>
          <div className="hero-actions">
            <Link to="/products" className="btn btn-primary">Shop Now</Link>
            <Link to="/about" className="btn btn-outline">Learn More</Link>
          </div>
        </div>
        <div className="hero-image animate-fade-in">
          {/* We use a placeholder styled with CSS for now */}
          <div className="hero-image-placeholder"></div>
        </div>
      </section>

      {/* Featured Categories */}
      <section className="featured-categories">
        <h2>Shop by Category</h2>
        <div className="category-grid">
          {['Makeup', 'Skincare', 'Hair Care', 'Fragrances'].map((cat, idx) => (
            <div key={idx} className="category-card">
              <div className="category-card-bg"></div>
              <h3>{cat}</h3>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};

export default Home;
