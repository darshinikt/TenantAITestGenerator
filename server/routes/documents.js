// Documents routes
const express = require('express');
const { v4: uuidv4 } = require('uuid');
const db = require('../database/db');
const { authenticateToken } = require('./auth');

const router = express.Router();

// Get all documents for user
router.get('/', authenticateToken, (req, res) => {
  const userId = req.user.userId;
  const { type } = req.query;
  
  let query = 'SELECT * FROM documents WHERE user_id = ? OR uploaded_by = ?';
  let params = [userId, userId];
  
  if (type) {
    query += ' AND type = ?';
    params.push(type);
  }
  
  query += ' ORDER BY upload_date DESC';
  
  db.all(query, params, (err, rows) => {
    if (err) {
      console.error('Database error:', err);
      return res.status(500).json({
        error: 'Internal server error'
      });
    }
    
    const documents = rows.map(row => ({
      id: row.id,
      name: row.name,
      type: row.type,
      description: row.description,
      url: `/uploads/${row.file_path}`,
      uploadDate: row.upload_date,
      size: row.file_size,
      mimeType: row.mime_type,
      status: row.status,
      uploadedBy: {
        id: row.uploaded_by,
        name: 'System' // In real app, you'd join with users table
      }
    }));
    
    res.json(documents);
  });
});

// Upload document
router.post('/upload', authenticateToken, (req, res) => {
  const userId = req.user.userId;
  const { name, type, description, file } = req.body;
  
  // Validate input
  if (!name || !type || !file) {
    return res.status(400).json({
      error: 'Name, type, and file are required'
    });
  }
  
  const validTypes = ['lease', 'insurance', 'receipt', 'inspection', 'addendum', 'other'];
  if (!validTypes.includes(type)) {
    return res.status(400).json({
      error: 'Invalid document type'
    });
  }
  
  // In a real app, you would:
  // 1. Validate file format and size
  // 2. Scan for viruses
  // 3. Store file securely
  // 4. Generate thumbnail if image
  
  const documentId = 'doc_' + uuidv4().substring(0, 8);
  const fileName = `${documentId}_${name.replace(/[^a-zA-Z0-9.]/g, '_')}`;
  const filePath = `documents/${fileName}`;
  const fileSize = file.length; // Mock file size
  
  db.run(
    `INSERT INTO documents (
      id, user_id, name, type, description, file_path, 
      file_size, mime_type, uploaded_by
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      documentId, userId, name, type, description, filePath,
      fileSize, 'application/pdf', userId
    ],
    function(err) {
      if (err) {
        console.error('Database error:', err);
        return res.status(500).json({
          error: 'Document upload failed'
        });
      }
      
      res.status(201).json({
        success: true,
        document: {
          id: documentId,
          name: name,
          type: type,
          description: description,
          url: `/uploads/${filePath}`,
          uploadDate: new Date().toISOString().split('T')[0],
          status: 'active'
        }
      });
    }
  );
});

// Download document
router.get('/download/:id', authenticateToken, (req, res) => {
  const userId = req.user.userId;
  const documentId = req.params.id;
  
  db.get(
    'SELECT * FROM documents WHERE id = ? AND (user_id = ? OR uploaded_by = ?)',
    [documentId, userId, userId],
    (err, document) => {
      if (err) {
        console.error('Database error:', err);
        return res.status(500).json({
          error: 'Internal server error'
        });
      }
      
      if (!document) {
        return res.status(404).json({
          error: 'Document not found'
        });
      }
      
      // In a real app, you would serve the actual file
      res.json({
        id: document.id,
        name: document.name,
        type: document.type,
        url: `/uploads/${document.file_path}`,
        downloadUrl: `/api/documents/file/${document.id}`,
        size: document.file_size,
        mimeType: document.mime_type
      });
    }
  );
});

// Delete document
router.delete('/:id', authenticateToken, (req, res) => {
  const userId = req.user.userId;
  const documentId = req.params.id;
  
  db.get(
    'SELECT * FROM documents WHERE id = ? AND uploaded_by = ?',
    [documentId, userId],
    (err, document) => {
      if (err) {
        console.error('Database error:', err);
        return res.status(500).json({
          error: 'Internal server error'
        });
      }
      
      if (!document) {
        return res.status(404).json({
          error: 'Document not found or you do not have permission to delete it'
        });
      }
      
      // Only allow deletion of user-uploaded documents
      if (document.uploaded_by !== userId) {
        return res.status(403).json({
          error: 'You can only delete documents you uploaded'
        });
      }
      
      db.run(
        'DELETE FROM documents WHERE id = ? AND uploaded_by = ?',
        [documentId, userId],
        function(err) {
          if (err) {
            console.error('Database error:', err);
            return res.status(500).json({
              error: 'Internal server error'
            });
          }
          
          res.json({
            success: true,
            message: 'Document deleted successfully'
          });
        }
      );
    }
  );
});

module.exports = router;