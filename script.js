let getSummary = document.getElementById("getSummary");
console.log("hi");
getSummary.addEventListener("click", async () => {
  let [tab] = await chrome.tabs.query({
    active: true,
    currentWindow: true,
  });
  //Getting the current active tab

  //Executing the script to generate the summary of the page

  chrome.scripting.executeScript({
    target: { tabId: tab.id },
    function: generateSummary,
  });
});

//Gets the API Key from the user
document.getElementById("save_button").addEventListener("click", function () {
  let api_key = document.getElementById("api_key").value;
  chrome.runtime.sendMessage({
    action: "save_api_key",
    api_key: api_key,
  });
});

const generateSummary = async () => {
  let body = document.body.innerHTML;
  let regexToConfirmIfItIsTnCPage =
    /\b(?:terms\s+(?:of\s+service|and\s+conditions)?|privacy\s+policy)\b/;

  let checkIfItIsTnCPage = regexToConfirmIfItIsTnCPage.test(body);

  if (!checkIfItIsTnCPage) {
    let text =
      "This is not a Terms and Conditions page. Please try on a page which has the terms and conditions of the website";

    // chrome.runtime.sendMessage({ text, checkIfItIsTnCPage });
  } else {
    // Create a new element and set its innerHTML property
    let tempElement = document.createElement("div");
    tempElement.innerHTML = body;

    // Remove header and footer elements from the new element
    let headerElements = tempElement.querySelectorAll("header");
    headerElements.forEach(function (element) {
      element.remove();
    });

    let footerElements = tempElement.querySelectorAll("footer");
    footerElements.forEach(function (element) {
      element.remove();
    });
    let scriptElements = tempElement.querySelectorAll("script");
    scriptElements.forEach(function (element) {
      element.remove();
    });

    // Extract the text content from the new element
    let textContent = tempElement.textContent;

    fetch("https://api.openai.com/v1/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization:
          "Bearer " + "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",
      },
      body: JSON.stringify({
        model: "text-davinci-003",
        prompt: `Summarize the following terms and conditions in 5-10 bullet points in an easy to understand language without all the legal jargon. \n ${textContent}`,
        temperature: 0.7,
        max_tokens: 256,
        top_p: 1,
        frequency_penalty: 0.3,
        presence_penalty: 0,
      }),
    })
      .then(response => response.json())
      .then(data => alert("data", data.choices))
      .catch(error => alert(error, "error"));

    // let api_key = await chrome.runtime.sendMessage({ action: "get_api_key" }, function (api_key) {
    //   alert("api", api_key);
    //     fetch("https://api.openai.com/v1/completions", {
    //       method: "POST",
    //       headers: {
    //         "Content-Type": "application/json",
    //         Authorization: "Bearer " + api_key,
    //       },
    //       body: JSON.stringify({
    //         model: "text-davinci-003",
    //         prompt: `Summarize the following terms and conditions in 5-10 bullet points in an easy to understand language without all the legal jargon. \n ${textContent}`,
    //         temperature: 0.7,
    //         max_tokens: 256,
    //         top_p: 1,
    //         frequency_penalty: 0.3,
    //         presence_penalty: 0,
    //       }),
    //     })
    //       .then(response => response.json())
    //       .then(data => alert(data, "data"))
    //       .catch(error => alert(error, "error"));
    // });
  }
};

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  let text = request.text;
  if (!request.checkIfItIsTnCPage) {
    alert(text);
  }
});
