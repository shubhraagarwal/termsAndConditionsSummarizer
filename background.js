chrome.runtime.onInstalled.addListener(function () {
  chrome.storage.sync.set({ OPENAI_API_KEY: "" }, function () {
    console.log("API key initialized.");
  });
});

chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
  if (request.action == "save_api_key") {
    chrome.storage.sync.set({ OPENAI_API_KEY: request.api_key }, function () {
      console.log("API key saved.");
    });
  } else if (request.action == "get_api_key") {
    chrome.storage.sync.get("OPENAI_API_KEY", function (data) {
      sendResponse(data.OPENAI_API_KEY);
    });
    return true; // Make the message response asynchronous
  } else if (request.action == "SUMMARY") {
    console.log(request.summary, "data");
    console.log(request.textContent, "textContent");
    console.log(request.bulletPoints, "bulletPpoints");
  }
});
