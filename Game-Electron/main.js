const { app, BrowserWindow, Menu } = require('electron');
const path = require('path');
const fs = require('fs');

// ── App User Model ID ──
// Windows requires this so all Electron helper processes (GPU, utility, renderer)
// collapse into a single taskbar icon. Without it, each helper process shows up
// as its own "black" window in the taskbar / Alt+Tab, even though only the
// renderer is the actual game UI. Must be set BEFORE app.whenReady().
app.setAppUserModelId('com.nanbeichao.game');

// Allow autoplay without user gesture (Electron default is "no-user-gesture-required"
// but on Windows 11 + Chromium 110+ some versions need this explicit switch).
app.commandLine.appendSwitch('autoplay-policy', 'no-user-gesture-required');

// WORKAROUND for Electron 28 + Chromium 110 GPU compositor bug:
// <video> elements load fine (play() resolves, currentTime advances,
// videoWidth/Height set, readyState=4) but no frames are drawn to screen.
// Same compositor fails to blit some main-menu images.
// Disabling GPU hardware acceleration forces software compositing which
// works correctly. Splash is short (30s) so software decode cost is acceptable.
app.disableHardwareAcceleration();
console.log('[Main] GPU hardware acceleration disabled (software compositor)');

// ── PID Lock File ──
// Fallback for npx scenario: each `npx electron .` spawns independent cmd.exe tree
// so requestSingleInstanceLock may not coordinate across processes.
// Write PID to file, detect running instance, focus + quit.
const PID_FILE = path.join(app.getPath('userData'), 'nb_game.lock');

function _pidFileCleanup() {
  try { if (fs.existsSync(PID_FILE)) fs.unlinkSync(PID_FILE); } catch {}
}
function _pidFileAcquire() {
  try { fs.writeFileSync(PID_FILE, String(process.pid)); } catch {}

// ── PID lock cleanup on process exit ──
process.on("exit", () => { try { fs.unlinkSync(PID_FILE); } catch {} });

}

// Primary singleton: works under direct `electron .`
const _gotLock = app.requestSingleInstanceLock();
if (!_gotLock) {
  // Electron says we're second instance
  app.quit();
}

// When second instance launches (direct `electron .` path)
app.on('second-instance', () => {
  if (mainWindow) {
    if (mainWindow.isMinimized()) mainWindow.restore();
    mainWindow.focus();
  }
});

// PID Fallback: scheduled immediately after app is ready
let _pidOwner = null;
try {
  if (fs.existsSync(PID_FILE)) {
    _pidOwner = parseInt(String(fs.readFileSync(PID_FILE)).trim(), 10);
  }
  _pidFileAcquire();
} catch {}

if (_gotLock) {
  // Only block PID fallback if we got Electron lock (regular single instance)
  // For npx scenario: PID file is the only protection; proceed.
} else if (!_gotLock && _pidOwner) {
  // Already have an Electron lock AND PID fallback covering both modes
  app.quit();
}

app.whenReady().then(() => {
  // PID fallback check
  if (_pidOwner && process.pid !== _pidOwner) {
    const { execSync } = require('child_process');
    let stillAlive = false;
    try {
      execSync(`powershell -Command "Get-Process -Id ${_pidOwner} -ErrorAction Stop"`, { timeout: 2000 });
      stillAlive = true;
    } catch { /* process not found → stale */ }
    if (stillAlive) {
      console.log('[Lock] Already running (pid', _pidOwner, '), quitting...');
      app.quit();
      return;
    }
    _pidFileAcquire();
    }

    }); // close app.whenReady()

    if(process.env.ELECTRON_USER_DATA_DIR)app.setPath('userData',process.env.ELECTRON_USER_DATA_DIR);

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

