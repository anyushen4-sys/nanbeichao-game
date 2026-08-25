// ===== Splash Screen Controller V3 (real videos + Canvas drawImage) =====
// 架构：
//   段 0 (开场 8 秒): 5 段南北朝历史文字从顶部到底部依次淡入 (不消失, 全部堆叠)
//                      + intro_frame_01_mystery 作为背景
//   段 1-9 (君主轮播, 每张 6 秒): 9 个君主真实视频 + Canvas drawImage 渲染
//                      L1, L3, L7 用 intro_frame_02/03/04 静态帧 fallback (无视频)
//                      L2, L4, L5, L6, L8, L9 用真实视频
//   段 10 (攻城, 6 秒): 大军攻城真实视频
//   段 11 (结束, 6 秒): intro_frame_06_ending 静态帧
//
// Canvas drawImage 渲染 (commit af9b82c) 已被验证保证显示
'use strict';

window._splashState = {
  isPlaying: false,
  isSkipped: false,
  currentSegment: 0,
  // 9 个君主 (按真实南北朝顺序), 仅 6 个有真实视频
  leaders: [
    { id: 'L1', name: '刘裕',   title: '南朝宋武帝 · 金戈铁马',  video: 'leader_L1_agnes.mp4' },      // Agnes 真实视频
    { id: 'L2', name: '萧道成', title: '南朝齐高帝 · 权臣篡位',  video: 'leader_L2.mp4' },           // 真实视频
    { id: 'L3', name: '陈霸先', title: '南朝陈武帝 · 乱世平南',  video: null },                       // fallback
    { id: 'L4', name: '宇文泰', title: '北朝西魏权臣 · 关陇集团', video: 'leader_L4.mp4' },           // 真实视频
    { id: 'L5', name: '高欢',   title: '北朝东魏权臣 · 雄霸河北', video: 'leader_L5.mp4' },           // 真实视频
    { id: 'L6', name: '萧衍',   title: '南朝梁武帝 · 竟陵八友',  video: 'leader_L6.mp4' },           // 真实视频 (文人)
    { id: 'L7', name: '陈庆之', title: '白袍将军 · 千军破敌',    video: null },                       // fallback
    { id: 'L8', name: '韦孝宽', title: '北朝名将 · 玉壁战神',    video: 'leader_L8.mp4' },           // 真实视频
    { id: 'L9', name: '侯景',   title: '羯族大将 · 乱梁之祸',    video: 'leader_L9.mp4' }            // 真实视频
  ],
  // 5 段南北朝历史背景文字
  historyTexts: [
    '公元 420 年，东晋灭亡，南北朝对峙开启。',
    '南方宋齐梁陈，衣冠南渡，文治繁华。',
    '北方北魏分裂，铁骑纵横，武风炽烈。',
    '三百余年，江山分合，英雄辈出。',
    '今以卡牌为媒，重演那段金戈铁马的岁月。'
  ],
  // 段时长 (ms)
  segmentDurations: {
    history: 8000,
    leader: 6000,  // 6 秒/张
    siege: 6000,
    ending: 4000
  },
  _timers: []
};

window._splashInited = false;

window._splashIsDisabled = function() {
  try {
    var q = (window.location && window.location.search) || '';
    return /[?&]nosplash(?:=1|&|$)/.test(q);
  } catch (e) { return false; }
};

// ===== 初始化 =====
window.initSplash = function() {
  if (window._splashInited) return;
  window._splashInited = true;
  window._initSplashStars();
};

