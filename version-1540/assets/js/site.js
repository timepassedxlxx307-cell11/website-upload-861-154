(function () {
    function ready(callback) {
        if (document.readyState === "loading") {
            document.addEventListener("DOMContentLoaded", callback);
        } else {
            callback();
        }
    }

    function normalize(value) {
        return (value || "").toString().trim().toLowerCase();
    }

    ready(function () {
        var menuButton = document.querySelector("[data-menu-button]");
        var mobileNav = document.querySelector("[data-mobile-nav]");

        if (menuButton && mobileNav) {
            menuButton.addEventListener("click", function () {
                mobileNav.classList.toggle("is-open");
            });
        }

        var hero = document.querySelector("[data-hero]");

        if (hero) {
            var slides = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-slide]"));
            var dots = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-dot]"));
            var prev = hero.querySelector("[data-hero-prev]");
            var next = hero.querySelector("[data-hero-next]");
            var index = 0;
            var timer = null;

            function show(nextIndex) {
                if (!slides.length) {
                    return;
                }
                index = (nextIndex + slides.length) % slides.length;
                slides.forEach(function (slide, current) {
                    slide.classList.toggle("is-active", current === index);
                });
                dots.forEach(function (dot, current) {
                    dot.classList.toggle("is-active", current === index);
                });
            }

            function play() {
                window.clearInterval(timer);
                timer = window.setInterval(function () {
                    show(index + 1);
                }, 5000);
            }

            dots.forEach(function (dot) {
                dot.addEventListener("click", function () {
                    show(Number(dot.getAttribute("data-hero-dot") || 0));
                    play();
                });
            });

            if (prev) {
                prev.addEventListener("click", function () {
                    show(index - 1);
                    play();
                });
            }

            if (next) {
                next.addEventListener("click", function () {
                    show(index + 1);
                    play();
                });
            }

            show(0);
            play();
        }

        var filterRoot = document.querySelector("[data-filter-root]");
        var filterList = document.querySelector(".filter-list");

        if (filterRoot && filterList) {
            var keywordInput = filterRoot.querySelector("[data-filter-keyword]");
            var regionSelect = filterRoot.querySelector("[data-filter-region]");
            var yearSelect = filterRoot.querySelector("[data-filter-year]");
            var typeSelect = filterRoot.querySelector("[data-filter-type]");
            var emptyState = document.querySelector("[data-empty-state]");
            var cards = Array.prototype.slice.call(filterList.querySelectorAll(".filter-card"));

            function updateFilter() {
                var keyword = normalize(keywordInput && keywordInput.value);
                var region = normalize(regionSelect && regionSelect.value);
                var year = normalize(yearSelect && yearSelect.value);
                var type = normalize(typeSelect && typeSelect.value);
                var visible = 0;

                cards.forEach(function (card) {
                    var haystack = normalize([
                        card.getAttribute("data-title"),
                        card.getAttribute("data-region"),
                        card.getAttribute("data-year"),
                        card.getAttribute("data-genre"),
                        card.getAttribute("data-type")
                    ].join(" "));
                    var matchesKeyword = !keyword || haystack.indexOf(keyword) !== -1;
                    var matchesRegion = !region || normalize(card.getAttribute("data-region")) === region;
                    var matchesYear = !year || normalize(card.getAttribute("data-year")) === year;
                    var matchesType = !type || normalize(card.getAttribute("data-type")) === type;
                    var visibleCard = matchesKeyword && matchesRegion && matchesYear && matchesType;
                    card.classList.toggle("is-hidden", !visibleCard);
                    if (visibleCard) {
                        visible += 1;
                    }
                });

                if (emptyState) {
                    emptyState.classList.toggle("is-visible", visible === 0);
                }
            }

            [keywordInput, regionSelect, yearSelect, typeSelect].forEach(function (control) {
                if (control) {
                    control.addEventListener("input", updateFilter);
                    control.addEventListener("change", updateFilter);
                }
            });

            updateFilter();
        }
    });
})();
