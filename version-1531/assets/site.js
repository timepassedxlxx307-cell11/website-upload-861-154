(function () {
  function ready(callback) {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', callback);
    } else {
      callback();
    }
  }

  function normalize(value) {
    return String(value || '').toLowerCase().replace(/\s+/g, ' ').trim();
  }

  ready(function () {
    var toggle = document.querySelector('[data-menu-toggle]');
    var nav = document.querySelector('[data-main-nav]');

    if (toggle && nav) {
      toggle.addEventListener('click', function () {
        nav.classList.toggle('is-open');
      });
    }

    var slides = Array.prototype.slice.call(document.querySelectorAll('[data-hero-slide]'));
    var dots = Array.prototype.slice.call(document.querySelectorAll('[data-hero-dot]'));
    var current = 0;

    function showSlide(index) {
      if (!slides.length) {
        return;
      }

      current = (index + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle('is-active', slideIndex === current);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle('is-active', dotIndex === current);
      });
    }

    dots.forEach(function (dot) {
      dot.addEventListener('click', function () {
        showSlide(Number(dot.getAttribute('data-hero-dot')) || 0);
      });
    });

    if (slides.length > 1) {
      setInterval(function () {
        showSlide(current + 1);
      }, 5200);
    }

    var localSearch = document.querySelector('[data-card-search]');
    if (localSearch) {
      var cards = Array.prototype.slice.call(document.querySelectorAll('[data-search-text]'));
      localSearch.addEventListener('input', function () {
        var keyword = normalize(localSearch.value);
        cards.forEach(function (card) {
          var text = normalize(card.getAttribute('data-search-text'));
          card.style.display = !keyword || text.indexOf(keyword) !== -1 ? '' : 'none';
        });
      });
    }

    var globalSearch = document.querySelector('[data-global-search]');
    var results = document.querySelector('[data-search-results]');
    if (globalSearch && results) {
      var movies = [];

      function render(list) {
        if (!list.length) {
          results.innerHTML = '<p class="search-result-item">没有找到匹配影片，请尝试更换关键词。</p>';
          return;
        }

        results.innerHTML = list.slice(0, 80).map(function (movie) {
          return [
            '<a class="search-result-item" href="' + movie.url + '">',
            '<h2>' + movie.title + '</h2>',
            '<p>' + movie.meta + '</p>',
            '<p>' + movie.desc + '</p>',
            '</a>'
          ].join('');
        }).join('');
      }

      fetch('assets/movies-search.json')
        .then(function (response) {
          return response.json();
        })
        .then(function (data) {
          movies = data;
          render(movies.slice(0, 30));
        })
        .catch(function () {
          results.innerHTML = '<p class="search-result-item">搜索数据加载失败，请稍后刷新页面。</p>';
        });

      globalSearch.addEventListener('input', function () {
        var keyword = normalize(globalSearch.value);
        if (!keyword) {
          render(movies.slice(0, 30));
          return;
        }

        render(movies.filter(function (movie) {
          return normalize(movie.search).indexOf(keyword) !== -1;
        }));
      });
    }
  });
})();
