# Tenant Management Portal

A simple tenant management system with automated testing using Playwright and Cypress.

## 🚀 Quick Start

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Start the application:**
   ```bash
   npm start
   ```
   
   Or use the convenient script:
   ```bash
   ./run.sh
   ```

3. **Open in browser:**
   Visit http://localhost:3000

4. **Demo Login:**
   - Email: `john.doe@email.com`
   - Password: `TenantPass123!`

## 🧪 Running Tests

### Playwright Tests
```bash
npm test                    # Run all Playwright tests
npm run test:playwright     # Same as above
npm run test:playwright:headed  # Run with browser visible
```

### Cypress Tests
```bash
npm run test:cypress        # Run Cypress tests headless
npm run test:cypress:open   # Open Cypress UI
```

### End-to-End Tests
```bash
npm run test:e2e           # Start server and run tests
```

## 📁 Project Structure

```
├── public/                 # Frontend files
│   ├── index.html         # Main application UI
│   └── app.js            # Frontend JavaScript
├── tests/                 # Playwright tests
│   └── example.spec.ts   # Main test suite
├── cypress/              # Cypress tests
│   └── e2e/             # End-to-end tests
├── simple-server.js      # Express.js backend
├── package.json         # Dependencies and scripts
└── README.md           # This file
```

## 🎯 Features

- **Login/Authentication** - Simple demo authentication
- **Dashboard** - Overview of tenant information
- **Maintenance Requests** - Submit and track maintenance
- **Payments** - View and make payments
- **Documents** - Upload and manage documents
- **Profile Management** - Update tenant information

## 🔧 Technology Stack

- **Frontend:** HTML5, CSS3, JavaScript, Bootstrap 5
- **Backend:** Node.js, Express.js
- **Testing:** Playwright, Cypress
- **UI Framework:** Bootstrap 5 with custom styling

## 📋 Available Scripts

- `npm start` - Start the server
- `npm test` - Run Playwright tests
- `npm run test:cypress` - Run Cypress tests
- `npm run test:e2e` - Start server and run tests
- `npm run dev` - Start server with auto-reload

## 🌟 Demo Features

The application includes:
- Responsive design for mobile and desktop
- Interactive forms with validation
- Modal dialogs for actions
- Success/error notifications
- Navigation between sections
- Mock data for demonstration

## 🧪 Test Coverage

Tests include:
- User authentication flow
- Navigation between sections
- Form submissions
- Error handling
- Responsive design
- API interactions

## 📝 Notes

This is a simplified demo application designed for testing automation examples. In a production environment, you would need:
- Real database integration
- Proper authentication/authorization
- File upload handling
- Security middleware
- Input validation
- Error logging