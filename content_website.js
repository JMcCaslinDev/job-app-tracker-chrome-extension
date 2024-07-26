// Configuration values
const config = {
    site_url: 'http://localhost:3000'  // Replace it with your actual site URL
  };
  
  // Log when the content script starts
  console.log("Website content script starting.");
  
  // Function to list all cookies
  function listAllCookies() {
    console.log("Listing all cookies:");
    console.log(document.cookie);
    const cookiesArray = document.cookie.split(';').map(cookie => cookie.trim());
    cookiesArray.forEach(cookie => console.log(cookie));
  }
  
  // Function to get a cookie by name
  function getCookie(name) {
    console.log("Attempting to retrieve cookie with name:", name);
    const value = `; ${document.cookie}`;
    console.log("Document.cookie value:", value);
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) {
      const cookieValue = parts.pop().split(';').shift();
      console.log(`Cookie "${name}" found with value:`, cookieValue);
      return cookieValue;
    } else {
      console.log(`Cookie "${name}" not found. All cookies:`, document.cookie);
    }
  }
  
  // Function to retrieve and store the token
  function retrieveAndStoreToken() {
    console.log("Attempting to retrieve and store token.");
    const token = getCookie('extension_token');
    if (token) {
      console.log("Token found:", token);
      chrome.runtime.sendMessage({ type: "STORE_TOKEN", token: token });
      console.log("Token sent to background script:", token);
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
      setTimeout(function() {
        retrieveAndStoreToken();
      }, 1500); // Adjust the delay as needed
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
    setTimeout(function() {
      retrieveAndStoreToken();
    }, 1500); // Adjust the delay as needed
  });
  
  (function(history){
    var pushState = history.pushState;
    var replaceState = history.replaceState;
    history.pushState = function(state) {
      if (typeof history.onpushstate == "function") {
        history.onpushstate({state: state});
      }
      console.log("pushState called");
      return pushState.apply(history, arguments);
    };
    history.replaceState = function(state) {
      if (typeof history.onreplacestate == "function") {
        history.onreplacestate({state: state});
      }
      console.log("replaceState called");
      return replaceState.apply(history, arguments);
    };
    window.addEventListener('popstate', handleLoginOrSignup);
    window.onpushstate = history.onpushstate = handleLoginOrSignup;
    window.onreplacestate = history.onreplacestate = handleLoginOrSignup;
  })(window.history);