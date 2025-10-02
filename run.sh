#!/bin/bash

echo "🚀 Starting Tenant Management Portal..."

# Kill any existing processes on port 3000
lsof -ti:3000 | xargs kill -9 2>/dev/null || true

# Wait a moment
sleep 1

# Start the server
echo "📡 Starting server on port 3000..."
npm start &
SERVER_PID=$!

# Wait for server to start
echo "⏳ Waiting for server to start..."
sleep 3

# Check if server is running
if curl -s http://localhost:3000/health > /dev/null; then
    echo "✅ Server is running at http://localhost:3000"
    echo "🌐 Open http://localhost:3000 in your browser"
    echo "👤 Demo login: john.doe@email.com / TenantPass123!"
    echo ""
    echo "📋 Available commands:"
    echo "  npm test              - Run Playwright tests"
    echo "  npm run test:cypress  - Run Cypress tests"
    echo "  npm run test:e2e      - Run end-to-end tests"
    echo ""
    echo "Press Ctrl+C to stop the server"
    
    # Keep the script running
    wait $SERVER_PID
else
    echo "❌ Server failed to start"
    kill $SERVER_PID 2>/dev/null
    exit 1
fi