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

    // Cleaning the input by remove unnecessary elements and data
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
    let styleElements = tempElement.querySelectorAll("style");
    styleElements.forEach(function (element) {
      element.remove();
    });
    let navElements = tempElement.querySelectorAll("nav");
    navElements.forEach(function (element) {
      element.remove();
    });
    let iframeElements = tempElement.querySelectorAll("iframe");
    iframeElements.forEach(function (element) {
      element.remove();
    });
    let imgElements = tempElement.querySelectorAll("img");
    imgElements.forEach(function (element) {
      element.remove();
    });

    // Extract the text content from the new element
    let textContent = tempElement.textContent;

    textContent = textContent.replace(/[\r\n]+/gm, "");

    fetch("https://api.openai.com/v1/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: "Bearer " + "",
      },
      body: JSON.stringify({
        model: "text-davinci-003",
        prompt: `Summarize the following terms and conditions in no more than 10 points in an easy to understand language and enclose every point with <li> tag. \n ${textContent}`,
        temperature: 0.7,
        max_tokens: 256,
        top_p: 1,
        frequency_penalty: 0.3,
        presence_penalty: 0,
      }),
    })
      .then(response => response.json())
      .then(data => {
        chrome.runtime.sendMessage({
          action: "SUMMARY",
          summary: data,
          textContent,
          bulletPoints: body,
        });
        // let [tab] = await chrome.tabs.query({
        //   active: true,
        //   currentWindow: true,
        // });

        // chrome.scripting.executeScript({
        //   target: { tabId: tab.id },
        //   function: () => {
        //     document.getElementById("bulletPoints").innerHTML =
        //       data.choices[0].text;
        //   },
        // });
        const newUl = document.createElement("ul");
        newUl.id = "bulletPoints";
        newUl.innerHTML = data.choices[0].text;
        const wrapper = document.createElement("div");
        wrapper.appendChild(newUl);

        wrapper.style =
          "position: fixed, top: 0, left: 0, width: 100%, height: 100%, background-color: red, z-index: 99999999999999";
        document.body.appendChild(wrapper);
      })
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
