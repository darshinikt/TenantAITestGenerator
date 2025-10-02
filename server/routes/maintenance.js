// Maintenance requests routes
const express = require('express');
const { v4: uuidv4 } = require('uuid');
const db = require('../database/db');
const { authenticateToken } = require('./auth');

const router = express.Router();

// Get all maintenance requests for user
router.get('/requests', authenticateToken, (req, res) => {
  const userId = req.user.userId;
  const { status, priority, category } = req.query;
  
  let query = 'SELECT * FROM maintenance_requests WHERE user_id = ?';
  let params = [userId];
  
  // Add filters
  if (status) {
    query += ' AND status = ?';
    params.push(status);
  }
  
  if (priority) {
    query += ' AND priority = ?';
    params.push(priority);
  }
  
  if (category) {
    query += ' AND category = ?';
    params.push(category);
  }
  
  query += ' ORDER BY created_at DESC';
  
  db.all(query, params, (err, rows) => {
    if (err) {
      console.error('Database error:', err);
      return res.status(500).json({
        error: 'Internal server error'
      });
    }
    
    // Format response
    const requests = rows.map(row => ({
      id: row.id,
      title: row.title,
      description: row.description,
      priority: row.priority,
      status: row.status,
      category: row.category,
      assignedTo: row.assigned_to,
      estimatedCompletion: row.estimated_completion,
      completedDate: row.completed_date,
      completionNotes: row.completion_notes,
      createdDate: row.created_at.split(' ')[0], // Extract date part
      updatedDate: row.updated_at.split(' ')[0]
    }));
    
    res.json(requests);
  });
});

// Get specific maintenance request
router.get('/requests/:id', authenticateToken, (req, res) => {
  const userId = req.user.userId;
  const requestId = req.params.id;
  
  db.get(
    'SELECT * FROM maintenance_requests WHERE id = ? AND user_id = ?',
    [requestId, userId],
    (err, row) => {
      if (err) {
        console.error('Database error:', err);
        return res.status(500).json({
          error: 'Internal server error'
        });
      }
      
      if (!row) {
        return res.status(404).json({
          error: 'Maintenance request not found'
        });
      }
      
      // Get associated photos
      db.all(
        'SELECT * FROM maintenance_photos WHERE maintenance_request_id = ?',
        [requestId],
        (err, photos) => {
          if (err) {
            console.error('Error fetching photos:', err);
            photos = [];
          }
          
          res.json({
            id: row.id,
            title: row.title,
            description: row.description,
            priority: row.priority,
            status: row.status,
            category: row.category,
            assignedTo: row.assigned_to,
            estimatedCompletion: row.estimated_completion,
            completedDate: row.completed_date,
            completionNotes: row.completion_notes,
            createdDate: row.created_at.split(' ')[0],
            updatedDate: row.updated_at.split(' ')[0],
            photos: photos.map(photo => ({
              id: photo.id,
              url: `/uploads/${photo.file_path}`,
              filename: photo.filename,
              description: photo.description
            }))
          });
        }
      );
    }
  );
});

// Create new maintenance request
router.post('/requests', authenticateToken, (req, res) => {
  const userId = req.user.userId;
  const { title, description, priority, category } = req.body;
  
  // Validate input
  if (!title || !description || !category) {
    return res.status(400).json({
      error: 'Title, description, and category are required'
    });
  }
  
  // Validate priority
  const validPriorities = ['low', 'medium', 'high', 'urgent'];
  if (priority && !validPriorities.includes(priority)) {
    return res.status(400).json({
      error: 'Invalid priority. Must be: low, medium, high, or urgent'
    });
  }
  
  // Validate category
  const validCategories = ['plumbing', 'electrical', 'hvac', 'appliances', 'general', 'pest_control', 'security'];
  if (!validCategories.includes(category)) {
    return res.status(400).json({
      error: 'Invalid category'
    });
  }
  
  // Sanitize HTML to prevent XSS
  const sanitizedTitle = title.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '');
  const sanitizedDescription = description.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '');
  
  const requestId = 'maint_' + uuidv4().substring(0, 8);
  
  db.run(
    `INSERT INTO maintenance_requests (
      id, user_id, title, description, priority, category
    ) VALUES (?, ?, ?, ?, ?, ?)`,
    [requestId, userId, sanitizedTitle, sanitizedDescription, priority || 'medium', category],
    function(err) {
      if (err) {
        console.error('Database error:', err);
        return res.status(500).json({
          error: 'Internal server error'
        });
      }
      
      // Return the created request
      db.get(
        'SELECT * FROM maintenance_requests WHERE id = ?',
        [requestId],
        (err, row) => {
          if (err) {
            console.error('Error fetching created request:', err);
            return res.status(500).json({
              error: 'Request created but error fetching details'
            });
          }
          
          res.status(201).json({
            id: row.id,
            title: row.title,
            description: row.description,
            priority: row.priority,
            status: row.status,
            category: row.category,
            createdDate: row.created_at.split(' ')[0],
            unitId: 'unit_001' // Mock unit ID
          });
        }
      );
    }
  );
});

