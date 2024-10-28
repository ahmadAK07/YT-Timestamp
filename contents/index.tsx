import type { PlasmoCSConfig, PlasmoGetInlineAnchor } from "plasmo";
import React, { useEffect, useState } from "react";

export const config: PlasmoCSConfig = {
  matches: ["https://www.youtube.com/*"]
};

export const getInlineAnchor: PlasmoGetInlineAnchor = async () => ({
  element: document.querySelector(".ytp-time-wrapper")
});

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
        style={{
          backgroundColor: "pink",
          color: "#222",
          fontSize: "16px",
          transform: "translate(100px, -35px)"
        }}
      >
        Add
      </button>
    </div>
  );
};

export default Btn;
