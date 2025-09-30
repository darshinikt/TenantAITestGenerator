// Configuration
const API_BASE = window.location.origin;
let authToken = localStorage.getItem('authToken');
let currentUser = null;

// Utility Functions
function showElement(elementId) {
    document.getElementById(elementId).classList.remove('hidden');
}

function hideElement(elementId) {
    document.getElementById(elementId).classList.add('hidden');
}

function showLoading() {
    showElement('loadingSpinner');
}

function hideLoading() {
    hideElement('loadingSpinner');
}

function showError(message, containerId = 'loginError') {
    const errorElement = document.getElementById(containerId);
    errorElement.textContent = message;
    errorElement.classList.remove('hidden');
    setTimeout(() => {
        errorElement.classList.add('hidden');
    }, 5000);
}

function showSuccess(message) {
    // Create a temporary success alert
    const alertDiv = document.createElement('div');
    alertDiv.className = 'alert alert-success alert-dismissible fade show position-fixed top-0 start-50 translate-middle-x';
    alertDiv.style.zIndex = '9999';
    alertDiv.innerHTML = `
        ${message}
        <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
    `;
    document.body.appendChild(alertDiv);
    
    setTimeout(() => {
        alertDiv.remove();
    }, 5000);
}

async function apiCall(endpoint, options = {}) {
    const config = {
        headers: {
            'Content-Type': 'application/json',
            ...options.headers
        },
        ...options
    };

    if (authToken) {
        config.headers.Authorization = `Bearer ${authToken}`;
    }

    try {
        const response = await fetch(`${API_BASE}${endpoint}`, config);
        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.error || 'Request failed');
        }

        return data;
    } catch (error) {
        console.error('API Error:', error);
        throw error;
    }
}

// Authentication Functions
async function login(email, password) {
    try {
        showLoading();
        const response = await apiCall('/auth/login', {
            method: 'POST',
            body: JSON.stringify({ email, password })
        });

        authToken = response.token;
        currentUser = response.user;
        localStorage.setItem('authToken', authToken);
        localStorage.setItem('currentUser', JSON.stringify(currentUser));

        hideElement('loginPage');
        showElement('mainApp');
        
        // Update user display
        document.getElementById('userDisplayName').textContent = currentUser.name;
        document.getElementById('welcomeUserName').textContent = currentUser.name;
        
        // Load dashboard data
        loadDashboard();
        
        hideLoading();
        showSuccess('Welcome back!');
    } catch (error) {
        hideLoading();
        showError(error.message);
    }
}

function logout() {
    authToken = null;
    currentUser = null;
    localStorage.removeItem('authToken');
    localStorage.removeItem('currentUser');
    
    hideElement('mainApp');
    showElement('loginPage');
    
    // Reset forms
    document.getElementById('loginForm').reset();
    showSection('dashboard');
}

function checkAuth() {
    const token = localStorage.getItem('authToken');
    const user = localStorage.getItem('currentUser');
    
    if (token && user) {
        authToken = token;
        currentUser = JSON.parse(user);
        
        hideElement('loginPage');
        showElement('mainApp');
        
        document.getElementById('userDisplayName').textContent = currentUser.name;
        document.getElementById('welcomeUserName').textContent = currentUser.name;
        
        loadDashboard();
    }
}

// Navigation Functions
function showSection(sectionName) {
    // Hide all sections
    const sections = document.querySelectorAll('.content-section');
    sections.forEach(section => section.classList.add('hidden'));
    
    // Remove active class from all nav links
    const navLinks = document.querySelectorAll('.nav-link');
    navLinks.forEach(link => link.classList.remove('active'));
    
    // Show selected section
    showElement(sectionName + 'Section');
    
    // Add active class to selected nav link
    const activeLink = document.querySelector(`[onclick*="${sectionName}"]`);
    if (activeLink) {
        activeLink.classList.add('active');
    }
    
    // Load section-specific data
    switch(sectionName) {
        case 'dashboard':
            loadDashboard();
            break;
        case 'maintenance':
            loadMaintenanceRequests();
            break;
        case 'payments':
            loadPayments();
            break;
        case 'documents':
            loadDocuments();
            break;
        case 'profile':
            loadProfile();
            break;
    }
}

