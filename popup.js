const toggle = document.getElementById("toggle");
const statusText = document.getElementById("status");
const clearBtn = document.getElementById("clearBtn");

function getCurrentTab(callback) {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
        callback(tabs[0]);
    });
}

function getPageKey(url) {
    let u = new URL(url);
    return u.origin + u.pathname;
}

// Load status
getCurrentTab((tab) => {
    let pageKey = getPageKey(tab.url);

    chrome.storage.local.get(["smartFormEnabled"], (res) => {
        let status = res.smartFormEnabled || {};
        let enabled = status[pageKey] !== false;

        toggle.checked = enabled;
        statusText.innerText = enabled ? "Disable For This Page" : "Enable For This Page";
    });
});

// Toggle enable/disable
toggle.addEventListener("change", () => {
    getCurrentTab((tab) => {
        let pageKey = getPageKey(tab.url);

        chrome.storage.local.get(["smartFormEnabled"], (res) => {
            let status = res.smartFormEnabled || {};
            status[pageKey] = toggle.checked;

            chrome.storage.local.set({ smartFormEnabled: status });
            statusText.innerText = toggle.checked ? "Disable For This Page" : "Enable For This Page";
        });
    });
});

// Clear data
clearBtn.addEventListener("click", () => {
    getCurrentTab((tab) => {
        let pageKey = getPageKey(tab.url);

        chrome.storage.local.get(["smartFormData"], (res) => {
            let data = res.smartFormData || {};
            delete data[pageKey];

            chrome.storage.local.set({ smartFormData: data }, () => {

                chrome.tabs.sendMessage(tab.id, { action: "CLEAR_FIELDS" }, () => {
                    if (chrome.runtime.lastError) {
                        console.log("No content script on this page.");
                    }
                });

                alert("Data cleared!");
            });
        });
    });
});