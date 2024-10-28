import { useState, useEffect } from "react";
import { Storage } from "@plasmohq/storage";
import { RiDeleteBin6Line } from "react-icons/ri";
import { FaPlay } from "react-icons/fa6";
import "./style.css";

const storage = new Storage();

function IndexPopup() {
  const [isSitesActive, setisSitesActive] = useState(false);
  const [url, setUrl] = useState("");
  const [times, setTimes] = useState([]);
  const [videoUrls, setVideoUrls] = useState([]);
  let api = "https://i.ytimg.com/vi/xzs9UUy220s/default.jpg";
  let getVideoId = (url) => {
    return url.split("v=")[1];
  }
  useEffect(() => {
    getCurrentUrl();
    getVideoUrlList();
  }, []);

  useEffect(() => {
    if (url.length > 0) {
      makeListReady();
    }
  }, [url]);

  
  function hasVideoParam(urlString) {
    try {
      const url = new URL(urlString);
      return url.searchParams.has("v");
    } catch (error) {
      console.error("Invalid URL:", error);
      return false;
    }
  }

  let makeListReady = async () => {
    let res = await getTimeFromStorage(url);
    if (res.length > 0) {
      setTimes(res);
    }
  };

  let getCurrentUrl = () => {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      if (tabs[0].url && hasVideoParam(tabs[0].url)) {
        setUrl(tabs[0].url);
      } else {
        setUrl(""); // Clear URL and times if no video ID
        setTimes([]);
      }
    });
  };

  async function saveTimeInStorage(url, timeInSeconds) {
    await storage.set(`${url}`, JSON.stringify(timeInSeconds));
  }

  function cleanYouTubeURL(url) {
    try {
      const urlObj = new URL(url);
      const videoID = urlObj.searchParams.get("v");
      if (videoID) {
        urlObj.search = "";
        urlObj.searchParams.set("v", videoID);
      }
      return urlObj.toString();
    } catch (error) {
      console.error("Invalid URL:", error);
      return null;
    }
  }

  async function getTimeFromStorage(url) {
    let onlyUrl = cleanYouTubeURL(url);
    let result = await storage.get(`${onlyUrl}`);
    if (result) {
      return JSON.parse(result);
    }
    return [];
  }

  let getVideoUrlList = async () => {
    try {
      let res = await storage.get("videoUrlList");
      let data = await JSON.parse(res);

      if(data.length > 0){
        setVideoUrls(data);
      }

    } catch (error) {
      
    }
  }

  let handlePlay = (time) => {
    chrome.runtime.sendMessage({ action: "play-video", time }, (res) => {
      console.log(res);
    });
  };

  let handleDelete = (time) => {
    let updatedTimes = times.filter((t) => t !== time);
    setTimes(updatedTimes);
    saveTimeInStorage(url, updatedTimes);
  };
  let openTab = (url) => {
     chrome.tabs.create({
      url: url
     })
  }

   
  return (
    <div className="container">
      <div className="btn-group">
        <button onClick={() => setisSitesActive(false)} style={!isSitesActive ? { backgroundColor: "#222", color: "white" } : {background: "#eee", color: "#222"}} title="Bookmarks for this Video">Bookmarks</button>
        <button onClick={() => setisSitesActive(true)} style={!isSitesActive ? { backgroundColor: "#eee", color: "#222" } : {background: "#222", color: "white"}} title="All Bookmakred Videos">All Videos</button>
      </div>
      <div  className="flex">
      <div style={{ display: !isSitesActive ? "block" : "none"}} className="timestamps">
     {url ? (
        <ul>
          {times.length > 0 ? (
            times.map((time, index) => (
              <li key={index}>
                <div>Time: {time}</div>
                <button className="bg-green" onClick={() => handlePlay(time)}>
                  <FaPlay />
                </button>
                <button className="bg-red" onClick={() => handleDelete(time)}>
                  <RiDeleteBin6Line />
                </button>
              </li>
            ))
          ) : (
            <li><h3>There are no bookmarks for this video.</h3></li>
          )}
        </ul>
      ) : (
        <h3>No video detected. Please open a YouTube video to view bookmarks.</h3>
      )}
     </div>
     <div style={{ display: isSitesActive ? "block" : "none"}} className="sites">
      <ul>
      {videoUrls.length > 0 ? videoUrls.map((video, index) => <li className="site-btn" onClick={() => openTab(video.url)} key={index}> <img alt="thubnail" width={"50px"} src={`https://i.ytimg.com/vi/${getVideoId(video.url)}/default.jpg`}/> <p>{video.title}</p></li>) : (
        <h3>There are no bookmarked videos.</h3>
        )}
      </ul>
     </div>
      </div>
    </div>
  );
}

export default IndexPopup;
