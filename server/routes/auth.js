// Authentication routes
const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('../database/db');

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';

// Login endpoint
router.post('/login', (req, res) => {
  const { email, password } = req.body;
  
  // Validate input
  if (!email || !password) {
    return res.status(400).json({
      error: 'Email and password are required'
    });
  }
  
  // Validate email format
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return res.status(400).json({
      error: 'Invalid email format'
    });
  }
  
  // Find user in database
  db.get(
    'SELECT * FROM users WHERE email = ?',
    [email],
    (err, user) => {
      if (err) {
        console.error('Database error:', err);
        return res.status(500).json({
          error: 'Internal server error'
        });
      }
      
      if (!user) {
        return res.status(401).json({
          error: 'Invalid email or password'
        });
      }
      
      // Verify password
      bcrypt.compare(password, user.password_hash, (err, isValid) => {
        if (err) {
          console.error('Password comparison error:', err);
          return res.status(500).json({
            error: 'Internal server error'
          });
        }
        
        if (!isValid) {
          return res.status(401).json({
            error: 'Invalid email or password'
          });
        }
        
        // Generate JWT token
        const token = jwt.sign(
          { 
            userId: user.id,
            email: user.email,
            role: user.role
          },
          JWT_SECRET,
          { expiresIn: '24h' }
        );
        
        // Return user data and token
        res.json({
          success: true,
          user: {
            id: user.id,
            email: user.email,
            firstName: user.first_name,
            lastName: user.last_name,
            role: user.role,
            propertyId: user.property_id,
            unitNumber: user.unit_number
          },
          token,
          expiresIn: '24h'
        });
      });
    }
  );
});

// Logout endpoint (client-side token invalidation)
router.post('/logout', (req, res) => {
  res.json({
    success: true,
    message: 'Logged out successfully'
  });
});

// Password reset request
router.post('/forgot-password', (req, res) => {
  const { email } = req.body;
  
  if (!email) {
    return res.status(400).json({
      error: 'Email is required'
    });
  }
  
  // In a real application, you would:
  // 1. Generate a reset token
  // 2. Save it to database with expiration
  // 3. Send email with reset link
  
  // For demo purposes, just return success
  res.json({
    message: 'Password reset email sent'
  });
});

// Token validation endpoint
router.get('/validate', authenticateToken, (req, res) => {
  res.json({
    valid: true,
    user: req.user
  });
});

// Middleware to authenticate JWT tokens
function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  
  if (!token) {
    return res.status(401).json({
      error: 'Access token required'
    });
  }
  
  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(401).json({
        error: 'Invalid or expired token'
      });
    }
    
    req.user = user;
    next();
  });
}

module.exports = router;
module.exports.authenticateToken = authenticateToken;