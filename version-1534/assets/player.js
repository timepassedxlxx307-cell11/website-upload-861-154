(function () {
  function setupPlayer(player) {
    var video = player.querySelector('video');
    var button = player.querySelector('.player-cover');
    var playUrl = player.getAttribute('data-play-url');
    var ready = false;
    var hls = null;

    if (!video || !button || !playUrl) {
      return;
    }

    function attach() {
      if (ready) {
        return;
      }
      ready = true;
      if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = playUrl;
      } else if (window.Hls && window.Hls.isSupported()) {
        hls = new window.Hls({
          enableWorker: true,
          lowLatencyMode: true,
          backBufferLength: 90
        });
        hls.loadSource(playUrl);
        hls.attachMedia(video);
      } else {
        video.src = playUrl;
      }
    }

    function begin() {
      attach();
      player.classList.add('is-playing');
      video.controls = true;
      var promise = video.play();
      if (promise && promise.catch) {
        promise.catch(function () {
          player.classList.remove('is-playing');
        });
      }
    }

    button.addEventListener('click', begin);

    video.addEventListener('click', function () {
      if (video.paused) {
        begin();
      } else {
        video.pause();
      }
    });

    video.addEventListener('play', function () {
      player.classList.add('is-playing');
    });

    video.addEventListener('pause', function () {
      if (!video.ended) {
        player.classList.remove('is-playing');
      }
    });

    window.addEventListener('beforeunload', function () {
      if (hls && hls.destroy) {
        hls.destroy();
      }
    });
  }

  Array.prototype.slice.call(document.querySelectorAll('.site-player')).forEach(setupPlayer);
})();
