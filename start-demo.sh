#!/bin/bash

echo "🚀 Starting Tenant Management Portal Demo"
echo "========================================"

# Kill any existing processes on port 3000
echo "🧹 Cleaning up any existing processes..."
lsof -ti:3000 | xargs kill -9 2>/dev/null || true
sleep 1

# Start the server
echo "🖥️  Starting server..."
node simple-server.js &
SERVER_PID=$!

# Wait for server to start
echo "⏳ Waiting for server to start (3 seconds)..."
sleep 3

# Test server connection
echo "🔍 Testing server connection..."
if curl -s http://localhost:3000 >/dev/null 2>&1; then
    echo "✅ Server is running at http://localhost:3000"
    echo ""
    
    echo "🌐 You can now:"
    echo "   1. Open browser: http://localhost:3000"
    echo "   2. Login with: john.doe@email.com / TenantPass123!"
    echo "   3. Or run tests in another terminal:"
    echo "      npx cypress open"
    echo ""
    
    echo "📱 Server is running in background (PID: $SERVER_PID)"
    echo "🛑 Press Ctrl+C to stop the server"
    
    # Keep server running
    wait $SERVER_PID
else
    echo "❌ Server failed to start"
    kill $SERVER_PID 2>/dev/null || true
    exit 1
fi