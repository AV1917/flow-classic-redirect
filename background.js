function computeRedirectUrl(rawUrl) {
  try {
    const url = new URL(rawUrl);
    // target only edit / run history urls with v3 ne false
    if (url.hostname !== 'make.powerautomate.com' || !url.pathname.includes('/flows/') || /\/details\/?$/.test(url.pathname) || url.searchParams.get('v3') === 'false') return null;
    url.searchParams.set("v3", "false");
    return url.toString();
  } catch(e) {
    return null;
  }
}

chrome.tabs.onUpdated.addListener((tabId, changeInfo) => {
  // only run on new page nav
  if (changeInfo.status !== 'loading' || !changeInfo.url) return;
  if (!changeInfo.url.includes('://make.powerautomate.com/')) return;
  const redirectUrl = computeRedirectUrl(changeInfo.url);
  if (redirectUrl) {
    chrome.tabs.update(tabId, { url: redirectUrl });
  }
});