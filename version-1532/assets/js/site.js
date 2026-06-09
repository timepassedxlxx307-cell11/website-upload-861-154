(function () {
    var ready = function (callback) {
        if (document.readyState !== "loading") {
            callback();
        } else {
            document.addEventListener("DOMContentLoaded", callback);
        }
    };

    ready(function () {
        var menuButton = document.querySelector(".mobile-menu-button");
        var mobileNav = document.querySelector(".mobile-nav");
        if (menuButton && mobileNav) {
            menuButton.addEventListener("click", function () {
                mobileNav.classList.toggle("is-open");
                menuButton.setAttribute("aria-expanded", mobileNav.classList.contains("is-open") ? "true" : "false");
            });
        }

        var slides = Array.prototype.slice.call(document.querySelectorAll(".hero-slide"));
        var dots = Array.prototype.slice.call(document.querySelectorAll(".hero-dot"));
        if (slides.length > 1) {
            var activeIndex = 0;
            var showSlide = function (index) {
                activeIndex = (index + slides.length) % slides.length;
                slides.forEach(function (slide, itemIndex) {
                    slide.classList.toggle("is-active", itemIndex === activeIndex);
                });
                dots.forEach(function (dot, itemIndex) {
                    dot.classList.toggle("is-active", itemIndex === activeIndex);
                });
            };
            dots.forEach(function (dot, itemIndex) {
                dot.addEventListener("click", function () {
                    showSlide(itemIndex);
                });
            });
            window.setInterval(function () {
                showSlide(activeIndex + 1);
            }, 5200);
        }

        var filterForms = Array.prototype.slice.call(document.querySelectorAll(".movie-filter"));
        filterForms.forEach(function (form) {
            var keywordInput = form.querySelector("[data-filter='keyword']");
            var genreSelect = form.querySelector("[data-filter='genre']");
            var yearSelect = form.querySelector("[data-filter='year']");
            var scopeSelector = form.getAttribute("data-scope") || ".movie-card";
            var cards = Array.prototype.slice.call(document.querySelectorAll(scopeSelector));
            var emptyState = document.querySelector(form.getAttribute("data-empty") || "");
            var normalize = function (value) {
                return (value || "").toString().trim().toLowerCase();
            };
            var applyFilter = function () {
                var keyword = normalize(keywordInput && keywordInput.value);
                var genre = normalize(genreSelect && genreSelect.value);
                var year = normalize(yearSelect && yearSelect.value);
                var visible = 0;
                cards.forEach(function (card) {
                    var haystack = normalize(card.getAttribute("data-title") + " " + card.getAttribute("data-genre") + " " + card.getAttribute("data-tags") + " " + card.getAttribute("data-region") + " " + card.getAttribute("data-type"));
                    var cardGenre = normalize(card.getAttribute("data-genre") + " " + card.getAttribute("data-tags") + " " + card.getAttribute("data-type"));
                    var cardYear = normalize(card.getAttribute("data-year"));
                    var matched = true;
                    if (keyword && haystack.indexOf(keyword) === -1) {
                        matched = false;
                    }
                    if (genre && cardGenre.indexOf(genre) === -1) {
                        matched = false;
                    }
                    if (year && cardYear !== year) {
                        matched = false;
                    }
                    card.classList.toggle("hidden-card", !matched);
                    if (matched) {
                        visible += 1;
                    }
                });
                if (emptyState) {
                    emptyState.classList.toggle("is-visible", visible === 0);
                }
            };
            [keywordInput, genreSelect, yearSelect].forEach(function (control) {
                if (control) {
                    control.addEventListener("input", applyFilter);
                    control.addEventListener("change", applyFilter);
                }
            });
        });

        var hlsLoader = null;
        var loadHls = function (callback) {
            if (window.Hls) {
                callback();
                return;
            }
            if (hlsLoader) {
                hlsLoader.addEventListener("load", callback, { once: true });
                hlsLoader.addEventListener("error", callback, { once: true });
                return;
            }
            hlsLoader = document.createElement("script");
            hlsLoader.src = "https://cdn.jsdelivr.net/npm/hls.js@1.5.18/dist/hls.min.js";
            hlsLoader.onload = callback;
            hlsLoader.onerror = callback;
            document.head.appendChild(hlsLoader);
        };

        var startPlayer = function (player) {
            var video = player.querySelector("video");
            var overlay = player.querySelector(".player-overlay");
            if (!video || player.getAttribute("data-ready") === "true") {
                if (video) {
                    video.play().catch(function () {});
                }
                if (overlay) {
                    overlay.classList.add("is-hidden");
                }
                return;
            }
            var stream = player.getAttribute("data-stream");
            var playVideo = function () {
                if (video.canPlayType("application/vnd.apple.mpegurl")) {
                    video.src = stream;
                    video.load();
                } else if (window.Hls && window.Hls.isSupported()) {
                    var hls = new window.Hls({ enableWorker: true, lowLatencyMode: true });
                    hls.loadSource(stream);
                    hls.attachMedia(video);
                    player._hls = hls;
                } else {
                    video.src = stream;
                    video.load();
                }
                player.setAttribute("data-ready", "true");
                if (overlay) {
                    overlay.classList.add("is-hidden");
                }
                video.play().catch(function () {});
            };
            loadHls(playVideo);
        };

        Array.prototype.slice.call(document.querySelectorAll(".player-shell")).forEach(function (player) {
            var button = player.querySelector(".play-button");
            var video = player.querySelector("video");
            if (button) {
                button.addEventListener("click", function (event) {
                    event.preventDefault();
                    event.stopPropagation();
                    startPlayer(player);
                });
            }
            player.addEventListener("click", function (event) {
                if (event.target && event.target.closest && event.target.closest("button")) {
                    return;
                }
                startPlayer(player);
            });
            if (video) {
                video.addEventListener("play", function () {
                    var overlay = player.querySelector(".player-overlay");
                    if (overlay) {
                        overlay.classList.add("is-hidden");
                    }
                });
            }
        });
    });
})();