// Dashboard Functions
async function loadDashboard() {
    try {
        // Load maintenance count
        const maintenanceResponse = await apiCall('/maintenance');
        document.getElementById('maintenanceCount').textContent = maintenanceResponse.length;
        
        // Load payment status
        const paymentsResponse = await apiCall('/payments');
        const pendingPayments = paymentsResponse.filter(p => p.status === 'pending');
        
        if (pendingPayments.length > 0) {
            document.getElementById('paymentStatus').textContent = 'Pending';
            document.getElementById('paymentStatus').className = 'text-warning';
            const nextDue = new Date(pendingPayments[0].due_date);
            document.getElementById('nextDueDate').textContent = nextDue.toLocaleDateString();
        } else {
            document.getElementById('paymentStatus').textContent = 'Current';
            document.getElementById('paymentStatus').className = 'text-success';
        }
        
        // Load document count
        const documentsResponse = await apiCall('/documents');
        document.getElementById('documentCount').textContent = documentsResponse.length;
        
    } catch (error) {
        console.error('Dashboard load error:', error);
    }
}

// Maintenance Functions
async function loadMaintenanceRequests() {
    try {
        const response = await apiCall('/maintenance');
        const tbody = document.getElementById('maintenanceTableBody');
        
        tbody.innerHTML = response.map(request => `
            <tr>
                <td>${request.title}</td>
                <td><span class="badge bg-secondary">${request.category}</span></td>
                <td><span class="badge status-badge priority-${request.priority}">${request.priority.toUpperCase()}</span></td>
                <td><span class="badge status-badge status-${request.status.replace(' ', '-')}">${request.status.replace('_', ' ').toUpperCase()}</span></td>
                <td>${new Date(request.created_at).toLocaleDateString()}</td>
                <td>
                    <button class="btn btn-sm btn-outline-primary" onclick="viewMaintenanceDetails(${request.id})">
                        <i class="fas fa-eye"></i>
                    </button>
                </td>
            </tr>
        `).join('');
    } catch (error) {
        console.error('Maintenance load error:', error);
        showError('Failed to load maintenance requests');
    }
}

function showCreateMaintenanceModal() {
    const modal = new bootstrap.Modal(document.getElementById('createMaintenanceModal'));
    modal.show();
}

async function submitMaintenanceRequest() {
    try {
        const formData = {
            title: document.getElementById('maintenanceTitle').value,
            description: document.getElementById('maintenanceDescription').value,
            priority: document.getElementById('maintenancePriority').value,
            category: document.getElementById('maintenanceCategory').value
        };

        if (!formData.title || !formData.description || !formData.category) {
            showError('Please fill in all required fields');
            return;
        }

        showLoading();
        await apiCall('/maintenance', {
            method: 'POST',
            body: JSON.stringify(formData)
        });

        hideLoading();
        bootstrap.Modal.getInstance(document.getElementById('createMaintenanceModal')).hide();
        document.getElementById('createMaintenanceForm').reset();
        showSuccess('Maintenance request submitted successfully!');
        loadMaintenanceRequests();
        loadDashboard(); // Refresh counts
    } catch (error) {
        hideLoading();
        showError(error.message);
    }
}

function viewMaintenanceDetails(id) {
    // For demo purposes, just show an alert
    alert(`Viewing details for maintenance request #${id}`);
}

// Payment Functions
async function loadPayments() {
    try {
        const response = await apiCall('/payments');
        
        // Load upcoming payments
        const upcomingPayments = response.filter(p => p.status === 'pending');
        const upcomingContainer = document.getElementById('upcomingPayments');
        
        if (upcomingPayments.length > 0) {
            upcomingContainer.innerHTML = upcomingPayments.map(payment => `
                <div class="d-flex justify-content-between align-items-center mb-2 p-2 border rounded">
                    <div>
                        <strong>$${payment.amount}</strong><br>
                        <small class="text-muted">Due: ${new Date(payment.due_date).toLocaleDateString()}</small>
                    </div>
                    <button class="btn btn-sm btn-success" onclick="paySpecificAmount(${payment.amount})">
                        Pay Now
                    </button>
                </div>
            `).join('');
        } else {
            upcomingContainer.innerHTML = '<p class="text-muted">No pending payments</p>';
        }
        
        // Load payment history
        const historyBody = document.getElementById('paymentHistoryBody');
        const completedPayments = response.filter(p => p.status === 'completed').slice(0, 10);
        
        historyBody.innerHTML = completedPayments.map(payment => `
            <tr>
                <td>${new Date(payment.payment_date || payment.created_at).toLocaleDateString()}</td>
                <td>$${payment.amount}</td>
                <td><span class="badge bg-success">Paid</span></td>
            </tr>
        `).join('');
        
    } catch (error) {
        console.error('Payments load error:', error);
        showError('Failed to load payment information');
    }
}

function showPaymentModal() {
    const modal = new bootstrap.Modal(document.getElementById('paymentModal'));
    modal.show();
}

