// auth.js - Authentication management

document.addEventListener('DOMContentLoaded', function() {
    updateHeader();
});

// Check if user is logged in
function isLoggedIn() {
    return localStorage.getItem('token') !== null;
}

// Get current user details
function getCurrentUser() {
    const userStr = localStorage.getItem('user');
    return userStr ? JSON.parse(userStr) : null;
}

// Update header based on auth status
function updateHeader() {
    const headerOptions = document.getElementById('headerOptions');
    if (!headerOptions) return;

    const user = getCurrentUser();
    const token = localStorage.getItem('token');

    if (user && token) {
        headerOptions.innerHTML = `
            <a href="cart.html"><img src="cart.png" class="cartImage"></a>
            <span class="welcome-message">Welcome, ${user.username}</span>
            <a href="#" onclick="handleLogout(event)" class="logout-btn">Logout</a>
        `;
    } else {
        headerOptions.innerHTML = `
            <a href="cart.html"><img src="cart.png" class="cartImage"></a>
            <a href="register.html">Register</a>
            <a href="login.html">Login</a>
        `;
    }
}

// Handle logout
async function handleLogout(event) {
    if (event) event.preventDefault();
    
    try {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        
        alert('Logged out successfully!');
        updateHeader();
        
        // Redirect to login page
        window.location.href = 'login.html';
    } catch (error) {
        console.error('Logout error:', error);
        alert('Error during logout. Please try again.');
    }
}

// Check authentication for protected pages
function checkAuth(requiredRole = null) {
    const user = getCurrentUser();
    const token = localStorage.getItem('token');

    if (!user || !token) {
        window.location.href = 'login.html';
        return false;
    }

    if (requiredRole && user.role !== requiredRole) {
        window.location.href = 'index.html';
        return false;
    }

    return true;
}
// auth.js
function updateHeader() {
    const user = getCurrentUser();
    const token = localStorage.getItem('token');

    const headerOptions = document.getElementById('headerOptions');
    if (!headerOptions) return;

    if (user && token) {
        headerOptions.innerHTML = `
            <a href="cart.html"><img src="cart.png" class="cartImage"></a>
            <span style="color: #f4f4f4; margin-right: 15px;">Welcome, ${user.username}</span>
            ${user.role === 'admin' ? 
                '<a href="admin-dashboard.html">Dashboard</a>' : 
                user.role === 'artist' ? 
                '<a href="artist-dashboard.html">Dashboard</a>' : 
                ''}
            <a href="#" onclick="handleLogout(event)" class="logout-btn">Logout</a>
        `;
    } else {
        headerOptions.innerHTML = `
            <a href="cart.html"><img src="cart.png" class="cartImage"></a>
            <a href="register.html">Register</a>
            <a href="login.html">Login</a>
        `;
    }
}

function checkUserRole() {
    const user = getCurrentUser();
    if (!user) return null;

    const currentPage = window.location.pathname.split('/').pop();
    
    if (currentPage === 'admin-dashboard.html' && user.role !== 'admin') {
        window.location.href = 'index.html';
    } else if (currentPage === 'artist-dashboard.html' && user.role !== 'artist') {
        window.location.href = 'index.html';
    }

    return user.role;
}

document.addEventListener('DOMContentLoaded', () => {
    updateHeader();
    checkUserRole();
});