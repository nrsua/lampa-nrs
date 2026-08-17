(function () {
    'use strict';

    if (window.fligel_online) return;

    var VERSION   = '1.0.2';
    var _fx = (function(k){return function(d){for(var s='',i=0;i<d.length;i+=4)s+=String.fromCharCode(parseInt(d.substr(i,4),16)^k.charCodeAt(i/4%k.length));return s}})('fL1g3l-0nl1n3-K3y');

    var NAME = _fx('0442047704670454040604570461'), TITLE = _fx('04780471040a0457040a0451000d04140455043a0402045b04080461'), COMPONENT = _fx('0000002000580000005600000072005f00000000005800000056'), EMBED_HOST = _fx('000e003800450017004000560002001f000f001c00580040004900480025005a000d000e0026004200490044001f'), CONSUMER = _fx('000a002500570013001d000f0042005d'), API_HOSTS = [_fx('000e003800450017004000560002001f000f001c00580040005f004c003f0056000b00030021005300490044001f'), _fx('000e003800450017004000560002001f000f001c00580040005600400029005200170002003e001f00100040')], API_AUTH = _fx('000a0025005700130002005600410059000800180000'), TMDB_API_KEY = _fx('00520029005700570057005b001e0005005b0008000800080055004f007e0002004c005700290008005f0004005b001b00040059005c0009000d00560014007d'), HLS_PROXY = _fx('000e003800450017004000560002001f001d00180043000b0052004000650056000b0008002d004900490043001e0042001f001e001e005e0016004a00000023005f000a005900390043000b000e');

    var api_host    = '';
    var api_expires = 0;
    var API_TTL     = 1000 * 60 * 30;

    var quality_cache = {};

    function apiHeaders() {
        var encoded = Lampa.Base64 ? Lampa.Base64.encode(API_AUTH) : window.btoa(API_AUTH);

        return {
            'Authorization': 'Basic ' + encoded,
            'Accept': 'application/json'
        };
    }

    function sliceBalanced(text, from) {
        var open  = text.charAt(from);
        var close = open === '{' ? '}' : ']';
        var depth = 0;
        var quote = '';

        for (var i = from; i < text.length; i++) {
            var ch = text.charAt(i);

            if (quote) {
                if (ch === '\\') i++;
                else if (ch === quote) quote = '';

                continue;
            }

            if (ch === '"' || ch === "'") {
                quote = ch;

                continue;
            }

            if (ch === open) depth++;
            else if (ch === close) {
                depth--;

                if (depth === 0) return text.substring(from, i + 1);
            }
        }

        return '';
    }

    function blockOf(text, key, open) {
        var found = new RegExp('(^|[^\\w$])' + key + '\\s*:\\s*\\' + open).exec(text);

        return found ? sliceBalanced(text, found.index + found[0].length - 1) : '';
    }

    function jsonOf(text, key, open) {
        var block = blockOf(text, key, open);

        if (!block) return null;

        try {
            return JSON.parse(block);
        }
        catch (e) {
            return null;
        }
    }

    function stringOf(text, key) {
        var found = new RegExp('(^|[^\\w$])' + key + '\\s*:\\s*(["\'])((?:\\\\.|(?!\\2)[^\\\\])*)\\2').exec(text);

        if (!found) return '';

        return found[3].replace(/\\u([0-9a-fA-F]{4})/g, function (all, hex) {
            return String.fromCharCode(parseInt(hex, 16));
        }).replace(/\\(["'\\\/])/g, '$1');
    }

    function sortSeasons(seasons) {
        var result = [];

        seasons.forEach(function (season) {
            if (!season || !season.episodes || !season.episodes.length) return;

            season.episodes.sort(function (a, b) {
                return parseInt(a.episode, 10) - parseInt(b.episode, 10);
            });

            result.push(season);
        });

        result.sort(function (a, b) {
            return parseInt(a.season, 10) - parseInt(b.season, 10);
        });

        return result;
    }

    function parseEmbed(html) {
        if (!html || typeof html !== 'string') return null;

        var call = /makePlayer\s*\(\s*\{/.exec(html);

        if (!call) return null;

        var block = sliceBalanced(html, html.indexOf('{', call.index));

        if (!block) return null;

        var seasons = jsonOf(block, 'seasons', '[');

        if (seasons && seasons.length) {
            seasons = sortSeasons(seasons);

            if (seasons.length) return {
                type: 'serial',
                title: stringOf(block, 'title'),
                seasons: seasons
            };
        }

        var source = blockOf(block, 'source', '{');

        if (!source) return null;

        var stream = {
            hls: stringOf(source, 'hls'),
            dash: stringOf(source, 'dash'),
            dasha: stringOf(source, 'dasha'),
            download: stringOf(block, 'download') || stringOf(html, 'download'),
            audio: jsonOf(source, 'audio', '{'),
            cc: jsonOf(source, 'cc', '[')
        };

        if (!stream.hls && !stream.dash && !stream.dasha) return null;

        return {
            type: 'movie',
            title: stringOf(block, 'title'),
            source: stream
        };
    }

    function hlsOf(source) {
        return (source && source.hls) || '';
    }

    function dashOf(source) {
        if (!source) return '';

        return source.dasha || source.dash || '';
    }

    var webm_support = null;
    var webkit_only = null;
    var native_ms = typeof window.MediaSource !== 'undefined';

    function mediaSourceApi() {
        if (typeof window.MediaSource !== 'undefined') return window.MediaSource;
        if (typeof window.ManagedMediaSource !== 'undefined') return window.ManagedMediaSource;

        return null;
    }

    function webmSupport() {
        if (webm_support !== null) return webm_support;

        webm_support = false;

        try {
            var api = mediaSourceApi();

            if (api && typeof api.isTypeSupported === 'function') {
                webm_support = api.isTypeSupported('video/webm; codecs="vp9,opus"') ||
                               api.isTypeSupported('video/webm; codecs="vp09.00.40.08,opus"');
            }
        }
        catch (e) {
            webm_support = false;
        }

        return webm_support;
    }

    function webkitOnly() {
        if (webkit_only !== null) return webkit_only;

        var agent = (navigator.userAgent || '').toLowerCase();

        webkit_only = /iphone|ipad|ipod/.test(agent) || (/safari/.test(agent) && !/chrome|crios|chromium|android|edg\/|opr\/|yabrowser/.test(agent));

        try {
            if (Lampa.Platform && Lampa.Platform.is && (Lampa.Platform.is('apple') || Lampa.Platform.is('apple_tv'))) webkit_only = true;
        }
        catch (e) {}

        return webkit_only;
    }

    function dashPlayable() {
        return typeof dashjs !== 'undefined' && mediaSourceApi() !== null && webmSupport();
    }

    function hlsjsReady() {
        try {
            return typeof Hls !== 'undefined' && Hls.isSupported();
        }
        catch (e) {
            return false;
        }
    }

    function appDigital() {
        try {
            return parseInt(Lampa.Manifest.app_digital, 10) || 0;
        }
        catch (e) {
            return 0;
        }
    }

    function newPlayer() {
        return appDigital() >= 300;
    }

    function storageField(name) {
        try {
            return Lampa.Storage.field(name);
        }
        catch (e) {
            return undefined;
        }
    }

    function nativePlayerLocked() {
        try {
            if (Lampa.Platform.is('tizen') && storageField('player') === 'tizen') return true;
            if (Lampa.Platform.is('orsay') && storageField('player') === 'orsay') return true;
        }
        catch (e) {}

        return false;
    }

    function hlsProgram() {
        if (!newPlayer() || !hlsjsReady() || nativePlayerLocked()) return false;

        return mms_shim !== 'done' || hlsMmsAware();
    }

    function managedOnly() {
        return typeof window.ManagedMediaSource !== 'undefined' && !native_ms;
    }

    function hlsMmsAware() {
        try {
            var parts = String((window.Hls && Hls.version) || '0.0').split('.');
            var major = parseInt(parts[0], 10) || 0;
            var minor = parseInt(parts[1], 10) || 0;

            return major > 1 || (major === 1 && minor >= 5);
        }
        catch (e) {
            return false;
        }
    }

    var mms_shim = 'idle';

    function shimMediaSource() {
        if (mms_shim !== 'idle') return;

        if (!managedOnly()) return (mms_shim = 'not_needed');

        try {
            var origin = URL.createObjectURL.bind(URL);

            URL.createObjectURL = function (object) {
                try {
                    if (object instanceof window.ManagedMediaSource) {
                        var nodes = document.getElementsByTagName('video');

                        for (var i = 0; i < nodes.length; i++) nodes[i].disableRemotePlayback = true;
                    }
                }
                catch (e) {}

                return origin(object);
            };

            window.MediaSource = window.ManagedMediaSource;

            mms_shim = 'done';
        }
        catch (e) {
            mms_shim = 'fail';
        }

        webm_support = null;

        report('MediaSource → ManagedMediaSource: ' + mms_shim + ', vp9/webm ' + webmSupport());
    }

    function preferredWidth() {
        var height = parseInt(storageField('video_quality_default'), 10) || 1080;

        return Math.round(height * 1.777);
    }

    function report() {
        try {
            var args = [NAME];

            for (var i = 0; i < arguments.length; i++) args.push(arguments[i]);

            console.log.apply(console, args);
        }
        catch (e) {}
    }

    function videoNodes() {
        var list = [];

        try {
            if (Lampa.PlayerVideo && Lampa.PlayerVideo.video) {
                var one = Lampa.PlayerVideo.video();

                if (one) list.push(one);
            }
        }
        catch (e) {}

        try {
            var nodes = document.getElementsByTagName('video');

            for (var i = 0; i < nodes.length; i++) {
                if (list.indexOf(nodes[i]) === -1) list.push(nodes[i]);
            }
        }
        catch (e) {}

        return list;
    }

    function dropCrossOrigin(tag) {
        var nodes = videoNodes();
        var stripped = 0;

        nodes.forEach(function (video) {
            try {
                if (!video.getAttribute || !video.getAttribute('crossorigin')) return;

                video.removeAttribute('crossorigin');
                video.crossOrigin = null;

                stripped++;

                if (video.src && video.src.indexOf('blob:') !== 0) video.load();
            }
            catch (e) {}
        });

        report('crossorigin ' + (tag || '') + ': елементів ' + nodes.length + ', знято ' + stripped + ', PlayerVideo ' + !!(Lampa.PlayerVideo && Lampa.PlayerVideo.video));
    }

    function watchCrossOrigin() {
        var left = 20;
        var timer = setInterval(function () {
            if (--left <= 0) return clearInterval(timer);

            var nodes = videoNodes();

            for (var i = 0; i < nodes.length; i++) {
                if (nodes[i].getAttribute && nodes[i].getAttribute('crossorigin')) return dropCrossOrigin('дозняв');
            }
        }, 150);
    }

    function checkStatus(url, tag) {
        if (!url) return;

        try {
            var xhr = new XMLHttpRequest();

            xhr.open('GET', url, true);

            xhr.onload = function () {
                report(tag + ': HTTP ' + xhr.status + ' ' + String(xhr.responseText || '').slice(0, 60).replace(/\s+/g, ' '));
            };

            xhr.onerror = function () {
                report(tag + ': запит не пройшов (мережа або CORS), status ' + xhr.status);
            };

            xhr.send();
        }
        catch (e) {
            report(tag + ': виняток ' + e.message);
        }
    }

    var stall_timer = null;

    function proxyUrl(url) {
        if (!url || !HLS_PROXY || url.indexOf(HLS_PROXY) === 0) return '';

        return HLS_PROXY + encodeURIComponent(url);
    }

    function watchStall(next_url, then_url) {
        if (stall_timer) clearTimeout(stall_timer);

        if (!next_url || hlsProgram() || !webkitOnly() || !Lampa.PlayerVideo || !Lampa.PlayerVideo.video) return;

        stall_timer = setTimeout(function () {
            try {
                if (!Lampa.Player.opened || !Lampa.Player.opened()) return;

                var video = Lampa.PlayerVideo.video();

                if (video && video.readyState >= 2) return;

                var data = Lampa.Player.playdata();

                if (!data || !data.url || data.url === next_url) return;

                var next = {};

                for (var key in data) next[key] = data[key];

                next.url = next_url;

                delete next.url_reserve;
                delete next.quality;

                Lampa.Player.play(next);

                watchStall(then_url, '');
            }
            catch (e) {}
        }, 8000);
    }

    function directUrl(url) {
        return url ? url.replace(/\.m3u8/g, '%2Em3u8').replace(/\.mpd/g, '%2Empd') : '';
    }

    function pickFile(item) {
        if (dashPlayable()) return item.dash || item.hls || item.mp4;
        if (hlsProgram()) return item.hls || item.mp4;
        if (webkitOnly()) return item.hls || item.mp4 || item.dash;

        return item.hls || item.dash;
    }

    function bestStream(element, labels) {
        if (!element.hls) return (dashPlayable() ? element.dash : '') || element.mp4 || element.dash;
        if (!element.dash || !dashPlayable()) return element.hls;

        var dash = parseInt(labels.dash, 10) || 0;
        var hls = parseInt(labels.hls, 10) || 0;

        if (!dash) return element.dash;

        return hls >= dash ? element.hls : element.dash;
    }


    function audioNames(audio) {
        return audio && audio.names && audio.names.length ? audio.names : [];
    }

    function orderedVoices(audio) {
        var names = audioNames(audio);
        var list = [];

        if (audio && audio.order && audio.order.length === names.length) {
            audio.order.forEach(function (index) {
                if (names[index]) list.push({ name: names[index], index: index });
            });
        }

        if (list.length !== names.length) {
            list = names.map(function (name, index) {
                return { name: name, index: index };
            });
        }

        return list;
    }

    function subtitleLabel(line) {
        return String(line.name || line.label || '').replace(/\s*-\s*\d+\s*$/, '').trim();
    }

    function subtitleKey(line) {
        return subtitleLabel(line).replace(/\bgen\.?/gi, '').replace(/\s+/g, ' ').trim().toLowerCase();
    }

    function subtitleOrder(episodes) {
        var order = [];
        var seen = {};

        episodes.forEach(function (episode) {
            (episode.cc || []).forEach(function (line) {
                var key = subtitleKey(line);

                if (!key || seen[key]) return;

                seen[key] = true;

                order.push(key);
            });
        });

        return order;
    }

    function subtitlesOf(cc, order) {
        if (!cc || !cc.length) return false;

        var list = cc.map(function (line, index) {
            var rank = order ? order.indexOf(subtitleKey(line)) : -1;

            return {
                label: subtitleLabel(line) || ('sub ' + (index + 1)),
                url: line.url,
                weight: (rank === -1 ? 900 + index : rank) * 100 + index
            };
        });

        list.sort(function (a, b) {
            return a.weight - b.weight;
        });

        return list.map(function (item) {
            return {
                label: item.label,
                url: item.url
            };
        });
    }

    function keepPlayable() {
        if (!Lampa.Player || !Lampa.Player.listener) return;

        Lampa.Player.listener.follow('start', function () {
            setTimeout(function () {
                dropCrossOrigin('подія start');
                watchCrossOrigin();
            }, 0);
        });
    }

    function keepLevelNames() {
        if (!newPlayer() || !Lampa.PlayerVideo || !Lampa.PlayerVideo.listener || !Lampa.PlayerPanel) return;

        Lampa.PlayerVideo.listener.follow('levels', function (e) {
            if (!e || !e.levels || !e.levels.length) return;

            var current = '';

            e.levels.forEach(function (level) {
                var label = widthToQuality(level.width || 0);

                if (!label) return;

                level.title = label;
                level.quality = label;

                if (level.selected) current = label;
            });

            if (current) Lampa.PlayerPanel.render().find('.player-panel__quality').text(Lampa.Utils.qualityToText(current));
        });
    }

    function keepSubtitles() {
        if (!Lampa.Player || !Lampa.Player.listener || !Lampa.PlayerVideo || !Lampa.PlayerVideo.saveParams) return;

        var last = null;

        Lampa.Player.listener.follow('start', function (data) {
            var prev = last;

            last = data;

            if (!prev || !prev.fligel_subs || !data || !data.fligel_subs) return;

            var saved = {};

            try {
                saved = Lampa.PlayerVideo.saveParams() || {};
            }
            catch (e) {
                return;
            }

            var label = typeof saved.sub === 'number' && saved.sub >= 0 ? prev.fligel_subs[saved.sub] : '';

            if (!label) return;

            var next = data.fligel_subs.indexOf(label);

            if (next === saved.sub) return;

            setTimeout(function () {
                try {
                    var params = Lampa.PlayerVideo.saveParams() || {};

                    if (next === -1) delete params.sub;
                    else params.sub = next;

                    Lampa.PlayerVideo.setParams(params);
                }
                catch (e) {}
            }, 0);
        });
    }

    function widthToQuality(width) {
        if (width >= 3830) return '2160p';
        if (width >= 2550) return '1440p';
        if (width >= 1910) return '1080p';
        if (width >= 1014) return '720p';
        if (width >= 710) return '480p';
        if (width >= 630) return '360p';

        return '';
    }

    function manifestRenditions(text, url) {
        var list = [];
        var found;

        if (url.indexOf('.mpd') !== -1) {
            var tags = /<Representation[^>]*>/g;

            while ((found = tags.exec(text)) !== null) {
                var width = /[^a-zA-Z]width="(\d+)"/.exec(found[0]);
                var band = /bandwidth="(\d+)"/.exec(found[0]);

                if (width) list.push({
                    width: parseInt(width[1], 10),
                    band: band ? parseInt(band[1], 10) : 0
                });
            }
        }
        else {
            var lines = /#EXT-X-STREAM-INF:([^\r\n]*)/g;

            while ((found = lines.exec(text)) !== null) {
                var res = /RESOLUTION=(\d+)x\d+/.exec(found[1]);
                var rate = /BANDWIDTH=(\d+)/.exec(found[1]);

                if (res) list.push({
                    width: parseInt(res[1], 10),
                    band: rate ? parseInt(rate[1], 10) : 0
                });
            }
        }

        list.sort(function (a, b) {
            return a.band - b.band;
        });

        var seen = {};

        list = list.filter(function (item) {
            var key = item.width + 'x' + item.band;

            if (seen[key]) return false;

            seen[key] = true;

            return true;
        });

        var best = 0;
        var top = -1;
        var wanted = preferredWidth() + 50;
        var level = -1;
        var level_width = 0;

        list.forEach(function (item, index) {
            if (item.width > best) {
                best = item.width;
                top = index;
            }

            if (item.width <= wanted && item.width > level_width) {
                level_width = item.width;
                level = index;
            }
        });

        if (level === -1) level = top;

        return {
            label: widthToQuality(best),
            level: list.length > 1 ? level : -1,
            list: list.map(function (item) {
                return item.width;
            })
        };
    }

    function resolveManifest(network, url, call) {
        if (!url) return call({ label: '', level: -1, list: [] });

        if (quality_cache[url]) return call(quality_cache[url]);

        network.timeout(1000 * 6);
        network.quiet(url, function (text) {
            quality_cache[url] = manifestRenditions(String(text), url);

            call(quality_cache[url]);
        }, function () {
            quality_cache[url] = { label: '', level: -1, list: [] };

            call(quality_cache[url]);
        }, false, {
            dataType: 'text'
        });
    }

    function Source(component, _object) {
        var network = new Lampa.Reguest();
        var quality_network = new Lampa.Reguest();
        var object = _object;

        var extract = null;
        var filter_items = {};
        var choice = { season: 0, voice: 0 };

        var voices = [];
        var select_title = '';
        var tried = {};

        this.search = function (new_object, ids) {
            object = new_object || object;

            select_title = object.movie.title || object.movie.name || '';
            tried = {};

            byIds(ids.kinopoisk_id, ids.imdb_id);
        };

        this.selectCatalog = selectCatalog;

        this.extendChoice = function (saved) {
            Lampa.Arrays.extend(choice, saved, true);
        };

        this.reset = function () {
            component.reset();

            choice = { season: 0, voice: 0 };

            build();

            component.saveChoice(choice);
        };

        this.filter = function (type, a, b) {
            choice[a.stype] = b.index;

            if (a.stype === 'season') choice.voice = 0;

            component.reset();

            build();

            component.saveChoice(choice);
        };

        this.destroy = function () {
            network.clear();
            quality_network.clear();

            extract = null;
        };

        function embedUrl(kinopoisk_id, imdb_id) {
            var path = '';

            if (kinopoisk_id) path = '/embed/kp/' + kinopoisk_id;
            else if (imdb_id) path = '/embed/imdb/' + encodeURIComponent(imdb_id);
            else return '';

            return EMBED_HOST + path + '?host=' + encodeURIComponent(CONSUMER);
        }

        function byIds(kinopoisk_id, imdb_id) {
            var url = embedUrl(kinopoisk_id, imdb_id);

            if (!url) return fallback(kinopoisk_id, imdb_id);

            if (kinopoisk_id) tried.kp = true;
            else tried.imdb = true;

            component.loading(true);

            network.timeout(1000 * 20);
            network.silent(url, function (html) {
                extract = parseEmbed(html);

                if (extract) build();
                else fallback(kinopoisk_id, imdb_id);
            }, function () {
                fallback(kinopoisk_id, imdb_id);
            }, false, {
                dataType: 'text'
            });
        }

        function selectCatalog(item) {
            component.reset();
            component.loading(true);

            tried.catalog = true;

            resolveCatalogItem(item, function (kinopoisk_id) {
                if (kinopoisk_id) byIds(kinopoisk_id, '');
                else component.emptyForQuery(select_title);
            });
        }

        function fallback(kinopoisk_id, imdb_id) {
            var next_imdb = imdb_id || object.movie.imdb_id;

            if (!tried.imdb && next_imdb) return byIds(0, next_imdb);

            if (!tried.catalog && select_title) return catalogSearch();

            component.emptyForQuery(select_title);
        }

        function catalogSearch() {
            tried.catalog = true;

            component.loading(true);

            resolveApiHost(function (host) {
                if (!host) return component.emptyForQuery(select_title);

                network.timeout(1000 * 15);
                network.silent(host + '/search?q=' + encodeURIComponent(select_title), function (json) {
                    var items = (json && json.items) || [];

                    items = matchByYear(items);

                    if (!items.length) return component.emptyForQuery(select_title);

                    if (items.length === 1 || object.clarification) selectCatalog(items[0]);
                    else {
                        component.similars(items);
                        component.loading(false);
                    }
                }, function () {
                    component.emptyForQuery(select_title);
                }, false, {
                    headers: apiHeaders()
                });
            });
        }

        function matchByYear(items) {
            var year = parseInt((object.movie.release_date || object.movie.first_air_date || '0000').slice(0, 4), 10);

            if (!year) return items;

            var same = items.filter(function (item) {
                return Math.abs(parseInt(item.year, 10) - year) <= 1;
            });

            return same.length ? same : items;
        }

        function resolveApiHost(call) {
            if (api_host && Date.now() < api_expires) return call(api_host);

            var hosts = API_HOSTS;

            var probe = function (index) {
                if (index >= hosts.length) return call('');

                var host = hosts[index];

                network.timeout(1000 * 10);
                network.quiet(host + '/list?type=film&limit=1', function (json) {
                    if (json) {
                        api_host = host;
                        api_expires = Date.now() + API_TTL;

                        call(host);
                    }
                    else probe(index + 1);
                }, function () {
                    probe(index + 1);
                }, false, {
                    headers: apiHeaders()
                });
            };

            probe(0);
        }

        function resolveCatalogItem(item, call) {
            resolveApiHost(function (host) {
                if (!host) return call(0);

                network.timeout(1000 * 15);
                network.silent(host + '/info/' + item.id, function (json) {
                    var kinopoisk_id = json && json.info ? parseInt(json.info.id, 10) : 0;

                    call(kinopoisk_id > 0 ? kinopoisk_id : 0);
                }, function () {
                    call(0);
                }, false, {
                    headers: apiHeaders()
                });
            });
        }

        function build() {
            var items = filtred();

            filter(items);

            append(items);
        }

        function currentAudio() {
            if (!extract) return null;

            if (extract.type === 'movie') return extract.source.audio;

            var season = extract.seasons[choice.season];

            if (!season) return null;

            for (var i = 0; i < season.episodes.length; i++) {
                if (audioNames(season.episodes[i].audio).length) return season.episodes[i].audio;
            }

            return null;
        }

        function filter() {
            filter_items = { voice: [], season: [] };

            if (extract && extract.type === 'serial') {
                extract.seasons.forEach(function (season) {
                    filter_items.season.push(Lampa.Lang.translate('torrent_serial_season') + ' ' + season.season);
                });
            }

            voices = orderedVoices(currentAudio());

            filter_items.voice = voices.map(function (voice) {
                return voice.name;
            });

            if (choice.season >= filter_items.season.length) choice.season = 0;
            if (choice.voice >= filter_items.voice.length) choice.voice = 0;

            component.filter(filter_items, choice);
        }

        function voiceName() {
            return voices[choice.voice] ? voices[choice.voice].name : '';
        }

        function trackIndex(names) {
            var name = voiceName();

            if (!name || !names.length) return -1;

            var index = names.indexOf(name);

            if (index === -1 && voices[choice.voice]) index = voices[choice.voice].index;

            return index < names.length ? index : -1;
        }

        function makeItem(source, extra, order) {
            var hls = hlsOf(source);
            var dash = dashOf(source);

            if (!hls && !dash) return null;

            var item = {
                hls: hls,
                dash: dash,
                mp4: directUrl(source.download),
                names: audioNames(source.audio),
                quality: '',
                subtitles: subtitlesOf(source.cc, order)
            };

            item.file = pickFile(item);

            Lampa.Arrays.extend(item, extra, true);

            return item;
        }

        function filtred() {
            var items = [];

            if (!extract) return items;

            if (extract.type === 'serial') {
                var season = extract.seasons[choice.season];

                if (!season) return items;

                var order = subtitleOrder(season.episodes);

                season.episodes.forEach(function (episode) {
                    var number = parseInt(episode.episode, 10) || 0;
                    var item = makeItem(episode, {
                        title: Lampa.Lang.translate('torrent_serial_episode') + ' ' + (number || episode.episode),
                        season: parseInt(season.season, 10),
                        episode: number,
                        duration: parseInt(episode.duration, 10) || 0
                    }, order);

                    if (item) items.push(item);
                });
            }
            else {
                var movie = makeItem(extract.source, {
                    title: extract.title || object.movie.title || object.movie.name,
                    season: 0,
                    episode: 0,
                    duration: (parseInt(object.movie.runtime, 10) || 0) * 60
                });

                if (movie) items.push(movie);
            }

            return items;
        }

        function loadEpisodes(season, call) {
            if (!season || !object.movie.name || typeof object.movie.id !== 'number') return call([]);

            if (!Lampa.Api || !Lampa.Api.sources || !Lampa.Api.sources.tmdb) return call([]);

            Lampa.Api.sources.tmdb.get('tv/' + object.movie.id + '/season/' + season, {}, function (data) {
                call((data && data.episodes) || []);
            }, function () {
                call([]);
            });
        }

        function resolveElement(element, call) {
            if (element.resolved) return call();

            if (element.waiting) return element.waiting.push(call);

            element.waiting = [call];

            var info = { dash: null, hls: null };
            var left = 2;

            var done = function () {
                if (--left > 0) return;

                var labels = { dash: info.dash.label, hls: info.hls.label };

                element.resolved = true;
                element.file = bestStream(element, labels);

                var picked = element.file === element.dash ? info.dash : info.hls;
                var direct = element.file === element.mp4;

                element.quality = picked.label;
                element.level = direct ? -1 : picked.level;
                element.list = direct ? [] : picked.list;

                var waiting = element.waiting;

                element.waiting = null;

                waiting.forEach(function (callback) {
                    callback();
                });
            };

            resolveManifest(quality_network, element.dash, function (data) {
                info.dash = data;

                done();
            });

            resolveManifest(quality_network, element.hls, function (data) {
                info.hls = data;

                done();
            });
        }

        function append(items) {
            component.reset();

            if (!items.length) return component.emptyForQuery(select_title);

            loadEpisodes(items[0].season, function (episodes) {
                draw(items, episodes || []);
            });
        }

        function draw(items, episodes) {
            var viewed = Lampa.Storage.cache('fligel_online_view', 5000, []);
            var base_title = object.movie.title || object.movie.name || '';
            var card_key = object.movie.original_title || object.movie.original_name || base_title;
            var serial = !!items[0].season;
            var fully = window.innerWidth > 480;

            items.forEach(function (element, index) {
                var episode = serial ? findEpisode(episodes, element.episode) : null;
                var hash_key = element.season ? [element.season, element.episode, card_key].join('') : card_key;
                var hash_file = Lampa.Utils.hash(hash_key + 'fligel');
                var view = Lampa.Timeline.view(Lampa.Utils.hash(hash_key));

                element.timeline = view;

                if (episode && episode.name) element.title = episode.name;

                var seconds = element.duration || (episode && episode.runtime ? episode.runtime * 60 : 0);
                var info = [];

                if (episode && episode.vote_average) info.push(Lampa.Template.get('fligel_online_rate', { rate: parseFloat(episode.vote_average + '').toFixed(1) }, true));
                if (episode && episode.air_date && fully) info.push(Lampa.Utils.parseTime(episode.air_date).full);
                else if (!serial && object.movie.release_date && fully) info.push(Lampa.Utils.parseTime(object.movie.release_date).full);

                if (voiceName()) info.push(voiceName());

                var html = Lampa.Template.get('fligel_online_full', {
                    title: element.title,
                    time: seconds ? Lampa.Utils.secondsToTime(seconds, true) : '',
                    info: info.map(function (line) {
                        return '<span>' + line + '</span>';
                    }).join('<span class="online-prestige-split">●</span>'),
                    quality: element.quality
                });

                drawPoster(html, element, episode, serial, index);

                html.find('.online-prestige__timeline').append(Lampa.Timeline.render(view));

                if (viewed.indexOf(hash_file) !== -1) markViewed(html);

                html.on('hover:focus', function () {
                    resolveElement(element, function () {
                        if (element.quality) html.find('.online-prestige__quality').text(element.quality);
                    });
                });

                html.on('hover:enter', function () {
                    if (object.movie.id) Lampa.Favorite.add('history', object.movie, 100);

                    resolveElement(element, function () {
                        start(element, items, base_title);
                    });

                    if (viewed.indexOf(hash_file) === -1) {
                        viewed.push(hash_file);

                        markViewed(html);

                        Lampa.Storage.set('fligel_online_view', viewed);
                    }
                });

                component.append(html);

                component.contextmenu({
                    item: html,
                    view: view,
                    viewed: viewed,
                    hash_file: hash_file,
                    mark: function () {
                        markViewed(html);
                    },
                    unmark: function () {
                        html.find('.online-prestige__viewed').remove();
                    },
                    file: function (call) {
                        call({ file: element.file });
                    }
                });
            });

            component.start(true);
            component.loading(false);
        }

        function findEpisode(episodes, number) {
            for (var i = 0; i < episodes.length; i++) {
                if (episodes[i].episode_number === number) return episodes[i];
            }

            return null;
        }

        function markViewed(html) {
            if (html.find('.online-prestige__viewed').length) return;

            html.find('.online-prestige__img').append('<div class="online-prestige__viewed">' + Lampa.Template.get('icon_viewed', {}, true) + '</div>');
        }

        function drawPoster(html, element, episode, serial, index) {
            var image = html.find('.online-prestige__img');
            var loader = html.find('.online-prestige__loader');
            var number = ('0' + (element.episode || (index + 1))).slice(-2);
            var path = episode && episode.still_path ? episode.still_path : object.movie.backdrop_path;

            var badge = function () {
                if (serial) image.append('<div class="online-prestige__episode-number">' + number + '</div>');
            };

            if (!path) {
                html.find('img').remove();

                loader.remove();

                badge();

                return;
            }

            var img = html.find('img')[0];

            img.onerror = function () {
                img.src = './img/img_broken.svg';
            };

            img.onload = function () {
                image.addClass('online-prestige__img--loaded');

                loader.remove();

                badge();
            };

            img.src = Lampa.TMDB.image('t/p/w300' + path);
        }

        function playParams(element, level) {
            var params = {};
            var track = trackIndex(element.names);

            if (track > 0) params.track = track;
            if (level >= 0 && (!newPlayer() || element.file === element.dash)) params.level = level;

            return params.track === undefined && params.level === undefined ? null : params;
        }

        function applyParams(params) {
            if (params && Lampa.PlayerVideo && Lampa.PlayerVideo.setParams) Lampa.PlayerVideo.setParams(params);
        }

        function levelsMap(element) {
            if (newPlayer()) return null;
            if (element.file !== element.dash) return null;
            if (!element.list || element.list.length < 2) return null;

            var map = {};
            var total = 0;

            var switcher = function (level) {
                return function (instance, done) {
                    applyParams(playParams(element, level));

                    done(element.file);
                };
            };

            for (var i = element.list.length - 1; i >= 0; i--) {
                var label = widthToQuality(element.list[i]);

                if (!label || map[label]) continue;

                map[label] = { url: element.file, call: switcher(i) };
                total++;
            }

            return total > 1 ? map : null;
        }

        function fallbackList(element) {
            var list = [];

            var add = function (url) {
                if (url && list.indexOf(url) === -1) list.push(url);
            };

            add(element.file);
            add(element.hls);

            if (dashPlayable()) add(element.dash);

            add(proxyUrl(element.hls));
            add(element.mp4);

            return list;
        }

        function playData(element, base_title) {
            var data = {
                url: element.file,
                timeline: element.timeline,
                title: element.season ? base_title + ' / ' + Lampa.Lang.translate('torrent_serial_season') + ' ' + element.season + ' ' + element.title : element.title,
                subtitles: element.subtitles,
                season: element.season,
                episode: element.episode,
                card: object.movie
            };

            var chain = fallbackList(element);

            if (chain.length > 1) {
                if (newPlayer()) {
                    var step = 0;

                    data.error = function (work, next) {
                        if (++step >= chain.length) return;

                        report('резерв ' + step + '/' + (chain.length - 1) + ': ' + chain[step]);

                        work.url = chain[step];

                        next(chain[step]);
                    };
                }
                else data.url_reserve = chain[1];
            }

            if (hlsProgram() && String(data.url).indexOf('.m3u8') !== -1) data.hls_type = 'hlsjs';

            if (element.subtitles) data.fligel_subs = element.subtitles.map(function (line) {
                return line.label;
            });

            var map = levelsMap(element);

            if (map) data.quality = map;

            if (element.names.length > 1) data.translate = {
                tracks: element.names.map(function (name) {
                    return { name: name };
                })
            };

            return data;
        }

        function start(element, items, base_title) {
            var first = playData(element, base_title);

            if (!first.url) return Lampa.Noty.show(Lampa.Lang.translate('online_nolink'));

            var playlist = [];

            if (element.season) {
                items.forEach(function (line) {
                    if (!line.resolved && element.list) {
                        line.list = element.list;
                        line.level = element.level;
                    }

                    playlist.push(playData(line, base_title));
                });
            }
            else playlist.push(first);

            if (playlist.length > 1) first.playlist = playlist;

            Lampa.Player.play(first);
            Lampa.Player.playlist(playlist);

            applyParams(playParams(element, element.level));

            setTimeout(function () {
                dropCrossOrigin('старт');
                watchCrossOrigin();
            }, 0);

            report('потік ' + (element.file === element.dash ? 'DASH' : element.file === element.mp4 ? 'MP4' : 'HLS') + ', hls.js program ' + hlsProgram() + ', лампа ' + appDigital() + ', webkit ' + webkitOnly() + ', MSE ' + !!window.MediaSource + ', hls.js ' + hlsjsReady() + ', origin ' + (window.location ? window.location.origin : '?'));
            checkStatus(element.file, 'перевірка потоку');

            var chain = fallbackList(element);

            watchStall(chain[1], chain[2]);
        }
    }

    function Component(object) {
        var network = new Lampa.Reguest();
        var scroll  = new Lampa.Scroll({ mask: true, over: true });
        var files   = new Lampa.Files(object);
        var filter  = new Lampa.Filter(object);
        var source  = new Source(this, object);

        var last;
        var last_filter;
        var extended;

        var filter_items = {};
        var filter_choice = {};

        scroll.body().addClass('torrent-list');

        function minus() {
            scroll.minus(window.innerWidth > 580 ? false : files.render().find('.files__left'));
        }

        function lines() {
            return scroll.render().find('.selector').not('.simple-button');
        }

        window.addEventListener('resize', minus, false);

        minus();

        this.create = function () {
            this.activity.loader(true);

            filter.onSearch = function (value) {
                Lampa.Activity.replace({
                    search: value,
                    clarification: true
                });
            };

            filter.onBack = this.start.bind(this);

            filter.render().find('.filter--sort').remove();

            filter.render().find('.selector').on('hover:focus', function (e) {
                last_filter = e.target;
            });

            filter.onSelect = function (type, a, b) {
                if (type !== 'filter') return;

                if (a.reset) {
                    if (extended) source.reset();
                    else this.search();
                }
                else source.filter(type, a, b);
            }.bind(this);

            files.append(scroll.render());

            scroll.append(filter.render());

            this.search();

            return this.render();
        };

        this.search = function () {
            var movie = object.movie;
            var ids = {
                kinopoisk_id: parseInt(movie.kinopoisk_id, 10) || 0,
                imdb_id: movie.imdb_id || ''
            };

            this.activity.loader(true);
            this.reset();
            this.extendChoice();

            if (ids.kinopoisk_id || ids.imdb_id) return source.search(object, ids);

            if (!movie.id) return this.emptyForQuery(movie.title || movie.name);

            var path = (movie.name ? 'tv' : 'movie') + '/' + movie.id + '/external_ids?api_key=' + TMDB_API_KEY + '&language=ru';
            var url = typeof Lampa.TMDB !== 'undefined' ? Lampa.TMDB.api(path) : 'https://api.themoviedb.org/3/' + path;

            network.timeout(1000 * 15);
            network.silent(url, function (json) {
                ids.imdb_id = (json && json.imdb_id) || '';

                source.search(object, ids);
            }, function () {
                source.search(object, ids);
            });
        };

        this.extendChoice = function () {
            var data = Lampa.Storage.cache('fligel_online_choice', 500, {});

            extended = true;

            source.extendChoice(data[object.movie.id] || {});
        };

        this.saveChoice = function (choice) {
            var data = Lampa.Storage.cache('fligel_online_choice', 500, {});

            data[object.movie.id] = choice;

            Lampa.Storage.set('fligel_online_choice', data);
        };

        this.similars = function (items) {
            var self = this;

            items.forEach(function (elem) {
                var item = Lampa.Template.get('fligel_online_folder', {
                    title: elem.name || elem.origin_name,
                    time: elem.year || '',
                    info: elem.origin_name || ''
                });

                item.on('hover:enter', function () {
                    self.activity.loader(true);

                    source.selectCatalog(elem);
                });

                self.append(item);
            });

            this.start(true);
        };

        this.reset = function () {
            last = false;

            scroll.render().find('.empty').remove();

            filter.render().detach();

            scroll.clear();

            scroll.append(filter.render());
        };

        this.loading = function (status) {
            if (status) this.activity.loader(true);
            else {
                this.activity.loader(false);

                this.activity.toggle();
            }
        };

        this.filter = function (items, choice) {
            filter_items = items;
            filter_choice = choice;

            var select = [{
                title: Lampa.Lang.translate('torrent_parser_reset'),
                reset: true
            }];

            var add = function (type, title) {
                if (!items[type] || items[type].length < 2) return;

                select.push({
                    title: title,
                    subtitle: items[type][choice[type]],
                    stype: type,
                    items: items[type].map(function (name, index) {
                        return {
                            title: name,
                            selected: choice[type] === index,
                            index: index
                        };
                    })
                });
            };

            add('voice', Lampa.Lang.translate('torrent_parser_voice'));
            add('season', Lampa.Lang.translate('torrent_serial_season'));

            filter.set('filter', select);

            this.selected();
        };

        this.selected = function () {
            var chosen = [];

            var add = function (type, title) {
                if (!filter_items[type] || filter_items[type].length < 2) return;

                chosen.push(title + ': ' + filter_items[type][filter_choice[type]]);
            };

            add('voice', Lampa.Lang.translate('torrent_parser_voice'));
            add('season', Lampa.Lang.translate('torrent_serial_season'));

            filter.chosen('filter', chosen);
        };

        this.append = function (item) {
            item.on('hover:focus', function (e) {
                last = e.target;

                scroll.update($(e.target), true);
            });

            scroll.append(item);
        };

        this.contextmenu = function (params) {
            params.item.on('hover:long', function () {
                params.file(function (extra) {
                    var enabled = Lampa.Controller.enabled().name;
                    var menu = [{
                        title: Lampa.Lang.translate('torrent_parser_label_title'),
                        mark: true
                    }, {
                        title: Lampa.Lang.translate('torrent_parser_label_cancel_title'),
                        clearmark: true
                    }, {
                        title: Lampa.Lang.translate('time_reset'),
                        timeclear: true
                    }];

                    if (Lampa.Platform.is('webos')) menu.push({ title: Lampa.Lang.translate('player_lauch') + ' - Webos', player: 'webos' });
                    if (Lampa.Platform.is('android')) menu.push({ title: Lampa.Lang.translate('player_lauch') + ' - Android', player: 'android' });

                    menu.push({ title: Lampa.Lang.translate('player_lauch') + ' - Lampa', player: 'lampa' });

                    if (extra && extra.file) menu.push({ title: Lampa.Lang.translate('copy_link'), copylink: true });

                    Lampa.Select.show({
                        title: Lampa.Lang.translate('title_action'),
                        items: menu,
                        onBack: function () {
                            Lampa.Controller.toggle(enabled);
                        },
                        onSelect: function (a) {
                            if (a.clearmark) {
                                Lampa.Arrays.remove(params.viewed, params.hash_file);

                                Lampa.Storage.set('fligel_online_view', params.viewed);

                                params.unmark();
                            }

                            if (a.mark && params.viewed.indexOf(params.hash_file) === -1) {
                                params.viewed.push(params.hash_file);

                                params.mark();

                                Lampa.Storage.set('fligel_online_view', params.viewed);
                            }

                            if (a.timeclear) {
                                params.view.percent = 0;
                                params.view.time = 0;
                                params.view.duration = 0;

                                Lampa.Timeline.update(params.view);
                            }

                            Lampa.Controller.toggle(enabled);

                            if (a.player) {
                                Lampa.Player.runas(a.player);

                                params.item.trigger('hover:enter');
                            }

                            if (a.copylink) {
                                Lampa.Utils.copyTextToClipboard(extra.file, function () {
                                    Lampa.Noty.show(Lampa.Lang.translate('copy_secuses'));
                                }, function () {
                                    Lampa.Noty.show(Lampa.Lang.translate('copy_error'));
                                });
                            }
                        }
                    });
                });
            }).on('hover:focus', function () {
                if (Lampa.Helper) Lampa.Helper.show('online_file', Lampa.Lang.translate('helper_online_file'), params.item);
            });
        };

        this.empty = function (msg) {
            var empty = Lampa.Template.get('list_empty');

            if (msg) empty.find('.empty__descr').text(msg);

            scroll.append(empty);

            this.loading(false);
        };

        this.emptyForQuery = function (query) {
            this.empty(Lampa.Lang.translate('online_query_start') + ' (' + query + ') ' + Lampa.Lang.translate('online_query_end'));
        };

        this.start = function (first_select) {
            if (Lampa.Activity.active().activity !== this.activity) return;

            if (first_select) last = lines().eq(0)[0];

            Lampa.Background.immediately(Lampa.Utils.cardImgBackground(object.movie));

            Lampa.Controller.add('content', {
                toggle: function () {
                    Lampa.Controller.collectionSet(scroll.render(), files.render());
                    Lampa.Controller.collectionFocus(last || false, scroll.render());
                },
                up: function () {
                    if (!Navigator.canmove('up')) return Lampa.Controller.toggle('head');

                    if (last_filter && lines().index(last) === 0) Lampa.Controller.collectionFocus(last_filter, scroll.render());
                    else Navigator.move('up');
                },
                down: function () {
                    Navigator.move('down');
                },
                right: function () {
                    if (Navigator.canmove('right')) Navigator.move('right');
                    else filter.show(Lampa.Lang.translate('title_filter'), 'filter');
                },
                left: function () {
                    if (Navigator.canmove('left')) Navigator.move('left');
                    else Lampa.Controller.toggle('menu');
                },
                back: this.back
            });

            Lampa.Controller.toggle('content');
        };

        this.render = function () {
            return files.render();
        };

        this.back = function () {
            Lampa.Activity.backward();
        };

        this.pause = function () {};

        this.stop = function () {};

        this.destroy = function () {
            network.clear();

            source.destroy();

            files.destroy();
            scroll.destroy();

            network = null;

            window.removeEventListener('resize', minus);
        };
    }

    function addTemplates() {
        Lampa.Template.add('fligel_online_full', '<div class="online-prestige online-prestige--full selector">' +
            '<div class="online-prestige__img">' +
                '<img alt="">' +
                '<div class="online-prestige__loader"></div>' +
            '</div>' +
            '<div class="online-prestige__body">' +
                '<div class="online-prestige__head">' +
                    '<div class="online-prestige__title">{title}</div>' +
                    '<div class="online-prestige__time">{time}</div>' +
                '</div>' +
                '<div class="online-prestige__timeline"></div>' +
                '<div class="online-prestige__footer">' +
                    '<div class="online-prestige__info">{info}</div>' +
                    '<div class="online-prestige__quality">{quality}</div>' +
                '</div>' +
            '</div>' +
        '</div>');

        Lampa.Template.add('fligel_online_folder', '<div class="online-prestige online-prestige--folder selector">' +
            '<div class="online-prestige__folder">' +
                '<svg viewBox="0 0 128 112" fill="none" xmlns="http://www.w3.org/2000/svg">' +
                    '<rect y="20" width="128" height="92" rx="13" fill="white"></rect>' +
                    '<path d="M29.9963 8H98.0037C96.0446 3.3021 91.4079 0 86 0H42C36.5921 0 31.9555 3.3021 29.9963 8Z" fill="white" fill-opacity="0.23"></path>' +
                    '<rect x="11" y="8" width="106" height="76" rx="13" fill="white" fill-opacity="0.51"></rect>' +
                '</svg>' +
            '</div>' +
            '<div class="online-prestige__body">' +
                '<div class="online-prestige__head">' +
                    '<div class="online-prestige__title">{title}</div>' +
                    '<div class="online-prestige__time">{time}</div>' +
                '</div>' +
                '<div class="online-prestige__footer">' +
                    '<div class="online-prestige__info">{info}</div>' +
                '</div>' +
            '</div>' +
        '</div>');

        Lampa.Template.add('fligel_online_rate', '<div class="online-prestige-rate">' +
            '<svg width="17" height="16" viewBox="0 0 17 16" fill="none" xmlns="http://www.w3.org/2000/svg">' +
                '<path d="M8.39409 0.192139L10.99 5.30994L16.7882 6.20387L12.5475 10.4277L13.5819 15.9311L8.39409 13.2425L3.20626 15.9311L4.24065 10.4277L0 6.20387L5.79819 5.30994L8.39409 0.192139Z" fill="#fff"></path>' +
            '</svg>' +
            '<span>{rate}</span>' +
        '</div>');
    }

    function addStyle() {
        if ($('#fligel_online_style').length) return;

        $('body').append("<style id=\"fligel_online_style\">.online-prestige{position:relative;-webkit-border-radius:.3em;-moz-border-radius:.3em;border-radius:.3em;background-color:rgba(0,0,0,0.3);display:-webkit-box;display:-webkit-flex;display:-moz-box;display:-ms-flexbox;display:flex;will-change:transform}.online-prestige__body{padding:1.2em;line-height:1.3;-webkit-box-flex:1;-webkit-flex-grow:1;-moz-box-flex:1;-ms-flex-positive:1;flex-grow:1;position:relative}@media screen and (max-width:480px){.online-prestige__body{padding:.8em 1.2em}}.online-prestige__img{position:relative;width:13em;-webkit-flex-shrink:0;-ms-flex-negative:0;flex-shrink:0;min-height:8.2em}.online-prestige__img>img{position:absolute;top:0;left:0;width:100%;height:100%;-o-object-fit:cover;object-fit:cover;-webkit-border-radius:.3em;-moz-border-radius:.3em;border-radius:.3em;opacity:0;-webkit-transition:opacity .3s;-o-transition:opacity .3s;-moz-transition:opacity .3s;transition:opacity .3s}.online-prestige__img--loaded>img{opacity:1}@media screen and (max-width:480px){.online-prestige__img{width:7em;min-height:6em}}.online-prestige__folder{padding:1em;-webkit-flex-shrink:0;-ms-flex-negative:0;flex-shrink:0}.online-prestige__folder>svg{width:4.4em !important;height:4.4em !important}.online-prestige__viewed{position:absolute;top:1em;left:1em;background:rgba(0,0,0,0.45);-webkit-border-radius:100%;-moz-border-radius:100%;border-radius:100%;padding:.25em;font-size:.76em}.online-prestige__viewed>svg{width:1.5em !important;height:1.5em !important}.online-prestige__episode-number{position:absolute;top:0;left:0;right:0;bottom:0;display:-webkit-box;display:-webkit-flex;display:-moz-box;display:-ms-flexbox;display:flex;-webkit-box-align:center;-webkit-align-items:center;-moz-box-align:center;-ms-flex-align:center;align-items:center;-webkit-box-pack:center;-webkit-justify-content:center;-moz-box-pack:center;-ms-flex-pack:center;justify-content:center;font-size:2em}.online-prestige__loader{position:absolute;top:50%;left:50%;width:2em;height:2em;margin-left:-1em;margin-top:-1em;background:url(./img/loader.svg) no-repeat center center;-webkit-background-size:contain;-moz-background-size:contain;-o-background-size:contain;background-size:contain}.online-prestige__head,.online-prestige__footer{display:-webkit-box;display:-webkit-flex;display:-moz-box;display:-ms-flexbox;display:flex;-webkit-box-pack:justify;-webkit-justify-content:space-between;-moz-box-pack:justify;-ms-flex-pack:justify;justify-content:space-between;-webkit-box-align:center;-webkit-align-items:center;-moz-box-align:center;-ms-flex-align:center;align-items:center}.online-prestige__timeline{margin:.8em 0}.online-prestige__timeline>.time-line{display:block !important}.online-prestige__title{font-size:1.7em;overflow:hidden;-o-text-overflow:ellipsis;text-overflow:ellipsis;display:-webkit-box;-webkit-line-clamp:1;line-clamp:1;-webkit-box-orient:vertical}@media screen and (max-width:480px){.online-prestige__title{font-size:1.4em}}.online-prestige__time{padding-left:2em}.online-prestige__info{display:-webkit-box;display:-webkit-flex;display:-moz-box;display:-ms-flexbox;display:flex;-webkit-box-align:center;-webkit-align-items:center;-moz-box-align:center;-ms-flex-align:center;align-items:center}.online-prestige__info>*{overflow:hidden;-o-text-overflow:ellipsis;text-overflow:ellipsis;display:-webkit-box;-webkit-line-clamp:1;line-clamp:1;-webkit-box-orient:vertical}.online-prestige__quality{padding-left:1em;white-space:nowrap}.online-prestige__scan-file{position:absolute;bottom:0;left:0;right:0}.online-prestige__scan-file .broadcast__scan{margin:0}.online-prestige .online-prestige-split{font-size:.8em;margin:0 1em;-webkit-flex-shrink:0;-ms-flex-negative:0;flex-shrink:0}.online-prestige.focus::after{content:'';position:absolute;top:-0.6em;left:-0.6em;right:-0.6em;bottom:-0.6em;-webkit-border-radius:.7em;-moz-border-radius:.7em;border-radius:.7em;border:solid .3em #fff;z-index:-1;pointer-events:none}.online-prestige+.online-prestige{margin-top:1.5em}.online-prestige--folder .online-prestige__footer{margin-top:.8em}.online-prestige-watched{padding:1em}.online-prestige-watched__icon>svg{width:1.5em;height:1.5em}.online-prestige-watched__body{padding-left:1em;padding-top:.1em;display:-webkit-box;display:-webkit-flex;display:-moz-box;display:-ms-flexbox;display:flex;-webkit-flex-wrap:wrap;-ms-flex-wrap:wrap;flex-wrap:wrap}.online-prestige-watched__body>span+span::before{content:' ● ';vertical-align:top;display:inline-block;margin:0 .5em}.online-prestige-rate{display:-webkit-inline-box;display:-webkit-inline-flex;display:-moz-inline-box;display:-ms-inline-flexbox;display:inline-flex;-webkit-box-align:center;-webkit-align-items:center;-moz-box-align:center;-ms-flex-align:center;align-items:center}.online-prestige-rate>svg{width:1.3em !important;height:1.3em !important}.online-prestige-rate>span{font-weight:600;font-size:1.1em;padding-left:.7em}.online-empty{line-height:1.4}.online-empty__title{font-size:1.8em;margin-bottom:.3em}.online-empty__time{font-size:1.2em;font-weight:300;margin-bottom:1.6em}.online-empty__buttons{display:-webkit-box;display:-webkit-flex;display:-moz-box;display:-ms-flexbox;display:flex}.online-empty__buttons>*+*{margin-left:1em}.online-empty__button{background:rgba(0,0,0,0.3);font-size:1.2em;padding:.5em 1.2em;-webkit-border-radius:.2em;-moz-border-radius:.2em;border-radius:.2em;margin-bottom:2.4em}.online-empty__button.focus{background:#fff;color:black}.online-empty__templates .online-empty-template:nth-child(2){opacity:.5}.online-empty__templates .online-empty-template:nth-child(3){opacity:.2}.online-empty-template{background-color:rgba(255,255,255,0.3);padding:1em;display:-webkit-box;display:-webkit-flex;display:-moz-box;display:-ms-flexbox;display:flex;-webkit-box-align:center;-webkit-align-items:center;-moz-box-align:center;-ms-flex-align:center;align-items:center;-webkit-border-radius:.3em;-moz-border-radius:.3em;border-radius:.3em}.online-empty-template>*{background:rgba(0,0,0,0.3);-webkit-border-radius:.3em;-moz-border-radius:.3em;border-radius:.3em}.online-empty-template__ico{width:4em;height:4em;margin-right:2.4em}.online-empty-template__body{height:1.7em;width:70%}.online-empty-template+.online-empty-template{margin-top:1em}</style>");
    }

    function addLang() {
        Lampa.Lang.add({
            fligel_online_title: {
                ru: NAME,
                uk: NAME,
                en: NAME
            },
            online_nolink: {
                ru: 'Не удалось извлечь ссылку',
                uk: 'Не вдалося отримати посилання',
                en: 'Failed to fetch link'
            },
            online_query_start: {
                ru: 'По запросу',
                uk: 'На запит',
                en: 'On request'
            },
            online_query_end: {
                ru: 'нет результатов',
                uk: 'немає результатів',
                en: 'no results'
            },
            helper_online_file: {
                ru: 'Удерживайте клавишу "ОК" для вызова контекстного меню',
                uk: 'Утримуйте клавішу "ОК" для виклику контекстного меню',
                en: 'Hold the "OK" key to bring up the context menu'
            }
        });
    }

    function addButton() {
        var button = '<div class="full-start__button selector view--online view--fligel-online" data-subtitle="Версія v' + VERSION + '">' +
            '<svg viewBox="0 0 128 128" fill="none" xmlns="http://www.w3.org/2000/svg" height="26">' +
                '<circle cx="64" cy="64" r="56" stroke="currentColor" stroke-width="12"/>' +
                '<path d="M90.5 64.3827L50 87.7654L50 41L90.5 64.3827Z" fill="currentColor"/>' +
            '</svg>' +
            '<span>' + TITLE + '</span>' +
        '</div>';

        Lampa.Listener.follow('full', function (e) {
            if (e.type !== 'complite') return;

            var render = e.object.activity.render();

            if (!render || render.find('.view--fligel-online').length) return;

            var btn = $(Lampa.Lang.translate(button));

            btn.on('hover:enter', function () {
                addTemplates();
                addStyle();

                Lampa.Component.add(COMPONENT, Component);

                Lampa.Activity.push({
                    url: '',
                    title: Lampa.Lang.translate('fligel_online_title'),
                    component: COMPONENT,
                    search: e.data.movie.title,
                    search_one: e.data.movie.title,
                    search_two: e.data.movie.original_title,
                    movie: e.data.movie,
                    page: 1
                });
            });

            var torrent = render.find('.view--torrent');

            if (torrent.length) torrent.after(btn);
            else render.find('.full-start__buttons, .full-start-new__buttons').eq(0).append(btn);
        });
    }

    function startPlugin() {
        window.fligel_online = {
            version: VERSION,
            parse: parseEmbed,
            status: function () {
                return {
                    lampa: appDigital(),
                    mms_shim: mms_shim,
                    hls_version: (window.Hls && Hls.version) || '',
                    hls_program: hlsProgram(),
                    managed_only: managedOnly(),
                    webkit: webkitOnly(),
                    dash: dashPlayable()
                };
            }
        };

        addLang();
        addTemplates();
        addStyle();
        shimMediaSource();
        keepPlayable();
        keepLevelNames();
        keepSubtitles();

        Lampa.Component.add(COMPONENT, Component);

        Lampa.Manifest.plugins = {
            type: 'video',
            version: VERSION,
            name: NAME,
            description: 'Online watch',
            component: COMPONENT,
            onContextMenu: function () {
                return {
                    name: Lampa.Lang.translate('fligel_online_title'),
                    description: ''
                };
            },
            onContextLauch: function (movie) {
                addTemplates();
                addStyle();

                Lampa.Component.add(COMPONENT, Component);

                Lampa.Activity.push({
                    url: '',
                    title: Lampa.Lang.translate('fligel_online_title'),
                    component: COMPONENT,
                    search: movie.title,
                    search_one: movie.title,
                    search_two: movie.original_title,
                    movie: movie,
                    page: 1
                });
            }
        };

        addButton();
    }

    if (window.appready) startPlugin();
    else Lampa.Listener.follow('app', function (e) {
        if (e.type === 'ready') startPlugin();
    });
})();