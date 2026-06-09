import React from 'react';
import { Link } from 'react-router-dom';

const About = () => {
  return (
    <div style={{maxWidth: '800px', margin: '4rem auto', padding: '2rem', textAlign: 'center'}}>
      <h1 style={{fontSize: '3rem', marginBottom: '1.5rem'}}>About BeautyBox</h1>
      <p style={{fontSize: '1.2rem', lineHeight: '1.8', color: 'var(--text-muted)', marginBottom: '2rem'}}>
        BeautyBox Marketplace is your ultimate destination for premium cosmetics, skincare, and beauty tools. 
        We connect passionate beauty sellers with enthusiasts around the globe. Our mission is to make luxury 
        beauty accessible, authentic, and empowering for everyone.
      </p>
      <Link to="/products" className="btn btn-primary" style={{padding: '1rem 2rem', fontSize: '1.1rem'}}>
        Explore Our Collection
      </Link>
    </div>
  );
};

export default About;
