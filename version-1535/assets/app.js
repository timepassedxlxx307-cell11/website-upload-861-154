(function () {
    function ready(callback) {
        if (document.readyState === "loading") {
            document.addEventListener("DOMContentLoaded", callback);
        } else {
            callback();
        }
    }

    function setupMobileNav() {
        var toggle = document.querySelector("[data-mobile-toggle]");
        var nav = document.querySelector("[data-mobile-nav]");
        if (!toggle || !nav) {
            return;
        }
        toggle.addEventListener("click", function () {
            nav.classList.toggle("is-open");
        });
    }

    function setupHero() {
        var hero = document.querySelector("[data-hero]");
        if (!hero) {
            return;
        }
        var slides = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-slide]"));
        var dots = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-dot]"));
        if (slides.length <= 1) {
            return;
        }
        var active = 0;
        var timer = null;
        function show(index) {
            active = (index + slides.length) % slides.length;
            slides.forEach(function (slide, i) {
                slide.classList.toggle("is-active", i === active);
            });
            dots.forEach(function (dot, i) {
                dot.classList.toggle("is-active", i === active);
            });
        }
        function start() {
            timer = window.setInterval(function () {
                show(active + 1);
            }, 5200);
        }
        function restart() {
            if (timer) {
                window.clearInterval(timer);
            }
            start();
        }
        dots.forEach(function (dot) {
            dot.addEventListener("click", function () {
                show(Number(dot.getAttribute("data-hero-dot") || 0));
                restart();
            });
        });
        start();
    }

    function textOf(card) {
        return [
            card.getAttribute("data-title"),
            card.getAttribute("data-region"),
            card.getAttribute("data-type"),
            card.getAttribute("data-year"),
            card.getAttribute("data-genre"),
            card.getAttribute("data-tags")
        ].join(" ").toLowerCase();
    }

    function setupCategoryFilter() {
        var panel = document.querySelector("[data-filter-panel]");
        var list = document.querySelector("[data-filter-list]");
        if (!panel || !list) {
            return;
        }
        var input = panel.querySelector("[data-filter-input]");
        var typeSelect = panel.querySelector("[data-filter-type]");
        var cards = Array.prototype.slice.call(list.querySelectorAll("[data-card]"));
        function apply() {
            var term = input ? input.value.trim().toLowerCase() : "";
            var typeValue = typeSelect ? typeSelect.value : "";
            cards.forEach(function (card) {
                var matchTerm = !term || textOf(card).indexOf(term) !== -1;
                var matchType = !typeValue || card.getAttribute("data-type") === typeValue;
                card.classList.toggle("is-hidden", !(matchTerm && matchType));
            });
        }
        if (input) {
            input.addEventListener("input", apply);
        }
        if (typeSelect) {
            typeSelect.addEventListener("change", apply);
        }
        apply();
    }

    function setupSearchPage() {
        var panel = document.querySelector("[data-search-page]");
        var list = document.querySelector("[data-search-list]");
        if (!panel || !list) {
            return;
        }
        var params = new URLSearchParams(window.location.search);
        var input = panel.querySelector("[data-search-input]");
        var category = panel.querySelector("[data-search-category]");
        var region = panel.querySelector("[data-search-region]");
        var type = panel.querySelector("[data-search-type]");
        var year = panel.querySelector("[data-search-year]");
        var cards = Array.prototype.slice.call(list.querySelectorAll("[data-card]"));
        if (input && params.get("q")) {
            input.value = params.get("q");
        }
        function apply() {
            var term = input ? input.value.trim().toLowerCase() : "";
            var catValue = category ? category.value : "";
            var regionValue = region ? region.value : "";
            var typeValue = type ? type.value : "";
            var yearValue = year ? year.value : "";
            cards.forEach(function (card) {
                var ok = true;
                if (term && textOf(card).indexOf(term) === -1) {
                    ok = false;
                }
                if (catValue && card.getAttribute("data-category") !== catValue) {
                    ok = false;
                }
                if (regionValue && card.getAttribute("data-region") !== regionValue) {
                    ok = false;
                }
                if (typeValue && card.getAttribute("data-type") !== typeValue) {
                    ok = false;
                }
                if (yearValue && card.getAttribute("data-year") !== yearValue) {
                    ok = false;
                }
                card.classList.toggle("is-hidden", !ok);
            });
        }
        [input, category, region, type, year].forEach(function (control) {
            if (!control) {
                return;
            }
            control.addEventListener(control.tagName === "INPUT" ? "input" : "change", apply);
        });
        apply();
    }

    function setupPlayer() {
        var player = document.querySelector("[data-player]");
        if (!player) {
            return;
        }
        var video = player.querySelector("video");
        var button = player.querySelector("[data-play-button]");
        var src = player.getAttribute("data-video");
        var hls = null;
        var attached = false;
        function attach() {
            if (!video || !src || attached) {
                return;
            }
            if (video.canPlayType("application/vnd.apple.mpegurl")) {
                video.src = src;
            } else if (window.Hls && window.Hls.isSupported()) {
                hls = new window.Hls({
                    enableWorker: true,
                    lowLatencyMode: true
                });
                hls.loadSource(src);
                hls.attachMedia(video);
            } else {
                video.src = src;
            }
            attached = true;
        }
        function play() {
            attach();
            if (!video) {
                return;
            }
            var attempt = video.play();
            if (attempt && typeof attempt.catch === "function") {
                attempt.catch(function () {});
            }
        }
        if (button) {
            button.addEventListener("click", play);
        }
        if (video) {
            video.addEventListener("play", function () {
                if (button) {
                    button.classList.add("is-hidden");
                }
            });
            video.addEventListener("click", function () {
                if (video.paused) {
                    play();
                }
            });
        }
        window.addEventListener("beforeunload", function () {
            if (hls) {
                hls.destroy();
            }
        });
    }

    ready(function () {
        setupMobileNav();
        setupHero();
        setupCategoryFilter();
        setupSearchPage();
        setupPlayer();
    });
})();
