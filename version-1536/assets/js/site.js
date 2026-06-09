(function () {
  function ready(callback) {
    if (document.readyState !== "loading") {
      callback();
      return;
    }
    document.addEventListener("DOMContentLoaded", callback);
  }

  function initHeader() {
    var header = document.querySelector(".site-header");
    if (!header) {
      return;
    }

    var setScrolled = function () {
      header.classList.toggle("is-scrolled", window.scrollY > 18);
    };

    setScrolled();
    window.addEventListener("scroll", setScrolled, { passive: true });

    var toggle = document.querySelector("[data-menu-toggle]");
    if (toggle) {
      toggle.addEventListener("click", function () {
        header.classList.toggle("menu-open");
      });
    }
  }

  function initSearchForms() {
    document.querySelectorAll("[data-search-form]").forEach(function (form) {
      form.addEventListener("submit", function (event) {
        event.preventDefault();
        var input = form.querySelector("input[name='q']");
        var value = input ? input.value.trim() : "";
        if (!value) {
          return;
        }
        var target = form.getAttribute("data-target") || "search.html";
        window.location.href = target + "?q=" + encodeURIComponent(value);
      });
    });
  }

  function initHero() {
    var hero = document.querySelector("[data-hero]");
    if (!hero) {
      return;
    }

    var slides = Array.prototype.slice.call(hero.querySelectorAll(".hero-slide"));
    var dots = Array.prototype.slice.call(hero.querySelectorAll(".hero-dot"));
    var prev = hero.querySelector("[data-hero-prev]");
    var next = hero.querySelector("[data-hero-next]");
    var current = 0;
    var timer = null;

    function show(index) {
      current = (index + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle("is-active", slideIndex === current);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle("is-active", dotIndex === current);
      });
    }

    function go(step) {
      show(current + step);
    }

    function restart() {
      if (timer) {
        clearInterval(timer);
      }
      timer = setInterval(function () {
        go(1);
      }, 5200);
    }

    if (slides.length === 0) {
      return;
    }

    dots.forEach(function (dot, index) {
      dot.addEventListener("click", function () {
        show(index);
        restart();
      });
    });

    if (prev) {
      prev.addEventListener("click", function () {
        go(-1);
        restart();
      });
    }

    if (next) {
      next.addEventListener("click", function () {
        go(1);
        restart();
      });
    }

    show(0);
    restart();
  }

  function getQuery() {
    var params = new URLSearchParams(window.location.search);
    return params.get("q") || "";
  }

  function normalize(value) {
    return String(value || "").toLowerCase();
  }

  function createSearchCard(movie) {
    var article = document.createElement("article");
    article.className = "movie-card";
    article.innerHTML = [
      '<a class="card-cover" href="./movies/' + movie.file + '">',
      '  <img src="./' + movie.cover + '.jpg" alt="' + escapeHtml(movie.title) + '" loading="lazy">',
      '  <span class="card-year">' + escapeHtml(movie.year) + '</span>',
      '</a>',
      '<div class="card-content">',
      '  <a class="card-label" href="./category-' + movie.categorySlug + '.html">' + escapeHtml(movie.category) + '</a>',
      '  <h3><a href="./movies/' + movie.file + '">' + escapeHtml(movie.title) + '</a></h3>',
      '  <p>' + escapeHtml(movie.oneLine) + '</p>',
      '  <div class="card-meta"><span>' + escapeHtml(movie.region) + '</span><span>' + escapeHtml(movie.type) + '</span></div>',
      '</div>'
    ].join("");
    return article;
  }

  function escapeHtml(value) {
    return String(value || "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }

  function initSearchPage() {
    var results = document.querySelector("[data-search-results]");
    var queryInput = document.querySelector("[data-search-input]");
    var genreSelect = document.querySelector("[data-genre-filter]");
    var status = document.querySelector("[data-search-status]");
    var movies = window.siteMovieIndex || [];

    if (!results || !queryInput) {
      return;
    }

    var initialQuery = getQuery();
    queryInput.value = initialQuery;

    function render() {
      var query = normalize(queryInput.value.trim());
      var genre = genreSelect ? genreSelect.value : "";
      var matched = movies.filter(function (movie) {
        var text = normalize([
          movie.title,
          movie.region,
          movie.type,
          movie.year,
          movie.genre,
          movie.tags,
          movie.oneLine,
          movie.category
        ].join(" "));
        var queryMatched = !query || text.indexOf(query) !== -1;
        var genreMatched = !genre || movie.genre.indexOf(genre) !== -1 || movie.category === genre;
        return queryMatched && genreMatched;
      }).slice(0, 120);

      results.innerHTML = "";
      matched.forEach(function (movie) {
        results.appendChild(createSearchCard(movie));
      });

      if (status) {
        status.textContent = matched.length ? "已找到匹配影片" : "未找到匹配影片";
      }
    }

    queryInput.addEventListener("input", render);
    if (genreSelect) {
      genreSelect.addEventListener("change", render);
    }
    render();
  }

  ready(function () {
    initHeader();
    initSearchForms();
    initHero();
    initSearchPage();
  });
})();
