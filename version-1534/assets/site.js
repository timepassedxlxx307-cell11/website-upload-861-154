(function () {
  var toggle = document.querySelector('[data-menu-toggle]');
  var menu = document.querySelector('[data-mobile-menu]');

  if (toggle && menu) {
    toggle.addEventListener('click', function () {
      menu.classList.toggle('is-open');
    });
  }

  var hero = document.querySelector('[data-hero]');

  if (hero) {
    var slides = Array.prototype.slice.call(hero.querySelectorAll('.hero-slide'));
    var dots = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-dot]'));
    var prev = hero.querySelector('[data-hero-prev]');
    var next = hero.querySelector('[data-hero-next]');
    var current = 0;
    var timer = null;

    function show(index) {
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

    function schedule() {
      window.clearInterval(timer);
      timer = window.setInterval(function () {
        show(current + 1);
      }, 5200);
    }

    dots.forEach(function (dot) {
      dot.addEventListener('click', function () {
        show(Number(dot.getAttribute('data-hero-dot')) || 0);
        schedule();
      });
    });

    if (prev) {
      prev.addEventListener('click', function () {
        show(current - 1);
        schedule();
      });
    }

    if (next) {
      next.addEventListener('click', function () {
        show(current + 1);
        schedule();
      });
    }

    show(0);
    schedule();
  }

  var filterInput = document.querySelector('.page-filter');
  var filterList = document.querySelector('[data-filter-list]');

  if (filterInput && filterList) {
    filterInput.addEventListener('input', function () {
      var keyword = filterInput.value.trim().toLowerCase();
      var cards = Array.prototype.slice.call(filterList.querySelectorAll('.movie-card'));
      cards.forEach(function (card) {
        var haystack = card.getAttribute('data-search') || '';
        card.classList.toggle('is-hidden-by-filter', keyword && haystack.indexOf(keyword) === -1);
      });
    });
  }

  var results = document.getElementById('search-results');
  var searchForm = document.querySelector('[data-search-form]');

  if (results && window.SEARCH_MOVIES) {
    var params = new URLSearchParams(window.location.search);
    var initialQuery = (params.get('q') || '').trim();
    var field = searchForm ? searchForm.querySelector('input[name="q"]') : null;

    if (field) {
      field.value = initialQuery;
    }

    function createCard(movie) {
      var article = document.createElement('article');
      article.className = 'movie-card';

      var link = document.createElement('a');
      link.className = 'poster-link';
      link.href = movie.link;
      link.setAttribute('aria-label', '观看' + movie.title);

      var img = document.createElement('img');
      img.className = 'poster';
      img.src = movie.image;
      img.alt = movie.title;

      var badge = document.createElement('span');
      badge.className = 'type-badge';
      badge.textContent = movie.type || '影片';

      var play = document.createElement('span');
      play.className = 'hover-play';
      play.textContent = '▶';

      link.appendChild(img);
      link.appendChild(badge);
      link.appendChild(play);

      var body = document.createElement('div');
      body.className = 'movie-card-body';

      var title = document.createElement('h2');
      var titleLink = document.createElement('a');
      titleLink.href = movie.link;
      titleLink.textContent = movie.title;
      title.appendChild(titleLink);

      var meta = document.createElement('p');
      meta.className = 'movie-meta';
      meta.textContent = [movie.year, movie.region, movie.genre].filter(Boolean).join(' · ');

      var line = document.createElement('p');
      line.className = 'movie-one-line';
      line.textContent = movie.oneLine || '';

      var tags = document.createElement('div');
      tags.className = 'tag-row';
      (movie.tags || []).slice(0, 3).forEach(function (item) {
        var tag = document.createElement('span');
        tag.textContent = item;
        tags.appendChild(tag);
      });

      body.appendChild(title);
      body.appendChild(meta);
      body.appendChild(line);
      body.appendChild(tags);
      article.appendChild(link);
      article.appendChild(body);
      return article;
    }

    function renderSearch(query) {
      var keyword = query.trim().toLowerCase();
      var matched = window.SEARCH_MOVIES.filter(function (movie) {
        var text = [movie.title, movie.region, movie.type, movie.year, movie.genre, (movie.tags || []).join(' '), movie.oneLine].join(' ').toLowerCase();
        return keyword ? text.indexOf(keyword) !== -1 : true;
      }).slice(0, 96);
      results.innerHTML = '';
      if (!matched.length) {
        var empty = document.createElement('div');
        empty.className = 'empty-state';
        empty.textContent = '没有找到匹配影片，可以换一个关键词继续搜索。';
        results.appendChild(empty);
        return;
      }
      matched.forEach(function (movie) {
        results.appendChild(createCard(movie));
      });
    }

    if (initialQuery) {
      renderSearch(initialQuery);
    }

    if (searchForm) {
      searchForm.addEventListener('submit', function (event) {
        event.preventDefault();
        var query = field ? field.value.trim() : '';
        var nextUrl = query ? './search.html?q=' + encodeURIComponent(query) : './search.html';
        window.history.replaceState(null, '', nextUrl);
        renderSearch(query);
      });
    }
  }
})();
