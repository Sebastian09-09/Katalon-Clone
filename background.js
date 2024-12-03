chrome.action.onClicked.addListener(async () => {
    chrome.windows.create({
      url: chrome.runtime.getURL("emon.html"),
      type: "popup",
      width: 800,
      height: 600
    });
});

chrome.tabs.onUpdated.addListener(function(tabId, changeInfo , tab) {
  if (changeInfo.status === "complete" && tab.url) {
    let eventType = 'open';
    let value = undefined;
    let page = tab.url;
    let xpath = tab.url;
    chrome.runtime.sendMessage({
      type: "logEvent",
      data: {eventType, xpath , value, page}
  });
}
});