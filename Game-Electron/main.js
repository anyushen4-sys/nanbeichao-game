const { app, BrowserWindow, Menu } = require('electron');
const path = require('path');

// ===== Steamworks 集成 =====
// steamworks.js: https://github.com/ceifa/steamworks.js
// 使用 App ID 480 (Spacewar, Steam 官方测试 app) 在开发模式;上线时改为真实 App ID
const STEAM_APP_ID = process.env.STEAM_APP_ID || 480;
let steamClient = null;
try {
  const steamworks = require('steamworks.js');
  steamClient = steamworks.init(STEAM_APP_ID);
  console.log('[Steam] Connected, player:', steamClient.localplayer.getName());
} catch (e) {
  console.log('[Steam] Dev mode (Steam not running):', e.message);
}

// 窗口引用
let mainWindow;

// 成就/统计配置
const ACHIEVEMENTS = {
  FIRST_WIN: 'ACH_FIRST_WIN',          // 初露锋芒 - 首次获胜
  PERFECT_ROUND: 'ACH_PERFECT_ROUND',  // 运筹帷幄 - 3 局全胜
  VETERAN: 'ACH_VETERAN',              // 百战不殆 - 玩 10 局
  DEEP_DIVE: 'ACH_DEEP_DIVE',          // 历尽沧桑 - 完成 1 局 3 回合
};

const STATS = {
  TOTAL_GAMES: 'STAT_TOTAL_GAMES',
  TOTAL_WINS: 'STAT_TOTAL_WINS',
  TOTAL_LOSSES: 'STAT_TOTAL_LOSSES',
  HIGHEST_POWER: 'STAT_HIGHEST_POWER',
};

// 暴露给 renderer 进程的 Steam API (通过 IPC)
function setupSteamIPC() {
  const { ipcMain } = require('electron');
  ipcMain.handle('steam:unlockAchievement', (event, achId) => {
    if (!steamClient) return { success: false, reason: 'steam_not_running' };
    try {
      steamClient.achievement.activate(achId);
      return { success: true };
    } catch (e) {
      console.error('[Steam] unlockAchievement failed:', e);
      return { success: false, reason: e.message };
    }
  });
  ipcMain.handle('steam:setStat', (event, statName, value) => {
    if (!steamClient) return { success: false, reason: 'steam_not_running' };
    try {
      steamClient.stats.setStatInt(statName, value);
      return { success: true };
    } catch (e) {
      console.error('[Steam] setStat failed:', e);
      return { success: false, reason: e.message };
    }
  });
  ipcMain.handle('steam:isAvailable', () => {
    return { available: steamClient !== null };
  });
  ipcMain.handle('steam:storeCloudSave', (event, data) => {
    if (!steamClient) return { success: false, reason: 'steam_not_running' };
    try {
      // steamworks.js 云存档 API
      const filename = 'savegame.json';
      const buffer = Buffer.from(JSON.stringify(data), 'utf-8');
      steamClient.cloud.writeFile(filename, buffer);
      return { success: true };
    } catch (e) {
      console.error('[Steam] storeCloudSave failed:', e);
      return { success: false, reason: e.message };
    }
  });
  ipcMain.handle('steam:loadCloudSave', () => {
    if (!steamClient) return { success: false, reason: 'steam_not_running' };
    try {
      const filename = 'savegame.json';
      const buffer = steamClient.cloud.readFile(filename);
      return { success: true, data: JSON.parse(buffer.toString('utf-8')) };
    } catch (e) {
      return { success: false, reason: e.message };
    }
  });
}

setupSteamIPC();

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1280,
    height: 800,
    minWidth: 1024,
    minHeight: 640,
    title: '南北朝·天下对弈',
    backgroundColor: '#1E1812',
    show: false, // 启动后再显示，避免白屏
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: true
    }
  });

  // 加载游戏页面
  const page = process.env.DEV_PAGE || 'index.html';
  mainWindow.loadFile(path.join(__dirname, 'src', page));

  // 窗口准备好后再显示
  mainWindow.once('ready-to-show', () => {
    mainWindow.show();
  });

  // DevTools console logging for image load failures
  mainWindow.webContents.on('console-message', (e, level, msg) => {
    console.log(`[page ${level}]`, msg);
  });
  mainWindow.webContents.on('did-fail-load', (e, code, desc) => {
    console.log('[did-fail-load]', code, desc);
  });
  // Open DevTools for diagnostics
  if (process.env.DEVTOOLS === '1') {
    mainWindow.webContents.openDevTools({ mode: 'detach' });
  }
  // 去掉默认菜单栏（游戏自带 UI）
  Menu.setApplicationMenu(null);

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

app.whenReady().then(() => {
  createWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});
