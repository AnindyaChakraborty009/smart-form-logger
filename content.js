const STORAGE_KEY = "smartFormData";
const PAGE_STATUS_KEY = "smartFormEnabled";

// Get unique page key
function getPageKey() {
    return window.location.origin + window.location.pathname;
}

// Save all inputs
function saveFormData() {
    chrome.storage.local.get([STORAGE_KEY], (result) => {
        let data = result[STORAGE_KEY] || {};
        let pageKey = getPageKey();

        data[pageKey] = {};

        document.querySelectorAll("input, textarea, select").forEach((el) => {
            let key = el.name || el.id;
            if (!key) return;

            if (el.type === "checkbox" || el.type === "radio") {
                data[pageKey][key] = el.checked;
            } else {
                data[pageKey][key] = el.value;
            }
        });

        chrome.storage.local.set({ [STORAGE_KEY]: data });
    });
}

// Restore inputs
function restoreFormData() {
    chrome.storage.local.get([STORAGE_KEY], (result) => {
        let data = result[STORAGE_KEY] || {};
        let pageKey = getPageKey();

        if (!data[pageKey]) return;

        document.querySelectorAll("input, textarea, select").forEach((el) => {
            let key = el.name || el.id;
            if (!key || !(key in data[pageKey])) return;

            if (el.type === "checkbox" || el.type === "radio") {
                el.checked = data[pageKey][key];
            } else {
                el.value = data[pageKey][key];
            }
        });
    });
}

// Check if enabled
function isEnabled(callback) {
    chrome.storage.local.get([PAGE_STATUS_KEY], (res) => {
        let status = res[PAGE_STATUS_KEY] || {};
        let pageKey = getPageKey();
        callback(status[pageKey] !== false); // default true
    });
}

// Init
isEnabled((enabled) => {
    if (!enabled) return;

    restoreFormData();

    document.addEventListener("input", saveFormData);
    document.addEventListener("change", saveFormData);
});


chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === "CLEAR_FIELDS") {
        clearAllFields();
    }
});

// Clear all form fields from UI
function clearAllFields() {
    document.querySelectorAll("input, textarea, select").forEach((el) => {
        if (el.type === "checkbox" || el.type === "radio") {
            el.checked = false;
        } else {
            el.value = "";
        }
    });
}