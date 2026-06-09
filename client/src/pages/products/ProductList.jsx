import React, { useState, useEffect } from 'react';
import ProductCard from '../../components/product/ProductCard';
import productService from '../../services/productService';
import { FiSearch, FiFilter } from 'react-icons/fi';
import './ProductList.css';

const ProductList = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  
  // This would typically come from an API endpoint
  const categories = ['All', 'Makeup', 'Skincare', 'Hair Care', 'Fragrances', 'Beauty Tools'];
  const [activeCategory, setActiveCategory] = useState('All');

  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      try {
        // In a real app, we'd pass search and category params to the API
        const data = await productService.getProducts();
        setProducts(data.products || []);
      } catch (error) {
        console.error('Failed to fetch products', error);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  // Filter products locally for demo purposes
  const filteredProducts = products.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(search.toLowerCase());
    const matchesCategory = activeCategory === 'All' || product.category_name === activeCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="product-list-page">
      <div className="page-header">
        <h1>Shop All Products</h1>
        <p>Discover our curated collection of premium beauty products.</p>
      </div>

      <div className="product-list-container">
        {/* Sidebar Filters */}
        <aside className="filters-sidebar">
          <div className="search-box">
            <FiSearch className="search-icon" />
            <input 
              type="text" 
              placeholder="Search products..." 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          <div className="filter-group">
            <h3>Categories <FiFilter size={16} /></h3>
            <ul className="category-list">
              {categories.map(cat => (
                <li key={cat}>
                  <button 
                    className={activeCategory === cat ? 'active' : ''}
                    onClick={() => setActiveCategory(cat)}
                  >
                    {cat}
                  </button>
                </li>
              ))}
            </ul>
          </div>
        </aside>

        {/* Product Grid */}
        <div className="product-grid-section">
          <div className="grid-header">
            <span>Showing {filteredProducts.length} results</span>
            <select className="sort-select">
              <option value="newest">Newest Arrivals</option>
              <option value="price-low">Price: Low to High</option>
              <option value="price-high">Price: High to Low</option>
              <option value="rating">Top Rated</option>
            </select>
          </div>

          {loading ? (
            <div className="loading-state">Loading amazing products...</div>
          ) : filteredProducts.length > 0 ? (
            <div className="products-grid">
              {filteredProducts.map(product => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          ) : (
            <div className="empty-state">
              <h3>No products found</h3>
              <p>Try adjusting your search or filters.</p>
              <button className="btn btn-outline" onClick={() => {setSearch(''); setActiveCategory('All');}}>
                Clear Filters
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProductList;
