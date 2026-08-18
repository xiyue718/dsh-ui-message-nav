# @dsh-external/ui-message-nav

## 介绍

`ui-message-nav` 是独立的“会话消息导航”插件，从文件浏览插件中提取并重新设计，专注于为会话对话视图提供用户消息导航能力。它根据会话中的用户消息数量生成垂直导航条，支持点击定位、当前消息高亮、悬停预览和自动加载更早消息。

## 安装

### 方式一：超级模组注入器

```text
dev_build_plugin  {"dir": "C:/Users/<user>/.dsh/plugins/ui-message-nav"}
dev_inject_plugin {"dir": "C:/Users/<user>/.dsh/plugins/ui-message-nav"}
```

打开或刷新 DSH Web，进入任意会话即可看到消息导航条。

### 方式二：dsh 命令安装（项目官方方式）

如果你已安装 `dsh` CLI，可以按项目官方教程使用 `dsh plugin` 命令安装：

```bash
# 从本地插件目录安装
dsh plugin --profile web add C:/Users/<user>/.dsh/plugins/ui-message-nav

# 或从 GitHub 仓库安装
dsh plugin --profile web add github:xiyue718/dsh-ui-message-nav
```

安装后启动：

```bash
dsh --profile web
```

查看组合配置：

```bash
dsh --profile web --dump-config
```

详细命令说明见项目文档：`docs/user/develop/basic/publish.md`。

构建产物：host 为 `lib/index.js`，client 为 `lib/client.js`，打包文件为 `dsh-external-ui-message-nav-0.1.0.tgz`。

## 使用

1. 打开任意会话。
2. 对话视图右侧会出现垂直导航栏。
3. 每个长条对应一条用户消息。
4. 当前正在查看的消息对应长条为蓝色且较长。
5. 鼠标悬停任意长条，显示该消息内容预览。
6. 点击长条，对话自动滚动到对应消息。
7. 滚动到对话顶部，自动加载更早消息。
8. 如果之前使用的是文件浏览插件中的旧版消息导航，请卸载或更新文件浏览插件；本插件独立提供新版导航，旧版不会重复出现。

## 功能

- 在会话对话视图右侧（或左侧）显示垂直消息导航栏。
- 导航项数量等于当前会话中用户（user）消息数量。
- 导航项按消息发送顺序从上到下排列。
- 使用长条形图标，不显示数字。
- 当前正在查看的消息对应图标高亮为蓝色；非高亮图标更短。
- 鼠标悬停时使用项目内置 Tooltip 样式显示消息内容预览。
- 点击图标自动滚动定位到对应的用户消息。
- 滚动到对话顶部时自动触发“加载更早消息”。
- 本插件不依赖文件浏览插件的任何功能模块，只负责消息导航相关能力。

### 配置项

插件支持通过 profile bundle 装配时的 `config` 传入配置。未配置时自动使用默认值。

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

配置示例（cordis.yml / bundle entry）：

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

## 原理

插件由 host 和 client 两部分组成。

Host 侧只提供轻量 API：`/api/config` 返回当前配置，`/api/status` 返回健康状态。所有消息导航逻辑都在 client 中完成。

Client 侧识别会话对话视图中的用户消息 DOM，为每条用户消息生成一个导航长条；通过监听滚动位置确定当前正在查看的消息并高亮对应图标；点击图标时滚动到对应消息；滚动到顶部且达到阈值时触发“加载更早消息”。导航样式、颜色、尺寸和预览行为都来自插件配置。
