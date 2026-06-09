import { H as Hls } from './video-player-dru42stk.js';

function updateStatus(element, message) {
  if (element) {
    element.textContent = message || '';
  }
}

function initializePlayer(shell) {
  var video = shell.querySelector('.movie-video');
  var button = shell.querySelector('[data-play-button]');
  var status = shell.querySelector('[data-player-status]');

  if (!video || !button) {
    return;
  }

  var source = video.getAttribute('data-src');
  var hlsInstance = null;
  var isStarted = false;

  function play() {
    if (!source) {
      updateStatus(status, '未找到播放地址');
      return;
    }

    if (!isStarted) {
      isStarted = true;
      updateStatus(status, '正在加载播放源...');

      if (Hls && Hls.isSupported && Hls.isSupported()) {
        hlsInstance = new Hls({
          enableWorker: true,
          lowLatencyMode: true,
          backBufferLength: 90
        });
        hlsInstance.loadSource(source);
        hlsInstance.attachMedia(video);
        hlsInstance.on(Hls.Events.MANIFEST_PARSED, function () {
          shell.classList.add('is-ready');
          updateStatus(status, '');
          video.play().catch(function () {
            updateStatus(status, '点击播放器继续播放');
          });
        });
        hlsInstance.on(Hls.Events.ERROR, function (event, data) {
          if (data && data.fatal) {
            updateStatus(status, '播放源暂时无法加载，请稍后重试');
            if (hlsInstance) {
              hlsInstance.destroy();
              hlsInstance = null;
            }
          }
        });
      } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = source;
        shell.classList.add('is-ready');
        updateStatus(status, '');
        video.play().catch(function () {
          updateStatus(status, '点击播放器继续播放');
        });
      } else {
        updateStatus(status, '当前浏览器不支持 HLS 播放');
      }
    } else {
      shell.classList.add('is-ready');
      video.play().catch(function () {
        updateStatus(status, '点击播放器继续播放');
      });
    }
  }

  button.addEventListener('click', play);
}

document.addEventListener('DOMContentLoaded', function () {
  Array.prototype.slice.call(document.querySelectorAll('[data-player]')).forEach(initializePlayer);
});