// Update maintenance request
router.put('/requests/:id', authenticateToken, (req, res) => {
  const userId = req.user.userId;
  const requestId = req.params.id;
  const { title, description, priority } = req.body;
  
  // Check if request exists and belongs to user
  db.get(
    'SELECT * FROM maintenance_requests WHERE id = ? AND user_id = ?',
    [requestId, userId],
    (err, existingRequest) => {
      if (err) {
        console.error('Database error:', err);
        return res.status(500).json({
          error: 'Internal server error'
        });
      }
      
      if (!existingRequest) {
        return res.status(404).json({
          error: 'Maintenance request not found'
        });
      }
      
      // Only allow updates if status is 'open'
      if (existingRequest.status !== 'open') {
        return res.status(400).json({
          error: 'Cannot update request that is no longer open'
        });
      }
      
      // Validate priority if provided
      if (priority) {
        const validPriorities = ['low', 'medium', 'high', 'urgent'];
        if (!validPriorities.includes(priority)) {
          return res.status(400).json({
            error: 'Invalid priority'
          });
        }
      }
      
      // Build update query dynamically
      const updates = [];
      const params = [];
      
      if (title) {
        updates.push('title = ?');
        params.push(title.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, ''));
      }
      
      if (description) {
        updates.push('description = ?');
        params.push(description.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, ''));
      }
      
      if (priority) {
        updates.push('priority = ?');
        params.push(priority);
      }
      
      if (updates.length === 0) {
        return res.status(400).json({
          error: 'No valid fields to update'
        });
      }
      
      updates.push('updated_at = CURRENT_TIMESTAMP');
      params.push(requestId, userId);
      
      const query = `UPDATE maintenance_requests SET ${updates.join(', ')} WHERE id = ? AND user_id = ?`;
      
      db.run(query, params, function(err) {
        if (err) {
          console.error('Database error:', err);
          return res.status(500).json({
            error: 'Internal server error'
          });
        }
        
        // Return updated request
        db.get(
          'SELECT * FROM maintenance_requests WHERE id = ?',
          [requestId],
          (err, row) => {
            if (err) {
              console.error('Error fetching updated request:', err);
              return res.status(500).json({
                error: 'Update successful but error fetching details'
              });
            }
            
            res.json({
              id: row.id,
              title: row.title,
              description: row.description,
              priority: row.priority,
              status: row.status,
              category: row.category,
              updatedDate: row.updated_at.split(' ')[0]
            });
          }
        );
      });
    }
  );
});

// Delete maintenance request
router.delete('/requests/:id', authenticateToken, (req, res) => {
  const userId = req.user.userId;
  const requestId = req.params.id;
  
  // Check if request exists and belongs to user
  db.get(
    'SELECT * FROM maintenance_requests WHERE id = ? AND user_id = ?',
    [requestId, userId],
    (err, existingRequest) => {
      if (err) {
        console.error('Database error:', err);
        return res.status(500).json({
          error: 'Internal server error'
        });
      }
      
      if (!existingRequest) {
        return res.status(404).json({
          error: 'Maintenance request not found'
        });
      }
      
      // Only allow deletion if status is 'open'
      if (existingRequest.status !== 'open') {
        return res.status(400).json({
          error: 'Cannot delete request that is no longer open'
        });
      }
      
      // Delete associated photos first
      db.run(
        'DELETE FROM maintenance_photos WHERE maintenance_request_id = ?',
        [requestId],
        (err) => {
          if (err) {
            console.error('Error deleting photos:', err);
          }
          
          // Delete the request
          db.run(
            'DELETE FROM maintenance_requests WHERE id = ? AND user_id = ?',
            [requestId, userId],
            function(err) {
              if (err) {
                console.error('Database error:', err);
                return res.status(500).json({
                  error: 'Internal server error'
                });
              }
              
              res.json({
                success: true,
                message: 'Maintenance request deleted successfully'
              });
            }
          );
        }
      );
    }
  );
});

module.exports = router;