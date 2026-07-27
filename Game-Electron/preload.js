// preload.js — 南北朝·天下对弈 Electron bridge
// contextIsolation: true 时此脚本在隔离环境中运行
// 通过 contextBridge 暴露安全 API 给渲染进程

const { contextBridge, ipcRenderer } = require('electron');

// 暴露给游戏页面的 API
contextBridge.exposeInMainWorld('electronAPI', {
  // 平台信息
  platform: process.platform,
  // 是否为 Electron 环境（区别于浏览器）
  isElectron: true,
  // 应用版本
  appVersion: '1.0.0',

  // ===== Steam API (转发到主进程的 IPC) =====
  steam: {
    isAvailable: () => ipcRenderer.invoke('steam:isAvailable'),
    unlockAchievement: (achId) => ipcRenderer.invoke('steam:unlockAchievement', achId),
    setStat: (statName, value) => ipcRenderer.invoke('steam:setStat', statName, value),
    storeCloudSave: (data) => ipcRenderer.invoke('steam:storeCloudSave', data),
    loadCloudSave: () => ipcRenderer.invoke('steam:loadCloudSave'),
  },

  // ===== Multiplayer API (7 个 IPC handlers, T7-ipc-bridge) =====
  multiplayer: {
    // 1. 检测 Steam 客户端是否可用
    isSteamAvailable: () => ipcRenderer.invoke('multiplayer:isSteamAvailable'),
    // 2. 打开 Steam 好友邀请对话框
    openInviteDialog: () => ipcRenderer.invoke('multiplayer:openInviteDialog'),
    // 3. 确认可以接受 P2P 会话（由 Steam Overlay 邀请触发）
    acceptIncomingInvite: () => ipcRenderer.invoke('multiplayer:acceptIncomingInvite'),
    // 4. 发送 P2P 消息（steamId64: bigint, data: object）
    sendP2PMessage: (steamId64, data) => ipcRenderer.invoke('multiplayer:sendP2PMessage', steamId64, data),
    // 5. 拉取已接收的 P2P 消息（轮询模式，返回 { messages: [...] }）
    onP2PMessage: () => ipcRenderer.invoke('multiplayer:onP2PMessage'),
    // 6. P2P 会话请求回调（前端注册监听）
    onSessionRequest: () => ipcRenderer.invoke('multiplayer:onSessionRequest'),
    // 7. 获取当前玩家的 Steam ID
    getLocalPlayerSteamId: () => ipcRenderer.invoke('multiplayer:getLocalPlayerSteamId'),
  },
});

// 当前不做 IPC 暴露 node 能力，保证沙箱安全（sandbox: true）
