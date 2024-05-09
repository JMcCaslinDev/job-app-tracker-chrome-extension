// background.js
chrome.runtime.onInstalled.addListener(() => {
    console.log('Extension installed and background script loaded.');
});

// background.js
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    console.log('Received message:', request);
    if (request.action === 'saveJobData') {
        console.log('Saving job data:', request.data);
        // Simulate a database operation with a timeout
        setTimeout(() => {
            console.log('Data saved to database:', request.data);
            sendResponse({status: 'Success', message: 'Data saved successfully'});
        }, 1000); // Simulate async database operation
    }
    return true; // Keep the message channel open for the response
});


function saveToDatabase(jobData) {
    console.log('Saving job data to the database:', jobData);
    // Placeholder for database implementation
    // Log here when actual save to database is implemented
}

// Ensure this logs show up when you test by opening the background page's Developer Console in chrome://extensions/
