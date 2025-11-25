const express = require('express');
const mongoose = require('mongoose');
const cookieParser = require('cookie-parser');
const cors = require('cors');

const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '.env') });

const app = express();

const PORT = process.env.PORT || 5000;
const MONGO_URI = process.env.MONGO_URI;

// Connect to MongoDB
if (!MONGO_URI) {
  console.warn('MONGO_URI not set in environment. MongoDB connection skipped.');
} else {
  mongoose.connect(MONGO_URI)
    .then(() => console.log('MongoDB connected'))
    .catch(err => console.error('MongoDB connection error:', err));
}

// Middleware
// Configure CORS to allow credentials and reflect the requesting origin
const frontendOrigin = process.env.FRONTEND_URL || 'http://localhost:3000';
const corsOptions = {
  origin: function(origin, callback) {
    // allow requests with no origin (like mobile apps, curl, Postman)
    if (!origin) return callback(null, true);
    if (origin === frontendOrigin) return callback(null, true);
    // you can extend with a whitelist array if needed
    return callback(new Error('CORS policy: This origin is not allowed'), false);
  },
  credentials: true,
  methods: ['GET','HEAD','PUT','PATCH','POST','DELETE','OPTIONS'],
  allowedHeaders: ['Content-Type','Authorization']
};
app.use(cors(corsOptions));
app.use((req, res, next) => {
  res.setHeader("Cross-Origin-Resource-Policy", "cross-origin")
  next();
})
app.use(cookieParser());
app.use(express.json());

// Routes
const userRoutes = require('./routes/user');
const postRoutes = require('./routes/post');
const categoryRoutes = require('./routes/category');
const tagRoutes = require('./routes/tag');
const commentRoutes = require('./routes/comment');

app.use('/api/users', userRoutes);
app.use('/api/posts', postRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/tags', tagRoutes);
app.use('/api/comments', commentRoutes);

app.get('/', (req, res) => res.send('Blogify Backend'));

// Serve uploaded files statically so images are accessible from the frontend
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Generic error handler to return JSON errors (helps surface multer/validator errors)
app.use((err, req, res, next) => {
  console.error('Unhandled error:', err);
  // If multer provided a file filter error it will be available here
  if (err && err.message) {
    return res.status(err.status || 500).json({ message: err.message, errors: err.errors || undefined });
  }
  return res.status(500).json({ message: 'Server error' });
});

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
