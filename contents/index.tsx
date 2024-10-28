import type { PlasmoCSConfig, PlasmoGetInlineAnchor, PlasmoGetStyle } from "plasmo";
import React, { useEffect, useState } from "react";

export const config: PlasmoCSConfig = {
  matches: ["https://www.youtube.com/*"]
};

export const getInlineAnchor: PlasmoGetInlineAnchor = async () => ({
  element: document.querySelector(".ytp-chrome-controls .ytp-left-controls")
});

export const getStyle: PlasmoGetStyle = () => {
  const style = document.createElement("style")
  style.textContent = `
     .yt-timestamp-btn{
      border: none;
      outline: none;
      background: transparent;
      transform: translateY(8px);
      cursor: pointer;
      color: red;
    }
    .yt-timestamp-btn svg{
      width: 24px;
      color: red;
    }
  `
  return style
}

// Move this outside the component to ensure it only runs once
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === "playVideo") {
    playVideo(message.time);
    sendResponse({ success: true });
  }
});

let playVideo = (playTime) => {
  let video = document.querySelector("video");
  if (video) {
    video.currentTime = playTime;
    video.play();
  }
};

let Btn = () => {
  const [time, setTime] = useState(0);

  let getTimeInSeconds = (t) => {
    let [minutes, seconds] = t.split(":");
    return parseInt(minutes) * 60 + parseInt(seconds);
  };

  const handleClick = () => {
    
    let t = document.querySelector(".ytp-left-controls .ytp-time-display .ytp-time-current");
    let videoTitle = document.querySelector("yt-formatted-string.style-scope.ytd-watch-metadata");
    let videoUrl = window.location.href;

    if (t?.textContent) {
      let seconds = getTimeInSeconds(t.textContent);
      setTime(seconds);

      // Send time and URL to background.ts with error handling
      chrome.runtime.sendMessage({ type: "saveTime", time: seconds, url: videoUrl, videoTitle: videoTitle.textContent }, (res) => {

          console.log("Response from background:", res);
        
      });
    }
  };

  return (
    <div>
      <button
        onClick={handleClick}
        className="yt-timestamp-btn"      >
        <svg fill="currentColor" viewBox="0 0 448 512"><path d="M256 80c0-17.7-14.3-32-32-32s-32 14.3-32 32l0 144L48 224c-17.7 0-32 14.3-32 32s14.3 32 32 32l144 0 0 144c0 17.7 14.3 32 32 32s32-14.3 32-32l0-144 144 0c17.7 0 32-14.3 32-32s-14.3-32-32-32l-144 0 0-144z"/></svg>
      </button>
    </div>
  );
};

export default Btn;
