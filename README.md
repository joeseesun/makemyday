# MakeMyDay

一个「以今天为中心」的习惯追踪桌面应用。不追求复杂的数据分析，只关注一件事：**今天，你做了吗？**

## 功能

- **今日打卡** — 打开即看到今天的习惯清单，一键完成
- **连续统计** — 当前连续天数、最长纪录、总完成次数
- **年度日历** — GitHub 风格热力图，一眼看到全年坚持情况
- **习惯管理** — 自由添加/删除/排序你的习惯项
- **系统托盘** — 常驻 macOS 菜单栏，随时唤起

## 技术栈

- **桌面框架**: Tauri 2.0（Rust 后端）
- **前端**: React 19 + TypeScript
- **样式**: TailwindCSS v4
- **数据库**: SQLite（本地存储，数据不上云）

## 安装

前往 [Releases](https://github.com/joeseesun/makemyday/releases) 下载最新版本的 `.dmg` 文件，拖入 Applications 即可使用。

> 目前仅提供 macOS Apple Silicon (arm64) 版本。

## 本地开发

```bash
# 安装依赖
pnpm install

# 开发模式
pnpm tauri dev

# 构建发布版
pnpm tauri build
```

**前置要求**: Node.js 20+、pnpm、Rust toolchain

## 截图

（待补充）

## 关注作者

如果这个项目对你有帮助，欢迎关注我获取更多技术分享：

- **X (Twitter)**: [@vista8](https://x.com/vista8)
- **微信公众号「向阳乔木推荐看」**:

<p align="center">
  <img src="https://github.com/joeseesun/terminal-boost/raw/main/assets/wechat-qr.jpg?raw=true" alt="向阳乔木推荐看公众号二维码" width="300">
</p>

## License

MIT
