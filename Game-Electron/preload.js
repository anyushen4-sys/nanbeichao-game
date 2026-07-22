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
});

// 当前不做 IPC 暴露 node 能力，保证沙箱安全（sandbox: true）
