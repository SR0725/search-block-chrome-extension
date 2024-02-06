chrome.runtime.onMessage.addListener((request) => {
  if (request.action === "refreshBlockedDomains") {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      if (tabs.length > 0) {
        chrome.tabs.sendMessage(tabs[0].id, request);
      }
    });
  }
});
