// SQLite Database Connection and Setup
const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.join(__dirname, 'tenant_management.db');

// Create and configure database connection
const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('Error opening database:', err);
  } else {
    console.log('📄 Connected to SQLite database');
    
    // Enable foreign keys
    db.run('PRAGMA foreign_keys = ON');
    
    // Initialize tables
    initializeTables();
  }
});

function initializeTables() {
  const tableCount = { created: 0, total: 5 };
  
  function onTableCreated() {
    tableCount.created++;
    if (tableCount.created === tableCount.total) {
      console.log('📋 Database tables initialized');
      // Insert sample data after all tables are created
      setTimeout(insertSampleData, 100);
    }
  }

  // Users table
  db.run(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      email TEXT UNIQUE NOT NULL,
      password_hash TEXT NOT NULL,
      first_name TEXT NOT NULL,
      last_name TEXT NOT NULL,
      role TEXT DEFAULT 'tenant',
      property_id TEXT,
      unit_number TEXT,
      phone_number TEXT,
      emergency_contact_name TEXT,
      emergency_contact_phone TEXT,
      lease_start_date DATE,
      lease_end_date DATE,
      monthly_rent DECIMAL(10,2),
      security_deposit DECIMAL(10,2),
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `, onTableCreated);

  // Maintenance requests table
  db.run(`
    CREATE TABLE IF NOT EXISTS maintenance_requests (
      id TEXT PRIMARY KEY,
      user_id INTEGER,
      title TEXT NOT NULL,
      description TEXT NOT NULL,
      priority TEXT DEFAULT 'medium',
      status TEXT DEFAULT 'open',
      category TEXT NOT NULL,
      assigned_to TEXT,
      estimated_completion DATE,
      completed_date DATE,
      completion_notes TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users (id)
    )
  `, onTableCreated);

  // Payments table
  db.run(`
    CREATE TABLE IF NOT EXISTS payments (
      id TEXT PRIMARY KEY,
      user_id INTEGER,
      amount DECIMAL(10,2) NOT NULL,
      payment_date DATE,
      due_date DATE NOT NULL,
      type TEXT DEFAULT 'rent',
      status TEXT DEFAULT 'pending',
      method TEXT,
      transaction_id TEXT,
      description TEXT,
      late_fee DECIMAL(10,2) DEFAULT 0.00,
      receipt_url TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users (id)
    )
  `, onTableCreated);

  // Documents table
  db.run(`
    CREATE TABLE IF NOT EXISTS documents (
      id TEXT PRIMARY KEY,
      user_id INTEGER,
      name TEXT NOT NULL,
      type TEXT NOT NULL,
      description TEXT,
      file_path TEXT NOT NULL,
      file_size INTEGER,
      mime_type TEXT,
      status TEXT DEFAULT 'active',
      uploaded_by INTEGER,
      upload_date DATE DEFAULT CURRENT_DATE,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users (id),
      FOREIGN KEY (uploaded_by) REFERENCES users (id)
    )
  `, onTableCreated);

  // Maintenance photos table
  db.run(`
    CREATE TABLE IF NOT EXISTS maintenance_photos (
      id TEXT PRIMARY KEY,
      maintenance_request_id TEXT,
      file_path TEXT NOT NULL,
      filename TEXT NOT NULL,
      description TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (maintenance_request_id) REFERENCES maintenance_requests (id)
    )
  `, onTableCreated);
}

function insertSampleData() {
  const bcrypt = require('bcryptjs');
  
  // Check if sample data already exists
  db.get('SELECT COUNT(*) as count FROM users', (err, row) => {
    if (err) {
      console.error('Error checking sample data:', err);
      return;
    }
    
    if (row.count > 0) {
      console.log('📊 Sample data already exists');
      return;
    }
    
    console.log('📝 Inserting sample data...');
    
    // Hash passwords
    const tenantPassword = bcrypt.hashSync('TenantPass123!', 10);
    const adminPassword = bcrypt.hashSync('AdminPass789!', 10);
    
    // Insert sample users
    const users = [
      {
        email: 'john.doe@email.com',
        password: tenantPassword,
        firstName: 'John',
        lastName: 'Doe',
        role: 'tenant',
        propertyId: 'prop_001',
        unitNumber: 'A101',
        phoneNumber: '+1-555-0123',
        emergencyContactName: 'Jane Doe',
        emergencyContactPhone: '+1-555-0124',
        leaseStartDate: '2025-01-01',
        leaseEndDate: '2025-12-31',
        monthlyRent: 1200.00,
        securityDeposit: 1200.00
      },
      {
        email: 'jane.smith@email.com',
        password: tenantPassword,
        firstName: 'Jane',
        lastName: 'Smith',
        role: 'tenant',
        propertyId: 'prop_001',
        unitNumber: 'B205',
        phoneNumber: '+1-555-0125',
        emergencyContactName: 'Bob Smith',
        emergencyContactPhone: '+1-555-0126',
        leaseStartDate: '2025-01-01',
        leaseEndDate: '2025-12-31',
        monthlyRent: 1800.00,
        securityDeposit: 1800.00
      },
      {
        email: 'admin@propertymanagement.com',
        password: adminPassword,
        firstName: 'Admin',
        lastName: 'User',
        role: 'admin',
        propertyId: 'prop_001',
        phoneNumber: '+1-555-0100'
      }
    ];
    
    users.forEach((user, index) => {
      db.run(`
        INSERT INTO users (
          email, password_hash, first_name, last_name, role, property_id, 
          unit_number, phone_number, emergency_contact_name, emergency_contact_phone,
          lease_start_date, lease_end_date, monthly_rent, security_deposit
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `, [
        user.email, user.password, user.firstName, user.lastName, user.role,
        user.propertyId, user.unitNumber, user.phoneNumber, user.emergencyContactName,
        user.emergencyContactPhone, user.leaseStartDate, user.leaseEndDate,
        user.monthlyRent, user.securityDeposit
      ], function(err) {
        if (err) {
          console.error('Error inserting user:', err);
        } else {
          console.log(`👤 Created user: ${user.email}`);
          
          // Insert sample data for the first tenant
          if (index === 0) {
            insertSampleMaintenanceRequests(this.lastID);
            insertSamplePayments(this.lastID);
          }
        }
      });
    });
  });
}

function insertSampleMaintenanceRequests(userId) {
  const requests = [
    {
      id: 'maint_001',
      title: 'Leaky Kitchen Faucet',
      description: 'Kitchen faucet has been dripping constantly for the past week',
      priority: 'medium',
      status: 'open',
      category: 'plumbing'
    },
    {
      id: 'maint_002',
      title: 'AC Not Working Properly',
      description: 'Air conditioning unit not cooling the apartment effectively',
      priority: 'high',
      status: 'in-progress',
      category: 'hvac',
      assignedTo: 'Mike Johnson'
    },
    {
      id: 'maint_003',
      title: 'Broken Light Fixture',
      description: 'Main bathroom light fixture is flickering and needs replacement',
      priority: 'low',
      status: 'completed',
      category: 'electrical',
      assignedTo: 'Sarah Wilson',
      completedDate: '2025-09-27',
      completionNotes: 'Replaced light fixture with new LED fixture. Issue resolved.'
    }
  ];
  
  requests.forEach(req => {
    db.run(`
      INSERT INTO maintenance_requests (
        id, user_id, title, description, priority, status, category, 
        assigned_to, completed_date, completion_notes
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, [
      req.id, userId, req.title, req.description, req.priority, req.status,
      req.category, req.assignedTo, req.completedDate, req.completionNotes
    ], (err) => {
      if (err) {
        console.error('Error inserting maintenance request:', err);
      } else {
        console.log(`🔧 Created maintenance request: ${req.title}`);
      }
    });
  });
}

