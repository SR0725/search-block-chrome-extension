chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
  if (request.action === "refreshBlockedDomains") {
    chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
      if (tabs.length > 0) {
        chrome.tabs.sendMessage(tabs[0].id, request);
      }
    });
  }
});
