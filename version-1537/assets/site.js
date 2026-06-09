(function () {
    const header = document.getElementById("siteHeader");
    const mobileButton = document.querySelector("[data-mobile-menu]");
    const mobilePanel = document.getElementById("mobilePanel");

    function updateHeader() {
        if (!header) {
            return;
        }
        if (window.scrollY > 16) {
            header.classList.add("is-scrolled");
        } else {
            header.classList.remove("is-scrolled");
        }
    }

    updateHeader();
    window.addEventListener("scroll", updateHeader, { passive: true });

    if (mobileButton && mobilePanel) {
        mobileButton.addEventListener("click", function () {
            mobilePanel.classList.toggle("is-open");
        });
    }

    const hero = document.querySelector("[data-hero-slider]");
    if (hero) {
        const slides = Array.from(hero.querySelectorAll(".hero-slide"));
        const dots = Array.from(hero.querySelectorAll("[data-hero-dot]"));
        const next = hero.querySelector("[data-hero-next]");
        const prev = hero.querySelector("[data-hero-prev]");
        let current = 0;
        let timer = null;

        function showSlide(index) {
            if (!slides.length) {
                return;
            }
            current = (index + slides.length) % slides.length;
            slides.forEach(function (slide, slideIndex) {
                slide.classList.toggle("is-active", slideIndex === current);
            });
            dots.forEach(function (dot, dotIndex) {
                dot.classList.toggle("is-active", dotIndex === current);
            });
        }

        function startTimer() {
            timer = window.setInterval(function () {
                showSlide(current + 1);
            }, 5200);
        }

        function restartTimer() {
            if (timer) {
                window.clearInterval(timer);
            }
            startTimer();
        }

        if (next) {
            next.addEventListener("click", function () {
                showSlide(current + 1);
                restartTimer();
            });
        }

        if (prev) {
            prev.addEventListener("click", function () {
                showSlide(current - 1);
                restartTimer();
            });
        }

        dots.forEach(function (dot) {
            dot.addEventListener("click", function () {
                showSlide(Number(dot.getAttribute("data-hero-dot")) || 0);
                restartTimer();
            });
        });

        showSlide(0);
        startTimer();
    }

    const filterAreas = document.querySelectorAll("[data-filter-area]");
    filterAreas.forEach(function (area) {
        const input = area.querySelector("[data-filter-input]");
        const yearSelect = area.querySelector("[data-filter-year]");
        const clear = area.querySelector("[data-filter-clear]");
        const items = Array.from(area.querySelectorAll(".movie-card, .rank-row"));
        const empty = area.querySelector("[data-filter-empty]");

        function valueOf(item) {
            return [
                item.getAttribute("data-title"),
                item.getAttribute("data-region"),
                item.getAttribute("data-year"),
                item.getAttribute("data-genre"),
                item.getAttribute("data-tags")
            ].join(" ").toLowerCase();
        }

        function applyFilter() {
            const query = input ? input.value.trim().toLowerCase() : "";
            const year = yearSelect ? yearSelect.value : "";
            let visible = 0;

            items.forEach(function (item) {
                const matchesQuery = !query || valueOf(item).indexOf(query) !== -1;
                const matchesYear = !year || item.getAttribute("data-year") === year;
                const show = matchesQuery && matchesYear;
                item.style.display = show ? "" : "none";
                if (show) {
                    visible += 1;
                }
            });

            if (empty) {
                empty.classList.toggle("is-visible", visible === 0);
            }
        }

        if (input) {
            input.addEventListener("input", applyFilter);
        }
        if (yearSelect) {
            yearSelect.addEventListener("change", applyFilter);
        }
        if (clear) {
            clear.addEventListener("click", function () {
                if (input) {
                    input.value = "";
                }
                if (yearSelect) {
                    yearSelect.value = "";
                }
                applyFilter();
            });
        }

        if (area.hasAttribute("data-search-page") && input) {
            const params = new URLSearchParams(window.location.search);
            const q = params.get("q");
            if (q) {
                input.value = q;
            }
        }

        applyFilter();
    });
})();

function initMoviePlayer(source) {
    const video = document.getElementById("moviePlayer");
    const cover = document.getElementById("playerCover");
    if (!video || !cover || !source) {
        return;
    }

    let attached = false;
    let hlsInstance = null;

    function attachSource() {
        if (attached) {
            return;
        }
        attached = true;

        if (video.canPlayType("application/vnd.apple.mpegurl")) {
            video.src = source;
            return;
        }

        if (window.Hls && window.Hls.isSupported()) {
            hlsInstance = new window.Hls({
                enableWorker: true,
                lowLatencyMode: true
            });
            hlsInstance.loadSource(source);
            hlsInstance.attachMedia(video);
            hlsInstance.on(window.Hls.Events.ERROR, function (event, data) {
                if (data && data.fatal) {
                    cover.classList.remove("is-hidden");
                }
            });
        }
    }

    function play() {
        attachSource();
        video.controls = true;
        cover.classList.add("is-hidden");
        const promise = video.play();
        if (promise && typeof promise.catch === "function") {
            promise.catch(function () {
                cover.classList.remove("is-hidden");
            });
        }
    }

    cover.addEventListener("click", play);
    video.addEventListener("click", function () {
        if (video.paused) {
            play();
        }
    });
    video.addEventListener("play", function () {
        cover.classList.add("is-hidden");
    });
    window.addEventListener("beforeunload", function () {
        if (hlsInstance) {
            hlsInstance.destroy();
        }
    });
}
