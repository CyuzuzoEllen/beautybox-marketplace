// =====================================================
// FILE UPLOAD MIDDLEWARE (Multer Configuration)
// =====================================================
// This file configures 'multer' - a library that handles
// file uploads in Express. We use it to let sellers
// upload product images.
//
// Key settings:
//   - Files are saved to the server/uploads/ folder
//   - Only image files are allowed (jpg, png, gif, webp)
//   - Maximum file size is 5MB
//   - Files get unique names to avoid overwriting
// =====================================================

const multer = require('multer');
const path = require('path');

// -------------------------------------------------
// STORAGE CONFIGURATION
// -------------------------------------------------
// Tell multer WHERE to save files and WHAT to name them.
// We save files to the 'uploads' folder with unique names.
// -------------------------------------------------
const storage = multer.diskStorage({
    // Set the destination folder for uploaded files
    destination: function (req, file, cb) {
        // cb = callback. First arg is error (null = no error), second is the folder path
        cb(null, path.join(__dirname, '..', 'uploads'));
    },

    // Set the filename for each uploaded file
    filename: function (req, file, cb) {
        // Create a unique filename using timestamp + random number + original extension
        // Example: product-1699123456789-123456789.jpg
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        const extension = path.extname(file.originalname); // Gets '.jpg', '.png', etc.
        cb(null, 'product-' + uniqueSuffix + extension);
    }
});

// -------------------------------------------------
// FILE FILTER
// -------------------------------------------------
// Only allow image files. Reject everything else.
// This prevents users from uploading dangerous files.
// -------------------------------------------------
const fileFilter = (req, file, cb) => {
    // List of allowed image MIME types
    const allowedTypes = [
        'image/jpeg',   // .jpg, .jpeg files
        'image/png',    // .png files
        'image/gif',    // .gif files
        'image/webp'    // .webp files
    ];

    // Check if the uploaded file's type is in our allowed list
    if (allowedTypes.includes(file.mimetype)) {
        // Accept the file
        cb(null, true);
    } else {
        // Reject the file with a helpful error message
        cb(new Error('Invalid file type. Only JPEG, PNG, GIF, and WebP images are allowed.'), false);
    }
};

// -------------------------------------------------
// CREATE THE MULTER UPLOAD INSTANCE
// -------------------------------------------------
// Combine our storage, filter, and size limit settings
// into a single upload handler we can use in routes.
// -------------------------------------------------
const upload = multer({
    storage: storage,       // Where and how to save files
    fileFilter: fileFilter, // Which files to accept
    limits: {
        fileSize: 5 * 1024 * 1024 // 5MB max file size (5 * 1024 * 1024 bytes)
    }
});

// Export the upload instance
// Usage in routes: upload.single('image') for one file
module.exports = upload;
