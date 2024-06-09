
// 
// 
// 

function getToken() {
    const value = `; ${document.cookie}`;
    const parts = value.split(`; token=`);
    if (parts.length === 2) return parts.pop().split(';').shift();
}

// Function to decode JWT token
function parseJwt(token) {
    try {
        return JSON.parse(atob(token.split('.')[1]));
    } catch (e) {
        return null;
    }
}

// Function to check token expiration
function checkTokenExpiration() {
    console.log("session check")
    const token = getToken();
    if (!token) {
        showSessionExpiredAlert();
        return;
    }

    const decodedToken = parseJwt(token);
    if (decodedToken && decodedToken.exp) {
        const expirationTime = decodedToken.exp * 1000; // Convert to milliseconds
        const currentTime = Date.now();

        if (currentTime >= expirationTime) {
            showSessionExpiredAlert();
        } else {
            // Set a timeout to check again right before expiration
            const timeUntilExpiration = expirationTime - currentTime;
            setTimeout(checkTokenExpiration, timeUntilExpiration);
        }
    } else {
        showSessionExpiredAlert();
    }
}

// Function to show SweetAlert2 alert
function showSessionExpiredAlert() {
    Swal.fire({
        title: 'Session Expired',
        text: 'Your session has expired. Please log in again.',
        icon: 'warning',
        confirmButtonText: 'OK'
    }).then(() => {
        window.location.href = '/user/login'; // Redirect to login page
    });
}

// Initial check on page load
document.addEventListener("DOMContentLoaded", () => {
    console.log("session load check")
    checkTokenExpiration();
    // Set an interval to periodically check the token expiration every minute
    setInterval(checkTokenExpiration, 20000); // 60,000 milliseconds = 1 minute
});