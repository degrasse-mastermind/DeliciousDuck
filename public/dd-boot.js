(function () {
try {
var KEY = "dd_analytics_optout";
var PARAM = "dd_qa";
var value = new URLSearchParams(location.search || '').get(PARAM);
if (value === '1' || value === 'true' || value === 'on') localStorage.setItem(KEY, '1');
if (value === '0' || value === 'false' || value === 'off') localStorage.removeItem(KEY);
} catch (e) {
}
})();
(function () {
try {
var hosts = ["deliciousduck.com","www.deliciousduck.com"];
var blocked = ["/internal","/api"];
var disableKey = "ga-disable-G-E15CFY209D";
var host = (location.hostname || '').toLowerCase().replace(/\.$/, '');
var qaExcluded = false;
try {
qaExcluded = localStorage.getItem("dd_analytics_optout") === "1";
} catch (e) {  }
var hostOk = hosts.indexOf(host) !== -1 && !qaExcluded;
function pathAllowedFor(path) {
path = path || '/';
var bare = path.split('#')[0].split('?')[0] || '/';
for (var i = 0; i < blocked.length; i++) {
if (bare === blocked[i] || bare.indexOf(blocked[i] + '/') === 0) return false;
}
return true;
}
function pathAllowed() {
return pathAllowedFor(location.pathname || '/');
}
function syncDisableFlag() {
window[disableKey] = !(hostOk && pathAllowed());
return !window[disableKey];
}
syncDisableFlag();
var history = window.history;
['pushState', 'replaceState'].forEach(function (name) {
var original = history[name];
if (typeof original !== 'function') return;
history[name] = function () {
var result = original.apply(this, arguments);
syncDisableFlag();
return result;
};
});
window.addEventListener('popstate', syncDisableFlag, true);
window.addEventListener('hashchange', syncDisableFlag, true);
window.__ddSyncGaDisableFlag = syncDisableFlag;
window.__ddLoadGtag = function (forcePath) {
if (window.__ddGtagLoaded) return false;
var path = typeof forcePath === 'string' && forcePath
? (forcePath.split('#')[0].split('?')[0] || '/')
: (location.pathname || '/');
if (!hostOk || !pathAllowedFor(path)) return false;
window.__ddGtagLoaded = true;
window[disableKey] = false;
var s = document.createElement('script');
s.async = true;
s.src = 'https://www.googletagmanager.com/gtag/js?id=G-E15CFY209D';
document.head.appendChild(s);
window.dataLayer = window.dataLayer || [];
function gtag(){dataLayer.push(arguments);}
window.gtag = gtag;
gtag('js', new Date());
gtag('config', 'G-E15CFY209D', {
page_location: location.origin + path,
page_path: path
});
return true;
};
if (!hostOk || !pathAllowed()) return;
window.__ddLoadGtag();
} catch (e) {
}
})();
