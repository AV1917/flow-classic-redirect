# flow-classic-redirect

![sample.png](./sample.png)

A lightweight browser extension that forces Microsoft Power Automate flows to open in the Classic Designer.

Includes whitelist capability – disable automatic redirect for individual flows, allowing you to choose which Designer experience you use.

## Installation (Recommended)

### [Install from Chrome Web Store](https://chromewebstore.google.com/detail/flow-classic-redirect/hckjhekebdlnipgejjbbkbdggfmkjjag)

## Features

- **Classic Designer by Default**: Automatically reloads any flow URL in Classic mode, so you never get dropped into the New Designer.
- **Global On/Off**: Enable or disable automatic redirection across all flows with one click.
- **Per-Flow Whitelist**: Opt individual flows out of Classic redirects, so they stay in New Designer mode when you need them.
- **Whitelist Manager**: View, remove, or clear all whitelisted flows from a single page.
- **No More Copilot**: Fully suppresses Copilot icon and pop-ups.
- **Fewer Interruptions**: Skips 'Save before switching' prompts, avoids intrusive survey pop-ups, and bypasses the unreliable switcher toggle between Classic and New Designer.
- **Smoother Multi-tab Workflow**: No need to manually toggle Classic Mode on every tab – just open your flows and get to work.

## Permissions

- **Host permission**: `https://make.powerautomate.com/*`
- **Storage**: To persist global settings and whitelisted flow IDs across sessions.

## Installation (Manual)

1. Clone or download this repository; unzip.
2. Open `chrome://extensions` (Chrome) or `edge://extensions` (Edge).
3. Enable **Developer mode**, click **Load unpacked**, and select this folder.