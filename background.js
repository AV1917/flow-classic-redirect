const GLOBAL_KEY = 'redirectEnabled';
const WHITELIST_KEY = 'whitelistedFlows';

// init storage defaults
chrome.runtime.onInstalled.addListener(() => {
  chrome.storage.sync.get([GLOBAL_KEY, WHITELIST_KEY], prefs => {
    if (prefs[GLOBAL_KEY] === undefined) {
      chrome.storage.sync.set({ [GLOBAL_KEY]: true });
    }
    if (!Array.isArray(prefs[WHITELIST_KEY])) {
      chrome.storage.sync.set({ [WHITELIST_KEY]: [] });
    }
  });
});

// pop-up msg handler
chrome.runtime.onMessage.addListener((msg, _, respond) => {
  switch(msg.type) {
    // refresh current tab's icon
    case 'refresh-icon':
      chrome.tabs.query({ active: true, currentWindow: true }, tabs => {
        const t = tabs[0];
        if (t?.id) updateState(t.id, t.url, { redirect: false });
      });
      break;
    // toggle global on/off & refresh all tab icons
    case 'set-global':
      chrome.storage.sync.set({ [GLOBAL_KEY]: msg.value }, () => {
        chrome.tabs.query({}, tabs => {
          for (const t of tabs) {
            if (t.id) updateState(t.id, t.url, { redirect: false });
          }
        });
        respond();
      });
      return true;
    // add/remove flow from watchlist & refresh all tab icons
    case 'toggle-whitelist':
      if (!msg.flowId) return;
      chrome.storage.sync.get(WHITELIST_KEY, prefs => {
        const list = prefs[WHITELIST_KEY] || [];
        const idx = list.indexOf(msg.flowId);
        if (idx === -1) list.push(msg.flowId);
        else list.splice(idx, 1);
        chrome.storage.sync.set({ [WHITELIST_KEY]: list }, () => {
          chrome.tabs.query({}, tabs => {
            for (const t of tabs) {
              if (t.id) updateState(t.id, t.url, { redirect: false });
            }
          });
          respond();
        });
      });
      return true;
  }
});

// tab nav / reload listener - only case where redirect should occur
chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  if (changeInfo.status === 'loading') return;
  const url = changeInfo.url || tab.url;
  if (!url) return;
  updateState(tabId, url, { redirect: true });
});

// tab switch listener
chrome.tabs.onActivated.addListener(async ({ tabId }) => {
  const tab = await chrome.tabs.get(tabId);
  if (tab.url) updateState(tabId, tab.url, { redirect: false });
});

// applies computeState
async function updateState(tabId, rawUrl, { redirect }) {
  // disable if invalid url e.g. chrome://
  if (typeof rawUrl !== 'string') {
    chrome.action.disable(tabId);
    chrome.action.setIcon({ tabId, path: 'icons/icon16_disabled.png' });
    chrome.action.setPopup({ tabId, popup: '' });
    return;
  }

  const { iconPath, shouldRedirect, redirectUrl } = await computeState(rawUrl);
  // enable/disable and disable popup if host ne power automate
  const isHost = rawUrl.startsWith('https://make.powerautomate.com/');
  if (isHost) {
    chrome.action.enable(tabId);
    chrome.action.setPopup({ tabId, popup: 'popup.html' });
  } else {
    chrome.action.disable(tabId);
    chrome.action.setPopup({ tabId, popup: '' });
  }
  // update icon
  chrome.action.setIcon({ tabId, path: iconPath });
  // redirect if applicable
  if (redirect && shouldRedirect && redirectUrl) {
    chrome.tabs.update(tabId, { url: redirectUrl });
  }
}

// helper function - computes icon & if redirect
async function computeState(rawUrl) {
  let iconPath = 'icons/icon16_disabled.png';
  let redirectUrl = null;
  let shouldRedirect = false;

  let url;
  try {
    url = new URL(rawUrl);
  } catch {
    return { iconPath, shouldRedirect, redirectUrl };
  }

  const isHost = url.hostname === 'make.powerautomate.com';
  // get stored prefs
  const {
    [GLOBAL_KEY]: enabled = true,
    [WHITELIST_KEY]: whitelist = []
  } = await chrome.storage.sync.get({
    [GLOBAL_KEY]: true,
    [WHITELIST_KEY]: []
  });

  const flowMatch = url.pathname.match(/\/flows\/([0-9a-fA-F-]+)/);
  const flowId = flowMatch?.[1] || null;
  const isFlow = isHost && flowId && !/\/details\/?$/.test(url.pathname);

  if (!isHost) {
    iconPath = 'icons/icon16_disabled.png';
  } else if (!enabled) {
    iconPath = 'icons/icon16_off.png';
  } else if (isFlow && whitelist.includes(flowId)) {
    iconPath = 'icons/icon16_wl.png';
  } else {
    iconPath = 'icons/icon16_on.png';
    if (isFlow) {
      const dest = computeRedirectUrl(rawUrl);
      if (dest) {
        shouldRedirect = true;
        redirectUrl = dest;
      }
    }
  }

  return { iconPath, shouldRedirect, redirectUrl };
}

// compute redirect url
function computeRedirectUrl(rawUrl) {
  try {
    const url = new URL(rawUrl);
    if (
      url.hostname !== 'make.powerautomate.com' || !url.pathname.includes('/flows/') || /\/details\/?$/.test(url.pathname) || url.searchParams.get('v3') === 'false'
    ) return null;
    url.searchParams.set('v3', 'false');
    return url.toString();
  } catch {
    return null;
  }
}