// ===== 星空粒子 =====
window._initSplashStars = function() {
  const canvas = document.getElementById('splash-stars');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  if (!ctx) return;
  function resize() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
  }
  resize();
  window.addEventListener('resize', resize);
  const stars = [];
  for (let i = 0; i < 60; i++) {
    stars.push({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      size: Math.random() * 1.2 + 0.3,
      opacity: Math.random() * 0.4,
      speed: Math.random() * 0.2 + 0.05
    });
  }
  function animate() {
    if (!window._splashState.isPlaying) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    stars.forEach(s => {
      s.opacity += (Math.random() - 0.5) * 0.02;
      s.opacity = Math.max(0.1, Math.min(0.5, s.opacity));
      s.y += s.speed;
      if (s.y > canvas.height) s.y = 0;
      ctx.beginPath();
      ctx.arc(s.x, s.y, s.size, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(212, 168, 64, ${s.opacity})`;
      ctx.fill();
    });
    requestAnimationFrame(animate);
  }
  animate();
};

// ===== 显示 splash =====
window.showSplash = function() {
  const state = window._splashState;
  const splash = document.getElementById('splash-screen');
  if (!splash) return;

  state.isPlaying = true;
  state.isSkipped = false;
  state.currentSegment = 0;
  splash.style.display = 'block';
  splash.style.opacity = '1';

  const skipTimer = setTimeout(() => {
    if (!state.isPlaying) return;
    const btn = document.getElementById('splash-skip-btn');
    if (btn) btn.style.display = 'block';
  }, 3000);
  state._timers.push(skipTimer);

  // 安全超时: 8s + 9×6s + 6s + 4s + 12s buffer = 84s
  const safetyTimer = setTimeout(() => {
    if (state.isPlaying) {
      console.warn('[Splash] safety timeout');
      window.hideSplash();
    }
  }, 84000);
  state._timers.push(safetyTimer);

  // 开始段 0
  window._playHistorySegment();

  const progress = document.getElementById('splash-progress');
  if (progress) progress.style.width = '0%';
};

// ===== 段 0: 历史背景文字 (从上到下依次淡入, 全部堆叠) =====
window._playHistorySegment = function() {
  const state = window._splashState;
  if (!state.isPlaying) return;

  const historyContainer = document.getElementById('splash-history-container');
  const bgFrame = document.getElementById('splash-bg-frame');
  const videoContainer = document.getElementById('splash-video-container');
  const leaderContainer = document.getElementById('splash-leader-container');

  // 隐藏视频容器 + 君主容器
  if (videoContainer) videoContainer.style.display = 'none';
  if (leaderContainer) leaderContainer.style.display = 'none';

  // 显示历史文字
  if (historyContainer) historyContainer.style.display = 'block';

  // 背景图
  if (bgFrame) {
    bgFrame.style.backgroundImage = 'url(assets/intro/intro_frame_01_mystery.png)';
    bgFrame.style.opacity = '1';
  }

  // 设置文字内容 + 从上到下依次淡入 (每行间隔 1.2 秒)
  const lines = document.querySelectorAll('.splash-history-line');
  lines.forEach((el, i) => {
    el.textContent = state.historyTexts[i] || '';
    const t = setTimeout(() => {
      if (!state.isPlaying) return;
      el.style.opacity = '1';
      el.style.transform = 'translateY(0)';
    }, 800 + i * 1200);
    state._timers.push(t);
  });

  // 8 秒后进入段 1
  const nextTimer = setTimeout(() => {
    if (!state.isPlaying) return;
    state.currentSegment = 1;
    const progress = document.getElementById('splash-progress');
    if (progress) progress.style.width = '8%';
    window._playLeaderSegment(0);
  }, state.segmentDurations.history);
  state._timers.push(nextTimer);
};

// ===== 段 1-9: 君主轮播 (Canvas drawImage 渲染视频) =====
window._playLeaderSegment = function(leaderIdx) {
  const state = window._splashState;
  if (!state.isPlaying) return;
  if (leaderIdx >= state.leaders.length) {
    // 9 张君主播完 → 进入攻城段
    state.currentSegment = 10;
    window._playSiegeSegment();
    return;
  }

  const leader = state.leaders[leaderIdx];
  const bgFrame = document.getElementById('splash-bg-frame');
  const historyContainer = document.getElementById('splash-history-container');
  const leaderContainer = document.getElementById('splash-leader-container');
  const leaderName = document.getElementById('splash-leader-name');
  const leaderTitle = document.getElementById('splash-leader-title');
  const leaderCard = document.getElementById('splash-leader-card');

  // 隐藏历史文字容器
  if (historyContainer) historyContainer.style.display = 'none';

  // 显示君主容器 + 设置君主名
    if (leaderContainer) leaderContainer.style.display = 'block';
    if (leaderName) leaderName.textContent = leader.name;
    if (leaderTitle) leaderTitle.textContent = leader.title;
    // 设置君主图 (避免 Chromium preload 警告, 且 fallback 君主卡牌也能看到图)
    const leaderImg = document.getElementById('splash-leader-img');
    if (leaderImg) {
      leaderImg.src = `assets/leaders/leader_${leader.id}.png`;
      leaderImg.alt = leader.name;
    }

  // 3D 翻转 - 重置
  if (leaderCard) {
    leaderCard.style.transition = 'none';
    leaderCard.style.transform = 'rotateY(90deg) scale(0.85)';
    leaderCard.style.opacity = '0';
  }

  // 下一帧触发动画
  setTimeout(() => {
    if (!state.isPlaying || !leaderCard) return;
    leaderCard.style.transition = 'transform 1s cubic-bezier(0.4,0,0.2,1), opacity 0.6s ease';
    leaderCard.style.transform = 'rotateY(0deg) scale(1)';
    leaderCard.style.opacity = '1';
  }, 50);

  if (leader.video) {
    // === 有真实视频：使用 Canvas drawImage 渲染 ===
    if (bgFrame) bgFrame.style.opacity = '0';  // 隐藏静态背景
    window._playVideoOnCanvas(leader.video);
  } else {
    // === 无视频：用 intro_frame 静态图 fallback ===
    window._stopVideoOnCanvas();
    const videoContainer = document.getElementById('splash-video-container');
    if (videoContainer) videoContainer.style.display = 'none';
    // 使用 frame 02-06 轮转
    const frameIdx = 1 + (leaderIdx % 5);  // frame 02-06
    if (bgFrame) {
      bgFrame.style.backgroundImage = `url(assets/intro/intro_frame_0${frameIdx + 1}_${['battle','generals','cards','final','ending'][leaderIdx % 5]}.png)`;
      bgFrame.style.opacity = '1';
    }
  }

  // 进度条
  const progress = document.getElementById('splash-progress');
  if (progress) {
    const pct = 8 + ((leaderIdx + 1) / state.leaders.length) * 70;  // 8% → 78%
    progress.style.width = `${pct}%`;
  }

  // 6 秒后切下一张
  const nextTimer = setTimeout(() => {
    if (!state.isPlaying) return;
    if (leaderCard) {
      leaderCard.style.transition = 'transform 0.7s ease, opacity 0.6s ease';
      leaderCard.style.transform = 'rotateY(-90deg) scale(0.85)';
      leaderCard.style.opacity = '0';
    }
    const advanceTimer = setTimeout(() => {
      window._playLeaderSegment(leaderIdx + 1);
    }, 700);
    state._timers.push(advanceTimer);
  }, state.segmentDurations.leader);
  state._timers.push(nextTimer);
};

// ===== Canvas drawImage 视频渲染 (commit af9b82c) =====
window._playVideoOnCanvas = function(videoFile) {
  const state = window._splashState;
  const video = document.getElementById('splash-video');
  const canvas = document.getElementById('splash-canvas');
  const videoContainer = document.getElementById('splash-video-container');

  if (!video || !canvas || !videoContainer) return;

  // 显示视频容器
  videoContainer.style.display = 'flex';
  videoContainer.style.opacity = '1';

  // 停止之前的循环
  window._stopVideoOnCanvas();

  // 设置视频源
  video.src = `assets/intro/${videoFile}`;
  video.load();
  video.currentTime = 0;
  video.muted = true;
  video.playsInline = true;

  // Canvas 上下文
  const ctx = canvas.getContext('2d');
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;

  // 绘制循环
  const drawFrame = () => {
    if (video.readyState >= 2 && video.videoWidth > 0) {
      // 缩放到覆盖整个 canvas
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    }
  };

  // 启动 RAF
  let stopped = false;
  const loop = () => {
    if (stopped || !state.isPlaying) return;
    drawFrame();
    state._videoRAF = requestAnimationFrame(loop);
  };

  // 启动播放 + RAF
  const playPromise = video.play();
  if (playPromise && typeof playPromise.then === 'function') {
    playPromise.catch(e => console.warn('[Splash] play failed:', e && e.message));
  }
  state._videoRAF = requestAnimationFrame(loop);
  state._videoStop = () => {
    stopped = true;
    if (state._videoRAF) cancelAnimationFrame(state._videoRAF);
    state._videoRAF = null;
  };
};

window._stopVideoOnCanvas = function() {
  const state = window._splashState;
  if (state._videoStop) state._videoStop();
  const video = document.getElementById('splash-video');
  const canvas = document.getElementById('splash-canvas');
  if (video) {
    try { video.pause(); } catch (e) {}
    video.removeAttribute('src');
    try { video.load(); } catch (e) {}
  }
  if (canvas) {
    const ctx = canvas.getContext('2d');
    if (ctx) ctx.clearRect(0, 0, canvas.width, canvas.height);
  }
};

// ===== 段 10: 大军攻城 =====
window._playSiegeSegment = function() {
  const state = window._splashState;
  if (!state.isPlaying) return;

  const bgFrame = document.getElementById('splash-bg-frame');
  const leaderContainer = document.getElementById('splash-leader-container');
  const historyContainer = document.getElementById('splash-history-container');

  // 隐藏君主容器
  if (leaderContainer) leaderContainer.style.display = 'none';
  if (historyContainer) historyContainer.style.display = 'none';

  // 显示攻城视频
  if (bgFrame) bgFrame.style.opacity = '0';
  window._playVideoOnCanvas('siege_attack.mp4');

  // 进度条: 78% → 90%
  const progress = document.getElementById('splash-progress');
  if (progress) progress.style.width = '90%';

  // 6 秒后进入段 11 (ending)
  const nextTimer = setTimeout(() => {
    if (!state.isPlaying) return;
    state.currentSegment = 11;
    window._playEndingSegment();
  }, state.segmentDurations.siege);
  state._timers.push(nextTimer);
};

// ===== 段 11: ending 静态帧 =====
window._playEndingSegment = function() {
  const state = window._splashState;
  if (!state.isPlaying) return;

  // 停止视频
  window._stopVideoOnCanvas();
  const videoContainer = document.getElementById('splash-video-container');
  if (videoContainer) videoContainer.style.display = 'none';

  // 显示 ending 帧
  const bgFrame = document.getElementById('splash-bg-frame');
  if (bgFrame) {
    bgFrame.style.backgroundImage = 'url(assets/intro/intro_frame_06_ending.png)';
    bgFrame.style.opacity = '1';
  }

  // 进度条: 95%
  const progress = document.getElementById('splash-progress');
  if (progress) progress.style.width = '95%';

  // 4 秒后进入主菜单
  const finishTimer = setTimeout(() => {
    if (!state.isPlaying) return;
    window.hideSplash();
  }, state.segmentDurations.ending);
  state._timers.push(finishTimer);
};

// ===== 隐藏 splash =====
window.hideSplash = function() {
  const state = window._splashState;
  const splash = document.getElementById('splash-screen');
  if (!splash) return;

  state._timers.forEach(t => clearTimeout(t));
  state._timers = [];

  window._stopVideoOnCanvas();

  state.isPlaying = false;
  state.isSkipped = true;

  splash.style.opacity = '0';
  setTimeout(() => {
    splash.style.display = 'none';
    splash.style.opacity = '1';
    if (typeof G !== 'undefined') {
      G.phase = 'menu';
      G._menuScreen = 'main';
      if (typeof render === 'function') render();
    }
  }, 600);
};

window._splashSkip = function() {
  window.hideSplash();
};

window._onSplashKey = function(e) {
  if (!window._splashState || !window._splashState.isPlaying) return;
  const key = e && (e.key || e.keyCode);
  if (key === 'Escape' || key === 'Enter' || key === ' ' || key === 27 || key === 13 || key === 32) {
    e.preventDefault();
    window._splashSkip();
  }
};

(function wrapRenderForSplash() {
  if (window._splashIsDisabled()) {
    window._splashShown = true;
    return;
  }
  var orig = (typeof window.render === 'function')
    ? window.render
    : (typeof render === 'function' ? render : null);
  if (!orig) {
    console.warn('[Splash] render not defined');
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

document.addEventListener('DOMContentLoaded', () => {
  const splash = document.getElementById('splash-screen');
  if (splash) {
    splash.addEventListener('click', (e) => {
      const tag = e.target && e.target.tagName;
      if (tag === 'BUTTON' || tag === 'A') return;
      if (window._splashState && window._splashState.isPlaying) {
        window._splashSkip();
      }
    });
  }
  document.addEventListener('keydown', window._onSplashKey);
});