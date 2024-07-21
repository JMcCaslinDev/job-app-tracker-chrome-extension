console.log("Website content script starting.");

// Function to retrieve the JWT from cookies and store it in chrome.storage.local
function getCookie(name) {
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) return parts.pop().split(';').shift();
}

function retrieveAndStoreToken() {
    const token = getCookie('token');
    if (token) {
        chrome.runtime.sendMessage({type: "STORE_TOKEN", token: token});
        console.log("Token found in cookies and sent to background script:", token);
    } else {
        console.log("Token not found in cookies.");
    }
}

// Listen for changes in the URL or specific events on your website's login and signup pages
function handleLoginOrSignup() {
    const loginUrl = process.env.LOGIN_URL;
    const signupUrl = process.env.SIGNUP_URL;
    // Check if the current URL matches your website's login or signup page
    if (window.location.href.includes(loginUrl) || window.location.href.includes(signupUrl)) {
        // Wait for a short delay to allow the token to be stored in cookies after a successful login or signup
        setTimeout(function() {
            retrieveAndStoreToken();
        }, 1000); // Adjust the delay as needed
    }
}

// Call the handleLoginOrSignup function whenever the URL changes
window.addEventListener('popstate', handleLoginOrSignup);
window.addEventListener('pushstate', handleLoginOrSignup);
window.addEventListener('replacestate', handleLoginOrSignup);

// Retrieve and store the token when the content script is injected
retrieveAndStoreToken();
