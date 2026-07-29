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

// ===== Multiplayer IPC bridge =====
// 7 个 multiplayer.* API，dev mode (steamClient === null) 时返回 {ok: false, reason: 'steam_not_running'}
function setupMultiplayerIPC() {
  const { ipcMain } = require('electron');

  // --- 1. isSteamAvailable() ---
  ipcMain.handle('multiplayer:isSteamAvailable', () => {
    try {
      return { ok: steamClient !== null };
    } catch (e) {
      console.error('[Multiplayer] isSteamAvailable failed:', e);
      return { ok: false, reason: e.message };
    }
  });

  // --- 2. openInviteDialog() ---
  ipcMain.handle('multiplayer:openInviteDialog', () => {
    if (!steamClient) return { ok: false, reason: 'steam_not_running' };
    try {
      steamClient.overlay.activateDialog('Friends');
      return { ok: true };
    } catch (e) {
      console.error('[Multiplayer] openInviteDialog failed:', e);
      return { ok: false, reason: e.message };
    }
  });

  // --- 3. acceptIncomingInvite() ---
  ipcMain.handle('multiplayer:acceptIncomingInvite', () => {
    if (!steamClient) return { ok: false, reason: 'steam_not_running' };
    try {
      // Steam overlay triggers GameLobbyJoinRequested callback; here we just confirm
      // that the client is alive and ready to accept.
      return { ok: true };
    } catch (e) {
      console.error('[Multiplayer] acceptIncomingInvite failed:', e);
      return { ok: false, reason: e.message };
    }
  });

  // --- 4. sendP2PMessage(steamId64, data) ---
  ipcMain.handle('multiplayer:sendP2PMessage', (_event, steamId64, data) => {
    if (!steamClient) return { ok: false, reason: 'steam_not_running' };
    try {
      const buf = Buffer.from(JSON.stringify(data), 'utf-8');
      steamClient.networking.sendP2PPacket(steamId64, 2 /* Reliable */, buf);
      return { ok: true };
    } catch (e) {
      console.error('[Multiplayer] sendP2PMessage failed:', e);
      return { ok: false, reason: e.message };
    }
  });

  // --- 5. onP2PMessage (callback registration) ---
  // renderer 不能直接注册 native callback，所以用 IPC 轮询方式：
  // 前端每 50ms 调用一次，主进程返回缓冲区中所有待处理消息
  let p2pMessageQueue = [];
  ipcMain.handle('multiplayer:onP2PMessage', () => {
    if (!steamClient) return { ok: false, reason: 'steam_not_running' };
    try {
      const messages = [...p2pMessageQueue];
      p2pMessageQueue = [];
      return { ok: true, messages };
    } catch (e) {
      console.error('[Multiplayer] onP2PMessage failed:', e);
      return { ok: false, reason: e.message };
    }
  });

  // 读取 P2P 数据包并放入队列（由 runCallbacks 周期调用）
  if (steamClient) {
    setInterval(() => {
      try {
        const available = steamClient.networking.isP2PPacketAvailable();
        if (!available) return;
        const rawPacket = steamClient.networking.readP2PPacket(available);
        if (rawPacket && rawPacket.data) {
          const parsed = JSON.parse(rawPacket.data.toString('utf-8'));
          p2pMessageQueue.push({
            steamId: rawPacket.steamId,
            data: parsed,
          });
        }
      } catch (_) { /* no packet available or parse error; silently skip */ }
    }, 50);
  }

  if (steamClient && steamClient.callback && steamClient.callback.register) {
    steamClient.callback.register('P2PSessionRequest', (steamId64) => {
      steamClient.networking.acceptP2PSession(steamId64);
    });
  }

  // --- 6. onSessionRequest (callback registration) ---
  // 通过在 setupSteamIPC 中注册 SteamCallback.P2PSessionRequest
  // 将其暴露给渲染进程
  ipcMain.handle('multiplayer:onSessionRequest', () => {
    if (!steamClient) return { ok: false, reason: 'steam_not_running' };
    try {
      return { ok: true };
    } catch (e) {
      console.error('[Multiplayer] onSessionRequest failed:', e);
      return { ok: false, reason: e.message };
    }
  });

  // --- 7. getLocalPlayerSteamId() ---
  ipcMain.handle('multiplayer:getLocalPlayerSteamId', () => {
    if (!steamClient) return { ok: false, reason: 'steam_not_running' };
    try {
      const id = steamClient.localplayer.getSteamId();
      return { ok: true, steamId: id };
    } catch (e) {
      console.error('[Multiplayer] getLocalPlayerSteamId failed:', e);
      return { ok: false, reason: e.message };
    }
  });

  console.log('[Multiplayer] IPC handlers registered');
}

setupMultiplayerIPC();

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
