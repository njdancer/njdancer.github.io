"use strict";

document.addEventListener("DOMContentLoaded", function(event) {
  Array.from(document.getElementsByTagName("img")).forEach(function(image) {
    if (image.src.split('.').pop() == "mp4") {
      image.addEventListener("error", function(event) {
        var videoEl = document.createElement("video");
        ["autoplay", "loop", "muted", "playsinline", "preload"].forEach(function(attributeName) {
          videoEl.setAttribute(attributeName, "");
        })
        videoEl.setAttribute("class", videoEl.getAttribute("class") + " slideshow");

        var videoSource = document.createElement("source");
        videoSource.setAttribute("src", image.src);
        videoSource.setAttribute("type", "video/mp4");

        videoEl.appendChild(videoSource);

        image.parentNode.replaceChild(videoEl, image);
      });
    }
  });
});
