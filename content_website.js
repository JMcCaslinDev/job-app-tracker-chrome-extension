console.log("Website content script starting.");

// Function to retrieve the JWT from local storage and store it in chrome.storage.local
function retrieveAndStoreToken() {
    const token = localStorage.getItem('token');
    if (token) {
        chrome.runtime.sendMessage({type: "STORE_TOKEN", token: token});
        console.log("Token found in localStorage and sent to background script:", token);
    } else {
        console.log("Token not found in localStorage.");
    }
}

// Listen for changes in the URL or specific events on your website's login and signup pages
function handleLoginOrSignup() {
    // Check if the current URL matches your website's login or signup page
    if (window.location.href.includes('https://job-app-tracker-website-b2cef22d84a2.herokuapp.com/login') ||
        window.location.href.includes('https://job-app-tracker-website-b2cef22d84a2.herokuapp.com/signup')) {
        // Wait for a short delay to allow the token to be stored in localStorage after a successful login or signup
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