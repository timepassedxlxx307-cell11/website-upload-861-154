(function () {
    var panel = document.querySelector('.mobile-panel');
    var toggle = document.querySelector('.mobile-toggle');

    if (toggle && panel) {
        toggle.addEventListener('click', function () {
            panel.classList.toggle('open');
        });
    }

    document.querySelectorAll('[data-hero]').forEach(function (hero) {
        var slides = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-slide]'));
        var dots = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-dot]'));
        var prev = hero.querySelector('[data-hero-prev]');
        var next = hero.querySelector('[data-hero-next]');
        var index = 0;
        var timer = null;

        function show(nextIndex) {
            if (!slides.length) {
                return;
            }
            index = (nextIndex + slides.length) % slides.length;
            slides.forEach(function (slide, i) {
                slide.classList.toggle('active', i === index);
            });
            dots.forEach(function (dot, i) {
                dot.classList.toggle('active', i === index);
            });
        }

        function restart() {
            if (timer) {
                window.clearInterval(timer);
            }
            timer = window.setInterval(function () {
                show(index + 1);
            }, 5200);
        }

        dots.forEach(function (dot) {
            dot.addEventListener('click', function () {
                show(Number(dot.getAttribute('data-hero-dot')) || 0);
                restart();
            });
        });

        if (prev) {
            prev.addEventListener('click', function () {
                show(index - 1);
                restart();
            });
        }

        if (next) {
            next.addEventListener('click', function () {
                show(index + 1);
                restart();
            });
        }

        restart();
    });

    document.querySelectorAll('[data-filter-scope]').forEach(function (scope) {
        var input = scope.querySelector('[data-search-input]');
        var buttons = Array.prototype.slice.call(scope.querySelectorAll('[data-filter-value]'));
        var cards = Array.prototype.slice.call(scope.querySelectorAll('[data-title]'));
        var current = '';

        function normalize(value) {
            return (value || '').toString().trim().toLowerCase();
        }

        function matches(card, query) {
            var text = [
                card.getAttribute('data-title'),
                card.getAttribute('data-region'),
                card.getAttribute('data-year'),
                card.getAttribute('data-genre'),
                card.getAttribute('data-tags')
            ].join(' ').toLowerCase();
            return !query || text.indexOf(query) !== -1;
        }

        function apply() {
            var query = normalize(input ? input.value : '') || normalize(current);
            cards.forEach(function (card) {
                card.classList.toggle('is-hidden', !matches(card, query));
            });
        }

        if (input) {
            input.addEventListener('input', function () {
                current = '';
                buttons.forEach(function (button) {
                    button.classList.toggle('active', !button.getAttribute('data-filter-value'));
                });
                apply();
            });
        }

        buttons.forEach(function (button) {
            button.addEventListener('click', function () {
                current = button.getAttribute('data-filter-value') || '';
                if (input) {
                    input.value = current;
                }
                buttons.forEach(function (item) {
                    item.classList.toggle('active', item === button);
                });
                apply();
            });
        });
    });

    document.querySelectorAll('[data-player]').forEach(function (shell) {
        var video = shell.querySelector('video[data-stream]');
        var button = shell.querySelector('[data-video-start]');
        var state = shell.querySelector('[data-video-state]');

        if (!video) {
            return;
        }

        var source = video.getAttribute('data-stream');
        var ready = false;
        var hlsInstance = null;

        function setState(message) {
            if (state) {
                state.textContent = message || '';
            }
        }

        function attach() {
            if (ready || !source) {
                return;
            }

            if (window.Hls && window.Hls.isSupported()) {
                hlsInstance = new window.Hls({
                    enableWorker: true,
                    lowLatencyMode: false
                });
                hlsInstance.loadSource(source);
                hlsInstance.attachMedia(video);
                hlsInstance.on(window.Hls.Events.MANIFEST_PARSED, function () {
                    ready = true;
                    setState('');
                });
                hlsInstance.on(window.Hls.Events.ERROR, function (event, data) {
                    if (!data || !data.fatal) {
                        return;
                    }
                    if (data.type === window.Hls.ErrorTypes.NETWORK_ERROR) {
                        setState('网络连接异常，正在重新连接');
                        hlsInstance.startLoad();
                    } else if (data.type === window.Hls.ErrorTypes.MEDIA_ERROR) {
                        setState('媒体载入异常，正在恢复');
                        hlsInstance.recoverMediaError();
                    } else {
                        setState('视频暂时无法播放');
                        hlsInstance.destroy();
                    }
                });
            } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
                video.src = source;
                ready = true;
            } else {
                video.src = source;
                ready = true;
            }
        }

        function play() {
            attach();
            var promise = video.play();
            if (promise && promise.catch) {
                promise.catch(function () {
                    setState('点击视频控件开始播放');
                });
            }
        }

        if (button) {
            button.addEventListener('click', play);
        }

        video.addEventListener('click', function () {
            if (video.paused) {
                play();
            } else {
                video.pause();
            }
        });

        video.addEventListener('play', function () {
            shell.classList.add('playing');
            setState('');
        });

        video.addEventListener('pause', function () {
            shell.classList.remove('playing');
        });

        video.addEventListener('error', function () {
            setState('视频暂时无法播放');
        });

        window.addEventListener('beforeunload', function () {
            if (hlsInstance) {
                hlsInstance.destroy();
            }
        });
    });
}());
