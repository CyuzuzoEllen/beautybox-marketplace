import React, { useState, useEffect } from 'react';
import ProductCard from '../../components/product/ProductCard';
import productService from '../../services/productService';
import { FiSearch, FiFilter } from 'react-icons/fi';
import './ProductList.css';

const ProductList = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [categories, setCategories] = useState([]);
  
  // Filter state
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [activeCategory, setActiveCategory] = useState('');
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');
  const [debouncedMinPrice, setDebouncedMinPrice] = useState('');
  const [debouncedMaxPrice, setDebouncedMaxPrice] = useState('');
  const [sort, setSort] = useState('newest');

  // Debounce search and price inputs
  useEffect(() => {
    const timerId = setTimeout(() => {
      setDebouncedSearch(search);
      setDebouncedMinPrice(minPrice);
      setDebouncedMaxPrice(maxPrice);
    }, 500);

    return () => {
      clearTimeout(timerId);
    };
  }, [search, minPrice, maxPrice]);

  // Fetch categories on mount
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const data = await productService.getCategories();
        setCategories(data.categories || []);
      } catch (error) {
        console.error('Failed to fetch categories', error);
      }
    };
    fetchCategories();
  }, []);

  // Fetch products when filters change
  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      try {
        const params = {};
        if (debouncedSearch) params.search = debouncedSearch;
        if (activeCategory) params.category = activeCategory;
        if (debouncedMinPrice) params.min_price = debouncedMinPrice;
        if (debouncedMaxPrice) params.max_price = debouncedMaxPrice;
        if (sort) params.sort = sort;

        const data = await productService.getProducts(params);
        setProducts(data.products || []);
      } catch (error) {
        console.error('Failed to fetch products', error);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, [debouncedSearch, activeCategory, debouncedMinPrice, debouncedMaxPrice, sort]);

  const clearFilters = () => {
    setSearch('');
    setActiveCategory('');
    setMinPrice('');
    setMaxPrice('');
    setSort('newest');
  };

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
              <li>
                <button 
                  className={activeCategory === '' ? 'active' : ''}
                  onClick={() => setActiveCategory('')}
                >
                  All Products
                </button>
              </li>
              {categories.map(cat => (
                <li key={cat.id}>
                  <button 
                    className={activeCategory === cat.id ? 'active' : ''}
                    onClick={() => setActiveCategory(cat.id)}
                  >
                    {cat.name} <span className="cat-count">({cat.product_count})</span>
                  </button>
                </li>
              ))}
            </ul>
          </div>

          <div className="filter-group price-filter-group">
            <h3>Price Range (RWF)</h3>
            <div className="price-inputs">
              <input 
                type="number" 
                placeholder="Min" 
                value={minPrice}
                onChange={(e) => setMinPrice(e.target.value)}
                min="0"
              />
              <span>-</span>
              <input 
                type="number" 
                placeholder="Max" 
                value={maxPrice}
                onChange={(e) => setMaxPrice(e.target.value)}
                min="0"
              />
            </div>
          </div>
          
          <button className="btn btn-outline clear-filters-btn" onClick={clearFilters}>
            Clear All Filters
          </button>
        </aside>

        {/* Product Grid */}
        <div className="product-grid-section">
          <div className="grid-header">
            <span>Showing {products.length} results</span>
            <select 
              className="sort-select" 
              value={sort}
              onChange={(e) => setSort(e.target.value)}
            >
              <option value="newest">Newest Arrivals</option>
              <option value="price_asc">Price: Low to High</option>
              <option value="price_desc">Price: High to Low</option>
            </select>
          </div>

          {loading ? (
            <div className="loading-state">Loading amazing products...</div>
          ) : products.length > 0 ? (
            <div className="products-grid">
              {products.map(product => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          ) : (
            <div className="empty-state">
              <h3>No products found</h3>
              <p>Try adjusting your search or filters.</p>
              <button className="btn btn-primary" onClick={clearFilters}>
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
