const cloudinary = require('cloudinary').v2;

cloudinary.config({
  cloud_name: 'dbxyz8fba',
  api_key: '526794571396543',
  api_secret: 'DR6yjnNhuHWBC'
});

cloudinary.api.ping()
  .then(res => console.log('Ping successful:', res))
  .catch(err => console.error('Ping error:', err));
