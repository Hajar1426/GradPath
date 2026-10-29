const PREFIX = 'gradpath:';

export function loadJSON(key, fallback) {
    try {
        const raw = localStorage.getItem(PREFIX + key);
        return raw === null ? fallback : JSON.parse(raw);
    } catch {
        return fallback;
    }
}

export function saveJSON(key, value) {
    try {
        localStorage.setItem(PREFIX + key, JSON.stringify(value));
    } catch {
        // storage may be unavailable; the app still works without it
    }
}

export function removeKey(key) {
    try {
        localStorage.removeItem(PREFIX + key);
    } catch {
        // ignore
    }
}