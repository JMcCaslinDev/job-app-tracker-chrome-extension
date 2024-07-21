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

chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
    if (request.type === "STORE_TOKEN") {
        chrome.storage.local.set({token: request.token}, function() {
            console.log('Token stored in chrome.storage.local:', request.token);
        });
    }
});

chrome.action.onClicked.addListener(function(tab) {
    const dashboardUrl = process.env.DASHBOARD_URL || 'http://localhost:3000/dashboard';
    chrome.tabs.create({ url: dashboardUrl });
});
