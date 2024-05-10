chrome.runtime.onInstalled.addListener(function() {
    chrome.declarativeContent.onPageChanged.removeRules(undefined, function() {
        chrome.declarativeContent.onPageChanged.addRules([{
            conditions: [new chrome.declarativeContent.PageStateMatcher({
                pageUrl: {hostEquals: 'job-app-tracker-website-b2cef22d84a2.herokuapp.com'},
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
    chrome.tabs.create({ url: 'https://job-app-tracker-website-b2cef22d84a2.herokuapp.com/dashboard' });
});