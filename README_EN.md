# @dsh-external/ui-message-nav

## Introduction

`ui-message-nav` is a standalone "session message navigation" plugin, extracted and redesigned from the file browser plugin. It focuses on providing user-message navigation for the conversation view. It generates a vertical navigation rail based on the number of user messages in the current session, with click-to-locate, active-message highlighting, hover previews, and automatic loading of older messages.

## Installation

### Method 1: Super Module Injector

```text
dev_build_plugin  {"dir": "C:/Users/<user>/.dsh/plugins/ui-message-nav"}
dev_inject_plugin {"dir": "C:/Users/<user>/.dsh/plugins/ui-message-nav"}
```

Open or refresh DSH Web and open any session to see the message navigation rail.

### Method 2: dsh CLI (Official Project Way)

If you have the `dsh` CLI installed, follow the official project tutorial to install with `dsh plugin`:

```bash
# Install from a local plugin directory
dsh plugin --profile web add C:/Users/<user>/.dsh/plugins/ui-message-nav

# Or install from the GitHub repository
dsh plugin --profile web add github:xiyue718/dsh-ui-message-nav
```

Start after installation:

```bash
dsh --profile web
```

View the composed configuration:

```bash
dsh --profile web --dump-config
```

See the project documentation for details: `docs/user/develop/basic/publish.md`.

Build artifacts: host `lib/index.js`, client `lib/client.js`, package `dsh-external-ui-message-nav-0.1.0.tgz`.

## Usage

1. Open any session.
2. A vertical navigation rail appears on the right side of the conversation view.
3. Each bar corresponds to one user message.
4. The bar for the message currently being viewed is blue and longer.
5. Hover over any bar to preview the message content.
6. Click a bar to scroll the conversation to that message.
7. Scroll to the top of the conversation to automatically load older messages.
8. If you previously used the old message navigation in the file browser plugin, uninstall or update that plugin. This plugin provides the new navigation independently; the old one will not appear again.

## Features

- Shows a vertical message navigation rail on the right (or left) side of the conversation view.
- The number of navigation items equals the number of user messages in the current session.
- Navigation items are ordered from top to bottom by message send order.
- Uses elongated bar icons, without numbers.
- The icon for the message currently being viewed is highlighted in blue; non-active icons are shorter.
- Hovering shows a message content preview using the project's built-in Tooltip style.
- Clicking an icon scrolls the conversation to the corresponding user message.
- Scrolling to the top of the conversation automatically triggers "load older messages".
- This plugin does not depend on any file browser plugin module; it only handles message navigation.

### Configuration

The plugin accepts configuration through `config` when assembled as a profile bundle. Defaults are used when not configured.

| Config | Type | Default | Description |
|---|---|---|---|
| `position` | `'left' \| 'right'` | `right` | Side of the conversation view where the rail is displayed |
| `previewMaxLength` | number | `60` | Maximum characters in the hover preview |
| `autoLoadOlder` | boolean | `true` | Whether scrolling to the top automatically loads older messages |
| `autoLoadThreshold` | number | `40` | Top scroll threshold in px that triggers auto-load-older |
| `showPreview` | boolean | `true` | Whether hover previews are enabled |
| `activeColor` | string | blue token | Highlight color for the active message |
| `idleColor` | string | gray token | Color for non-active icons |
| `barWidthActive` | number | `6` | Active icon width (px) |
| `barWidthIdle` | number | `4` | Idle icon width (px) |
| `barHeightActive` | number | `20` | Active icon height (px) |
| `barHeightIdle` | number | `12` | Idle icon height (px) |

Example configuration (cordis.yml / bundle entry):

```yaml
- id: ui-message-nav
  name: '@dsh-external/ui-message-nav'
  config:
    position: right
    previewMaxLength: 60
    autoLoadOlder: true
    autoLoadThreshold: 40
    showPreview: true
    activeColor: 'var(--dsw-alias-state-info-primary, #4a90d9)'
    idleColor: 'var(--dsw-alias-label-tertiary, #999)'
    barWidthActive: 6
    barWidthIdle: 4
    barHeightActive: 20
    barHeightIdle: 12
```

### Host API

```http
GET /@dsh-external/ui-message-nav/api/config
GET /@dsh-external/ui-message-nav/api/status
```

## How It Works

The plugin consists of a host half and a client half.

The host provides only lightweight APIs: `/api/config` returns the current configuration and `/api/status` returns health status. All message navigation logic is implemented in the client.

The client identifies user message DOM nodes in the conversation view, creates one navigation bar per user message, detects the currently viewed message by monitoring scroll position and highlights the corresponding icon, scrolls to the target message when clicked, and triggers "load older messages" when scrolling near the top reaches the threshold. The rail style, colors, sizes, and preview behavior come from the plugin configuration.