function paySpecificAmount(amount) {
    document.getElementById('paymentAmount').value = amount;
    showPaymentModal();
}

async function processPayment() {
    try {
        const amount = document.getElementById('paymentAmount').value;
        const method = document.getElementById('paymentMethod').value;

        if (!amount || !method) {
            showError('Please fill in all required fields');
            return;
        }

        showLoading();
        await apiCall('/payments', {
            method: 'POST',
            body: JSON.stringify({
                amount: parseFloat(amount),
                payment_method: method
            })
        });

        hideLoading();
        bootstrap.Modal.getInstance(document.getElementById('paymentModal')).hide();
        document.getElementById('paymentForm').reset();
        showSuccess('Payment processed successfully!');
        loadPayments();
        loadDashboard(); // Refresh status
    } catch (error) {
        hideLoading();
        showError(error.message);
    }
}

// Document Functions
async function loadDocuments() {
    try {
        const response = await apiCall('/documents');
        const grid = document.getElementById('documentsGrid');
        
        if (response.length > 0) {
            grid.innerHTML = response.map(doc => `
                <div class="col-md-4 mb-3">
                    <div class="card h-100">
                        <div class="card-body text-center">
                            <i class="fas fa-file-pdf fa-3x text-danger mb-3"></i>
                            <h6 class="card-title">${doc.name}</h6>
                            <p class="card-text small text-muted">${doc.type}</p>
                            <p class="card-text small">Uploaded: ${new Date(doc.created_at).toLocaleDateString()}</p>
                            <div class="btn-group" role="group">
                                <button class="btn btn-sm btn-outline-primary" onclick="downloadDocument(${doc.id})">
                                    <i class="fas fa-download"></i>
                                </button>
                                <button class="btn btn-sm btn-outline-danger" onclick="deleteDocument(${doc.id})">
                                    <i class="fas fa-trash"></i>
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            `).join('');
        } else {
            grid.innerHTML = '<div class="col-12"><p class="text-muted text-center">No documents available</p></div>';
        }
    } catch (error) {
        console.error('Documents load error:', error);
        showError('Failed to load documents');
    }
}

function showUploadModal() {
    // For demo purposes, just show an alert
    alert('Document upload functionality would be implemented here');
}

function downloadDocument(id) {
    // For demo purposes, just show an alert
    alert(`Downloading document #${id}`);
}

async function deleteDocument(id) {
    if (confirm('Are you sure you want to delete this document?')) {
        try {
            showLoading();
            await apiCall(`/documents/${id}`, { method: 'DELETE' });
            hideLoading();
            showSuccess('Document deleted successfully!');
            loadDocuments();
            loadDashboard(); // Refresh counts
        } catch (error) {
            hideLoading();
            showError(error.message);
        }
    }
}

// Profile Functions
async function loadProfile() {
    try {
        const response = await apiCall('/user/profile');
        
        document.getElementById('profileFirstName').value = response.name.split(' ')[0] || '';
        document.getElementById('profileLastName').value = response.name.split(' ')[1] || '';
        document.getElementById('profileEmail').value = response.email;
        document.getElementById('profilePhone').value = response.phone || '';
        
        // Mock lease information
        document.getElementById('leaseUnit').textContent = response.unit || 'A-101';
        document.getElementById('leaseRent').textContent = '$' + (response.rent || '1,200');
        document.getElementById('leaseTerm').textContent = response.lease_term || '12 months';
        
    } catch (error) {
        console.error('Profile load error:', error);
        showError('Failed to load profile information');
    }
}

// Event Listeners
document.addEventListener('DOMContentLoaded', function() {
    checkAuth();
    
    // Login form handler
    document.getElementById('loginForm').addEventListener('submit', function(e) {
        e.preventDefault();
        const email = document.getElementById('email').value;
        const password = document.getElementById('password').value;
        login(email, password);
    });
    
    // Profile form handler
    document.getElementById('profileForm').addEventListener('submit', function(e) {
        e.preventDefault();
        // Profile update would be implemented here
        showSuccess('Profile updated successfully!');
    });
    
    // Payment method change handler
    document.getElementById('paymentMethod').addEventListener('change', function() {
        const creditCardFields = document.getElementById('creditCardFields');
        if (this.value === 'credit_card') {
            creditCardFields.classList.remove('hidden');
        } else {
            creditCardFields.classList.add('hidden');
        }
    });
});

// Global error handler
window.addEventListener('error', function(e) {
    console.error('Application error:', e.error);
});

// Handle unauthorized responses
window.addEventListener('beforeunload', function() {
    // Clean up any ongoing requests
});