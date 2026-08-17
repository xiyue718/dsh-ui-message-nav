# @dsh-external/ui-message-nav

独立的“会话消息导航”插件，从文件浏览插件中提取并重新设计，专注提供会话对话视图的用户消息导航能力。

## 功能

- 在会话对话视图右侧（或左侧）显示垂直消息导航栏。
- 导航项数量等于当前会话中用户（user）消息数量。
- 导航项按消息发送顺序从上到下排列。
- 使用长条形图标，不显示数字。
- 当前正在查看的消息对应图标高亮为蓝色；非高亮图标更短。
- 鼠标悬停时使用项目内置 Tooltip 样式显示消息内容预览。
- 点击图标自动滚动定位到对应的用户消息。
- 滚动到对话顶部时自动触发“加载更早消息”。

## 独立架构

- 本插件不依赖文件浏览插件的任何功能模块。
- 只负责：
  - 识别对话中的用户消息 DOM；
  - 渲染导航栏；
  - 高亮当前消息；
  - 点击定位；
  - 自动加载更早消息。
- 文件浏览、用量统计、归档管理、插件管理等功能均不在本插件内。

## 配置项

插件支持通过 profile bundle 装配时的 `config` 传入配置。

### 配置示例（cordis.yml / bundle entry）

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

### 配置项说明

| 配置项 | 类型 | 默认值 | 说明 |
|---|---|---|---|
| `position` | `'left' \| 'right'` | `right` | 导航栏显示在对话视图左侧或右侧 |
| `previewMaxLength` | number | `60` | 悬停预览最大字符数 |
| `autoLoadOlder` | boolean | `true` | 是否在滚动到顶部时自动加载更早消息 |
| `autoLoadThreshold` | number | `40` | 触发自动加载的顶部距离阈值（px） |
| `showPreview` | boolean | `true` | 是否显示悬停消息预览 |
| `activeColor` | string | 蓝色 token | 当前消息高亮颜色 |
| `idleColor` | string | 灰色 token | 非高亮图标颜色 |
| `barWidthActive` | number | `6` | 高亮图标宽度（px） |
| `barWidthIdle` | number | `4` | 非高亮图标宽度（px） |
| `barHeightActive` | number | `20` | 高亮图标高度（px） |
| `barHeightIdle` | number | `12` | 非高亮图标高度（px） |

未配置时自动使用默认值。

## API

### 获取当前配置

```http
GET /@dsh-external/ui-message-nav/api/config
```

响应：

```json
{
  "config": {
    "position": "right",
    "previewMaxLength": 60,
    "autoLoadOlder": true,
    "autoLoadThreshold": 40,
    "showPreview": true,
    "activeColor": "var(--dsw-alias-state-info-primary, #4a90d9)",
    "idleColor": "var(--dsw-alias-label-tertiary, #999)",
    "barWidthActive": 6,
    "barWidthIdle": 4,
    "barHeightActive": 20,
    "barHeightIdle": 12
  }
}
```

### 健康检查

```http
GET /@dsh-external/ui-message-nav/api/status
```

响应：

```json
{
  "ok": true,
  "name": "@dsh-external/ui-message-nav"
}
```

## 安装

### 方式一：超级模组注入器

```text
dev_build_plugin  {"dir": "C:/Users/<user>/.dsh/plugins/ui-message-nav"}
dev_inject_plugin {"dir": "C:/Users/<user>/.dsh/plugins/ui-message-nav"}
```

### 方式二：项目自带 bundle 装配

在 profile 的 `package.json` 中添加：

```json
{
  "dependencies": {
    "@dsh-external/ui-message-nav": "link:C:/Users/<user>/.dsh/plugins/ui-message-nav"
  },
  "dsh": {
    "profile": {
      "bundles": [
        "@dsh-external/ui-message-nav"
      ]
    }
  }
}
```

然后：

```bash
cd C:\Users\<user>\.dsh\profiles\web
pnpm install
```

重启 DSH Web。

## 使用示例

1. 打开任意会话。
2. 对话视图右侧会出现垂直导航栏。
3. 每个长条对应一条用户消息。
4. 当前正在查看的消息对应长条为蓝色且较长。
5. 鼠标悬停任意长条，左侧显示该消息内容预览。
6. 点击长条，对话自动滚动到对应消息。
7. 滚动到对话顶部，自动加载更早消息。

## 迁移说明

- 如果之前使用的是文件浏览插件中的旧版消息导航，请卸载或更新文件浏览插件。
- 新版消息导航已从文件浏览插件中移除，由本插件独立提供。
- 安装本插件后，旧版导航不会重复出现。

## 构建产物

- host：`lib/index.js`
- client：`lib/client.js`
- 打包文件：`dsh-external-ui-message-nav-0.0.1.tgz`