// 成就/统计配置 (对应 SteamIntegration.md 16 个成就 + 6 个统计)
const ACHIEVEMENTS = {
  FIRST_WIN: 'ACH_FIRST_WIN',          // 初露锋芒 - 首次获胜
  TEN_WINS: 'ACH_TEN_WINS',            // 百战不殆 - 累计赢得 10 场
  ALL_LEADERS: 'ACH_ALL_LEADERS',      // 九转功成 - 解锁所有 9 位领袖
  PERFECT_VICTORY: 'ACH_PERFECT_VICTORY', // 摧枯拉朽 - 一场对局中输粮 ≤ 3
  NO_PASS: 'ACH_NO_PASS',              // 一鼓作气 - 一局中从不跳过回合并获胜
  SONG_MASTER: 'ACH_SONG_MASTER',      // 宋武扬威 - 用宋阵营赢 5 场
  QI_MASTER: 'ACH_QI_MASTER',          // 齐高帝 - 用齐全阵营赢 5 场
  LIANG_MASTER: 'ACH_LIANG_MASTER',    // 梁武崇佛 - 用梁阵营赢 5 场
  CHEN_MASTER: 'ACH_CHEN_MASTER',      // 陈武开国 - 用陈阵营赢 5 场
  BEIWEI_MASTER: 'ACH_BEIWEI_MASTER',  // 太武统一 - 用北魏阵营赢 5 场
  DONGWEI_MASTER: 'ACH_DONGWEI_MASTER', // 神武雄主 - 用东魏阵营赢 5 场
  XIWEI_MASTER: 'ACH_XIWEI_MASTER',    // 八柱国 - 用西魏阵营赢 5 场
  BEIQI_MASTER: 'ACH_BEIQI_MASTER',    // 兰陵王 - 用北齐阵营赢 5 场
  BEIZHOU_MASTER: 'ACH_BEIZHOU_MASTER', // 武帝雄才 - 用北周阵营赢 5 场
  SPEEDRUN: 'ACH_SPEEDRUN',            // 速战速决 - 5 回合内获胜
  COMBO_KING: 'ACH_COMBO_KING',        // 连环妙策 - 单场使用 3 张以上谋略卡并获胜
};

const STATS = {
  TOTAL_GAMES: 'STAT_TOTAL_GAMES',     // 总对局数
  TOTAL_WINS: 'STAT_TOTAL_WINS',       // 胜场
  TOTAL_LOSSES: 'STAT_TOTAL_LOSSES',   // 败场
  TOTAL_CARDS_PLAYED: 'STAT_CARDS_PLAYED', // 出牌总数
  STRATEGY_RATE: 'STAT_STRATEGY_RATE', // 谋略卡使用率 (avgrate)
  FASTEST_WIN: 'STAT_FASTEST_WIN',     // 最快回合取胜
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
    // Dev Mock 模式 (无 Steam 直接 OK, 渲染端 mock 负责状态同步)
    if (process.env.DEV_MOCKMP === '1') {
      console.log('[MockMP-Main] openInviteDialog → mock success');
      return { ok: true };
    }
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

  if (steamClient && steamClient.callback) {
    try {
      // SteamCallback.P2PSessionRequest = 6 (from steamworks.js client.d.ts)
      const P2P_SESSION_REQUEST = 6;
      steamClient.callback.register(P2P_SESSION_REQUEST, (steamId64) => {
        try {
          steamClient.networking.acceptP2PSession(steamId64);
        } catch (e) {
          console.error('[Steam] acceptP2PSession failed:', e);
        }
      });
    } catch (e) {
      console.warn('[Steam] callback.register failed:', e.message);
    }
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
      sandbox: false
    }
  });

  // 加载游戏页面
  const page = process.env.DEV_PAGE || 'index.html';
  // 加载页面 (URL query: ?mockmp=1 启用联机 Dev Mock)
  const urlQuery = process.env.DEV_MOCKMP === '1' ? '?mockmp=1' : '';
  // 使用 pathToFileURL 以正确处理 Windows 路径和 URL query
  const fileUrl = require('url').pathToFileURL(path.join(__dirname, 'src', page)).href;
  mainWindow.loadURL(fileUrl + urlQuery);

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
