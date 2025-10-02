// Payment routes
const express = require('express');
const { v4: uuidv4 } = require('uuid');
const db = require('../database/db');
const { authenticateToken } = require('./auth');

const router = express.Router();

// Get payment history
router.get('/history', authenticateToken, (req, res) => {
  const userId = req.user.userId;
  const { status, type, limit = 10, offset = 0 } = req.query;
  
  let query = 'SELECT * FROM payments WHERE user_id = ?';
  let params = [userId];
  
  // Add filters
  if (status) {
    query += ' AND status = ?';
    params.push(status);
  }
  
  if (type) {
    query += ' AND type = ?';
    params.push(type);
  }
  
  query += ' ORDER BY due_date DESC LIMIT ? OFFSET ?';
  params.push(parseInt(limit), parseInt(offset));
  
  db.all(query, params, (err, rows) => {
    if (err) {
      console.error('Database error:', err);
      return res.status(500).json({
        error: 'Internal server error'
      });
    }
    
    const payments = rows.map(row => ({
      id: row.id,
      amount: row.amount,
      date: row.payment_date,
      dueDate: row.due_date,
      type: row.type,
      status: row.status,
      method: row.method,
      transactionId: row.transaction_id,
      description: row.description,
      lateFee: row.late_fee,
      receiptUrl: row.receipt_url
    }));
    
    res.json(payments);
  });
});

// Process payment
router.post('/process', authenticateToken, (req, res) => {
  const userId = req.user.userId;
  const { amount, method, cardToken, paymentFor } = req.body;
  
  // Validate input
  if (!amount || amount <= 0) {
    return res.status(400).json({
      error: 'Valid amount is required'
    });
  }
  
  if (!method) {
    return res.status(400).json({
      error: 'Payment method is required'
    });
  }
  
  const validMethods = ['credit_card', 'bank_transfer', 'check'];
  if (!validMethods.includes(method)) {
    return res.status(400).json({
      error: 'Invalid payment method'
    });
  }
  
  if (method === 'credit_card' && !cardToken) {
    return res.status(400).json({
      error: 'Card token required for credit card payments'
    });
  }
  
  // Find pending payment to update or create new payment
  const paymentId = 'pay_' + uuidv4().substring(0, 8);
  const transactionId = 'txn_' + uuidv4().substring(0, 12);
  
  // Simulate payment processing
  setTimeout(() => {
    // In a real app, you would integrate with payment processor here
    const paymentDate = new Date().toISOString().split('T')[0];
    
    // Check if this is for an existing pending payment
    if (paymentFor) {
      db.run(
        `UPDATE payments SET 
          payment_date = ?, status = 'paid', method = ?, 
          transaction_id = ?, updated_at = CURRENT_TIMESTAMP
        WHERE id = ? AND user_id = ? AND status = 'pending'`,
        [paymentDate, method, transactionId, paymentFor, userId],
        function(err) {
          if (err) {
            console.error('Database error:', err);
            return res.status(500).json({
              error: 'Payment processing failed'
            });
          }
          
          if (this.changes === 0) {
            return res.status(404).json({
              error: 'Payment not found or already processed'
            });
          }
          
          res.json({
            success: true,
            paymentId: paymentFor,
            amount: amount,
            status: 'paid',
            transactionId: transactionId,
            receipt: `/api/payments/receipt/${paymentFor}`
          });
        }
      );
    } else {
      // Create new payment record
      db.run(
        `INSERT INTO payments (
          id, user_id, amount, payment_date, due_date, type, status, 
          method, transaction_id, description
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          paymentId, userId, amount, paymentDate, paymentDate, 
          'other', 'paid', method, transactionId, 'One-time payment'
        ],
        function(err) {
          if (err) {
            console.error('Database error:', err);
            return res.status(500).json({
              error: 'Payment processing failed'
            });
          }
          
          res.json({
            success: true,
            paymentId: paymentId,
            amount: amount,
            status: 'paid',
            transactionId: transactionId,
            receipt: `/api/payments/receipt/${paymentId}`
          });
        }
      );
    }
  }, 1000); // Simulate processing delay
});

// Get payment receipt
router.get('/receipt/:id', authenticateToken, (req, res) => {
  const userId = req.user.userId;
  const paymentId = req.params.id;
  
  db.get(
    'SELECT * FROM payments WHERE id = ? AND user_id = ?',
    [paymentId, userId],
    (err, payment) => {
      if (err) {
        console.error('Database error:', err);
        return res.status(500).json({
          error: 'Internal server error'
        });
      }
      
      if (!payment) {
        return res.status(404).json({
          error: 'Payment not found'
        });
      }
      
      if (payment.status !== 'paid') {
        return res.status(400).json({
          error: 'Receipt not available for unpaid transactions'
        });
      }
      
      // Generate receipt data (in a real app, you'd generate a PDF)
      res.json({
        receiptId: payment.id,
        amount: payment.amount,
        paymentDate: payment.payment_date,
        method: payment.method,
        transactionId: payment.transaction_id,
        description: payment.description,
        tenant: {
          name: req.user.firstName + ' ' + req.user.lastName,
          email: req.user.email
        },
        property: 'Sunset Apartments',
        unit: 'A101'
      });
    }
  );
});

// Get upcoming payments
router.get('/upcoming', authenticateToken, (req, res) => {
  const userId = req.user.userId;
  
  db.all(
    `SELECT * FROM payments 
     WHERE user_id = ? AND status = 'pending' 
     ORDER BY due_date ASC`,
    [userId],
    (err, rows) => {
      if (err) {
        console.error('Database error:', err);
        return res.status(500).json({
          error: 'Internal server error'
        });
      }
      
      const upcomingPayments = rows.map(row => ({
        id: row.id,
        amount: row.amount,
        dueDate: row.due_date,
        type: row.type,
        description: row.description,
        isOverdue: new Date(row.due_date) < new Date()
      }));
      
      res.json(upcomingPayments);
    }
  );
});

module.exports = router;