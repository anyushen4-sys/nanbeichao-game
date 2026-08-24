// ===== Splash Screen Controller (SPLASH-6 集成版) =====
// 视频文件名匹配 src/assets/intro/ 下的实际文件：
//   intro_01_mystery.mp4 / intro_02_battle.mp4 / intro_03_generals.mp4
//   intro_04.mp4 / intro_05.mp4 / intro_06.mp4
//
// 行为：
//   - 6 段 intro 视频顺序播放，每段 onended 推进到下一段
//   - 文字段（前 3 段）+ 视频段（后 3 段）按 textToShow/videoToShow 映射同步显示
//   - 进度条 timeupdate 实时更新百分比
//   - 跳过按钮（3s 后显示）/ 点击 splash 区域 / Esc/Enter/Space
//   - 30s 总超时安全网，避免卡死
//   - ?nosplash=1 查询参数直接跳过（开发用）
//
'use strict';

window._splashState = {
  currentVideo: 0,
  currentText: 0,
  isPlaying: false,
  isSkipped: false,
  // 文件名必须与 src/assets/intro/*.mp4 一致（intro_04/05/06 无后缀）
  videos: ['intro_01_mystery', 'intro_02_battle', 'intro_03_generals', 'intro_04', 'intro_05', 'intro_06'],
  // 每段视频的备用时长（秒）— Agnes AI 生成的视频没有 moov box,
  // 浏览器无法读 duration, ended 事件不触发。用 setTimeout 强制推进。
  videoDurations: [7, 7, 7, 7, 7, 7],
  texts: [
    { title: '南北朝·天下对弈', body: '南朝宋齐梁陈，北朝魏齐周隋——三百年的风云际会，英雄辈出的乱世篇章。' },
    { title: '群雄逐鹿', body: '从刘裕北伐到宇文泰改制，从北魏统一到侯景之乱——每一段历史都是一场无声的博弈。' },
    { title: '运筹帷幄', body: '四行布阵，三局两胜。粮草、战力、谋略——步步为营，方能决胜千里。' },
    { title: '将相风云', body: '陈庆之以七千白袍破敌百万，韦孝宽以一城之力挽狂澜——乱世英雄，各领风骚。' },
    { title: '天下归一', body: '历尽沧桑，终见曙光。隋唐一统，开启新的篇章——而你的传奇，才刚刚开始。' }
  ],
  videoToText: [null, null, null, 0, 1, 2], // 视频索引 -> 文本索引
  textToShow: [3, 4] // 文本 0,1,2 在视频前显示，3,4 跟随视频 4,5
};

window._splashAudio = {
  bgm: null,
  sfx: {},
  volume: 0.5,
  isMuted: false
};

// 全局去重标志，避免 splash.js 重复初始化
window._splashInited = false;

// ===== 工具函数：检测 ?nosplash 查询 =====
window._splashIsDisabled = function() {
  try {
    var q = (window.location && window.location.search) || '';
    return /[?&]nosplash(?:=1|&|$)/.test(q);
  } catch (e) { return false; }
};

// ===== 初始化（只跑一次）=====
window.initSplash = function() {
  if (window._splashInited) return;
  window._splashInited = true;

  const state = window._splashState;
  state.currentVideo = 0;
  state.currentText = 0;
  state.isPlaying = false;
  state.isSkipped = false;

  const video = document.getElementById('splash-video');
  if (!video) {
    console.warn('[Splash] #splash-video not found, splash disabled');
    return;
  }

  // 注册事件
  video.addEventListener('ended', window._onVideoEnded);
  video.addEventListener('timeupdate', window._onVideoTimeUpdate);
  video.addEventListener('error', function() {
    console.warn('[Splash] video error, advancing');
    window._onVideoEnded();
  });

  // 星空粒子
  window._initSplashStars();

  // 音频（如果 HTML 里有 splash-bgm / sfx-* 元素才会被绑定）
  window._initSplashAudio();
};

