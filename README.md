# AgentTown · 代理像素工位

让你的代理拥有自己的工位。AgentTown 是一个本地事件观察台：收到真实事件后，通过 SSE 同步驱动像素工位、状态卡片和时间线。四个初始工位，可根据收到的代理 ID 增加工位。

**默认中文、零 API Key、无需模型。** 自带合成示例明确标记“示例回放 · 合成数据”；“实时”只表示即时接收本地发送方的观察，不意味着已接入 AI 或验证了来源。

## 环境与安装

- Node.js **22.12+（22.x）、24.x 或 26+**，推荐 Node.js 24 LTS；npm 随 Node 安装。
- macOS、Windows、Linux 使用相同 npm 命令。Linux 需有 Chromium 所需系统运行库；setup 不修改系统设置、不自动安装操作系统包。
- 安装需要访问 npm 包源和 Playwright 浏览器下载源；运行演示不需要外网或密钥。
- 约需数百 MB 空间保存浏览器。依赖由 `package-lock.json` 锁定，Playwright 固定 1.59.1。请使用 `npm ci`，不要删除锁文件重新解析浮动版本。

在项目目录运行：

```sh
npm run setup
npm run doctor
npm run dev
```

`setup` 可在尚无 node_modules 时运行：先执行 `npm ci --cache .npm-cache`，再安装 Chromium 和录屏组件，默认位于本项目 `.browsers/`，已存在的版本会复用。它只安装项目依赖和浏览器，不改机器设置。终端会显示中文访问入口：**http://127.0.0.1:4201**；API 为 **http://127.0.0.1:5201**。按 Ctrl+C 停止自己启动的服务。

如果只想安装网页/API 依赖（暂不跑浏览器测试）：

```sh
npm ci --cache .npm-cache
npm run dev
```

单独安装项目内测试浏览器：

```sh
# macOS / Linux shell
PLAYWRIGHT_BROWSERS_PATH="$PWD/.browsers" npx playwright install chromium
```

```powershell
# Windows PowerShell
$env:PLAYWRIGHT_BROWSERS_PATH = Join-Path (Get-Location) '.browsers'
npx playwright install chromium
```

Windows CMD、PowerShell、macOS/Linux 均可直接使用 `npm run setup`，无需上述环境变量语法。浏览器配置未设置时自动使用项目 `.browsers/`。如已有兼容 Playwright 缓存，可用 `PLAYWRIGHT_BROWSERS_PATH` 显式指定，避免重复下载。`.env.example` 仅供配置说明，程序不自动加载 `.env`；不用填写任何 Key。

## 三步体验

1. 打开网页，点击 **播放示例**：查看四个工位随规划、编写、测试、空闲事件变化。这是合成数据，无模型推理；按钮会显示回放中的忙碌状态。
2. 点击 **本地实时**：保持服务运行，在项目目录的另一个终端运行 `npm run observe`。脚本实际执行单元测试，发送开始与真实退出码，Atlas 状态随 SSE 更新。
3. 点击 **历史回放**：查看 `source: "imported"` 的历史事件；未发送此类事件时显示中文空态及接入说明。当前没有内置 Codex / Claude 原生日志适配器。

小屏自动改为单列工位；Tab 可移动到链接和按钮，Enter/空格触发按钮，焦点有明确高亮。连接断开时自动重连；回放失败可读取中文提示后重试。

## 主要依赖及用途

