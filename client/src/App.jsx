import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import About from './pages/About';
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';
import ForgotPassword from './pages/auth/ForgotPassword';
import ProductList from './pages/products/ProductList';
import ProductDetail from './pages/products/ProductDetail';
import Cart from './pages/cart/Cart';
import Checkout from './pages/cart/Checkout';
import Profile from './pages/customer/Profile';
import OrderHistory from './pages/customer/OrderHistory';
import Wishlist from './pages/customer/Wishlist';
import SellerDashboard from './pages/seller/SellerDashboard';
import ManageProducts from './pages/seller/ManageProducts';
import SellerOrders from './pages/seller/SellerOrders';
import AdminDashboard from './pages/admin/AdminDashboard';
import ManageUsers from './pages/admin/ManageUsers';
import ManageAllProducts from './pages/admin/ManageAllProducts';
import ManageAllOrders from './pages/admin/ManageAllOrders';
import Navbar from './components/Navbar';
import './App.css';

function App() {
  return (
    <Router>
      <div className="app-container">
        <Navbar />
        <main className="main-content">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/about" element={<About />} />
            <Route path="/categories" element={<ProductList />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/products" element={<ProductList />} />
            <Route path="/products/:id" element={<ProductDetail />} />
            <Route path="/cart" element={<Cart />} />
            <Route path="/checkout" element={<Checkout />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/orders" element={<OrderHistory />} />
            <Route path="/wishlist" element={<Wishlist />} />
            <Route path="/seller/dashboard" element={<SellerDashboard />} />
            <Route path="/seller/products" element={<ManageProducts />} />
            <Route path="/seller/orders" element={<SellerOrders />} />
            <Route path="/admin/dashboard" element={<AdminDashboard />} />
            <Route path="/admin/users" element={<ManageUsers />} />
            <Route path="/admin/products" element={<ManageAllProducts />} />
            <Route path="/admin/orders" element={<ManageAllOrders />} />

            {/* Add more routes here as we build them */}
            <Route path="*" element={<div style={{padding: '2rem', textAlign: 'center'}}><h2>404 - Page Not Found</h2></div>} />
          </Routes>

        </main>
      </div>
    </Router>
  );
}

export default App;
