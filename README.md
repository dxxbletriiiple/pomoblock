# PomoBlock

A Chrome extension that blocks distracting websites during your Pomodoro focus sessions. Sites are automatically unblocked during break phases and re-blocked when the next work session begins.

## Features

- Pomodoro timer with configurable work, short break, and long break durations
- Automatic website blocking during work sessions via Chrome's `declarativeNetRequest` API
- Sites unblock automatically on breaks and re-block when the next session starts
- Persistent timer state — the countdown survives popup close and browser restarts via `chrome.alarms`
- Light / dark theme
- Fully local — no accounts, no network requests, no tracking

## Tech Stack

| Layer | Technology |
|---|---|
| UI | React 18 + TypeScript |
| Bundler | Vite 5 |
| Styling | CSS Modules |
| Extension API | Chrome Manifest V3 |
| State persistence | `chrome.storage.local` |
| Timer | `chrome.alarms` (survives service worker termination) |

## Project Structure

```
pomoblock/
├── public/
│   └── blocked.html         # Page shown when a site is blocked
├── src/
│   ├── app/
│   │   ├── App.tsx          # App wrapper (renders popup page)
│   │   └── index.ts
│   ├── background/
│   │   ├── index.ts         # Service worker — storage + message handler
│   │   ├── timer.ts         # Pomodoro phase logic
│   │   └── blocking.ts      # Site blocking logic
│   ├── content/
│   │   └── blockContent.ts  # Overlay helper (content script placeholder)
│   ├── pages/
│   │   └── popup/
│   │       ├── Popup.tsx    # Popup page component
│   │       ├── index.tsx    # React entry point
│   │       ├── Popup.module.css
│   │       ├── globals.css
│   │       └── components/
│   │           ├── Timer/       # Countdown display + controls
│   │           ├── SiteList/    # Add / remove blocked domains
│   │           ├── SettingsPanel/ # Work time, breaks, cycles, theme
│   │           ├── Tabs/
│   │           └── Icons/
│   ├── shared/
│   │   ├── constants/       # Timer/storage/url constants + defaults
│   │   ├── types/
│   │   │   └── index.ts     # Shared TypeScript types
│   │   └── utils/
│   │       ├── index.ts
│   │       └── time.ts      # Time helpers
│   ├── manifest.json        # Chrome extension manifest (MV3)
│   └── main.ts              # Root exports barrel
├── index.html               # Popup HTML entry point
├── vite.config.ts
├── tsconfig.json
└── package.json
```

## Prerequisites

- **Node.js** 18 or later
- **npm** (bundled with Node.js)
- **Google Chrome** (or any Chromium-based browser that supports MV3)

## Installation & Build

### 1. Clone the repository

```bash
git clone https://github.com/dxxbletriiiple/pomoblock.git
cd pomoblock
```

### 2. Install dependencies

```bash
npm install
```

### 3. Build the extension

```bash
npm run build
```

This compiles the project into the `dist/` directory, which is the complete, loadable extension package.

### Development mode (watch + rebuild on change)

```bash
npm run dev
```

Vite will watch for file changes and rebuild automatically. After each rebuild, reload the extension in Chrome (see step below).

## Loading the Extension in Chrome

1. Open Chrome and navigate to `chrome://extensions`
2. Enable **Developer mode** using the toggle in the top-right corner
3. Click **Load unpacked**
4. Select the `dist/` folder inside the project directory
5. The PomoBlock icon will appear in your Chrome toolbar

> After a `npm run build` or a watch-mode rebuild, click the **refresh icon** on the extension card at `chrome://extensions` to reload the latest build.

## Usage

1. Click the PomoBlock icon in the toolbar to open the popup
2. Add domains to block in the **Sites** tab (e.g. `reddit.com`, `twitter.com`)
3. Adjust timer durations and cycle count in **Settings** if needed
4. Press **Start** — the timer runs and all listed sites are blocked
5. Sites unblock automatically when a break begins
6. Sites re-block when the next work session starts

## Permissions

| Permission | Reason |
|---|---|
| `storage` | Persist timer state and settings across sessions |
| `alarms` | Keep the countdown running when the popup is closed |
| `declarativeNetRequest` + `declarativeNetRequestWithHostAccess` | Block / unblock sites using declarative rules |
| `host_permissions: <all_urls>` | Required to create dynamic blocking rules for arbitrary domains |

## Configuration Defaults

| Setting | Default | Options |
|---|---|---|
| Work time | 25 min | 15, 20, 25, 30, 45, 60, 90 |
| Short break | 5 min | 5, 10 |
| Long break | 15 min | 15, 20, 30 |
| Cycles before long break | 4 | 2 – 6 |
| Theme | Light | Light, Dark |

## Scripts

| Command | Description |
|---|---|
| `npm run build` | Production build → `dist/` |
| `npm run dev` | Watch mode — rebuilds on every file change |
| `npm run preview` | Preview the built popup in a browser tab (UI only, no extension APIs) |