function insertSamplePayments(userId) {
  const payments = [
    {
      id: 'pay_001',
      amount: 1200.00,
      paymentDate: '2025-09-01',
      dueDate: '2025-09-01',
      type: 'rent',
      status: 'paid',
      method: 'credit_card',
      transactionId: 'txn_abc123',
      description: 'Monthly rent payment for September 2025'
    },
    {
      id: 'pay_002',
      amount: 1200.00,
      paymentDate: '2025-08-01',
      dueDate: '2025-08-01',
      type: 'rent',
      status: 'paid',
      method: 'bank_transfer',
      transactionId: 'txn_def456',
      description: 'Monthly rent payment for August 2025'
    },
    {
      id: 'pay_003',
      amount: 1200.00,
      dueDate: '2025-10-01',
      type: 'rent',
      status: 'pending',
      description: 'Monthly rent payment for October 2025'
    }
  ];
  
  payments.forEach(payment => {
    db.run(`
      INSERT INTO payments (
        id, user_id, amount, payment_date, due_date, type, status, 
        method, transaction_id, description
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, [
      payment.id, userId, payment.amount, payment.paymentDate, payment.dueDate,
      payment.type, payment.status, payment.method, payment.transactionId, payment.description
    ], (err) => {
      if (err) {
        console.error('Error inserting payment:', err);
      } else {
        console.log(`💳 Created payment: ${payment.description}`);
      }
    });
  });
}

module.exports = db;