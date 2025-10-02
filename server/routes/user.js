// User profile routes
const express = require('express');
const db = require('../database/db');
const { authenticateToken } = require('./auth');

const router = express.Router();

// Get user profile
router.get('/profile', authenticateToken, (req, res) => {
  const userId = req.user.userId;
  
  db.get(
    `SELECT 
      id, email, first_name, last_name, role, property_id, unit_number,
      phone_number, emergency_contact_name, emergency_contact_phone,
      lease_start_date, lease_end_date, monthly_rent, security_deposit,
      created_at, updated_at
    FROM users WHERE id = ?`,
    [userId],
    (err, user) => {
      if (err) {
        console.error('Database error:', err);
        return res.status(500).json({
          error: 'Internal server error'
        });
      }
      
      if (!user) {
        return res.status(404).json({
          error: 'User not found'
        });
      }
      
      // Format response
      res.json({
        id: user.id,
        email: user.email,
        firstName: user.first_name,
        lastName: user.last_name,
        role: user.role,
        propertyId: user.property_id,
        unitNumber: user.unit_number,
        phoneNumber: user.phone_number,
        emergencyContact: {
          name: user.emergency_contact_name,
          phone: user.emergency_contact_phone
        },
        leaseInfo: {
          startDate: user.lease_start_date,
          endDate: user.lease_end_date,
          monthlyRent: user.monthly_rent,
          securityDeposit: user.security_deposit
        },
        createdAt: user.created_at,
        updatedAt: user.updated_at
      });
    }
  );
});

// Update user profile
router.put('/profile', authenticateToken, (req, res) => {
  const userId = req.user.userId;
  const {
    firstName,
    lastName,
    phoneNumber,
    emergencyContactName,
    emergencyContactPhone
  } = req.body;
  
  // Validate input
  if (!firstName || !lastName) {
    return res.status(400).json({
      error: 'First name and last name are required'
    });
  }
  
  db.run(
    `UPDATE users SET 
      first_name = ?, last_name = ?, phone_number = ?,
      emergency_contact_name = ?, emergency_contact_phone = ?,
      updated_at = CURRENT_TIMESTAMP
    WHERE id = ?`,
    [firstName, lastName, phoneNumber, emergencyContactName, emergencyContactPhone, userId],
    function(err) {
      if (err) {
        console.error('Database error:', err);
        return res.status(500).json({
          error: 'Internal server error'
        });
      }
      
      if (this.changes === 0) {
        return res.status(404).json({
          error: 'User not found'
        });
      }
      
      res.json({
        success: true,
        message: 'Profile updated successfully'
      });
    }
  );
});

// Get dashboard summary
router.get('/dashboard', authenticateToken, (req, res) => {
  const userId = req.user.userId;
  
  // Get dashboard data in parallel
  const queries = {
    maintenanceRequests: new Promise((resolve, reject) => {
      db.all(
        'SELECT COUNT(*) as total, status FROM maintenance_requests WHERE user_id = ? GROUP BY status',
        [userId],
        (err, rows) => {
          if (err) reject(err);
          else resolve(rows);
        }
      );
    }),
    
    recentPayments: new Promise((resolve, reject) => {
      db.all(
        'SELECT * FROM payments WHERE user_id = ? ORDER BY due_date DESC LIMIT 3',
        [userId],
        (err, rows) => {
          if (err) reject(err);
          else resolve(rows);
        }
      );
    }),
    
    upcomingPayments: new Promise((resolve, reject) => {
      db.all(
        'SELECT * FROM payments WHERE user_id = ? AND status = "pending" ORDER BY due_date ASC LIMIT 3',
        [userId],
        (err, rows) => {
          if (err) reject(err);
          else resolve(rows);
        }
      );
    })
  };
  
  Promise.all([queries.maintenanceRequests, queries.recentPayments, queries.upcomingPayments])
    .then(([maintenanceStats, recentPayments, upcomingPayments]) => {
      // Process maintenance stats
      const maintenanceByStatus = {};
      maintenanceStats.forEach(stat => {
        maintenanceByStatus[stat.status] = stat.total;
      });
      
      res.json({
        maintenance: {
          open: maintenanceByStatus.open || 0,
          inProgress: maintenanceByStatus['in-progress'] || 0,
          completed: maintenanceByStatus.completed || 0,
          total: Object.values(maintenanceByStatus).reduce((sum, count) => sum + count, 0)
        },
        recentPayments: recentPayments.map(payment => ({
          id: payment.id,
          amount: payment.amount,
          date: payment.payment_date,
          dueDate: payment.due_date,
          status: payment.status,
          type: payment.type
        })),
        upcomingPayments: upcomingPayments.map(payment => ({
          id: payment.id,
          amount: payment.amount,
          dueDate: payment.due_date,
          type: payment.type,
          description: payment.description
        }))
      });
    })
    .catch(err => {
      console.error('Dashboard data error:', err);
      res.status(500).json({
        error: 'Internal server error'
      });
    });
});

module.exports = router;