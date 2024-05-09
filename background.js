chrome.action.onClicked.addListener(function(tab) {
    chrome.tabs.create({ url: 'https://job-app-tracker-website-b2cef22d84a2.herokuapp.com/' });
  });