const express = require('express');
const path = require('path');
const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// Simple user data for demo
const users = [
  {
    id: 1,
    email: 'john.doe@email.com',
    password: 'TenantPass123!',
    name: 'John Doe',
    role: 'tenant'
  }
];

const maintenanceRequests = [];
const payments = [];
const documents = [];

// Auth routes
app.post('/auth/login', (req, res) => {
  const { email, password } = req.body;
  
  const user = users.find(u => u.email === email && u.password === password);
  if (user) {
    res.json({
      success: true,
      token: 'demo-token-123',
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role
      }
    });
  } else {
    res.status(401).json({ error: 'Invalid credentials' });
  }
});

// User routes
app.get('/user/profile', (req, res) => {
  res.json({
    id: 1,
    email: 'john.doe@email.com',
    name: 'John Doe',
    phone: '(555) 123-4567',
    unit: 'A-101',
    rent: '1,200',
    lease_term: '12 months'
  });
});

// Maintenance routes
app.get('/maintenance', (req, res) => {
  res.json(maintenanceRequests);
});

app.post('/maintenance', (req, res) => {
  const request = {
    id: maintenanceRequests.length + 1,
    ...req.body,
    status: 'open',
    created_at: new Date().toISOString()
  };
  maintenanceRequests.push(request);
  res.json(request);
});

// Payment routes
app.get('/payments', (req, res) => {
  res.json(payments);
});

app.post('/payments', (req, res) => {
  const payment = {
    id: payments.length + 1,
    ...req.body,
    status: 'completed',
    payment_date: new Date().toISOString(),
    created_at: new Date().toISOString()
  };
  payments.push(payment);
  res.json(payment);
});

// Document routes
app.get('/documents', (req, res) => {
  res.json(documents);
});

app.post('/documents', (req, res) => {
  const document = {
    id: documents.length + 1,
    ...req.body,
    created_at: new Date().toISOString()
  };
  documents.push(document);
  res.json(document);
});

app.delete('/documents/:id', (req, res) => {
  const index = documents.findIndex(d => d.id === parseInt(req.params.id));
  if (index !== -1) {
    documents.splice(index, 1);
    res.json({ success: true });
  } else {
    res.status(404).json({ error: 'Document not found' });
  }
});

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Serve frontend
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public/index.html'));
});

// Start server - bind to all interfaces
app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Simple Tenant Portal running on http://localhost:${PORT}`);
  console.log(`📁 Serving files from: ${path.join(__dirname, 'public')}`);
  console.log(`🔧 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`🌐 Server listening on all interfaces (0.0.0.0:${PORT})`);
});

module.exports = app;