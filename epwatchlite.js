(function () {
    'use strict';

    if (window.epwatchlite_ready) return;
    window.epwatchlite_ready = true;

    var META = { name: 'EpWatch Lite', version: '0.1.0', author: 'nrsua' };

    var KEY_SUBS = 'epwlite_subs';
    var KEY_DESC = 'epwlite_plugins';

    var MIN = 60 * 1000, HOUR = 60 * MIN, DAY = 24 * HOUR;

    var CFG = {
        start_delay:    2 * MIN,
        step_gap:       20 * 1000,
        idle_tick:      10 * MIN,
        wait_retry:     MIN,
        interval:       HOUR,
        req_gap:        400,
        bal_timeout:    20000,
        events_timeout: 40000,
        events_ttl:     10 * MIN,
        fail_retry:     4 * HOUR,
        fail_attempts:  3,
        fail_age:       2 * DAY,
        defer_tmdb:     2 * HOUR,
        defer_error:    HOUR
    };

    var DICT = {
        epwlite_menu:                 { uk: 'EpW Lite', en: 'EpW Lite', ru: 'EpW Lite' },
        epwlite_title:                { uk: 'EpWatch Lite: сповіщення', en: 'EpWatch Lite: notifications', ru: 'EpWatch Lite: уведомления' },
        epwlite_tmdb_mode:            { uk: '🔔 За датою виходу (TMDB)', en: '🔔 By air date (TMDB)', ru: '🔔 По дате выхода (TMDB)' },
        epwlite_tmdb_mode_sub:        { uk: 'Без джерела: коли серія вийде за TMDB', en: 'No source: when the episode airs on TMDB', ru: 'Без источника: когда серия выйдет по TMDB' },
        epwlite_plugins_head:         { uk: 'Або оберіть онлайн-плагін:', en: 'Or pick an online plugin:', ru: 'Или выберите онлайн-плагин:' },
        epwlite_plugins_head_movie:   { uk: 'Оберіть онлайн-плагін:', en: 'Pick an online plugin:', ru: 'Выберите онлайн-плагин:' },
        epwlite_no_plugins:           { uk: 'Немає сумісних онлайн-плагінів', en: 'No compatible online plugins', ru: 'Нет совместимых онлайн-плагинов' },
        epwlite_no_plugins_sub:       { uk: 'Підтримуються плагіни на базі Lampac (/lite)', en: 'Lampac-based plugins (/lite) are supported', ru: 'Поддерживаются плагины на базе Lampac (/lite)' },
        epwlite_sources_head:         { uk: 'Оберіть джерело', en: 'Pick a source', ru: 'Выберите источник' },
        epwlite_source_absent:        { uk: 'зараз не знаходить цю картку', en: 'does not find this title yet', ru: 'пока не находит эту карточку' },
        epwlite_no_sources:           { uk: 'Немає доступних джерел', en: 'No sources available', ru: 'Нет доступных источников' },
        epwlite_source_rch:           { uk: 'Це джерело працює лише через RCH - не підтримується', en: 'This source works only via RCH - not supported', ru: 'Этот источник работает только через RCH - не поддерживается' },
        epwlite_bal_seasons:          { uk: 'сезони:', en: 'seasons:', ru: 'сезоны:' },
        epwlite_no_voices:            { uk: 'На цьому джерелі озвучень не знайдено', en: 'No voice-overs found on this source', ru: 'На этом источнике озвучек не найдено' },
        epwlite_pick_show:            { uk: 'Оберіть потрібний серіал', en: 'Pick the right show', ru: 'Выберите нужный сериал' },
        epwlite_pick_movie:           { uk: 'Оберіть потрібний фільм', en: 'Pick the right movie', ru: 'Выберите нужный фильм' },
        epwlite_cand_ref:             { uk: 'Картка, з якої підписуєтесь (TMDB)', en: 'The card you subscribe from (TMDB)', ru: 'Карточка, с которой подписываетесь (TMDB)' },
        epwlite_movie_wait_exact:     { uk: '⏳ Немає потрібного - чекати точного збігу', en: '⏳ Not listed - wait for an exact match', ru: '⏳ Нет нужного - ждать точного совпадения' },
        epwlite_movie_wait_exact_sub: { uk: 'Сповістимо, коли джерело знайде саме цей фільм', en: 'We will notify you when the source finds this exact movie', ru: 'Сообщим, когда источник найдёт именно этот фильм' },
        epwlite_pick_season:          { uk: 'Оберіть сезон', en: 'Pick a season', ru: 'Выберите сезон' },
        epwlite_season_auto:          { uk: '🆕 Автоматично (новий сезон)', en: '🆕 Auto (newest season)', ru: '🆕 Автоматически (новый сезон)' },
        epwlite_season_auto_sub:      { uk: 'Слідкувати завжди за новим', en: 'Always follow the latest one', ru: 'Следить всегда за новейшим' },
        epwlite_season_upcoming:      { uk: 'планується', en: 'upcoming', ru: 'планируется' },
        epwlite_season_airing:        { uk: 'виходить', en: 'airing', ru: 'выходит' },
        epwlite_season_aired:         { uk: 'завершено', en: 'aired', ru: 'вышел' },
        epwlite_season_eps:           { uk: 'серій', en: 'episodes', ru: 'серий' },
        epwlite_unsub_prefix:         { uk: '❌ Відписатися: ', en: '❌ Unsubscribe: ', ru: '❌ Отписаться: ' },
        epwlite_unsubscribed:         { uk: 'Підписку скасовано', en: 'Subscription removed', ru: 'Подписка отменена' },
        epwlite_subscribed:           { uk: '🔔 Підписку оформлено', en: '🔔 Subscribed', ru: '🔔 Подписка оформлена' },
        epwlite_subscribed_v:         { uk: '🔔 Підписка: ', en: '🔔 Subscribed: ', ru: '🔔 Подписка: ' },
        epwlite_movie_subscribed:     { uk: '🎬 Підписку на фільм оформлено', en: '🎬 Subscribed to movie', ru: '🎬 Подписка на фильм оформлена' },
        epwlite_movie_any_source:     { uk: '🔔 Будь-яке джерело плагіна', en: '🔔 Any source of the plugin', ru: '🔔 Любой источник плагина' },
        epwlite_movie_any_source_sub: { uk: 'Коли фільм з’явиться на будь-якому джерелі', en: 'When the movie appears on any source', ru: 'Когда фильм появится на любом источнике' },
        epwlite_any_source_word:      { uk: 'будь-яке джерело', en: 'any source', ru: 'любой источник' },
        epwlite_err_network:          { uk: 'Мережева помилка', en: 'Network error', ru: 'Сетевая ошибка' },
        epwlite_err_tmdb:             { uk: 'Не вдалося отримати дані TMDB', en: 'Could not load TMDB data', ru: 'Не удалось получить данные TMDB' },
        epwlite_err_access:           { uk: 'Сервер плагіна відмовив у доступі', en: 'The plugin server denied access', ru: 'Сервер плагина отказал в доступе' },
        epwlite_notify_new:           { uk: 'Нова серія', en: 'New episode', ru: 'Новая серия' },
        epwlite_notify_new_many:      { uk: 'Нові серії', en: 'New episodes', ru: 'Новые серии' },
        epwlite_notify_movie:         { uk: 'Фільм доступний', en: 'Movie is available', ru: 'Фильм доступен' },
        epwlite_gone_title:           { uk: 'Підписку видалено', en: 'Subscription removed', ru: 'Подписка удалена' },
        epwlite_gone_plugin:          { uk: 'плагін зник або більше не підтримується', en: 'the plugin is gone or no longer supported', ru: 'плагин пропал или больше не поддерживается' },
        epwlite_gone_server:          { uk: 'сервер плагіна недоступний кілька днів', en: 'the plugin server has been down for several days', ru: 'сервер плагина недоступен несколько дней' },
        epwlite_gone_source:          { uk: 'джерело зникло з плагіна', en: 'the source is gone from the plugin', ru: 'источник пропал из плагина' },
        epwlite_gone_rch:             { uk: 'джерело перейшло на RCH (не підтримується)', en: 'the source switched to RCH (not supported)', ru: 'источник перешёл на RCH (не поддерживается)' },
        epwlite_fail_badge:           { uk: 'джерело недоступне', en: 'source unavailable', ru: 'источник недоступен' },
        epwlite_empty:                { uk: 'Підписок поки немає', en: 'No subscriptions yet', ru: 'Подписок пока нет' },
        epwlite_settings_author:      { uk: 'Автор', en: 'Author', ru: 'Автор' },
        epwlite_settings_lang:        { uk: 'Мова', en: 'Language', ru: 'Язык' },
        epwlite_settings_lang_desc:   { uk: 'Мова інтерфейсу та сповіщень. «Авто» - як у Lampa.', en: 'Interface and notification language. "Auto" follows Lampa.', ru: 'Язык интерфейса и уведомлений. «Авто» - как в Lampa.' },
        epwlite_settings_lang_auto:   { uk: 'Авто (як у Lampa)', en: 'Auto (as in Lampa)', ru: 'Авто (как в Lampa)' },
        epwlite_settings_bg:          { uk: 'Фонова перевірка', en: 'Background check', ru: 'Фоновая проверка' },
        epwlite_settings_bg_desc:     { uk: 'Поки Lampa відкрита, перевіряти нові серії. Старт через 2 хв після запуску, по одній підписці, пауза під час перегляду.', en: 'Check for new episodes while Lampa is open. Starts 2 min after launch, one subscription at a time, paused during playback.', ru: 'Пока Lampa открыта, проверять новые серии. Старт через 2 мин после запуска, по одной подписке, пауза во время просмотра.' },
        epwlite_settings_open:        { uk: 'Відкрити сторінку підписок', en: 'Open subscriptions page', ru: 'Открыть страницу подписок' },
        epwlite_settings_check:       { uk: 'Перевірити зараз', en: 'Check now', ru: 'Проверить сейчас' },
        epwlite_settings_plugins:     { uk: 'Сумісні плагіни', en: 'Compatible plugins', ru: 'Совместимые плагины' },
        epwlite_settings_plugins_desc:{ uk: 'Які з встановлених плагінів можна використати як джерело', en: 'Which installed plugins can be used as a source', ru: 'Какие из установленных плагинов можно использовать как источник' },
        epwlite_plugin_ok:            { uk: 'підтримується', en: 'supported', ru: 'поддерживается' },
        epwlite_plugin_bad:           { uk: 'не підтримується', en: 'not supported', ru: 'не поддерживается' },
        epwlite_plugin_unknown:       { uk: 'не вдалося прочитати', en: 'could not be read', ru: 'не удалось прочитать' },
        epwlite_plugins_none:         { uk: 'Встановлених плагінів не знайдено', en: 'No installed plugins found', ru: 'Установленных плагинов не найдено' },
        epwlite_check_running:        { uk: 'Перевірка вже триває', en: 'A check is already running', ru: 'Проверка уже идёт' },
        epwlite_check_start:          { uk: 'Перевірка запущена', en: 'Check started', ru: 'Проверка запущена' },
        epwlite_check_done:           { uk: 'Перевірено: {0}, нових сповіщень: {1}', en: 'Checked: {0}, new notifications: {1}', ru: 'Проверено: {0}, новых уведомлений: {1}' }
    };

    function resolveLang() {
        var pick = '';
        try { pick = '' + (Lampa.Storage.get('epwlite_lang', 'auto') || 'auto'); } catch (e) {}
        if (pick === 'uk' || pick === 'en' || pick === 'ru') return pick;
        var l = '';
        try { l = ('' + (Lampa.Storage.get('language', '') || '')).toLowerCase(); } catch (e) {}
        if (l.indexOf('uk') === 0) return 'uk';
        if (l.indexOf('ru') === 0) return 'ru';
        if (l.indexOf('en') === 0) return 'en';
        return 'en';
    }

    function L(key) {
        var l = resolveLang(), d = DICT[key];
        var s = d ? (d[l] || d.en) : key;
        for (var i = 1; i < arguments.length; i++) s = s.split('{' + (i - 1) + '}').join(arguments[i]);
        return s;
    }

    function tmdbLocale() {
        var l = resolveLang();
        return l === 'uk' ? 'uk-UA' : l === 'ru' ? 'ru-RU' : 'en-US';
    }

    function first(arr, fn) {
        arr = arr || [];
        for (var i = 0; i < arr.length; i++) if (fn(arr[i], i)) return arr[i];
        return null;
    }

    function clone(o) { return JSON.parse(JSON.stringify(o)); }

    function trim(s) { return ('' + (s == null ? '' : s)).replace(/^\s+|\s+$/g, ''); }

    function lc(s) { return trim(s).toLowerCase(); }

    function esc(s) {
        return ('' + (s == null ? '' : s)).replace(/[&<>"]/g, function (c) {
            return c === '&' ? '&amp;' : c === '<' ? '&lt;' : c === '>' ? '&gt;' : '&quot;';
        });
    }

    function pad2(n) { return (n < 10 ? '0' : '') + n; }

    function se(s, e) { return 'S' + pad2(s) + 'E' + pad2(e); }

    function dateStr(ms) { return new Date(ms).toISOString().slice(0, 10); }

    function today() { return dateStr(Date.now()); }

    function spread(win) { return Math.floor(Math.random() * Math.max(1000, win / 2)); }

    function delay(ms) { return new Promise(function (r) { setTimeout(r, ms); }); }

    function hashStr(s) {
        try { return '' + Lampa.Utils.hash(s); } catch (e) {}
        var h = 0;
        for (var i = 0; i < s.length; i++) { h = ((h << 5) - h) + s.charCodeAt(i); h = h & h; }
        return '' + Math.abs(h);
    }

    function appendQs(url, qs) {
        if (!qs) return url;
        return url + (url.indexOf('?') >= 0 ? '&' : '?') + qs;
    }

    function hasParam(url, name) { return new RegExp('[?&]' + name + '=').test(url); }

    function originOf(url) {
        var m = /^(https?:\/\/[^\/?#]+)/i.exec(url || '');
        return m ? m[1] : '';
    }

    function hostLabel(url) { return originOf(url).replace(/^https?:\/\//i, '') || url; }

    function absUrl(u, base) {
        u = trim(u);
        if (!u) return '';
        if (/^https?:\/\//i.test(u)) return u;
        if (u.indexOf('//') === 0) return (location.protocol === 'https:' ? 'https:' : 'http:') + u;
        if (u.charAt(0) === '/' && originOf(base)) return originOf(base) + u;
        return '';
    }

    function seq(items, fn) {
        var p = Promise.resolve();
        items.forEach(function (it) { p = p.then(function () { return fn(it); }); });
        return p;
    }

    function mapLimit(items, limit, fn) {
        var out = new Array(items.length), i = 0;
        function worker() {
            if (i >= items.length) return Promise.resolve();
            var k = i++;
            return Promise.resolve(fn(items[k])).then(function (r) { out[k] = r; }, function () { out[k] = null; }).then(worker);
        }
        var w = [];
        for (var n = 0; n < Math.min(limit, items.length); n++) w.push(worker());
        return Promise.all(w).then(function () { return out; });
    }

    function noty(text) { try { Lampa.Noty.show(text); } catch (e) {} }

    function loading(on, onBack) {
        try {
            if (on) Lampa.Loading.start(function () { Lampa.Loading.stop(); if (onBack) onBack(); });
            else Lampa.Loading.stop();
        } catch (e) {}
    }

    function storeGet(key, def) {
        var v;
        try { v = Lampa.Storage.get(key, def); } catch (e) { v = def; }
        if (typeof v === 'string') { try { v = JSON.parse(v); } catch (e) { v = def; } }
        return v == null ? def : v;
    }

    function loadSubs() {
        var v = storeGet(KEY_SUBS, []);
        return Array.isArray(v) ? v : [];
    }

    function saveSubs(list) { try { Lampa.Storage.set(KEY_SUBS, list); } catch (e) {} }

    function subId(s) {
        return 'epwl' + hashStr([s.media, s.tmdb_id, s.plugin_host || '', lc(s.balanser), trim(s.voice)].join('|'));
    }

    function subsOf(tmdbId, media) {
        return loadSubs().filter(function (s) { return s.tmdb_id === tmdbId && s.media === media; });
    }

    function upsertSub(sub) {
        var list = loadSubs();
        sub.id = subId(sub);
        var old = first(list, function (s) { return s.id === sub.id; });
        sub.rev = old ? (old.rev || 0) + 1 : 1;
        if (old) list[list.indexOf(old)] = sub;
        else list.push(sub);
        saveSubs(list);
    }

    function removeSub(id) {
        saveSubs(loadSubs().filter(function (s) { return s.id !== id; }));
    }

    function http(url, timeout, headers) {
        return new Promise(function (resolve) {
            var done = false;
            function fin(r) { if (!done) { done = true; resolve(r); } }
            try {
                var n = new Lampa.Reguest();
                n.timeout(timeout || 15000);
                var params = { dataType: 'text' };
                if (headers) params.headers = headers;
                n['native'](url, function (data) {
                    fin({ ok: true, status: 200, text: typeof data === 'string' ? data : (data == null ? '' : JSON.stringify(data)) });
                }, function (xhr) {
                    fin({ ok: false, status: (xhr && xhr.status) || 0, text: (xhr && typeof xhr.responseText === 'string') ? xhr.responseText : '' });
                }, false, params);
            } catch (e) { fin({ ok: false, status: 0, text: '' }); }
        });
    }

    function parseJson(text) {
        if (!text || typeof text !== 'string') return null;
        try { return JSON.parse(text); } catch (e) { return null; }
    }

    var memo = {};

    function memoGet(k) {
        var m = memo[k];
        if (m && m.exp > Date.now()) return m.v;
        delete memo[k];
        return undefined;
    }

    function memoSet(k, v, ttl) {
        memo[k] = { v: v, exp: Date.now() + ttl };
        return v;
    }

    function tmdbKey() {
        try { return Lampa.TMDB.key(); } catch (e) { return '4ef0d7355d9ffb5151e987764708ce96'; }
    }

    function tmdbUrl(path) {
        var q = appendQs(path, 'api_key=' + tmdbKey() + '&language=' + tmdbLocale());
        try { return Lampa.TMDB.api(q); } catch (e) { return 'https://api.themoviedb.org/3/' + q; }
    }

    function tmdbImg(size, path) {
        if (!path) return '';
        if (/^https?:\/\//i.test(path)) return path;
        try { return Lampa.TMDB.image('t/p/' + size + path); } catch (e) {}
        return 'https://image.tmdb.org/t/p/' + size + path;
    }

    function tmdbJson(path) {
        return http(tmdbUrl(path), 15000).then(function (r) { return r.ok ? parseJson(r.text) : null; });
    }

    function getSeason(id, s) {
        var k = 'season:' + id + ':' + s + ':' + tmdbLocale(), hit = memoGet(k);
        if (hit) return Promise.resolve(hit);
        return tmdbJson('tv/' + id + '/season/' + s).then(function (jo) {
            if (!jo || !Array.isArray(jo.episodes)) return [];
            var list = jo.episodes.map(function (e) {
                return {
                    season: e.season_number || s,
                    episode: e.episode_number || 0,
                    name: e.name || '',
                    air_date: e.air_date || '',
                    still_path: e.still_path || ''
                };
            });
            return memoSet(k, list, HOUR);
        });
    }

    function getShow(id) {
        var k = 'show:' + id + ':' + tmdbLocale(), hit = memoGet(k);
        if (hit) return Promise.resolve(hit);
        return tmdbJson('tv/' + id + '?append_to_response=external_ids').then(function (jo) {
            if (!jo || !jo.id) return null;
            var t = today();
            var show = {
                id: id,
                media: 'tv',
                name: jo.name || '',
                original_name: jo.original_name || '',
                original_language: jo.original_language || '',
                poster_path: jo.poster_path || '',
                number_of_seasons: jo.number_of_seasons || 0,
                status: jo.status || '',
                imdb_id: (jo.external_ids && jo.external_ids.imdb_id) || '',
                year: parseInt(('' + (jo.first_air_date || '')).slice(0, 4), 10) || 0,
                last_air_date: jo.last_air_date || '',
                next_air_date: (jo.next_episode_to_air && jo.next_episode_to_air.air_date) || '',
                seasons: [],
                latest_aired_season: 0,
                current_season_total: 0,
                current_season_aired: 0
            };
            var latest = 0, total = 0;
            (jo.seasons || []).forEach(function (s) {
                var num = s.season_number || 0;
                if (num <= 0) return;
                var cnt = s.episode_count || 0, ad = s.air_date || '';
                show.seasons.push({ season_number: num, name: s.name || '', episode_count: cnt, air_date: ad });
                if (cnt > 0 && ad && ad <= t && num > latest) { latest = num; total = cnt; }
            });
            show.seasons.sort(function (a, b) { return a.season_number - b.season_number; });
            show.latest_aired_season = latest > 0 ? latest : show.number_of_seasons;
            show.current_season_total = total;
            if (show.latest_aired_season <= 0) return memoSet(k, show, 3 * HOUR);
            return getSeason(id, show.latest_aired_season).then(function (eps) {
                show.current_season_aired = eps.filter(function (e) { return e.air_date && e.air_date <= t; }).length;
                if (show.current_season_total <= 0) show.current_season_total = eps.length;
                return memoSet(k, show, 3 * HOUR);
            });
        });
    }

    function getMovie(id) {
        var k = 'movie:' + id + ':' + tmdbLocale(), hit = memoGet(k);
        if (hit) return Promise.resolve(hit);
        return tmdbJson('movie/' + id + '?append_to_response=external_ids').then(function (jo) {
            if (!jo || !jo.id) return null;
            return memoSet(k, {
                id: id,
                media: 'movie',
                name: jo.title || '',
                original_name: jo.original_title || '',
                original_language: jo.original_language || '',
                poster_path: jo.poster_path || '',
                imdb_id: jo.imdb_id || (jo.external_ids && jo.external_ids.imdb_id) || '',
                year: parseInt(('' + (jo.release_date || '')).slice(0, 4), 10) || 0,
                status: jo.status || ''
            }, 6 * HOUR);
        });
    }

    function spOf(meta) {
        return {
            tmdb_id: meta.id,
            title: meta.name || '',
            original_title: meta.original_name || '',
            original_language: meta.original_language || '',
            imdb_id: meta.imdb_id || '',
            year: meta.year || 0
        };
    }

    var descMemo = {};

    function installedPlugins() {
        var out = [], seen = {};
        function add(url, name) {
            url = trim(url);
            if (!url || seen[url] || /modification\.js/i.test(url)) return;
            seen[url] = 1;
            out.push({ url: url, name: trim(name) });
        }
        try {
            (Lampa.Plugins.get() || []).forEach(function (p) {
                if (typeof p === 'string') add(p);
                else if (p && p.url && p.status !== 0) add(p.url, p.name);
            });
        } catch (e) {}
        try { (Lampa.Plugins.loaded() || []).forEach(function (u) { add(u); }); } catch (e) {}
        try { (Lampa.Plugins.awaits() || []).forEach(function (u) { add(u); }); } catch (e) {}
        if (!out.length) {
            var raw = storeGet('plugins', []);
            (Array.isArray(raw) ? raw : []).forEach(function (p) {
                if (typeof p === 'string') add(p);
                else if (p && p.url && p.status !== 0) add(p.url, p.name);
            });
        }
        return out;
    }

    function pluginSource(url) {
        return new Promise(function (resolve) {
            var done = false;
            function fin(t) { if (!done) { done = true; resolve(typeof t === 'string' ? t : ''); } }
            function net() { http(url, 15000).then(function (r) { fin(r.ok ? r.text : ''); }); }
            try {
                if (Lampa.Cache && Lampa.Cache.getData) {
                    Lampa.Cache.getData('plugins', url).then(function (code) {
                        if (typeof code === 'string' && code.length > 100) fin(code);
                        else net();
                    })['catch'](net);
                    return;
                }
            } catch (e) {}
            net();
        });
    }

    function parseLampac(src) {
        if (!src || src.indexOf('epwatchlite_ready') >= 0) return null;
        if (src.indexOf('lite/events') < 0) return null;
        var m = /\blocalhost\s*:\s*['"](https?:\/\/[^'"\s{}]+)['"]/.exec(src);
        if (!m) return null;
        var t = /\bvar\s+token\s*=\s*['"]([^'"{}\s]+)['"]/.exec(src) || /['"]token=([^'"{}&\s]+)['"]/.exec(src);
        var a = /Storage\.get\(\s*['"]((?:kit_)?aesgcmkey)['"]/.exec(src);
        return { host: m[1].replace(/\/+$/, ''), token: t ? t[1] : '', aes: a ? a[1] : '' };
    }

    function describePlugin(p) {
        if (descMemo[p.url]) return Promise.resolve(descMemo[p.url]);
        return pluginSource(p.url).then(function (src) {
            var stored = storeGet(KEY_DESC, {});
            if (!stored || typeof stored !== 'object' || Array.isArray(stored)) stored = {};
            var info = src ? parseLampac(src) : null;
            var d;
            if (src && src.indexOf('epwatchlite_ready') >= 0) d = { url: p.url, kind: 'self', name: META.name };
            else if (info) {
                d = { url: p.url, kind: 'lampac', host: info.host, token: info.token, aes: info.aes, name: p.name || hostLabel(info.host) };
                stored[p.url] = d;
                try { Lampa.Storage.set(KEY_DESC, stored); } catch (e) {}
            }
            else if (!src && stored[p.url]) d = stored[p.url];
            else d = { url: p.url, kind: src ? 'unsupported' : 'unknown', name: p.name || hostLabel(p.url) };
            if (d.kind !== 'unknown') descMemo[p.url] = d;
            return d;
        });
    }

    function allPlugins() {
        return Promise.all(installedPlugins().map(describePlugin)).then(function (list) {
            return list.filter(function (d) { return d && d.kind !== 'self'; });
        });
    }

    function compatiblePlugins() {
        return allPlugins().then(function (list) {
            var out = [], seen = {};
            list.forEach(function (d) {
                if (!d || d.kind !== 'lampac') return;
                var k = d.host + '|' + d.token;
                if (seen[k]) return;
                seen[k] = 1;
                out.push(d);
            });
            return out;
        });
    }

    function pluginFor(s) {
        var p = first(installedPlugins(), function (x) { return x.url === s.plugin; });
        return (p ? describePlugin(p) : Promise.resolve(null)).then(function (d) {
            if (d && d.kind === 'lampac') return d;
            if (!s.plugin_host) return null;
            return compatiblePlugins().then(function (list) {
                return first(list, function (x) { return x.host === s.plugin_host; });
            });
        });
    }

    var CLARIFY = ['filmix', 'filmixtv', 'fxapi', 'kinoukr', 'rezka', 'rhsprem', 'kinopub', 'alloha',
        'fancdn', 'kinotochka', 'remux', 'kinogo', 'kinobase', 'getstv', 'leproduction'];

    var SIDE = ['ova', 'ona', 'movie', 'special', 'recap', 'spin',
        'фільм', 'фильм', 'спешл', 'спэшл', 'спецвипуск', 'спецвыпуск', 'пілот', 'пилот'];

    var LINK_DROP = ['token', 'account_email', 'uid', 'box_mac', 'nws_id', 's', 't', 'rjson'];

    function lpAuth(d, url) {
        var add = [];
        try {
            var email = Lampa.Storage.get('account_email', '');
            if (email && !hasParam(url, 'account_email')) add.push('account_email=' + encodeURIComponent(email));
            var uid = Lampa.Storage.get('lampac_unic_id', '');
            if (uid && !hasParam(url, 'uid')) add.push('uid=' + encodeURIComponent(uid));
            if (d.token && !hasParam(url, 'token')) add.push('token=' + encodeURIComponent(d.token));
            var nws = Lampa.Storage.get('lampac_nws_id', '');
            if (nws && !hasParam(url, 'nws_id')) add.push('nws_id=' + encodeURIComponent(nws));
        } catch (e) {}
        return appendQs(url, add.join('&'));
    }

    function lpHeaders(d) {
        if (!d.aes) return null;
        var v = '';
        try { v = Lampa.Storage.get(d.aes, ''); } catch (e) {}
        return v ? { 'X-Kit-AesGcm': v } : null;
    }

    function showQs(sp, balanser, serial) {
        var q = ['serial=' + serial, 'source=tmdb'];
        if (sp.tmdb_id) { q.push('tmdb_id=' + sp.tmdb_id); q.push('id=' + sp.tmdb_id); }
        if (sp.title) q.push('title=' + encodeURIComponent(sp.title));
        if (sp.original_title) q.push('original_title=' + encodeURIComponent(sp.original_title));
        if (sp.original_language) q.push('original_language=' + encodeURIComponent(sp.original_language));
        if (sp.imdb_id) q.push('imdb_id=' + encodeURIComponent(sp.imdb_id));
        if (sp.year) q.push('year=' + sp.year);
        if (balanser && CLARIFY.indexOf(lc(balanser)) >= 0 && /^(ru|ja|ko|zh|cn)$/.test(lc(sp.original_language)))
            q.push('clarification=1');
        return q.join('&');
    }

    function guessBalanser(url) {
        var m = /\/lite\/([a-z0-9_\-]+)/i.exec(url || '');
        return m ? m[1].toLowerCase() : '';
    }

    function lpFetch(d, url, timeout) {
        if (!url) return Promise.resolve({ jo: null, status: 0, rch: false });
        if (!/[?&]rjson=true/.test(url)) url = appendQs(url, 'rjson=true');
        url = lpAuth(d, url);
        return http(url, timeout || CFG.bal_timeout, lpHeaders(d)).then(function (r) {
            var res = { jo: null, status: r.ok ? 200 : r.status, rch: false, accsdb: false, msg: '' };
            var jo = parseJson(r.text);
            if (!jo || typeof jo !== 'object' || Array.isArray(jo)) return res;
            if (jo.rch) { res.rch = true; return res; }
            if (jo.accsdb) { res.accsdb = true; res.msg = jo.msg || ''; return res; }
            if (r.ok) res.jo = jo;
            return res;
        });
    }

    function lpEvents(d, sp, serial) {
        var k = 'ev:' + d.host + '|' + d.token + '|' + sp.tmdb_id + '|' + serial, hit = memoGet(k);
        if (hit) return Promise.resolve(hit);
        var url = lpAuth(d, d.host + '/lite/events?' + showQs(sp, '', serial));
        return http(url, CFG.events_timeout, lpHeaders(d)).then(function (r) {
            var jo = r.ok ? parseJson(r.text) : null;
            var arr = Array.isArray(jo) ? jo : (jo && Array.isArray(jo.online) ? jo.online : null);
            if (!arr) return { ok: false, accsdb: !!(jo && jo.accsdb), msg: (jo && jo.msg) || '', list: [] };
            var list = [];
            arr.forEach(function (e) {
                if (!e || typeof e !== 'object' || !e.url) return;
                var u = absUrl(('' + e.url).replace('{localhost}', d.host), d.host + '/');
                var bal = trim(e.balanser || e.plugin || guessBalanser(u));
                if (!u || !bal) return;
                list.push({ name: trim(e.name) || bal, balanser: bal, url: u, rch: e.rch === true, show: e.show !== false });
            });
            return memoSet(k, { ok: true, list: list }, CFG.events_ttl);
        });
    }

    function pickSimilar(data, sp) {
        var best = null, bestScore = -1e9;
        (data || []).forEach(function (d) {
            if (!d || typeof d !== 'object') return;
            var tl = lc(d.title), year = parseInt(d.year, 10) || 0, score = 0;
            if (sp.year > 0 && year > 0) {
                if (year === sp.year) score += 10;
                else if (Math.abs(year - sp.year) <= 1) score += 3;
                else score -= Math.min(6, Math.abs(year - sp.year));
            }
            if (sp.original_title && tl.indexOf(lc(sp.original_title)) >= 0) score += 6;
            if (sp.title && tl.indexOf(lc(sp.title)) >= 0) score += 3;
            for (var i = 0; i < SIDE.length; i++) if (tl.indexOf(SIDE[i]) >= 0) { score -= 8; break; }
            if (score > bestScore) { bestScore = score; best = d; }
        });
        return best;
    }

    function collectVoices(jo, voices) {
        var seen = {};
        voices.forEach(function (v) { seen[lc(v.name)] = 1; });
        (Array.isArray(jo.voice) ? jo.voice : []).forEach(function (vi) {
            var name = trim(vi && vi.name);
            if (!name || seen[lc(name)]) return;
            seen[lc(name)] = 1;
            var m = /[?&]t=(\d+)/.exec((vi && vi.url) || '');
            voices.push({ name: name, t: m ? parseInt(m[1], 10) : 0 });
        });
        var seenDetails = {};
        (Array.isArray(jo.data) ? jo.data : []).forEach(function (d) {
            var details = (d && (d.details || d.voice_name)) || '';
            if (!trim(details) || seenDetails[lc(details)]) return;
            seenDetails[lc(details)] = 1;
            details.split(',').forEach(function (piece) {
                var name = trim(piece).replace(/^"+|"+$/g, '');
                if (name.length > 1 && !seen[lc(name)]) {
                    seen[lc(name)] = 1;
                    voices.push({ name: name, t: 0 });
                }
            });
        });
    }

    function findVoice(jo, voice) {
        voice = lc(voice);
        if (!voice || !Array.isArray(jo.voice)) return { found: false };
        var vi = first(jo.voice, function (x) { return x && lc(x.name) === voice; });
        if (!vi) return { found: false };
        var m = /[?&]t=([^&]+)/.exec(vi.url || '');
        return { found: true, token: m ? m[1] : '', active: !!vi.active };
    }

    function collectMaxEpisode(jo, voice) {
        voice = lc(voice);
        var max = 0;
        (Array.isArray(jo.data) ? jo.data : []).forEach(function (d) {
            if (!d) return;
            var ep = parseInt(d.e != null ? d.e : d.episode, 10) || 0;
            if (ep <= 0) return;
            if (voice) {
                var details = lc(d.details || d.voice_name || '');
                if (!details || details.indexOf(voice) < 0) return;
            }
            if (ep > max) max = ep;
        });
        return max;
    }

    function seasonTree(jo) {
        var tree = {};
        (Array.isArray(jo.data) ? jo.data : []).forEach(function (d) {
            if (!d) return;
            var u = d.url || d.playlist || '';
            if (!u || d.e != null) return;
            var n = parseInt(d.season_number != null ? d.season_number : d.season, 10) || 0;
            var m;
            if (n <= 0 && (m = /[?&]season=(\d+)/.exec(u))) n = parseInt(m[1], 10) || 0;
            if (n <= 0 && (m = /[?&]s=(\d+)(?!\d)/.exec(u))) n = parseInt(m[1], 10) || 0;
            if (n <= 0 && d.method === 'link') {
                var id = parseInt(d.id, 10) || 0;
                if (id > 0 && id < 100) n = id;
            }
            if (n > 0 && !tree[n]) tree[n] = u;
        });
        return tree;
    }

    function seasonsOf(jo) {
        var keys = Object.keys(seasonTree(jo)).map(Number).sort(function (a, b) { return a - b; });
        if (keys.length) return keys;
        return collectMaxEpisode(jo, null) > 0 ? [1] : [];
    }

    function cleanLink(link, base) {
        var u = absUrl(('' + (link || '')).replace('{localhost}', ''), base);
        if (!u || u.length > 2048) return '';
        var qi = u.indexOf('?');
        if (qi < 0) return u;
        var kept = u.slice(qi + 1).split('&').filter(function (p) {
            return p && LINK_DROP.indexOf(p.split('=')[0].toLowerCase()) < 0;
        });
        return u.slice(0, qi) + (kept.length ? '?' + kept.join('&') : '');
    }

    function relLink(link, entryUrl) {
        var o = originOf(entryUrl);
        return o && link.indexOf(o + '/') === 0 ? link.slice(o.length) : link;
    }

    function withLink(entry, link) {
        return { name: entry.name, balanser: entry.balanser, url: entry.url, rch: entry.rch, show: entry.show, link: link ? absUrl(link, entry.url) : '' };
    }

    function lpFetchShow(d, entry, sp, s, t) {
        var sel = 's=' + (s >= 0 ? s : -1) + (t >= 0 ? '&t=' + t : '');
        if (entry.link) {
            var pinned = appendQs(entry.link, sel);
            return lpFetch(d, pinned).then(function (r) { return { jo: r.jo, url: pinned, rch: r.rch }; });
        }
        var url = appendQs(entry.url, showQs(sp, entry.balanser, 1) + '&rjson=true&' + sel);
        return lpFetch(d, url).then(function (r) {
            if (r.jo && r.jo.type === 'similar') {
                var best = pickSimilar(r.jo.data, sp);
                if (best && best.url) {
                    var fu = appendQs(absUrl(best.url, entry.url), sel);
                    return lpFetch(d, fu).then(function (f) { return f.jo ? { jo: f.jo, url: fu } : { jo: null, url: url }; });
                }
                return { jo: null, url: url };
            }
            return { jo: r.jo, url: url, rch: r.rch };
        });
    }

    function lpVoiceMax(d, jo, baseUrl, voice, current) {
        var vi = findVoice(jo, voice);
        if (!vi.found) return Promise.resolve(current);
        if (vi.active || !vi.token) return Promise.resolve(Math.max(current, collectMaxEpisode(jo, null)));
        return lpFetch(d, appendQs(baseUrl, 't=' + vi.token)).then(function (r) {
            return r.jo ? Math.max(current, collectMaxEpisode(r.jo, null)) : current;
        });
    }

    function lpProbe(d, entry, sp, season, voice) {
        var voices = [], maxEp = 0;
        return lpFetchShow(d, entry, sp, season, -1).then(function (f) {
            if (!f.jo) return;
            collectVoices(f.jo, voices);
            maxEp = collectMaxEpisode(f.jo, voice);
            if (!voice) return;
            return lpVoiceMax(d, f.jo, f.url, voice, maxEp).then(function (m) { maxEp = m; });
        }).then(function () {
            if (voices.length || maxEp) return;
            return lpFetchShow(d, entry, sp, -1, -1).then(function (disc) {
                if (!disc.jo) return;
                collectVoices(disc.jo, voices);
                var tree = seasonTree(disc.jo), keys = Object.keys(tree).map(Number);
                if (!keys.length) { maxEp = collectMaxEpisode(disc.jo, voice); return; }
                var pick = tree[season] ? season : Math.max.apply(null, keys);
                var followUrl = absUrl(tree[pick], entry.url);
                return lpFetch(d, followUrl).then(function (sec) {
                    if (!sec.jo) return;
                    collectVoices(sec.jo, voices);
                    if (!(pick === season || season < 0)) return;
                    maxEp = collectMaxEpisode(sec.jo, voice);
                    if (!voice) return;
                    return lpVoiceMax(d, sec.jo, followUrl, voice, maxEp).then(function (m) { maxEp = m; });
                });
            });
        }).then(function () { return { maxEpisode: maxEp, voices: voices }; });
    }

    function lpDiscoverSeasons(d, entry, sp) {
        return lpFetchShow(d, entry, sp, -1, -1).then(function (r) { return r.jo ? seasonsOf(r.jo) : []; });
    }

    function lpSearch(d, entry, sp, movie) {
        var url = appendQs(entry.url, showQs(sp, entry.balanser, movie ? 0 : 1) + (movie ? '&rjson=true' : '&rjson=true&s=-1'));
        return lpFetch(d, url).then(function (r) {
            var res = { candidates: [], seasons: [], rch: r.rch };
            if (!r.jo) return res;
            if (r.jo.type !== 'similar') {
                if (!movie) res.seasons = seasonsOf(r.jo);
                return res;
            }
            var data = Array.isArray(r.jo.data) ? r.jo.data : [];
            var best = pickSimilar(data, sp);
            data.forEach(function (it) {
                if (!it || typeof it !== 'object') return;
                var link = cleanLink(it.url, entry.url);
                if (!link) return;
                var c = {
                    title: it.title || '',
                    year: parseInt(it.year, 10) || 0,
                    details: it.details || '',
                    img: absUrl(('' + (it.img || '')).replace('{localhost}', ''), entry.url),
                    link: link,
                    recommended: it === best
                };
                if (c.recommended) res.candidates.unshift(c);
                else res.candidates.push(c);
            });
            return res;
        });
    }

    function lpProbeMovie(d, entry, sp) {
        var url = entry.link || appendQs(entry.url, showQs(sp, entry.balanser, 0) + '&rjson=true');
        return lpFetch(d, url).then(function (r) {
            if (!r.jo || r.jo.type === 'similar') return { available: false, voices: [] };
            var data = Array.isArray(r.jo.data) ? r.jo.data : [];
            var names = [], seen = {};
            data.forEach(function (it) {
                var tr = trim(it && (it.translate || it.voice_name || it.details));
                if (tr && !seen[lc(tr)]) { seen[lc(tr)] = 1; names.push(tr); }
            });
            var extra = [];
            collectVoices(r.jo, extra);
            extra.forEach(function (v) { if (!seen[lc(v.name)]) { seen[lc(v.name)] = 1; names.push(v.name); } });
            return { available: data.length > 0 || names.length > 0, voices: names };
        });
    }

    function movieKey(balanser, voice) { return lc(balanser) + '\t' + trim(voice); }

    function latestFullyAired(show) {
        for (var i = show.seasons.length - 1; i >= 0; i--) {
            var s = show.seasons[i];
            if (s.episode_count <= 0) continue;
            if (s.season_number < show.latest_aired_season) return s;
            if (s.season_number === show.latest_aired_season && show.current_season_total > 0
                && show.current_season_aired >= show.current_season_total) return s;
        }
        return null;
    }

    function resolveStructure(d, entry, sp, show) {
        var tmdbSeasons = show.seasons.length;
        if (tmdbSeasons <= 1 || !entry) return Promise.resolve('tmdb');
        return lpDiscoverSeasons(d, entry, sp).then(function (bal) {
            if (bal.length !== 1) return 'tmdb';
            var anchor = latestFullyAired(show);
            var s1 = first(show.seasons, function (s) { return s.season_number === 1; });
            var s1c = s1 ? s1.episode_count : 0;
            return lpProbe(d, entry, sp, 1, '').then(function (p) {
                if (anchor && anchor.season_number === 1 && p.maxEpisode === anchor.episode_count) return 'tmdb';
                return s1c > 0 && p.maxEpisode > s1c ? 'absolute' : 'tmdb';
            });
        });
    }

    function buildTmdb(sub, show, latest) {
        var season = sub.target_season > 0 ? sub.target_season : latest;
        return getSeason(show.id, season).then(function (eps) {
            var t = today();
            eps.forEach(function (e) { e.season = season; });
            var es = { source: 'tmdb', effectiveSeason: season, all: eps, lastAir: '' };
            es.aired = eps.filter(function (e) { return e.air_date && e.air_date <= t; });
            es.aired.forEach(function (e) { if (e.air_date > es.lastAir) es.lastAir = e.air_date; });
            if (season === latest) {
                es.seasonTotal = show.current_season_total;
                es.seasonAired = show.current_season_aired;
            } else {
                var si = first(show.seasons, function (s) { return s.season_number === season; });
                es.seasonTotal = si ? si.episode_count : 0;
                es.seasonAired = es.aired.length;
            }
            es.info = function (n) {
                var ep = first(eps, function (e) { return e.episode === n; });
                return Promise.resolve(ep ? clone(ep) : { season: season, episode: n, name: '', still_path: '' });
            };
            return es;
        });
    }

    function buildAbsolute(show) {
        var total = 0, aired = 0;
        show.seasons.forEach(function (s) {
            if (s.episode_count <= 0) return;
            total += s.episode_count;
            if (s.season_number < show.latest_aired_season) aired += s.episode_count;
            else if (s.season_number === show.latest_aired_season) aired += show.current_season_aired;
        });
        var list = [];
        for (var i = 1; i <= aired; i++) list.push({ season: 1, episode: i });
        var es = { source: 'absolute', effectiveSeason: 1, seasonTotal: total, seasonAired: aired, aired: list, lastAir: show.last_air_date || '' };
        es.info = function (n) {
            var prior = 0;
            var s = first(show.seasons, function (x) {
                if (x.episode_count <= 0) return false;
                if (n <= prior + x.episode_count) return true;
                prior += x.episode_count;
                return false;
            });
            var base = { season: 1, episode: n, name: '', still_path: '' };
            if (!s) return Promise.resolve(base);
            return getSeason(show.id, s.season_number).then(function (eps) {
                var ep = first(eps, function (e) { return e.episode === n - prior; });
                if (ep) { base.name = ep.name; base.still_path = ep.still_path; }
                return base;
            });
        };
        return Promise.resolve(es);
    }

    function buildStructure(sub, show, latest) {
        return sub.structure === 'absolute' ? buildAbsolute(show) : buildTmdb(sub, show, latest);
    }

    function latestOf(show) {
        return show.latest_aired_season > 0 ? show.latest_aired_season : show.number_of_seasons;
    }

    function computeNextCheck(now, show) {
        var ended = /^(ended|canceled|cancelled)$/i.test(show.status || '');
        var complete = show.current_season_total > 0 && show.current_season_aired >= show.current_season_total;
        if (ended && complete && !show.next_air_date) return now + 30 * DAY;
        if (show.next_air_date && show.next_air_date > dateStr(now + DAY)) {
            var na = Date.parse(show.next_air_date + 'T00:00:00Z');
            if (!isNaN(na)) return na - 2 * HOUR;
        }
        if (complete && !show.next_air_date) return now + 3 * DAY;
        return now + CFG.interval;
    }

    function voiceLagPoll(now, es, poll) {
        var complete = es.seasonTotal > 0 && es.seasonAired >= es.seasonTotal;
        if (!complete || !es.lastAir) return poll;
        var la = Date.parse(es.lastAir + 'T00:00:00Z');
        if (isNaN(la)) return poll;
        var age = now - la;
        if (age >= 30 * DAY) return Math.max(poll, 7 * DAY);
        if (age >= 7 * DAY) return Math.max(poll, DAY);
        return poll;
    }

    function resolveSource(s, sp, serial) {
        return pluginFor(s).then(function (d) {
            if (!d) return { fail: 'plugin' };
            s.plugin = d.url;
            s.plugin_host = d.host;
            return lpEvents(d, sp, serial).then(function (ev) {
                if (!ev.ok) return { d: d, fail: 'server' };
                if (!s.balanser) return { d: d, list: ev.list };
                var e = first(ev.list, function (x) { return lc(x.balanser) === lc(s.balanser); });
                if (!e) return { d: d, fail: 'source' };
                if (e.rch) return { d: d, fail: 'rch' };
                if (e.name) s.bname = e.name;
                return { d: d, entry: withLink(e, s.link), list: ev.list };
            });
        });
    }

    function checkTv(sub) {
        return getShow(sub.tmdb_id).then(function (show) {
            if (!show) return { defer: CFG.defer_tmdb };
            var latest = latestOf(show);
            if (latest <= 0) return { defer: 6 * HOUR };

            var now = Date.now(), s = clone(sub), sp = s.sp || spOf(show);
            var voiceMode = !!trim(s.voice);
            var res = { sub: s, notify: [], fail: '', title: show.name || s.title };
            var src = null, es = null;

            return (voiceMode ? resolveSource(s, sp, 1) : Promise.resolve(null)).then(function (r) {
                src = r;
                if (src && src.fail) res.fail = src.fail;
                return buildStructure(s, show, latest);
            }).then(function (built) {
                es = built;
                var canProbe = voiceMode && src && src.entry;
                var stale = s.structure === 'absolute' && now - (s.resolved_at || 0) > DAY;
                if (!canProbe || (es.effectiveSeason === s.last_season && !stale)) return;
                return resolveStructure(src.d, src.entry, sp, show).then(function (newSrc) {
                    s.resolved_at = now;
                    if (newSrc === (s.structure || 'tmdb')) return;
                    s.structure = newSrc;
                    return buildStructure(s, show, latest).then(function (b) { es = b; });
                });
            }).then(function () {
                if (es.effectiveSeason !== s.last_season) {
                    s.last_episode = 0;
                    s.last_voice_episode = 0;
                    s.last_season = es.effectiveSeason;
                }
                es.aired.slice().sort(function (a, b) { return a.episode - b.episode; }).forEach(function (ep) {
                    if (ep.episode <= s.last_episode) return;
                    if (!voiceMode) res.notify.push(clone(ep));
                    s.last_episode = ep.episode;
                });
                if (!voiceMode || !src || !src.entry) return;
                return lpProbe(src.d, src.entry, sp, es.effectiveSeason, s.voice).then(function (pr) {
                    var newMax = Math.max(s.last_voice_episode || 0, pr.maxEpisode);
                    var cap = es.seasonTotal > 0 ? es.seasonTotal : newMax;
                    if (newMax > cap) newMax = cap;
                    if (newMax <= (s.last_voice_episode || 0)) return;
                    var nums = [];
                    for (var e = (s.last_voice_episode || 0) + 1; e <= newMax; e++) nums.push(e);
                    return seq(nums, function (n) {
                        return es.info(n).then(function (info) {
                            info.season = es.effectiveSeason;
                            info.episode = n;
                            res.notify.push(info);
                        });
                    }).then(function () { s.last_voice_episode = newMax; });
                });
            }).then(function () {
                s.title = show.name || s.title;
                if (show.poster_path) s.poster_path = show.poster_path;
                s.season_total = es.seasonTotal;
                s.season_aired = es.seasonAired;
                s.show_status = show.status;
                s.next_air_date = show.next_air_date;
                s.last_check = now;
                if (voiceMode && (s.last_voice_episode || 0) < (s.last_episode || 0))
                    s.next_check = now + voiceLagPoll(now, es, CFG.interval) + spread(CFG.interval);
                else
                    s.next_check = computeNextCheck(now, show) + spread(CFG.interval);
                return res;
            });
        });
    }

    function checkMovie(sub) {
        return getMovie(sub.tmdb_id).then(function (movie) {
            if (!movie) return { defer: CFG.defer_tmdb };
            var now = Date.now(), s = clone(sub), sp = s.sp || spOf(movie);
            var res = { sub: s, movieItems: [], fail: '', title: movie.name || s.title };
            s.title = movie.name || s.title;
            if (movie.poster_path) s.poster_path = movie.poster_path;
            return resolveSource(s, sp, 0).then(function (src) {
                s.last_check = now;
                if (src.fail) {
                    res.fail = src.fail;
                    s.next_check = now + CFG.fail_retry;
                    return res;
                }
                var entries = s.balanser ? [src.entry] : src.list.filter(function (e) { return !e.rch && e.show; });
                var seen = (s.seen || []).slice(), map = {};
                seen.forEach(function (k) { map[lc(k)] = 1; });
                return seq(entries, function (e) {
                    return lpProbeMovie(src.d, e, sp).then(function (r) {
                        if (r.available) {
                            (r.voices.length ? r.voices : ['']).forEach(function (v) {
                                var key = movieKey(e.balanser, v);
                                if (map[lc(key)]) return;
                                map[lc(key)] = 1;
                                seen.push(key);
                                res.movieItems.push({ bname: e.name, voice: trim(v) });
                            });
                        }
                        return delay(CFG.req_gap);
                    });
                }).then(function () {
                    s.seen = seen;
                    s.next_check = now + CFG.interval + spread(CFG.interval);
                    return res;
                });
            });
        });
    }

    function commit(orig, res) {
        var list = loadSubs();
        var cur = first(list, function (x) { return x.id === orig.id; });
        if (!cur || (cur.rev || 0) !== (orig.rev || 0)) return { notified: 0 };
        var now = Date.now(), idx = list.indexOf(cur);

        if (!res || res.defer) {
            var d = (res && res.defer) || CFG.defer_error;
            cur.next_check = now + d + spread(d);
            saveSubs(list);
            return { notified: 0 };
        }

        var s = res.sub;
        if (res.fail) {
            s.fail = (cur.fail || 0) + 1;
            s.fail_since = cur.fail_since || now;
            s.fail_reason = res.fail;
            if (s.fail >= CFG.fail_attempts && now - s.fail_since >= CFG.fail_age) {
                list.splice(idx, 1);
                saveSubs(list);
                noticeGone(s, res.title);
                return { notified: 1, removed: true };
            }
            s.next_check = Math.min(s.next_check || (now + CFG.fail_retry), now + CFG.fail_retry + spread(HOUR));
        } else {
            s.fail = 0;
            s.fail_since = 0;
            s.fail_reason = '';
        }

        list[idx] = s;
        saveSubs(list);

        var n = 0;
        if (res.notify && res.notify.length) { noticeEpisodes(s, res.title, res.notify); n += res.notify.length; }
        if (res.movieItems && res.movieItems.length) { noticeMovie(s, res.title, res.movieItems); n++; }
        return { notified: n };
    }

    function checkOne(id) {
        var sub = first(loadSubs(), function (s) { return s.id === id; });
        if (!sub) return Promise.resolve({ notified: 0 });
        var run;
        try { run = sub.media === 'movie' ? checkMovie(sub) : checkTv(sub); }
        catch (e) { run = Promise.reject(e); }
        return run.then(function (res) { return commit(sub, res); }, function () { return commit(sub, null); });
    }

    var NOTICE_CLASS = 'epwatchlite';
    var noticeTarget = '';

    function noticeReady() {
        if (noticeTarget) return true;
        try {
            if (!Lampa.Notice || !Lampa.Notice.classes) return false;
            if (Lampa.NoticeClassLampa && Lampa.Notice.addClass && !Lampa.Notice.classes[NOTICE_CLASS])
                Lampa.Notice.addClass(NOTICE_CLASS, new Lampa.NoticeClassLampa({ name: META.name, db_name: 'epwatchlite_notice' }));
            noticeTarget = Lampa.Notice.classes[NOTICE_CLASS] ? NOTICE_CLASS : 'lampa';
            return !!Lampa.Notice.classes[noticeTarget];
        } catch (e) { return false; }
    }

    function pushNotice(el) {
        if (!noticeReady()) return;
        try { Lampa.Notice.pushNotice(noticeTarget, el); } catch (e) {}
    }

    function popup(from, text) {
        try {
            if (Lampa.Bell && Lampa.Bell.push) return Lampa.Bell.push({ from: from, text: text });
        } catch (e) {}
        noty(from + ': ' + text);
    }

    function noticeCard(sub, withPoster) {
        var card = { id: sub.tmdb_id, tmdb_id: sub.tmdb_id, poster_path: withPoster ? (sub.poster_path || '') : '', source: 'tmdb' };
        if (sub.media === 'movie') {
            card.title = sub.title;
            card.original_title = (sub.sp && sub.sp.original_title) || sub.title;
        } else {
            card.name = sub.title;
            card.original_name = (sub.sp && sub.sp.original_title) || sub.title;
            card.number_of_seasons = sub.last_season || 1;
        }
        return card;
    }

    function noticeBase(sub, title, key, still) {
        var el = {
            id: 'epwlite_' + hashStr(sub.id + '|' + key),
            from: 'epwatchlite',
            title: esc(title || sub.title),
            time: Date.now(),
            card: noticeCard(sub, !still)
        };
        if (still) el.img = tmdbImg('w500', still);
        else if (sub.poster_path) el.poster = ('' + sub.poster_path).replace(/^\//, '');
        return el;
    }

    function epLine(ep) { return se(ep.season, ep.episode) + (ep.name ? ' · ' + esc(ep.name) : ''); }

    function noticeEpisodes(sub, title, eps) {
        eps.sort(function (a, b) { return a.episode - b.episode; });
        var a = eps[0], z = eps[eps.length - 1];
        var el = noticeBase(sub, title, 'ep|' + a.season + '|' + a.episode + '|' + z.episode, eps.length === 1 ? a.still_path : '');
        if (eps.length === 1) el.text = '🆕 ' + esc(L('epwlite_notify_new')) + ' · ' + epLine(a);
        else {
            el.text = '🆕 ' + esc(L('epwlite_notify_new_many')) + ':<br>' +
                eps.slice(0, 10).map(epLine).join('<br>') + (eps.length > 10 ? '<br>+' + (eps.length - 10) : '');
        }
        if (trim(sub.voice)) {
            el.labels = ['🎙 ' + esc(trim(sub.voice))];
            if (sub.bname) el.labels.push('🌐 ' + esc(sub.bname));
        }
        pushNotice(el);
        popup(esc(title || sub.title), eps.length === 1 ? '🆕 ' + epLine(a) : '🆕 ' + esc(L('epwlite_notify_new_many')) + ': ' + eps.length);
    }

    function noticeMovie(sub, title, items) {
        var el = noticeBase(sub, title, 'mv|' + items.map(function (i) { return i.bname + '/' + i.voice; }).join(','), '');
        el.text = '🎬 ' + esc(L('epwlite_notify_movie'));
        el.labels = items.slice(0, 8).map(function (i) { return '🌐 ' + esc(i.bname) + (i.voice ? ' · 🎙 ' + esc(i.voice) : ''); });
        pushNotice(el);
        popup(esc(title || sub.title), '🎬 ' + esc(L('epwlite_notify_movie')));
    }

    function goneReason(r) {
        return L(r === 'plugin' ? 'epwlite_gone_plugin' : r === 'source' ? 'epwlite_gone_source' : r === 'rch' ? 'epwlite_gone_rch' : 'epwlite_gone_server');
    }

    function noticeGone(sub, title) {
        var el = noticeBase(sub, title, 'gone|' + Date.now(), '');
        el.text = '⚠️ ' + esc(L('epwlite_gone_title')) + ': ' + esc(goneReason(sub.fail_reason));
        el.labels = [];
        if (trim(sub.voice)) el.labels.push('🎙 ' + esc(trim(sub.voice)));
        if (sub.bname) el.labels.push('🌐 ' + esc(sub.bname));
        if (sub.plugin_name) el.labels.push('🧩 ' + esc(sub.plugin_name));
        pushNotice(el);
        popup(esc(title || sub.title), '⚠️ ' + esc(L('epwlite_gone_title')));
    }

    var SCH = { timer: 0, busy: false };

    function bgEnabled() {
        var v = true;
        try { v = Lampa.Storage.get('epwlite_bg', true); } catch (e) {}
        return !(v === false || v === 'false');
    }

    function canRunNow() {
        try { if (document.hidden) return false; } catch (e) {}
        try { if (Lampa.Player.opened && Lampa.Player.opened()) return false; } catch (e) {}
        try { if (navigator.onLine === false) return false; } catch (e) {}
        return true;
    }

    function schedule(ms) {
        clearTimeout(SCH.timer);
        SCH.timer = setTimeout(tick, Math.max(1000, ms));
    }

    function whenIdle(fn) {
        if (window.requestIdleCallback) window.requestIdleCallback(function () { fn(); }, { timeout: 5000 });
        else setTimeout(fn, 0);
    }

    function tick() {
        if (SCH.busy) return schedule(CFG.step_gap);
        if (!bgEnabled()) return schedule(CFG.idle_tick);
        if (!canRunNow()) return schedule(CFG.wait_retry);
        var now = Date.now(), list = loadSubs();
        var due = list.filter(function (s) { return !s.next_check || s.next_check <= now; })
            .sort(function (a, b) { return (a.next_check || 0) - (b.next_check || 0); });
        if (!due.length) {
            var next = list.reduce(function (m, s) { return Math.min(m, s.next_check || now); }, now + CFG.idle_tick);
            return schedule(Math.min(CFG.idle_tick, Math.max(CFG.wait_retry, next - now)));
        }
        whenIdle(function () {
            if (SCH.busy) return schedule(CFG.step_gap);
            SCH.busy = true;
            function done() {
                SCH.busy = false;
                schedule(CFG.step_gap);
            }
            checkOne(due[0].id).then(done, done);
        });
    }

    function checkAll() {
        if (SCH.busy) return noty(L('epwlite_check_running'));
        SCH.busy = true;
        noty(L('epwlite_check_start'));
        var ids = loadSubs().map(function (s) { return s.id; }), count = 0, total = 0;
        seq(ids, function (id) {
            return checkOne(id).then(function (r) {
                count++;
                total += (r && r.notified) || 0;
                return delay(CFG.req_gap);
            });
        }).then(function () {
            SCH.busy = false;
            noty(L('epwlite_check_done', count, total));
            schedule(CFG.step_gap);
        }, function () { SCH.busy = false; schedule(CFG.step_gap); });
    }

    var MENU_ACTION = 'epwlite_list';
    var ICON_LOGO = '<svg width="64" height="64" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">' +
        '<rect x="2" y="4" width="20" height="14" rx="2.5" stroke="currentColor" stroke-width="1.8"/>' +
        '<path d="M9 21h6" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>' +
        '<path d="M12 18v3" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>' +
        '<circle cx="8" cy="11" r="1.3" fill="currentColor"/>' +
        '<circle cx="12" cy="11" r="1.3" fill="currentColor"/>' +
        '<circle class="epwl-dot" cx="16" cy="11" r="1.3" stroke="currentColor" stroke-width="1.5"/>' +
        '<circle cx="12" cy="4" r="2.5" fill="currentColor"/>' +
    '</svg>';

    function cardKind(card) {
        if (!card || !card.id) return '';
        var src = lc(card.source || 'tmdb');
        if (src !== 'tmdb' && src !== 'cub') return '';
        return (card.name || card.original_name || card.number_of_seasons || card.first_air_date) ? 'tv' : 'movie';
    }

    function refreshBtn(ctx) {
        try { ctx.$btn.toggleClass('epwl-on', subsOf(ctx.card.id, ctx.kind).length > 0); } catch (e) {}
    }

    function placeButton(render, $btn) {
        var $sub = render.find('.button--subscribe').first();
        if ($sub.length) return $sub.after($btn);
        var $opt = render.find('.full-start-new__buttons .button--options').first();
        if ($opt.length) return $opt.before($btn);
        var $row = render.find('.full-start-new__buttons, .full-start__buttons').first();
        if ($row.length) return $row.append($btn);
        render.find('.view--torrent').first().after($btn);
    }

    function addCardButton(render, card) {
        var kind = cardKind(card);
        if (!render || !render.length || !kind || render.find('.button--epwlite').length) return;
        var $btn = $('<div class="full-start__button selector button--epwlite">' + ICON_LOGO + '<span>' + L('epwlite_menu') + '</span></div>');
        var ctx = { card: card, kind: kind, $btn: $btn };
        $btn.on('hover:enter', function () { openMenu(ctx); });
        placeButton(render, $btn);
        refreshBtn(ctx);
    }

    function bindFull() {
        Lampa.Listener.follow('full', function (e) {
            if (e.type !== 'complite') return;
            try { addCardButton(e.object.activity.render(), (e.data && e.data.movie) || e.object.card); } catch (err) {}
        });
        try {
            var act = Lampa.Activity.active();
            if (act && act.component === 'full') addCardButton(act.activity.render(), act.card);
        } catch (e) {}
    }

    function ensureMeta(ctx) {
        if (ctx.meta) return Promise.resolve(ctx.meta);
        return (ctx.kind === 'tv' ? getShow(ctx.card.id) : getMovie(ctx.card.id)).then(function (m) {
            if (!m) throw new Error('tmdb');
            ctx.meta = m;
            ctx.sp = spOf(m);
            return m;
        });
    }

    function openMenu(ctx) {
        ctx.cancelled = false;
        loading(true, function () { ctx.cancelled = true; });
        Promise.all([
            compatiblePlugins()['catch'](function () { return []; }),
            ensureMeta(ctx)['catch'](function () { return null; })
        ]).then(function (r) {
            loading(false);
            if (ctx.cancelled) return;
            ctx.plugins = r[0] || [];
            ctx.back = function () { rootMenu(ctx); };
            rootMenu(ctx);
        });
    }

    function subLabel(s) {
        var parts = [];
        if (s.media === 'movie') parts.push(s.bname || L('epwlite_any_source_word'));
        else if (trim(s.voice)) { parts.push(trim(s.voice)); if (s.bname) parts.push(s.bname); }
        else parts.push('TMDB');
        if (s.plugin_name) parts.push(s.plugin_name);
        return parts.join(' · ');
    }

    function rootMenu(ctx) {
        var items = [];
        subsOf(ctx.card.id, ctx.kind).forEach(function (s) {
            items.push({ title: L('epwlite_unsub_prefix') + esc(subLabel(s)), unsub: s.id });
        });
        if (items.length) items.push({ title: '', separator: true });
        if (ctx.kind === 'tv') items.push({ title: L('epwlite_tmdb_mode'), subtitle: L('epwlite_tmdb_mode_sub'), tmdb: true });
        if (!ctx.plugins.length) {
            items.push({ title: L('epwlite_no_plugins'), subtitle: L('epwlite_no_plugins_sub'), noenter: true });
        } else {
            items.push({ title: L(ctx.kind === 'tv' ? 'epwlite_plugins_head' : 'epwlite_plugins_head_movie'), separator: true });
            ctx.plugins.forEach(function (p) {
                items.push({ title: '🧩 ' + esc(p.name), subtitle: esc(hostLabel(p.host)), plugin: p });
            });
        }
        Lampa.Select.show({
            title: L('epwlite_title'),
            items: items,
            onSelect: function (a) {
                if (a.noenter) return;
                Lampa.Controller.toggle('content');
                if (a.unsub) {
                    removeSub(a.unsub);
                    noty(L('epwlite_unsubscribed'));
                    return refreshBtn(ctx);
                }
                if (!ctx.meta) return noty(L('epwlite_err_tmdb'));
                if (a.tmdb) { ctx.plugin = null; return pickSeason(ctx, { voice: '' }); }
                if (a.plugin) sourcesMenu(ctx, a.plugin);
            },
            onBack: function () { Lampa.Controller.toggle('content'); }
        });
    }

    function sourcesMenu(ctx, plugin) {
        ctx.plugin = plugin;
        ctx.cancelled = false;
        loading(true, function () { ctx.cancelled = true; });
        lpEvents(plugin, ctx.sp, ctx.kind === 'tv' ? 1 : 0).then(function (ev) {
            loading(false);
            if (ctx.cancelled) return;
            if (!ev.ok) {
                noty(ev.accsdb ? (ev.msg || L('epwlite_err_access')) : L('epwlite_err_network'));
                return ctx.back();
            }
            var list = ev.list.filter(function (e) { return !e.rch; });
            if (!list.length) { noty(L('epwlite_no_sources')); return ctx.back(); }
            list = list.filter(function (e) { return e.show; }).concat(list.filter(function (e) { return !e.show; }));
            var items = [];
            if (ctx.kind === 'movie')
                items.push({ title: L('epwlite_movie_any_source'), subtitle: L('epwlite_movie_any_source_sub'), any: true });
            list.forEach(function (e) {
                items.push({ title: '🌐 ' + esc(e.name), subtitle: e.show ? '' : L('epwlite_source_absent'), entry: e });
            });
            ctx.backSources = function () { sourcesMenu(ctx, plugin); };
            Lampa.Select.show({
                title: L('epwlite_sources_head') + ' · ' + esc(plugin.name),
                items: items,
                onSelect: function (a) {
                    Lampa.Controller.toggle('content');
                    if (a.any) return subscribeMovie(ctx, null, '');
                    if (ctx.kind === 'movie') return movieSource(ctx, a.entry);
                    tvSource(ctx, a.entry, '');
                },
                onBack: ctx.back
            });
        });
    }

    function posterItem(item, src) {
        if (src) item.thumbnail = src.replace(/"/g, '%22');
        else {
            item.template = 'selectbox_icon';
            item.icon = '<div class="epwl-poster"></div>';
        }
        return item;
    }

    function pickCandidate(ctx, sourceName, list, onPick, extra) {
        var card = ctx.card;
        var refYear = ('' + (card.first_air_date || card.release_date || '')).slice(0, 4);
        var items = [posterItem({
            title: esc(card.name || card.title || '') + (refYear ? ' (' + refYear + ')' : ''),
            subtitle: L('epwlite_cand_ref'),
            noenter: true
        }, tmdbImg('w300', card.poster_path))];
        items.push({ title: '🌐 ' + esc(sourceName), separator: true });
        list.forEach(function (c, i) {
            items.push(posterItem({
                title: (c.recommended ? '★ ' : '') + esc(c.title || '?') + (c.year ? ' (' + c.year + ')' : ''),
                subtitle: esc(c.details || ''),
                link: c.link,
                selected: i === 0
            }, c.img));
        });
        if (extra) items.push({ title: extra.title, subtitle: extra.subtitle || '', extra: true });
        Lampa.Select.show({
            title: L(ctx.kind === 'tv' ? 'epwlite_pick_show' : 'epwlite_pick_movie') + ' · ' + esc(sourceName),
            items: items,
            nomark: true,
            onDraw: function (item) {
                item.addClass('epwl-cand');
                var img = item.find('.selectbox-item__icon img');
                if (!img.length) return;
                img.removeClass('size-youtube').addClass('epwl-poster').attr('alt', '');
                img.on('error', function () { $(this).css('opacity', 0); });
            },
            onSelect: function (a) {
                if (!a.link && !a.extra) return;
                Lampa.Controller.toggle('content');
                onPick(a.extra ? '' : a.link);
            },
            onBack: ctx.backSources || ctx.back
        });
    }

    function tvSource(ctx, entry, link) {
        var p = ctx.plugin;
        ctx.cancelled = false;
        loading(true, function () { ctx.cancelled = true; });
        (link ? Promise.resolve(null) : lpSearch(p, entry, ctx.sp, false)).then(function (sr) {
            if (ctx.cancelled) return loading(false);
            if (sr && sr.rch) { loading(false); noty(L('epwlite_source_rch')); return ctx.backSources(); }
            if (sr && sr.candidates.length) {
                loading(false);
                if (sr.candidates.length === 1) return tvSource(ctx, entry, sr.candidates[0].link);
                return pickCandidate(ctx, entry.name, sr.candidates, function (lnk) { tvSource(ctx, entry, lnk); });
            }
            var e2 = withLink(entry, link);
            return (sr ? Promise.resolve(sr.seasons) : lpDiscoverSeasons(p, e2, ctx.sp)).then(function (seasons) {
                return lpProbe(p, e2, ctx.sp, 1, '').then(function (pr) {
                    loading(false);
                    if (ctx.cancelled) return;
                    var voices = pr.voices.filter(function (v) { return trim(v.name); });
                    if (!voices.length) { noty(L('epwlite_no_voices')); return ctx.backSources(); }
                    Lampa.Select.show({
                        title: esc(entry.name) + (seasons.length ? ' · ' + L('epwlite_bal_seasons') + ' ' + seasons.join(', ') : ''),
                        items: voices.map(function (v) { return { title: '🎙 ' + esc(trim(v.name)), voice: trim(v.name) }; }),
                        onSelect: function (a) {
                            Lampa.Controller.toggle('content');
                            pickSeason(ctx, { voice: a.voice, entry: entry, link: link });
                        },
                        onBack: ctx.backSources
                    });
                });
            });
        })['catch'](function () {
            loading(false);
            noty(L('epwlite_err_network'));
        });
    }

    function pickSeason(ctx, choice) {
        var show = ctx.meta, t = today();
        if (!show.seasons.length) return subscribeTv(ctx, choice, 0);
        var items = [{ title: L('epwlite_season_auto'), subtitle: L('epwlite_season_auto_sub'), target: 0 }];
        show.seasons.forEach(function (s) {
            var st = !s.air_date ? '' : s.air_date > t ? 'epwlite_season_upcoming'
                : (s.season_number === show.latest_aired_season && show.current_season_aired < show.current_season_total ? 'epwlite_season_airing' : 'epwlite_season_aired');
            items.push({
                title: 'S' + pad2(s.season_number) + ' - ' + esc(s.name || ''),
                subtitle: s.episode_count + ' ' + L('epwlite_season_eps') + (st ? ' · ' + L(st) : '') + (s.air_date ? ' · ' + s.air_date : ''),
                target: s.season_number
            });
        });
        Lampa.Select.show({
            title: L('epwlite_pick_season'),
            items: items,
            onSelect: function (a) {
                Lampa.Controller.toggle('content');
                subscribeTv(ctx, choice, a.target);
            },
            onBack: ctx.back
        });
    }

    function baseSub(ctx, media) {
        var p = ctx.plugin;
        return {
            media: media,
            tmdb_id: ctx.card.id,
            title: ctx.meta.name || ctx.card.name || ctx.card.title || '',
            poster_path: ctx.meta.poster_path || ctx.card.poster_path || '',
            sp: ctx.sp,
            plugin: p ? p.url : '',
            plugin_host: p ? p.host : '',
            plugin_name: p ? p.name : '',
            balanser: '',
            bname: '',
            link: '',
            voice: '',
            created: Date.now(),
            last_check: Date.now(),
            next_check: Date.now() + CFG.interval,
            fail: 0,
            fail_since: 0,
            fail_reason: ''
        };
    }

    function finishSub(ctx, sub, text) {
        loading(false);
        if (ctx.cancelled) return;
        upsertSub(sub);
        noty(text);
        refreshBtn(ctx);
        noticeReady();
    }

    function subscribeTv(ctx, choice, target) {
        var show = ctx.meta, latest = latestOf(show), voice = trim(choice.voice);
        var p = voice ? ctx.plugin : null;
        var e2 = voice && choice.entry ? withLink(choice.entry, choice.link) : null;
        if (!voice) ctx.plugin = null;
        var sub = baseSub(ctx, 'tv');
        sub.voice = voice;
        sub.target_season = target || 0;
        sub.structure = 'tmdb';
        if (e2) {
            sub.balanser = e2.balanser;
            sub.bname = e2.name;
            sub.link = choice.link ? relLink(e2.link, e2.url) : '';
        }
        ctx.cancelled = false;
        loading(true, function () { ctx.cancelled = true; });
        (e2 ? resolveStructure(p, e2, ctx.sp, show) : Promise.resolve('tmdb')).then(function (src) {
            sub.structure = src;
            sub.resolved_at = Date.now();
            return buildStructure(sub, show, latest);
        }).then(function (es) {
            sub.last_season = es.effectiveSeason;
            sub.season_total = es.seasonTotal;
            sub.season_aired = es.seasonAired;
            sub.last_episode = es.aired.reduce(function (m, e) { return Math.max(m, e.episode); }, 0);
            sub.last_voice_episode = 0;
            sub.show_status = show.status;
            sub.next_air_date = show.next_air_date;
            if (!e2) return;
            return lpProbe(p, e2, ctx.sp, es.effectiveSeason, voice).then(function (pr) { sub.last_voice_episode = pr.maxEpisode; });
        }).then(function () {
            finishSub(ctx, sub, voice ? L('epwlite_subscribed_v') + voice : L('epwlite_subscribed'));
        })['catch'](function () {
            loading(false);
            noty(L('epwlite_err_network'));
        });
    }

    function movieSource(ctx, entry) {
        ctx.cancelled = false;
        loading(true, function () { ctx.cancelled = true; });
        lpSearch(ctx.plugin, entry, ctx.sp, true).then(function (sr) {
            loading(false);
            if (ctx.cancelled) return;
            if (sr.rch) { noty(L('epwlite_source_rch')); return ctx.backSources(); }
            if (sr.candidates.length) {
                return pickCandidate(ctx, entry.name, sr.candidates, function (lnk) { subscribeMovie(ctx, entry, lnk); },
                    { title: L('epwlite_movie_wait_exact'), subtitle: L('epwlite_movie_wait_exact_sub') });
            }
            subscribeMovie(ctx, entry, '');
        });
    }

    function subscribeMovie(ctx, entry, link) {
        var p = ctx.plugin, sub = baseSub(ctx, 'movie');
        if (entry) {
            var e2 = withLink(entry, link);
            sub.balanser = e2.balanser;
            sub.bname = e2.name;
            sub.link = link ? relLink(e2.link, e2.url) : '';
        }
        ctx.cancelled = false;
        loading(true, function () { ctx.cancelled = true; });
        var targets = entry ? Promise.resolve([withLink(entry, link)])
            : lpEvents(p, ctx.sp, 0).then(function (ev) { return ev.ok ? ev.list.filter(function (e) { return !e.rch && e.show; }) : []; });
        targets.then(function (list) {
            return mapLimit(list, 3, function (e) {
                return lpProbeMovie(p, e, ctx.sp).then(function (r) { return { e: e, r: r }; });
            });
        }).then(function (results) {
            var seen = [];
            results.forEach(function (x) {
                if (!x || !x.r.available) return;
                (x.r.voices.length ? x.r.voices : ['']).forEach(function (v) {
                    var k = movieKey(x.e.balanser, v);
                    if (seen.indexOf(k) < 0) seen.push(k);
                });
            });
            sub.seen = seen;
            finishSub(ctx, sub, L('epwlite_movie_subscribed'));
        })['catch'](function () {
            loading(false);
            noty(L('epwlite_err_network'));
        });
    }

    function cardFallback(sub) {
        var card = noticeCard(sub, true);
        card.epwlite = sub;
        card.__epwlFallback = true;
        return card;
    }

    function buildCards(self, subs) {
        var results = new Array(subs.length), pending = subs.length, built = false;
        function finish() {
            if (built) return;
            built = true;
            clearTimeout(deadline);
            for (var k = 0; k < subs.length; k++) if (!results[k]) results[k] = cardFallback(subs[k]);
            self.build({ results: results, total_pages: 1, card_category: true });
            self.render().find('.category-full').addClass('mapping--grid').addClass('cols--6');
        }
        var deadline = setTimeout(finish, 4000);
        subs.forEach(function (sub, i) {
            var path = (sub.media === 'movie' ? 'movie/' : 'tv/') + sub.tmdb_id;
            http(tmdbUrl(path), 6000).then(function (r) {
                var data = r.ok ? parseJson(r.text) : null;
                if (data && data.id) {
                    data.source = 'tmdb';
                    if (!data.poster_path && sub.poster_path) data.poster_path = sub.poster_path;
                    data.epwlite = sub;
                    results[i] = data;
                } else results[i] = cardFallback(sub);
                if (--pending <= 0) finish();
            });
        });
    }

    function SubsComponent(object) {
        var comp = new Lampa.InteractionCategory(object);

        comp.create = function () {
            this.activity.loader(true);
            var subs = loadSubs().sort(function (a, b) { return (b.created || 0) - (a.created || 0); });
            if (!subs.length) return this.empty();
            buildCards(this, subs);
        };

        comp.cardRender = function (obj, element, card) {
            var sub = element.epwlite;
            if (!sub) return;
            var isMovie = sub.media === 'movie', position, line, hint = '', shown = 0, seasonNum = 0;
            if (isMovie) {
                position = '🎬 ' + ((sub.seen && sub.seen.length) ? '✅' : '⏳');
                line = '🌐 ' + esc(sub.bname || L('epwlite_any_source_word'));
            } else {
                var hasVoice = !!trim(sub.voice);
                seasonNum = sub.target_season > 0 ? sub.target_season : (sub.last_season || 1);
                shown = hasVoice ? (sub.last_voice_episode || 0) : (sub.season_aired || 0);
                var total = sub.season_total || 0;
                position = 'S' + seasonNum + ' E' + shown + (total > 0 ? '/' + total : '');
                if (hasVoice && total > 0 && (sub.season_aired || 0) > shown)
                    hint = '<span class="epwl-tmdb">TMDB ' + sub.season_aired + '/' + total + '</span>';
                line = hasVoice
                    ? '🎙 ' + esc(trim(sub.voice)) + (sub.structure === 'absolute' ? ' · ABS' : '') + (sub.bname ? '<br>🌐 ' + esc(sub.bname) : '')
                    : '🔔 TMDB';
            }
            if (sub.fail > 0) line += '<br><span class="epwl-warn">⚠️ ' + esc(L('epwlite_fail_badge')) + ' (' + sub.fail + ')</span>';

            var posClass = 'card__subscribe-position epwl-pos';
            if (!isMovie && shown > 0 && element.original_name && !element.__epwlFallback) {
                try {
                    var h = Lampa.Utils.hash([seasonNum, seasonNum > 10 ? ':' : '', shown, element.original_name].join(''));
                    posClass += Lampa.Timeline.view(h).percent > 0 ? ' epwl-seen' : ' epwl-new';
                } catch (e) {}
            }

            try {
                var $view = card.render().find('.card__view').first();
                if ($view.length) $view.after(
                    '<div class="card__subscribe epwl-card">' +
                        '<div class="card__subscribe-status on"></div>' +
                        '<div class="' + posClass + '">' + position + hint + '</div>' +
                        '<div class="card__subscribe-voice">' + line + '</div>' +
                    '</div>');
            } catch (e) {}

            card.onEnter = function (t, d) {
                Lampa.Activity.push({ url: '', component: 'full', id: d.tmdb_id || d.id, method: isMovie ? 'movie' : 'tv', card: d, source: 'tmdb' });
            };
        };

        return comp;
    }

    function openSubsPage() {
        Lampa.Activity.push({ url: '', title: META.name, component: MENU_ACTION, page: 1 });
    }

    function addMenu() {
        try {
            if (!$('.menu__item[data-action="' + MENU_ACTION + '"]').length)
                Lampa.Menu.addButton(ICON_LOGO, L('epwlite_menu'), openSubsPage).attr('data-action', MENU_ACTION);
        } catch (e) {}
    }

    function showPluginsInfo() {
        loading(true);
        allPlugins().then(function (list) {
            loading(false);
            list = list.filter(function (d) { return d.kind === 'lampac'; })
                .concat(list.filter(function (d) { return d.kind !== 'lampac'; }));
            var items = list.map(function (d) {
                var ok = d.kind === 'lampac';
                return {
                    title: (ok ? '✅ ' : '⛔ ') + esc(d.name),
                    subtitle: ok ? esc(hostLabel(d.host)) + ' · ' + L('epwlite_plugin_ok')
                        : esc(d.url) + ' · ' + L(d.kind === 'unknown' ? 'epwlite_plugin_unknown' : 'epwlite_plugin_bad'),
                    noenter: true
                };
            });
            if (!items.length) items.push({ title: L('epwlite_plugins_none'), noenter: true });
            Lampa.Select.show({
                title: L('epwlite_settings_plugins'),
                items: items,
                onSelect: function () {},
                onBack: function () { Lampa.Controller.toggle('settings_component'); }
            });
        });
    }

    function addSettings() {
        if (!Lampa.SettingsApi) return;

        Lampa.SettingsApi.addComponent({ component: 'epwatchlite', name: META.name, icon: ICON_LOGO });

        Lampa.SettingsApi.addParam({
            component: 'epwatchlite',
            param: { name: 'epwlite_about', type: 'static' },
            field: { name: META.name + ' · v' + META.version, description: L('epwlite_settings_author') + ': ' + META.author },
            onRender: function (item) {
                try {
                    item.find('.settings-param__name').css({ 'font-weight': '600' });
                    item.find('.settings-param__descr').css({ 'opacity': '0.75' });
                } catch (e) {}
            }
        });

        Lampa.SettingsApi.addParam({
            component: 'epwatchlite',
            param: {
                name: 'epwlite_lang',
                type: 'select',
                values: { auto: L('epwlite_settings_lang_auto'), uk: 'Українська', en: 'English', ru: 'Русский' },
                'default': 'auto'
            },
            field: { name: L('epwlite_settings_lang'), description: L('epwlite_settings_lang_desc') },
            onChange: function () {}
        });

        Lampa.SettingsApi.addParam({
            component: 'epwatchlite',
            param: { name: 'epwlite_bg', type: 'trigger', 'default': true },
            field: { name: L('epwlite_settings_bg'), description: L('epwlite_settings_bg_desc') },
            onChange: function () { schedule(CFG.step_gap); }
        });

        Lampa.SettingsApi.addParam({
            component: 'epwatchlite',
            param: { name: 'epwlite_open', type: 'button' },
            field: { name: L('epwlite_settings_open') },
            onChange: function () {
                Lampa.Controller.toggle('settings_component');
                openSubsPage();
            }
        });

        Lampa.SettingsApi.addParam({
            component: 'epwatchlite',
            param: { name: 'epwlite_check', type: 'button' },
            field: { name: L('epwlite_settings_check') },
            onChange: function () { checkAll(); }
        });

        Lampa.SettingsApi.addParam({
            component: 'epwatchlite',
            param: { name: 'epwlite_plugins_info', type: 'button' },
            field: { name: L('epwlite_settings_plugins'), description: L('epwlite_settings_plugins_desc') },
            onChange: function () { showPluginsInfo(); }
        });
    }

    function injectStyles() {
        if (document.getElementById('epwatchlite-styles')) return;
        var css =
            '.button--epwlite.epwl-on .epwl-dot{fill:currentColor}' +
            '.epwl-card{font-size:0.85em}' +
            '.epwl-pos.epwl-new{color:#82d873}' +
            '.epwl-pos.epwl-seen{color:#fff}' +
            '.epwl-tmdb{display:block;font-size:0.72em;opacity:0.55;margin-top:0.15em;line-height:1.1;letter-spacing:0.02em}' +
            '.epwl-warn{color:#ffb74d}' +
            '.selectbox-item__icon > .epwl-poster{width:3em;height:4.5em;object-fit:cover;border-radius:0.3em;background:rgba(255,255,255,0.08)}' +
            '.epwl-cand > div:last-child{min-width:0;flex:1 1 auto}' +
            '.epwl-cand .selectbox-item__title{white-space:normal;word-break:break-word}';
        var style = document.createElement('style');
        style.id = 'epwatchlite-styles';
        style.appendChild(document.createTextNode(css));
        document.head.appendChild(style);
    }

    function init() {
        try { Lampa.Lang.add(DICT); } catch (e) {}
        injectStyles();
        Lampa.Component.add(MENU_ACTION, SubsComponent);
        setTimeout(addMenu, 500);
        bindFull();
        addSettings();
        if (loadSubs().length) setTimeout(noticeReady, 5000);
        schedule(CFG.start_delay);
    }

    if (window.appready) init();
    else Lampa.Listener.follow('app', function (e) { if (e.type === 'ready') init(); });
})();