// ===== 星空粒子动画 =====
window._initSplashStars = function() {
  const canvas = document.getElementById('splash-stars');
  if (!canvas) return;

  const ctx = canvas.getContext('2d');
  if (!ctx) return;

  // 适配窗口尺寸
  function resize() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
  }
  resize();
  window.addEventListener('resize', resize);

  const stars = [];
  for (let i = 0; i < 100; i++) {
    stars.push({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      size: Math.random() * 2 + 0.5,
      opacity: Math.random(),
      speed: Math.random() * 0.5 + 0.1
    });
  }

  function animate() {
    if (!window._splashState.isPlaying) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    stars.forEach(star => {
      star.opacity += (Math.random() - 0.5) * 0.02;
      star.opacity = Math.max(0.1, Math.min(1, star.opacity));
      star.y += star.speed;
      if (star.y > canvas.height) star.y = 0;

      ctx.beginPath();
      ctx.arc(star.x, star.y, star.size, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(212, 168, 64, ${star.opacity * 0.5})`;
      ctx.fill();
    });
    requestAnimationFrame(animate);
  }
  animate();
};

// ===== 音频初始化（占位，HTML 中如无 audio 元素则 no-op）=====
window._initSplashAudio = function() {
  const bgm = document.getElementById('splash-bgm');
  if (bgm) {
    bgm.volume = window._splashAudio.volume;
    window._splashAudio.bgm = bgm;
  }

  const sfxIds = ['card-flip', 'card-play', 'combo', 'win', 'lose'];
  sfxIds.forEach(id => {
    const el = document.getElementById(`sfx-${id}`);
    if (el) window._splashAudio.sfx[id] = el;
  });
};

// ===== 显示 / 启动播放 =====
window.showSplash = function() {
  const state = window._splashState;
  const splash = document.getElementById('splash-screen');
  if (!splash) return;

  state.isPlaying = true;
  state.isSkipped = false;
  splash.style.display = 'block';

  // 3s 后显示跳过按钮
  setTimeout(() => {
    const btn = document.getElementById('splash-skip-btn');
    if (btn) btn.style.display = 'block';
  }, 3000);

  // 60s 总超时安全网（6 段 × 8s + 12s buffer）
  state._safetyTimeout = setTimeout(() => {
    if (window._splashState.isPlaying) {
      console.warn('[Splash] 60s safety timeout, hiding');
      window.hideSplash();
    }
  }, 60000);

  // 开始播放第一段
  window._playNextVideo();
};

// ===== 推进到下一段视频 =====
window._playNextVideo = function() {
  const state = window._splashState;
  const video = document.getElementById('splash-video');
  const videoContainer = document.getElementById('splash-video-container');
  const progress = document.getElementById('splash-progress');

  if (!video || state.currentVideo >= state.videos.length) {
    // 全部播完
    window.hideSplash();
    return;
  }

  const videoSrc = `assets/intro/${state.videos[state.currentVideo]}.mp4`;
  console.log(`[Splash] playing ${state.currentVideo + 1}/${state.videos.length}: ${videoSrc} (webm)`);
  video.src = videoSrc;
  video.load();

  // 显示视频容器
  if (videoContainer) {
    videoContainer.style.display = 'flex';
    videoContainer.style.opacity = '1';
  }

  // 隐藏文字容器（视频段）
  const textContainer = document.getElementById('splash-text-container');
  if (textContainer) {
    textContainer.style.opacity = '0';
    setTimeout(() => {
      if (textContainer) textContainer.style.display = 'none';
    }, 600);
  }

  // 播放（autoplay 可能被浏览器拦，会 fallback 到第一次用户交互）
  // Aggressive play: try immediately, also retry on loadeddata (mp4-without-moov
  // 可能需要先 download 完才能 readyState >= 2)
  let _playedOnce = false;
  const tryPlay = () => {
    if (_playedOnce) return;
    const p = video.play();
    if (p && typeof p.then === 'function') {
      p.then(() => { _playedOnce = true; }).catch(e => {
        // autoplay blocked, log and retry on next user interaction
        console.warn('[Splash] video.play() rejected:', e && e.message);
      });
    } else {
      _playedOnce = true;
    }
  };
  video.removeEventListener('loadeddata', tryPlay);
  video.addEventListener('loadeddata', tryPlay, { once: true });
  tryPlay();

  // 进度条：段开始位置
  if (progress) {
    progress.style.width = `${(state.currentVideo / state.videos.length) * 100}%`;
  }

  // DIAGNOSTIC: log video element state every 1s
  const _diag = setInterval(() => {
    const r = video.getBoundingClientRect();
    console.log(`[Splash diag v${state.currentVideo + 1}] src=${video.src.split('/').pop()} readyState=${video.readyState} networkState=${video.networkState} duration=${video.duration} vw=${video.videoWidth}x${video.videoHeight} rect=${Math.round(r.width)}x${Math.round(r.height)} paused=${video.paused} currentTime=${video.currentTime.toFixed(1)} err=${video.error ? video.error.code : 'none'}`);
  }, 1000);
  if (state._diagInterval) clearInterval(state._diagInterval);
  state._diagInterval = _diag;

  // 后备超时：Agnes AI 生成的 mp4 没有 moov box, 浏览器无法读 duration,
  // ended 事件不会触发。用 setTimeout 强制推进。
  if (state._videoAdvanceTimeout) {
    clearTimeout(state._videoAdvanceTimeout);
    state._videoAdvanceTimeout = null;
  }
  let timeoutMs = state.videoDurations[state.currentVideo] * 1000;
  // 如果视频能读 duration, 用真实时长（更精确）
  if (video.duration && isFinite(video.duration) && video.duration > 0) {
    timeoutMs = Math.min(timeoutMs, (video.duration + 0.3) * 1000);
  }
  state._videoAdvanceTimeout = setTimeout(() => {
    console.log(`[Splash] advance timeout (${timeoutMs}ms) for video ${state.currentVideo + 1}`);
    window._onVideoEnded();
  }, timeoutMs);
};

// ===== 视频结束回调 =====
window._onVideoEnded = function() {
  const state = window._splashState;
  if (!state.isPlaying) return;
  state.currentVideo++;
  window._playNextVideo();
};

// ===== 视频 timeupdate 回调 =====
window._onVideoTimeUpdate = function(e) {
  const state = window._splashState;
  const video = e && e.target;
  if (!video || !video.duration) return;
  const progress = document.getElementById('splash-progress');
  if (progress) {
    const totalProgress = ((state.currentVideo + video.currentTime / video.duration) / state.videos.length) * 100;
    progress.style.width = `${Math.min(100, totalProgress)}%`;
  }
};

// ===== 隐藏 splash =====
window.hideSplash = function() {
  const state = window._splashState;
  const splash = document.getElementById('splash-screen');
  if (!splash) return;

  // 清除安全超时
  if (state._safetyTimeout) {
    clearTimeout(state._safetyTimeout);
    state._safetyTimeout = null;
  }

  state.isPlaying = false;
  state.isSkipped = true;

  // 暂停/清空视频
  const video = document.getElementById('splash-video');
  if (video) {
    try { video.pause(); } catch (e) {}
    video.removeAttribute('src');
    try { video.load(); } catch (e) {}
  }

  // 视频容器淡出
  const videoContainer = document.getElementById('splash-video-container');
  if (videoContainer) {
    videoContainer.style.opacity = '0';
    setTimeout(() => {
      if (videoContainer) videoContainer.style.display = 'none';
    }, 800);
  }

  // 文字容器淡出
  const textContainer = document.getElementById('splash-text-container');
  if (textContainer) {
    textContainer.style.opacity = '0';
  }

  // 整个 splash 淡出
  splash.style.opacity = '0';
  setTimeout(() => {
    splash.style.display = 'none';
    splash.style.opacity = '1';

    // 进入主菜单
    if (typeof G !== 'undefined') {
      G.phase = 'menu';
      G._menuScreen = 'main';
      if (typeof render === 'function') render();
    }
  }, 800);
};

// ===== 跳过入口 =====
window._splashSkip = function() {
  window.hideSplash();
};

// ===== 键盘跳过（Esc / Enter / Space）=====
window._onSplashKey = function(e) {
  if (!window._splashState || !window._splashState.isPlaying) return;
  const key = e && (e.key || e.keyCode);
  if (key === 'Escape' || key === 'Enter' || key === ' ' || key === 27 || key === 13 || key === 32) {
    e.preventDefault();
    window._splashSkip();
  }
};

// ===== 包装 window.render：首次进入 menu 时自动触发 splash =====
// 仅在 splash.js 加载时 render 已存在的情况下包裹（避免 ReferenceError）
(function wrapRenderForSplash() {
  // 早期 ?nosplash 直接返回
  if (window._splashIsDisabled()) {
    window._splashShown = true;
    return;
  }

  var orig = (typeof window.render === 'function')
    ? window.render
    : (typeof render === 'function' ? render : null);

  if (!orig) {
    // render 还未定义（极少见），什么都不做，由后续流程自行处理
    console.warn('[Splash] window.render not defined at splash.js load time, skipping render wrap');
    return;
  }

  window.render = function() {
    try {
      if (!window._splashShown && typeof G !== 'undefined' && G && G.phase === 'menu') {
        window._splashShown = true;
        window.initSplash();
        window.showSplash();
      }
    } catch (e) {
      console.warn('[Splash] render-wrap error:', e && e.message);
    }
    return orig.apply(this, arguments);
  };
})();

// ===== DOMContentLoaded 后注册点击 / 键盘事件 =====
document.addEventListener('DOMContentLoaded', () => {
  const splash = document.getElementById('splash-screen');
  if (splash) {
    splash.addEventListener('click', (e) => {
      // 仅在背景区域点击才跳过（不要干扰按钮）
      const tag = e.target && e.target.tagName;
      if (tag === 'BUTTON' || tag === 'A') return;
      if (window._splashState && window._splashState.isPlaying) {
        window._splashSkip();
      }
    });
  }
  // 键盘跳过
  document.addEventListener('keydown', window._onSplashKey);
});

// ===== 音频控制（占位 API，与 game 内可能调用的接口对齐）=====
window.toggleBGM = function() {
  const audio = window._splashAudio.bgm;
  if (!audio) return;
  window._splashAudio.isMuted = !window._splashAudio.isMuted;
  audio.muted = window._splashAudio.isMuted;
  if (window._splashAudio.isMuted) {
    audio.pause();
  } else {
    const p = audio.play();
    if (p && typeof p.catch === 'function') p.catch(e => console.warn('[Audio] BGM play failed:', e && e.message));
  }
};

window.setBGMVolume = function(volume) {
  window._splashAudio.volume = volume;
  if (window._splashAudio.bgm) {
    window._splashAudio.bgm.volume = volume;
  }
};

window.playSFX = function(sfxId) {
  const audio = window._splashAudio.sfx[sfxId];
  if (!audio) return;
  try {
    audio.currentTime = 0;
    const p = audio.play();
    if (p && typeof p.catch === 'function') p.catch(e => console.warn(`[Audio] SFX ${sfxId} failed:`, e && e.message));
  } catch (e) {}
};
