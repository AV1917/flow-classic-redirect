const GLOBAL_KEY = 'redirectEnabled';
const WHITELIST_KEY = 'whitelistedFlows';

document.addEventListener('DOMContentLoaded', async () => {
  // elements
  const mainPage = document.getElementById('mainPage');
  const wlPage = document.getElementById('wlPage');
  const showWhitelist = document.getElementById('showWhitelist');
  const backMain = document.getElementById('backMain');
  const btnOn = document.getElementById('btnOn');
  const btnOff = document.getElementById('btnOff');
  const wlButton = document.getElementById('wlButton');
  const clearAll = document.getElementById('clearAll');
  const wlList = document.getElementById('whitelistList');
  const noFlowsMsg = document.getElementById('noFlowsMsg');
  const manualInput = document.getElementById('manualFlowInput');
  const manualAddBtn = document.getElementById('manualAddBtn');

  showWhitelist.title = 'Click to open whitelist manager';

  // get current flow id
  let tabUrl = '';
  try {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    tabUrl = tab.url || '';
  } catch {}
  const isHost = tabUrl.startsWith('https://make.powerautomate.com/');
  let flowId = null;
  if (isHost) {
    try {
      const u = new URL(tabUrl);
      flowId = (u.pathname.match(/\/flows\/([0-9a-fA-F-]+)/) || [])[1] || null;
    } catch {}
  }

  // load prefs
  const { 
    [GLOBAL_KEY]: enabled = true, 
    [WHITELIST_KEY]: whitelist = [] 
  } = await chrome.storage.sync.get({
    [GLOBAL_KEY]: true,
    [WHITELIST_KEY]: []
  });
  let isWhitelisted = !!(flowId && whitelist.includes(flowId));

  // init ui
  updateOnOffButtons();
  updateWlButton();
  renderWhitelist();

  // event listeners
  btnOn.addEventListener('click', () =>
    chrome.runtime.sendMessage({ type: 'set-global', value: true }, () => window.close())
  );

  btnOff.addEventListener('click', () =>
    chrome.runtime.sendMessage({ type: 'set-global', value: false }, () => window.close())
  );

  wlButton.addEventListener('click', () => {
    if (!flowId) return;
    chrome.runtime.sendMessage({ type: 'toggle-whitelist', flowId }, () => {
      isWhitelisted = !isWhitelisted;
      updateWlButton();
      chrome.runtime.sendMessage({ type: 'refresh-icon' });
      window.close();
    });
  });

  showWhitelist.addEventListener('click', () => {
    mainPage.classList.remove('active');
    wlPage.classList.add('active');
    renderWhitelist();
  });

  backMain.addEventListener('click', () => {
    wlPage.classList.remove('active');
    mainPage.classList.add('active');
  });

  clearAll.addEventListener('click', async () => {
    await chrome.storage.sync.set({ [WHITELIST_KEY]: [] });
    isWhitelisted = false;
    updateWlButton();
    renderWhitelist();
    chrome.runtime.sendMessage({ type: 'refresh-icon' });
  });

  // manual whitelist entry
  manualAddBtn.addEventListener('click', async () => {
    const val = manualInput.value.trim();
    const guid = extractFlowId(val);
    if (!guid) {
      setInputError('Invalid flow URL or GUID');
      return;
    }

    const store = await chrome.storage.sync.get(WHITELIST_KEY);
    const list = store[WHITELIST_KEY] || [];
    if (list.includes(guid)) {
      setInputError('Flow is already whitelisted');
      return;
    }

    list.push(guid);
    await chrome.storage.sync.set({ [WHITELIST_KEY]: list });
    if (guid === flowId) {
      isWhitelisted = true;
      updateWlButton();
    }
    chrome.runtime.sendMessage({ type: 'refresh-icon' });
    renderWhitelist();
    manualInput.value = '';
    clearInputError();
  });

  manualInput.addEventListener('keydown', e => {
    if (e.key === 'Enter') {
      e.preventDefault();
      manualAddBtn.click();
    }
  });

  manualInput.addEventListener('input', clearInputError);

  // helper functions
  function updateOnOffButtons() {
    btnOn.classList.toggle('active', enabled);
    btnOff.classList.toggle('active', !enabled);
    btnOn.title = 'Click to enable redirect globally';
    btnOff.title = 'Click to disable redirect globally';
  }

  function updateWlButton() {
    if (!flowId) {
      wlButton.textContent = 'No Flow Detected';
      wlButton.disabled = true;
      wlButton.className = 'wl-button';
      wlButton.removeAttribute('title');
      return;
    }
    wlButton.disabled = false;
    if (isWhitelisted) {
      wlButton.innerHTML = '<span class="remove-icon">✕</span> Remove from whitelist';
      wlButton.className = 'wl-button remove';
      wlButton.title = 'Click to re-enable redirect for the current flow';
    } else {
      wlButton.innerHTML = '<span class="check-icon">✓</span> Add to whitelist';
      wlButton.className = 'wl-button add';
      wlButton.title = 'Click to disable redirect for the current flow only';
    }
  }

  function setInputError(msg) {
    manualInput.classList.add('invalid');
    manualInput.title = msg;
  }

  function clearInputError() {
    manualInput.classList.remove('invalid');
    manualInput.removeAttribute('title');
  }

  function extractFlowId(val) {
    const GUID = '[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}';
    const hostOK = /^(make\.powerautomate\.com|make\.powerapps\.com)$/i;

    try {
      const url = new URL(val);
      if (!hostOK.test(url.hostname)) return null;

      const rx = new RegExp(`/(?:flows|cloudflows)/(${GUID})(?=[/?#]|$)`);
      const m = url.pathname.match(rx);
      return m ? m[1] : null;
    } catch {
      return new RegExp(`^${GUID}$`).test(val) ? val : null;
    }
  }

  async function renderWhitelist() {
    const { [WHITELIST_KEY]: list = [] } = await chrome.storage.sync.get(WHITELIST_KEY);
    wlList.innerHTML = '';
    noFlowsMsg.style.display = list.length === 0 ? 'block' : 'none';
    clearAll.disabled = list.length === 0;
    clearAll.title = list.length ? 'Click to re-enable redirect for all whitelisted flows' : '';

    for (const id of list) {
      const li = document.createElement('li');
      const isCurrent = id === flowId;
      li.innerHTML = `<span>${id}${isCurrent ? ' (current)' : ''}</span><span class="remove-icon">\u2716</span>`;
      const rm = li.querySelector('.remove-icon');
      rm.title = 'Click to re-enable redirect for the selected flow';
      rm.onclick = async () => {
        const { [WHITELIST_KEY]: curr = [] } = await chrome.storage.sync.get(WHITELIST_KEY);
        const updated = curr.filter(x => x !== id);
        await chrome.storage.sync.set({ [WHITELIST_KEY]: updated });
        if (id === flowId) {
          isWhitelisted = false;
          updateWlButton();
          chrome.runtime.sendMessage({ type: 'refresh-icon' });
        }
        renderWhitelist();
      };
      wlList.appendChild(li);
    }
  }
});