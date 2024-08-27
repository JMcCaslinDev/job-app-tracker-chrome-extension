// brings in global variables from config file
const BASE_URL = CONFIG.DEV_MODE ? CONFIG.DEV_BASE_URL : CONFIG.BASE_URL;
console.log(`Running in ${CONFIG.DEV_MODE ? 'development' : 'production'} mode.`);

// Function to decode a JWT and check if it has expired
function isTokenExpired(token) {
    try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        const expiryTime = payload.exp * 1000; // Convert to milliseconds
        const currentTime = Date.now();
        return currentTime > expiryTime;
    } catch (error) {
        console.error("Error decoding token:", error);
        return true; // Assume expired if there's an error
    }
}

// Function to check if the token is valid or expired
function validateToken(callback) {
    chrome.storage.local.get('extension_token', function(data) {
        if (chrome.runtime.lastError) {
            console.error('Error checking token in local storage:', chrome.runtime.lastError);
            callback(false);
        } else {
            if (data.extension_token) {
                console.log('Token found in local storage:', data.extension_token);
                if (isTokenExpired(data.extension_token)) {
                    console.log('Token is expired.');
                    callback(false);
                } else {
                    console.log('Token is valid.');
                    callback(true);
                }
            } else {
                console.log('Token not found in local storage.');
                callback(false);
            }
        }
    });
}

// Function to get a cookie by name
function getCookie(name) {
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) return parts.pop().split(';').shift();
    return null;
}

// Function to check if the specified cookie is present
function isCookiePresent(name) {
    return getCookie(name) !== null;
}

// Function to retrieve the JWT from cookies and store it in chrome.storage.local
function retrieveAndStoreToken() {
    const token = getCookie('extension_token');
    if (token) {
        console.log("Token found:", token);
        chrome.storage.local.set({ 'extension_token': token }, function() {
            if (chrome.runtime.lastError) {
                console.error("Runtime error:", chrome.runtime.lastError);
            } else {
                console.log("Token stored successfully.");
            }
        });
    } else {
        console.error("Token not found in cookies.");
    }
}

// Function to handle token storage only on the dashboard page
function handleDashboardPage() {
    const currentURL = window.location.href;
    console.log("Current URL:", currentURL);

    if (currentURL.includes(`${BASE_URL}/dashboard`)) {
        console.log("On the dashboard page.");

        validateToken(function(isValid) {
            if (!isValid) {
                console.log("Token is either not saved or expired. Checking for token in cookies.");
                if (isCookiePresent('extension_token')) {
                    retrieveAndStoreToken();
                } else {
                    console.log("Token cookie not present.");
                }
            } else {
                console.log("Token is already saved and valid in local storage.");
            }
        });
    } else {
        console.log("Not on the dashboard page. No action taken.");
    }
}

// Ensure the function is called either immediately or on DOMContentLoaded
if (document.readyState === 'loading') {
    document.addEventListener("DOMContentLoaded", function() {
        console.log("DOM fully loaded and parsed. Checking for token on the dashboard page.");
        setTimeout(handleDashboardPage, 0); // Trigger immediately after DOM is ready
    });
} else {
    console.log("DOM already loaded. Checking for token on the dashboard page.");
    setTimeout(handleDashboardPage, 0); // Trigger immediately if DOMContentLoaded has already fired
}