## flow-classic-redirect

A simple, lightweight browser extension that automatically redirects Power Automate flow URLs from the New Designer to the Classic Designer by appending `?v3=false`.

---

### Features

* Automatically redirects any Power Automate URL to the Classic Designer
* Only host permission required

### Installation

1. Clone or download this repo
2. Navigate to `chrome://extensions` (Chrome) or `edge://extensions` (Edge)
3. Enable Developer mode, click **Load unpacked**, and select the project folder

### Usage

Navigate to any Power Automate URL that opens the Flow Designer. The extension automatically appends `?v3=false` and reloads the page in Classic Designer mode.

No redirect occurs on `/details` pages or if `v3=false` is already set.