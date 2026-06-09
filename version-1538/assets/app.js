(function () {
    function ready(fn) {
        if (document.readyState !== "loading") {
            fn();
        } else {
            document.addEventListener("DOMContentLoaded", fn);
        }
    }

    function setupNavigation() {
        var toggle = document.querySelector(".nav-toggle");
        var nav = document.querySelector(".main-nav");
        if (!toggle || !nav) {
            return;
        }
        toggle.addEventListener("click", function () {
            nav.classList.toggle("is-open");
        });
    }

    function setupHero() {
        var slides = Array.prototype.slice.call(document.querySelectorAll(".hero-slide"));
        var dots = Array.prototype.slice.call(document.querySelectorAll(".hero-dot"));
        if (!slides.length) {
            return;
        }
        var active = 0;
        var timer = null;
        function show(index) {
            active = (index + slides.length) % slides.length;
            slides.forEach(function (slide, current) {
                slide.classList.toggle("is-active", current === active);
            });
            dots.forEach(function (dot, current) {
                dot.classList.toggle("is-active", current === active);
            });
        }
        function start() {
            stop();
            timer = setInterval(function () {
                show(active + 1);
            }, 5200);
        }
        function stop() {
            if (timer) {
                clearInterval(timer);
                timer = null;
            }
        }
        dots.forEach(function (dot, index) {
            dot.addEventListener("click", function () {
                show(index);
                start();
            });
        });
        var hero = document.querySelector(".hero");
        if (hero) {
            hero.addEventListener("mouseenter", stop);
            hero.addEventListener("mouseleave", start);
        }
        show(0);
        start();
    }

    function setupGlobalSearch() {
        var forms = Array.prototype.slice.call(document.querySelectorAll("[data-global-search]"));
        if (!forms.length || !window.movieSearchIndex) {
            return;
        }
        forms.forEach(function (form) {
            var input = form.querySelector("input");
            var results = form.querySelector(".search-results");
            if (!input || !results) {
                return;
            }
            function close() {
                results.classList.remove("is-open");
                results.innerHTML = "";
            }
            function render(items) {
                if (!items.length) {
                    results.innerHTML = '<div class="search-result-item"><div><strong class="search-result-title">没有找到相关影片</strong><span class="search-result-meta">换一个关键词试试</span></div></div>';
                    results.classList.add("is-open");
                    return;
                }
                results.innerHTML = items.slice(0, 10).map(function (item) {
                    return '<a class="search-result-item" href="' + item.url + '">' +
                        '<img class="search-result-thumb" src="' + item.cover + '" alt="' + item.title + '">' +
                        '<div><strong class="search-result-title">' + item.title + '</strong>' +
                        '<span class="search-result-meta">' + item.year + ' · ' + item.region + ' · ' + item.type + '</span></div>' +
                        '</a>';
                }).join("");
                results.classList.add("is-open");
            }
            function search() {
                var keyword = input.value.trim().toLowerCase();
                if (!keyword) {
                    close();
                    return;
                }
                var items = window.movieSearchIndex.filter(function (item) {
                    return item.text.indexOf(keyword) !== -1;
                });
                render(items);
            }
            input.addEventListener("input", search);
            input.addEventListener("focus", search);
            form.addEventListener("submit", function (event) {
                event.preventDefault();
                var first = results.querySelector("a");
                if (first) {
                    window.location.href = first.getAttribute("href");
                }
            });
            document.addEventListener("click", function (event) {
                if (!form.contains(event.target)) {
                    close();
                }
            });
        });
    }

    function setupLocalFilters() {
        var blocks = Array.prototype.slice.call(document.querySelectorAll("[data-filter-block]"));
        blocks.forEach(function (block) {
            var input = block.querySelector("[data-local-search]");
            var buttons = Array.prototype.slice.call(block.querySelectorAll("[data-local-filter]"));
            var cards = Array.prototype.slice.call(document.querySelectorAll(".searchable-card"));
            var empty = document.querySelector(".no-results");
            var current = "all";
            function test(card, keyword, filter) {
                var text = (card.getAttribute("data-search") || "").toLowerCase();
                var type = card.getAttribute("data-type") || "";
                var region = card.getAttribute("data-region") || "";
                var year = card.getAttribute("data-year") || "";
                var genre = card.getAttribute("data-genre") || "";
                var matchesKeyword = !keyword || text.indexOf(keyword) !== -1;
                var matchesFilter = filter === "all" || type === filter || region === filter || year === filter || genre.indexOf(filter) !== -1;
                return matchesKeyword && matchesFilter;
            }
            function apply() {
                var keyword = input ? input.value.trim().toLowerCase() : "";
                var shown = 0;
                cards.forEach(function (card) {
                    var visible = test(card, keyword, current);
                    card.style.display = visible ? "" : "none";
                    if (visible) {
                        shown += 1;
                    }
                });
                if (empty) {
                    empty.classList.toggle("is-visible", shown === 0);
                }
            }
            if (input) {
                input.addEventListener("input", apply);
            }
            buttons.forEach(function (button) {
                button.addEventListener("click", function () {
                    current = button.getAttribute("data-local-filter") || "all";
                    buttons.forEach(function (item) {
                        item.classList.toggle("is-active", item === button);
                    });
                    apply();
                });
            });
            apply();
        });
    }

    window.initMoviePlayer = function (streamUrl) {
        var video = document.getElementById("movie-video");
        var overlay = document.getElementById("play-overlay");
        if (!video || !streamUrl) {
            return;
        }
        var attached = false;
        var hlsInstance = null;
        function hideOverlay() {
            if (overlay) {
                overlay.classList.add("is-hidden");
            }
        }
        function showOverlay() {
            if (overlay && video.paused) {
                overlay.classList.remove("is-hidden");
            }
        }
        function playVideo() {
            var attempt = video.play();
            if (attempt && typeof attempt.catch === "function") {
                attempt.catch(function () {
                    showOverlay();
                });
            }
        }
        function attach() {
            if (attached) {
                playVideo();
                return;
            }
            attached = true;
            if (video.canPlayType("application/vnd.apple.mpegurl")) {
                video.src = streamUrl;
                video.addEventListener("loadedmetadata", playVideo, { once: true });
                video.load();
                playVideo();
                return;
            }
            if (window.Hls && window.Hls.isSupported()) {
                hlsInstance = new window.Hls({ enableWorker: true });
                hlsInstance.loadSource(streamUrl);
                hlsInstance.attachMedia(video);
                hlsInstance.on(window.Hls.Events.MANIFEST_PARSED, function () {
                    playVideo();
                });
                return;
            }
            video.src = streamUrl;
            video.load();
            playVideo();
        }
        function begin() {
            hideOverlay();
            attach();
        }
        if (overlay) {
            overlay.addEventListener("click", begin);
        }
        video.addEventListener("click", function () {
            if (video.paused) {
                begin();
            }
        });
        video.addEventListener("play", hideOverlay);
        video.addEventListener("pause", showOverlay);
        window.addEventListener("beforeunload", function () {
            if (hlsInstance) {
                hlsInstance.destroy();
            }
        });
    };

    ready(function () {
        setupNavigation();
        setupHero();
        setupGlobalSearch();
        setupLocalFilters();
    });
})();
