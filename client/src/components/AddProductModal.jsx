import React, { useState, useEffect } from 'react';
import { FiX, FiUploadCloud } from 'react-icons/fi';
import { toast } from 'react-toastify';
import api from '../services/api';
import './AddProductModal.css';

const AddProductModal = ({ isOpen, onClose, onSuccess }) => {
  const [categories, setCategories] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    category_id: '',
    price: '',
    stock: '',
    description: '',
  });
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);

  useEffect(() => {
    if (isOpen) {
      fetchCategories();
      // Reset form
      setFormData({
        name: '',
        category_id: '',
        price: '',
        stock: '',
        description: '',
      });
      setImageFile(null);
      setImagePreview(null);
    }
  }, [isOpen]);

  const fetchCategories = async () => {
    try {
      const response = await api.get('/categories');
      setCategories(response.data.categories);
    } catch (error) {
      console.error('Failed to load categories', error);
      toast.error('Failed to load categories');
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast.error('Image must be less than 5MB');
        return;
      }
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.category_id) {
      return toast.error('Please select a category');
    }

    setIsLoading(true);

    try {
      // Using FormData because we are sending a file
      const data = new FormData();
      data.append('name', formData.name);
      data.append('category_id', formData.category_id);
      data.append('price', formData.price);
      data.append('stock', formData.stock);
      data.append('description', formData.description);
      
      if (imageFile) {
        data.append('image', imageFile);
      }

      await api.post('/products', data, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });

      toast.success('Product created successfully!');
      onSuccess();
      onClose();
    } catch (error) {
      console.error('Error creating product:', error);
      toast.error(error.response?.data?.message || 'Failed to create product');
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay">
      <div className="modal-container animate-fade-in">
        <div className="modal-header">
          <h2>Add New Product</h2>
          <button onClick={onClose} className="close-btn"><FiX size={24} /></button>
        </div>

        <form onSubmit={handleSubmit} className="modal-body">
          <div className="form-group image-upload-group">
            <label>Product Image</label>
            <div className="image-upload-area" onClick={() => document.getElementById('imageUpload').click()}>
              {imagePreview ? (
                <img src={imagePreview} alt="Preview" className="image-preview" />
              ) : (
                <div className="upload-placeholder">
                  <FiUploadCloud size={32} />
                  <span>Click to upload image</span>
                  <small>JPG, PNG or WEBP (Max 5MB)</small>
                </div>
              )}
              <input 
                type="file" 
                id="imageUpload" 
                accept="image/*" 
                onChange={handleImageChange} 
                style={{ display: 'none' }} 
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Product Name</label>
              <input 
                type="text" 
                name="name" 
                value={formData.name} 
                onChange={handleChange} 
                required 
                placeholder="e.g. Matte Lipstick"
              />
            </div>
            
            <div className="form-group">
              <label>Category</label>
              <select 
                name="category_id" 
                value={formData.category_id} 
                onChange={handleChange}
                required
              >
                <option value="">Select a category</option>
                {categories.map(cat => (
                  <option key={cat.id} value={cat.id}>{cat.name}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Price ($)</label>
              <input 
                type="number" 
                name="price" 
                value={formData.price} 
                onChange={handleChange} 
                required 
                min="0.01" 
                step="0.01"
                placeholder="0.00"
              />
            </div>
            
            <div className="form-group">
              <label>Stock Quantity</label>
              <input 
                type="number" 
                name="stock" 
                value={formData.stock} 
                onChange={handleChange} 
                required 
                min="0"
                placeholder="10"
              />
            </div>
          </div>

          <div className="form-group">
            <label>Description</label>
            <textarea 
              name="description" 
              value={formData.description} 
              onChange={handleChange} 
              rows="4" 
              placeholder="Describe your product..."
              required
            ></textarea>
          </div>

          <div className="modal-footer">
            <button type="button" className="btn btn-outline" onClick={onClose} disabled={isLoading}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary" disabled={isLoading}>
              {isLoading ? 'Saving...' : 'Save Product'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddProductModal;
