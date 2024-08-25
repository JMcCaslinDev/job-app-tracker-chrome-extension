chrome.runtime.onInstalled.addListener(function() {
    chrome.declarativeContent.onPageChanged.removeRules(undefined, function() {
        chrome.declarativeContent.onPageChanged.addRules([{
            conditions: [new chrome.declarativeContent.PageStateMatcher({
                pageUrl: {hostEquals: 'localhost', pathContains: 'dashboard'}
            })],
            actions: [new chrome.declarativeContent.ShowPageAction()]
        }]);
    });
});

// Listen for messages from content scripts
chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
    if (request.type === "STORE_TOKEN") {
        const token = request.token;
        if (token) {
            // Store the token in local storage
            chrome.storage.local.set({ 'extension_token': token }, function() {
                if (chrome.runtime.lastError) {
                    console.error("Error storing token:", chrome.runtime.lastError);
                    sendResponse({ status: "failure", message: "Failed to store token." });
                } else {
                    console.log('Token stored in chrome.storage.local:', token);
                    sendResponse({ status: "success", message: "Token stored successfully." });
                }
            });
            // Ensure async sendResponse works
            return true;
        }
    }
});

chrome.action.onClicked.addListener(function(tab) {
    const dashboardUrl = process.env.DASHBOARD_URL || 'http://localhost:3000/dashboard';
    chrome.tabs.create({ url: dashboardUrl });
});

chrome.storage.local.get('token', function(result) {
    console.log('Retrieved token:', result.token);
});