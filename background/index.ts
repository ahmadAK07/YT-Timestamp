import { Storage } from "@plasmohq/storage";
const storage = new Storage();
let currentUrl = "";

chrome.runtime.onMessage.addListener(async (request, sender, sendResponse) => {
    if (request.type === "saveTime" && request.url) {
        console.log("Received time:", request.time, "for URL:", request.url);
         
        let cleanedUrl = cleanYouTubeURL(request.url); // Use the URL from the message
        await saveVideoUrl(request.videoTitle, cleanedUrl);
        let res = await getTimeFromStorage(cleanedUrl);
        res.push(request.time);
        
        await saveTimeInStorage(cleanedUrl, res);
        sendResponse({ success: true });
        return true;  // Important for async sendResponse handling
    }
});

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === "play-video") {
        chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
            chrome.tabs.sendMessage(tabs[0].id, { action: "playVideo", time: request.time }, (res) => {
                console.log(res);
                sendResponse({ success: true });
            });
        });
        return true; // Important for async sendResponse handling
    }
});

async function saveVideoUrl(title, url) {
    let res = await storage.get("videoUrlList");
    if (res) {
        let data = JSON.parse(res);
        let exist = existsInArray(data, (obj) => obj.url === url);
        if (!exist) {
            data.push({ title: title, url: url });
            console.log("title and url object is pushed in videoUrlList: ", data);
            await storage.set("videoUrlList", JSON.stringify(data));
        }
    } else {
        await storage.set("videoUrlList", JSON.stringify([{ title: title, url: url }]));
        console.log("videoUrlList created to store object of title and url: ", { title, url });
    }
}

function existsInArray(arr, condition) {
    return arr.some(condition);
}

async function saveTimeInStorage(url, timeInSeconds) {
    console.log("time saved for this url: ", url);
    await storage.set(`${url}`, JSON.stringify(timeInSeconds));
    console.log("time saved", timeInSeconds);
}

async function getTimeFromStorage(url) {
    let result = await storage.get(`${url}`);
    if (result) {
        let data = JSON.parse(result);
        if (data) {
            console.log("retrieved time: ", data);
            return data;
        }
    }
    return [];
}

function cleanYouTubeURL(url) {
    try {
        const urlObj = new URL(url); // Parse the URL
        const videoID = urlObj.searchParams.get("v"); // Get the 'v' parameter

        if (videoID) {
            // Clear all search parameters
            urlObj.search = "";
            // Add back only the 'v' parameter
            urlObj.searchParams.set("v", videoID);
        }

        return urlObj.toString(); // Return the cleaned URL
    } catch (error) {
        console.error("Invalid URL:", error);
        return null;
    }
}

chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
    if (changeInfo.url) {
        currentUrl = changeInfo.url;
    }
});
