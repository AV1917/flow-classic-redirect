# flow-classic-redirect

![sample.png](./sample.png)

A lightweight browser extension that forces Microsoft Power Automate flows to open in the Classic Designer.

When enabled, visiting any flow URL will automatically reload the page in Classic Designer mode. If a flow has been whitelisted, it will remain in New Designer mode.

## Installation (Recommended)

- **Chrome:** https://chromewebstore.google.com/detail/flow-classic-redirect/hckjhekebdlnipgejjbbkbdggfmkjjag
- **Edge:** *Pending store review - in the interim, download from Chrome Web Store*
- **Firefox:** *Pending store review - coming soon!*

## Features

- **Classic Designer by Default**: Automatically reloads any flow URL in Classic mode, so you never get dropped into the New Designer.
- **Global On/Off**: Enable or disable automatic redirection across all flows with one click.
- **Per-Flow Whitelist**: Opt individual flows out of Classic redirects, so they stay in New Designer mode when you need them.
- **Whitelist Manager**: View, add, remove, or clear all whitelisted flows from a single page.
- **No More Copilot**: Fully suppresses Copilot icon and pop-ups.
- **Fewer Interruptions**: Skips 'Save before switching' prompts, avoids intrusive survey pop-ups, and bypasses the unreliable switcher toggle between Classic and New Designer.
- **Smoother Multi-tab Workflow**: No need to manually toggle Classic Mode on every tab – just open your flows and get to work.
- **Robust URL Handling**: Catches all flow URLs reliably – including from solutions, Power Apps, manual entries, refreshes, or new tabs.
- **No Unexpected Redirects**: To prevent data loss, redirection will only occur on the first load of a new page – already loaded pages will not be impacted by changes to the global on/off option or whitelist.

## User Experience

- On non-Power Automate websites, the extension is disabled and greyed out.
- On general Power Automate pages (like the homepage or flow list), the extension is active – so you can toggle global redirection or manage your whitelist before opening any flows.
- On a flow's Details or Editor page, you get all the same controls, plus a one-click option to add or remove the current flow from the whitelist.

## Statuses

#### Active

- ![Active](icons/icon16_on.png) **Active** – Extension is turned on and will redirect.
- ![Inactive](icons/icon16_off.png) **Inactive** – Extension is turned off and will not redirect.
- ![Whitelisted](icons/icon16_wl.png) **Whitelisted** – The current flow will *not* be redirected.

#### Inactive

- ![Disabled](icons/icon16_disabled.png) **Disabled** – Extension is inactive on the current site.


## Permissions

- **Host permission**: `https://make.powerautomate.com/*`
- **Storage**: To persist global settings and whitelisted flow IDs across sessions.

## Installation (Manual)

1. Clone or download this repository; unzip.
2. Open `chrome://extensions` (Chrome) or `edge://extensions` (Edge).
3. Enable **Developer mode**, click **Load unpacked**, and select this folder.