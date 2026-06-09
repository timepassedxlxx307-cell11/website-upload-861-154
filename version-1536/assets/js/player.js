function initMoviePlayer(config) {
  var video = document.getElementById("movie-video");
  var cover = document.querySelector(".player-cover");
  var message = document.querySelector(".player-message");
  var playButtons = document.querySelectorAll("[data-player-start]");
  var hlsInstance = null;
  var prepared = false;

  if (!video || !config || !config.url) {
    return;
  }

  function showMessage(text) {
    if (!message) {
      return;
    }
    message.textContent = text;
    message.classList.add("is-visible");
  }

  function prepare() {
    if (prepared) {
      return;
    }

    if (video.canPlayType("application/vnd.apple.mpegurl")) {
      video.src = config.url;
      prepared = true;
      return;
    }

    if (window.Hls && window.Hls.isSupported()) {
      hlsInstance = new window.Hls({
        enableWorker: true,
        lowLatencyMode: true
      });
      hlsInstance.loadSource(config.url);
      hlsInstance.attachMedia(video);
      hlsInstance.on(window.Hls.Events.ERROR, function (event, data) {
        if (data && data.fatal) {
          showMessage("播放暂时不可用");
        }
      });
      prepared = true;
      return;
    }

    video.src = config.url;
    prepared = true;
  }

  function start() {
    prepare();
    if (cover) {
      cover.classList.add("is-hidden");
    }
    var promise = video.play();
    if (promise && typeof promise.catch === "function") {
      promise.catch(function () {
        showMessage("点击画面继续播放");
      });
    }
  }

  playButtons.forEach(function (button) {
    button.addEventListener("click", function (event) {
      event.preventDefault();
      event.stopPropagation();
      start();
    });
  });

  if (cover) {
    cover.addEventListener("click", start);
  }

  video.addEventListener("click", function () {
    if (video.paused) {
      start();
      return;
    }
    video.pause();
  });

  video.addEventListener("play", function () {
    if (cover) {
      cover.classList.add("is-hidden");
    }
  });

  window.addEventListener("beforeunload", function () {
    if (hlsInstance) {
      hlsInstance.destroy();
    }
  });
}
