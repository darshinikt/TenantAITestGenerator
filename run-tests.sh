#!/bin/bash

echo "🚀 Starting Tenant Management Portal Tests"
echo "========================================"

# Check if server is running
if curl -s http://localhost:3000/health > /dev/null; then
    echo "✅ Server is already running"
else
    echo "🔧 Starting server..."
    node simple-server.js &
    SERVER_PID=$!
    echo "📝 Server PID: $SERVER_PID"
    
    # Wait for server to start
    sleep 3
    
    # Check if server started successfully
    if curl -s http://localhost:3000/health > /dev/null; then
        echo "✅ Server started successfully"
    else
        echo "❌ Server failed to start"
        kill $SERVER_PID 2>/dev/null
        exit 1
    fi
fi

echo ""
echo "🧪 Running Tests..."
echo "=================="

# Test basic server endpoints
echo "📋 Testing Health Endpoint..."
HEALTH_RESPONSE=$(curl -s http://localhost:3000/health)
if echo "$HEALTH_RESPONSE" | grep -q '"status":"ok"'; then
    echo "✅ Health check passed"
else
    echo "❌ Health check failed: $HEALTH_RESPONSE"
fi

echo ""
echo "🔐 Testing Authentication..."
AUTH_RESPONSE=$(curl -s -X POST http://localhost:3000/auth/login \
    -H "Content-Type: application/json" \
    -d '{"email":"john.doe@email.com","password":"TenantPass123!"}')

if echo "$AUTH_RESPONSE" | grep -q '"success":true'; then
    echo "✅ Authentication test passed"
    TOKEN=$(echo "$AUTH_RESPONSE" | sed -n 's/.*"token":"\([^"]*\)".*/\1/p')
    echo "🔑 Token: $TOKEN"
else
    echo "❌ Authentication test failed: $AUTH_RESPONSE"
fi

echo ""
echo "👤 Testing User Profile..."
PROFILE_RESPONSE=$(curl -s http://localhost:3000/user/profile)
if echo "$PROFILE_RESPONSE" | grep -q '"email"'; then
    echo "✅ Profile test passed"
else
    echo "❌ Profile test failed: $PROFILE_RESPONSE"
fi

echo ""
echo "🔧 Testing Maintenance API..."
MAINTENANCE_RESPONSE=$(curl -s http://localhost:3000/maintenance)
if echo "$MAINTENANCE_RESPONSE" | grep -q '\[\]'; then
    echo "✅ Maintenance GET test passed"
else
    echo "❌ Maintenance GET test failed: $MAINTENANCE_RESPONSE"
fi

# Test creating maintenance request
CREATE_MAINTENANCE=$(curl -s -X POST http://localhost:3000/maintenance \
    -H "Content-Type: application/json" \
    -d '{"title":"Test Request","description":"Test Description","category":"plumbing","priority":"medium"}')

if echo "$CREATE_MAINTENANCE" | grep -q '"id"'; then
    echo "✅ Maintenance CREATE test passed"
else
    echo "❌ Maintenance CREATE test failed: $CREATE_MAINTENANCE"
fi

echo ""
echo "💳 Testing Payment API..."
PAYMENT_RESPONSE=$(curl -s http://localhost:3000/payments)
if echo "$PAYMENT_RESPONSE" | grep -q '\[\]'; then
    echo "✅ Payment GET test passed"
else
    echo "❌ Payment GET test failed: $PAYMENT_RESPONSE"
fi

echo ""
echo "📄 Testing Document API..."
DOCUMENT_RESPONSE=$(curl -s http://localhost:3000/documents)
if echo "$DOCUMENT_RESPONSE" | grep -q '\[\]'; then
    echo "✅ Document GET test passed"
else
    echo "❌ Document GET test failed: $DOCUMENT_RESPONSE"
fi

echo ""
echo "🎯 Summary"
echo "========="
echo "✅ All basic API tests completed"
echo "🌐 Server is running at http://localhost:3000"
echo "📱 You can now test the frontend in your browser"

echo ""
echo "🔗 Test URLs:"
echo "- Frontend: http://localhost:3000"
echo "- Health Check: http://localhost:3000/health"
echo "- API Endpoints: /auth/login, /user/profile, /maintenance, /payments, /documents"

# Keep server running
if [ ! -z "$SERVER_PID" ]; then
    echo ""
    echo "🔧 Server is running in background (PID: $SERVER_PID)"
    echo "💡 To stop the server, run: kill $SERVER_PID"
    echo "📝 Or use Ctrl+C to stop this script"
    
    # Wait for user to stop
    read -p "Press Enter to stop the server..."
    kill $SERVER_PID 2>/dev/null
    echo "🛑 Server stopped"
fi