| 依赖 | 作用 |
| --- | --- |
| React、React DOM | 工位和时间线界面、状态渲染 |
| Express | 本地 API、事件校验入口、SSE 推送 |
| TypeScript、@types/* | 静态类型检查 |
| Vite、@vitejs/plugin-react | 网页开发服务与生产构建 |
| tsx | 运行 TypeScript 后端 |
| concurrently | 同时启动网页和 API，退出时清理进程 |
| Vitest | 校验、容量限制、环境契约单元测试 |
| Playwright + Chromium + FFmpeg | 真实浏览器操作、端到端断言、截图和录像 |

图形由 CSS 绘制，不依赖图片 CDN、外部字体、游戏引擎或模型服务。已移除未使用的 lucide-react。

## 接入事件

`POST /api/events` 接收一个事件对象；`GET /api/events/history` 返回最近最多 500 条事件；`GET /api/events/stream` 先发送 `history` 快照，再持续发送事件与心跳，重新连接时恢复当前保留的历史。

```json
{"ts":"2026-10-26T10:00:00Z","agentId":"atlas","type":"testing","message":"真实观察到测试开始","source":"live","file":"tests/events.test.ts"}
```

类型：`planning`（规划中）、`writing`（编写中）、`testing`（测试中）、`idle`（空闲）、`error`（错误）。来源：`live`（默认）、`replay`、`imported`。字段名和枚举是稳定代码标识；界面为中文。消息最多 500 字符，文件标签最多 200 字符；`file` 仅显示，绝不读取对应文件。非法输入返回 HTTP 400 中文错误。`POST /api/replay` 回放内置示例，重复回放返回 409。

## 检查、故障恢复与验证

```sh
npm run doctor
npm run build
npm run test
npm run e2e
npm run demo
```

运行 E2E/demo 前停止 `npm run dev`，测试会自行启动和关闭两个服务。doctor 的退出码 0 表示检查通过，1 表示需处理问题；已启动服务时端口被占用是预期诊断。

| 问题 | 处理 |
| --- | --- |
| Node 版本不支持 | 安装符合要求的 Node，再重试；项目脚本不会修改 Node 安装 |
| 缺少依赖 | 运行 `npm ci --cache .npm-cache` 或 `npm run setup` |
| Chromium 缺失或无法启动 | 运行 `npm run setup`；检查下载网络、缓存目录和 Linux 系统库 |
| 4201 / 5201 被占用 | 在自己启动服务的终端 Ctrl+C；不要终止未知进程。端口固定，不自动改用其他端口 |
| 网页提示 API 断开 | 检查后端终端错误，确认两项服务都已启动；页面自动重连 |
| 下载失败 | 确认网络和磁盘空间后重跑 setup，或指定已有兼容浏览器缓存 |
| npm 提示安装脚本受策略限制 | 按本机 npm 策略审查依赖；不要关闭全局安全设置。构建可用于确认 esbuild 是否可运行 |

真实证据保存在本地 `artifacts/`：`build.log`、`test.log`、`e2e.log`、`demo.log`、`doctor.log`、`doctor-missing-dependency.log`、中文截图 `replay.png` / `live.png` / `mobile-zh.png`，以及 `artifacts/playwright/` 中的真实视频。证据、录屏、缓存不提交 Git。

本次验证使用已有兼容浏览器缓存，不重复下载大型浏览器。全新机器从零下载、Windows/Linux 实机运行尚未验证；setup 的安装顺序与手动命令一致。早期缺浏览器/FFmpeg、按钮无障碍名称不匹配的失败日志保留在本地；后续修复已重测。查看 `status.json` 获取当前真实结果。

## 能力边界与安全

完整任务状态 **PARTIAL**：本地事件 → SSE → 工位状态闭环可运行；无真实模型推理，无原生 Codex/Claude 适配器，无真实九代理冲刺历史回放验证。测试中历史事件为明确标注的合成传输用例。演示视频的实时事件来自实际正在运行的 Playwright 测试进程，不代表模型编程。

数据仅在内存中，重启清空，最多 500 条；时间线显示当前来源最近 30 条。工位仅反映该来源最后保留的事件。示例保留历史时间戳。后端只绑定 127.0.0.1，无鉴权，不可公开暴露端口；本地发送方需自行去除敏感信息。后端不执行命令、不读取用户文件或其他仓库。观察脚本只执行固定的本项目单元测试，60 秒超时。MIT 许可。
