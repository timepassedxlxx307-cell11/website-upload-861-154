(function () {
    function ready(callback) {
        if (document.readyState === "loading") {
            document.addEventListener("DOMContentLoaded", callback);
        } else {
            callback();
        }
    }

    function loadHls(callback) {
        if (window.Hls) {
            callback();
            return;
        }

        var script = document.createElement("script");
        script.src = "https://cdn.jsdelivr.net/npm/hls.js@1.6.15/dist/hls.min.js";
        script.onload = callback;
        script.onerror = callback;
        document.head.appendChild(script);
    }

    function setStatus(root, message) {
        var status = root.querySelector("[data-player-status]");
        if (status) {
            status.textContent = message;
        }
    }

    function startPlayer(root) {
        var video = root.querySelector("video");
        var source = root.getAttribute("data-src");

        if (!video || !source) {
            setStatus(root, "播放源暂不可用");
            return;
        }

        function playVideo() {
            root.classList.add("is-playing");
            var promise = video.play();
            if (promise && typeof promise.catch === "function") {
                promise.catch(function () {
                    root.classList.remove("is-playing");
                    setStatus(root, "点击播放器继续播放");
                });
            }
        }

        if (video.canPlayType("application/vnd.apple.mpegurl")) {
            video.src = source;
            video.addEventListener("loadedmetadata", playVideo, { once: true });
            video.load();
            setStatus(root, "正在加载高清播放源");
            return;
        }

        loadHls(function () {
            if (window.Hls && window.Hls.isSupported()) {
                var hls = new window.Hls({ enableWorker: true, lowLatencyMode: true });
                hls.loadSource(source);
                hls.attachMedia(video);
                hls.on(window.Hls.Events.MANIFEST_PARSED, function () {
                    setStatus(root, "播放中");
                    playVideo();
                });
                hls.on(window.Hls.Events.ERROR, function () {
                    setStatus(root, "播放源加载中");
                });
            } else {
                video.src = source;
                video.load();
                setStatus(root, "正在加载播放源");
                playVideo();
            }
        });
    }

    ready(function () {
        Array.prototype.slice.call(document.querySelectorAll("[data-player]")).forEach(function (root) {
            var button = root.querySelector("[data-play-button]");
            var started = false;

            function startOnce() {
                if (started) {
                    return;
                }
                started = true;
                startPlayer(root);
            }

            if (button) {
                button.addEventListener("click", startOnce);
            }
        });
    });
})();
