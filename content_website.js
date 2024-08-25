// Configuration values
const config = {
  site_url: 'http://localhost:3000'  // Replace this with your actual site URL
};

// Log when the content script starts
console.log("Website content script starting.");

// Function to list all cookies
function listAllCookies() {
  console.log("Listing all cookies:");
  const cookiesArray = document.cookie.split(';').map(cookie => cookie.trim());
  cookiesArray.forEach(cookie => console.log(cookie));
}

// Function to get a cookie by name
function getCookie(name) {
  console.log(`Attempting to retrieve cookie with name: ${name}`);
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) {
      const cookieValue = parts.pop().split(';').shift();
      console.log(`Cookie "${name}" found with value:`, cookieValue);
      return cookieValue;
  } else {
      console.log(`Cookie "${name}" not found. All cookies:`, document.cookie);
      return null;
  }
}

function retrieveAndStoreToken() {
    console.log("Attempting to retrieve and store token.");
    const token = getCookie('extension_token');
    if (token) {
        console.log("Token found:", token);
        chrome.runtime.sendMessage({ type: "STORE_TOKEN", token: token }, function(response) {
            if (chrome.runtime.lastError) {
                console.error("Runtime error:", chrome.runtime.lastError);
            } else if (response && response.status === "success") {
                console.log("Response from background script:", response.message);
                // Immediately verify by retrieving the token from chrome.storage.local
                chrome.storage.local.get('extension_token', function(data) {
                    if (chrome.runtime.lastError) {
                        console.error('Error retrieving token from local storage:', chrome.runtime.lastError);
                    } else {
                        console.log('Token retrieved from local storage:', data.extension_token);
                    }
                });
            } else {
                console.log("No response or unexpected response from background script.");
            }
        });
    } else {
        console.error("Token not found in cookies.");
    }
}

// Function to handle login or signup page events
function handleLoginOrSignup() {
  console.log("Handling login or signup.");
  console.log("Current URL:", window.location.href);
  if (window.location.href.includes(`${config.site_url}/verify`) || window.location.href.includes(`${config.site_url}/dashboard`)) {
      console.log("URL indicates verify or dashboard page. Waiting before retrieving token.");
      setTimeout(retrieveAndStoreToken, 1500); // Adjust the delay as needed
  } else {
      console.log("URL does not indicate verify or dashboard page.");
  }
}

// Call the handleLoginOrSignup function whenever the URL changes
window.addEventListener('popstate', handleLoginOrSignup);
window.addEventListener('pushstate', handleLoginOrSignup);
window.addEventListener('replacestate', handleLoginOrSignup);

// Initial token retrieval when the content script is injected
console.log("Initial token retrieval:");
listAllCookies();  // List all cookies at the start
retrieveAndStoreToken();

// Adding a short timeout to allow for any delay in setting the token during page load
document.addEventListener("DOMContentLoaded", function() {
  console.log("DOM fully loaded and parsed. Setting timeout for token retrieval.");
  listAllCookies();  // List all cookies after DOM load
  setTimeout(retrieveAndStoreToken, 1500); // Adjust the delay as needed
});

// Modify history API to trigger handleLoginOrSignup on state changes
(function(history){
  const originalPushState = history.pushState;
  const originalReplaceState = history.replaceState;
  
  history.pushState = function(state) {
      if (typeof history.onpushstate === "function") {
          history.onpushstate({ state });
      }
      console.log("pushState called");
      return originalPushState.apply(history, arguments);
  };

  history.replaceState = function(state) {
      if (typeof history.onreplacestate === "function") {
          history.onreplacestate({ state });
      }
      console.log("replaceState called");
      return originalReplaceState.apply(history, arguments);
  };

  window.addEventListener('popstate', handleLoginOrSignup);
  window.onpushstate = history.onpushstate = handleLoginOrSignup;
  window.onreplacestate = history.onreplacestate = handleLoginOrSignup;
})(window.history);