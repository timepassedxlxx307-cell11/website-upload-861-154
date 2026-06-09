function ready(callback) {
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", callback);
    return;
  }
  callback();
}

function initMenu() {
  const button = document.querySelector(".menu-toggle");
  const mobileNav = document.querySelector(".mobile-nav");
  if (!button || !mobileNav) {
    return;
  }
  button.addEventListener("click", function () {
    const isOpen = mobileNav.classList.toggle("is-open");
    button.setAttribute("aria-expanded", String(isOpen));
  });
}

function initHeroSlider() {
  const slider = document.querySelector(".hero-slider");
  if (!slider) {
    return;
  }
  const slides = Array.from(slider.querySelectorAll(".hero-slide"));
  const dots = Array.from(slider.querySelectorAll(".hero-dot"));
  const prev = slider.querySelector("[data-slide-prev]");
  const next = slider.querySelector("[data-slide-next]");
  if (!slides.length) {
    return;
  }
  let index = Math.max(0, slides.findIndex(function (slide) {
    return slide.classList.contains("is-active");
  }));

  function show(nextIndex) {
    index = (nextIndex + slides.length) % slides.length;
    slides.forEach(function (slide, slideIndex) {
      slide.classList.toggle("is-active", slideIndex === index);
    });
    dots.forEach(function (dot, dotIndex) {
      dot.classList.toggle("is-active", dotIndex === index);
    });
  }

  dots.forEach(function (dot, dotIndex) {
    dot.addEventListener("click", function () {
      show(dotIndex);
    });
  });
  if (prev) {
    prev.addEventListener("click", function () {
      show(index - 1);
    });
  }
  if (next) {
    next.addEventListener("click", function () {
      show(index + 1);
    });
  }
  window.setInterval(function () {
    show(index + 1);
  }, 5200);
}

function initFilters() {
  const form = document.querySelector(".filter-search");
  const items = Array.from(document.querySelectorAll(".filter-item"));
  if (!form || !items.length) {
    return;
  }
  const keyword = form.querySelector("[name='q']");
  const year = form.querySelector("[name='year']");
  const region = form.querySelector("[name='region']");
  const empty = document.querySelector(".empty-state");
  const params = new URLSearchParams(window.location.search);
  if (keyword && params.get("q")) {
    keyword.value = params.get("q");
  }

  function normalize(value) {
    return String(value || "").trim().toLowerCase();
  }

  function runFilter(event) {
    if (event) {
      event.preventDefault();
    }
    const q = normalize(keyword ? keyword.value : "");
    const y = normalize(year ? year.value : "");
    const r = normalize(region ? region.value : "");
    let visible = 0;
    items.forEach(function (item) {
      const text = normalize(item.getAttribute("data-text"));
      const itemYear = normalize(item.getAttribute("data-year"));
      const itemRegion = normalize(item.getAttribute("data-region"));
      const matched = (!q || text.indexOf(q) !== -1) && (!y || itemYear === y) && (!r || itemRegion.indexOf(r) !== -1);
      item.style.display = matched ? "" : "none";
      if (matched) {
        visible += 1;
      }
    });
    if (empty) {
      empty.classList.toggle("is-visible", visible === 0);
    }
  }

  form.addEventListener("submit", runFilter);
  [keyword, year, region].forEach(function (field) {
    if (field) {
      field.addEventListener("input", runFilter);
      field.addEventListener("change", runFilter);
    }
  });
  runFilter();
}

function bindMoviePlayer(videoId, playUrl) {
  const video = document.getElementById(videoId);
  if (!video || !playUrl) {
    return;
  }
  const wrap = video.closest(".player-wrap");
  const button = wrap ? wrap.querySelector(".play-overlay") : null;
  let hlsInstance = null;
  let prepared = false;

  function prepare() {
    if (prepared) {
      return;
    }
    prepared = true;
    const nativeHls = video.canPlayType("application/vnd.apple.mpegurl") || video.canPlayType("application/x-mpegURL");
    if (nativeHls) {
      video.src = playUrl;
      return;
    }
    if (window.Hls && window.Hls.isSupported()) {
      hlsInstance = new window.Hls({
        enableWorker: true,
        lowLatencyMode: false,
        backBufferLength: 90
      });
      hlsInstance.loadSource(playUrl);
      hlsInstance.attachMedia(video);
      return;
    }
    video.src = playUrl;
  }

  function start() {
    prepare();
    if (button) {
      button.hidden = true;
    }
    if (wrap) {
      wrap.classList.add("is-playing");
    }
    const action = video.play();
    if (action && typeof action.catch === "function") {
      action.catch(function () {
        if (button) {
          button.hidden = false;
        }
        if (wrap) {
          wrap.classList.remove("is-playing");
        }
      });
    }
  }

  if (button) {
    button.addEventListener("click", start);
  }
  video.addEventListener("ended", function () {
    if (button) {
      button.hidden = false;
    }
    if (wrap) {
      wrap.classList.remove("is-playing");
    }
  });
  video.addEventListener("error", function () {
    if (hlsInstance) {
      hlsInstance.destroy();
      hlsInstance = null;
      prepared = false;
    }
  });
}

ready(function () {
  initMenu();
  initHeroSlider();
  initFilters();
});
