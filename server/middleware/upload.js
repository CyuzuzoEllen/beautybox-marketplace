// =====================================================
// FILE UPLOAD MIDDLEWARE (Cloudinary Configuration)
// =====================================================
// This file configures 'multer' with Cloudinary storage.
// Instead of saving images to the local server disk,
// images are uploaded directly to Cloudinary cloud storage.
//
// This means images are safe even if the server restarts!
//
// Key settings:
//   - Images are stored in the 'beautybox' folder on Cloudinary
//   - Only image files are allowed (jpg, png, gif, webp)
//   - Maximum file size is 5MB
// =====================================================

const multer = require('multer');
const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');

// Configure Cloudinary with credentials from .env
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
});

// -------------------------------------------------
// CLOUDINARY STORAGE CONFIGURATION
// -------------------------------------------------
// Instead of saving to disk, files go straight to
// Cloudinary and we get back a permanent URL.
// -------------------------------------------------
const storage = new CloudinaryStorage({
    cloudinary: cloudinary,
    params: {
        folder: 'beautybox',                              // Folder name in your Cloudinary account
        allowed_formats: ['jpg', 'jpeg', 'png', 'gif', 'webp'],
        resource_type: 'image',
        transformation: [{ width: 800, crop: 'limit' }]  // Optional: resize large images
    }
});

// -------------------------------------------------
// CREATE THE MULTER UPLOAD INSTANCE
// -------------------------------------------------
const upload = multer({
    storage: storage,
    limits: {
        fileSize: 5 * 1024 * 1024 // 5MB max file size
    }
});

// Export the upload instance
// Usage in routes: upload.single('image') for one file
// After upload, use req.file.path to get the Cloudinary URL
module.exports = upload;
