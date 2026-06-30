import re

path = r"G:\Hermes项目\card-game-design\game\index.html"
with open(path, 'r', encoding='utf-8') as f:
    content = f.read()

# 1. Replace renderMenu to remove inline script
old_render_menu_start = '''function renderMenu(el){
  el.innerHTML=`
  <div class="menu-screen">
    <div class="menu-battlefield">
    <canvas id="coverCanvas" style="width:100%;height:100%;object-fit:cover;opacity:0.95"></canvas>
  </div>
  <script>
    (function(){
      try{
        var c=document.getElementById('coverCanvas');
        if(!c)return;
        var dpr=Math.min(window.devicePixelRatio||1,2);
        var rect=c.getBoundingClientRect();
        c.width=rect.width*dpr;
        c.height=rect.height*dpr;
        var ctx=c.getContext('2d');
        ctx.scale(dpr,dpr);
        var W=rect.width,H=rect.height;
        // 天空
        var sky=ctx.createLinearGradient(0,0,0,H);
        sky.addColorStop(0,'#6b7a8a');
        sky.addColorStop(0.35,'#8a9aa8');
        sky.addColorStop(0.7,'#a09888');
        sky.addColorStop(1,'#5a4a3a');
        ctx.fillStyle=sky;
        ctx.fillRect(0,0,W,H);
        // 远山（不用blur，靠透明度叠层次）
        function drawMountain(baseY,h,color,opacity){
          ctx.globalAlpha=opacity;
          ctx.fillStyle=color;
          ctx.beginPath();
          ctx.moveTo(0,H);
          var step=W/6;
          for(var x=0;x<=W;x+=step){
            var y=baseY-Math.abs(Math.sin(x/W*Math.PI*2+h))*h;
            ctx.lineTo(x,y);
          }
          ctx.lineTo(W,H);
          ctx.closePath();
          ctx.fill();
          ctx.globalAlpha=1;
        }
        drawMountain(H*0.5,H*0.16,'#7a8a9a',0.3);
        drawMountain(H*0.55,H*0.13,'#5a6a7a',0.4);
        drawMountain(H*0.62,H*0.1,'#3a4a5a',0.55);
        // 城墙
        var wallY=H*0.64;
        ctx.fillStyle='#3a3530';
        ctx.globalAlpha=0.9;
        ctx.fillRect(W*0.1,wallY,W*0.8,H*0.22);
        ctx.globalAlpha=1;
        // 垛口
        ctx.strokeStyle='#6b6560';
        ctx.lineWidth=2;
        ctx.beginPath();
        var cw=W*0.8/20;
        for(var i=0;i<20;i++){
          var x=W*0.1+i*cw;
          ctx.moveTo(x,wallY);
          ctx.lineTo(x+cw/2,wallY-H*0.035);
          ctx.lineTo(x+cw,wallY);
        }
        ctx.stroke();
        // 城楼
        var tx=W*0.42,ty=wallY-H*0.1,tw=W*0.16,th=H*0.13;
        ctx.fillStyle='#2a2520';
        ctx.fillRect(tx,ty,tw,th);
        ctx.strokeStyle='#6b6560';
        ctx.lineWidth=1.5;
        ctx.strokeRect(tx,ty,tw,th);
        ctx.beginPath();
        ctx.moveTo(tx-12,ty);
        ctx.quadraticCurveTo(tx+tw/2,ty-22,tx+tw+12,ty);
        ctx.quadraticCurveTo(tx+tw/2,ty-6,tx-12,ty);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();
        ctx.fillStyle='#1a1510';
        ctx.fillRect(tx+tw*0.35,ty+th*0.25,tw*0.3,th*0.35);
        ctx.fillStyle='#8a7a60';
        ctx.font='bold '+(Math.max(10,W*0.015))+'px "Noto Serif SC","STKaiti",serif';
        ctx.textAlign='center';
        ctx.textBaseline='middle';
        ctx.fillText('天 下',tx+tw/2,ty+th*0.45);
        // 城门
        ctx.fillStyle='#1a1510';
        ctx.beginPath();
        ctx.moveTo(tx+tw*0.15,wallY);
        ctx.lineTo(tx+tw*0.15,wallY+H*0.1);
        ctx.quadraticCurveTo(tx+tw*0.5,wallY+H*0.14,tx+tw*0.85,wallY+H*0.1);
        ctx.lineTo(tx+tw*0.85,wallY);
        ctx.closePath();
        ctx.fill();
        ctx.strokeStyle='#6b6560';
        ctx.lineWidth=2;
        ctx.stroke();
        // 烽火
        function drawBeacon(bx,by,sc){
          var r=Math.max(14,W*0.016)*sc;
          var g=ctx.createRadialGradient(bx,by,0,bx,by,r*2);
          g.addColorStop(0,'rgba(255,140,60,0.85)');
          g.addColorStop(0.35,'rgba(255,100,30,0.45)');
          g.addColorStop(0.7,'rgba(200,60,20,0.12)');
          g.addColorStop(1,'rgba(139,0,0,0)');
          ctx.fillStyle=g;
          ctx.beginPath();
          ctx.arc(bx,by,r*2,0,Math.PI*2);
          ctx.fill();
        }
        drawBeacon(W*0.1,H*0.44,1);
        drawBeacon(W*0.9,H*0.44,0.9);
        // 旌旗
        function drawFlag(fx,fy,dir,sz){
          ctx.strokeStyle='#3a3530';
          ctx.lineWidth=2*sz;
          ctx.beginPath();
          ctx.moveTo(fx,fy);
          ctx.lineTo(fx,fy+H*0.2*sz);
          ctx.stroke();
          ctx.fillStyle='#a82a32';
          ctx.beginPath();
          ctx.moveTo(fx,fy+3*sz);
          ctx.bezierCurveTo(fx+dir*40*sz,fy-2*sz,fx+dir*75*sz,fy+12*sz,fx+dir*90*sz,fy+18*sz);
          ctx.bezierCurveTo(fx+dir*60*sz,fy+28*sz,fx+dir*25*sz,fy+32*sz,fx,fy+26*sz);
          ctx.closePath();
          ctx.fill();
        }
        drawFlag(W*0.13,H*0.36,1,1);
        drawFlag(W*0.87,H*0.35,-1,1);
        // 中旗
        ctx.strokeStyle='#4a4540';
        ctx.lineWidth=3.5;
        ctx.beginPath();
        ctx.moveTo(W*0.5,H*0.32);
        ctx.lineTo(W*0.5,H*0.5);
        ctx.stroke();
        ctx.fillStyle='#a82a32';
        ctx.beginPath();
        ctx.moveTo(W*0.5,H*0.34);
        ctx.bezierCurveTo(W*0.5+W*0.07,H*0.31,W*0.5+W*0.1,H*0.37,W*0.5+W*0.12,H*0.4);
        ctx.bezierCurveTo(W*0.5+W*0.09,H*0.46,W*0.5+W*0.04,H*0.48,W*0.5,H*0.45);
        ctx.closePath();
        ctx.fill();
        ctx.fillStyle='#1a1410';
        ctx.font='bold '+(Math.max(14,W*0.022))+'px "Noto Serif SC","STKaiti",serif';
        ctx.textAlign='center';
        ctx.textBaseline='middle';
        ctx.fillText('征',W*0.5+W*0.06,H*0.4);
        // 烟雾（少量径向渐变）
        function smoke(sx,sy,sr,col,op){
          var g=ctx.createRadialGradient(sx,sy,0,sx,sy,sr);
          g.addColorStop(0,col);
          g.addColorStop(1,'rgba(26,20,16,0)');
          ctx.globalAlpha=op;
          ctx.fillStyle=g;
          ctx.beginPath();
          ctx.arc(sx,sy,sr,0,Math.PI*2);
          ctx.fill();
          ctx.globalAlpha=1;
        }
        smoke(W*0.3,H*0.72,Math.max(70,W*0.09),'rgba(180,170,160,0.45)',0.3);
        smoke(W*0.6,H*0.74,Math.max(85,W*0.11),'rgba(160,150,140,0.4)',0.28);
        smoke(W*0.8,H*0.7,Math.max(60,W*0.08),'rgba(150,140,130,0.35)',0.25);
        // 前景士兵
        ctx.fillStyle='#0f0d0b';
        ctx.beginPath();
        ctx.arc(W*0.06,H*0.91,Math.max(12,W*0.016),0,Math.PI*2);
        ctx.fill();
        ctx.fillRect(W*0.06-6,H*0.91,Math.max(12,W*0.016),H*0.07);
        ctx.beginPath();
        ctx.arc(W*0.94,H*0.91,Math.max(11,W*0.015),0,Math.PI*2);
        ctx.fill();
        ctx.fillRect(W*0.94-5,H*0.91,Math.max(11,W*0.015),H*0.07);
        // 暗角
        var vig=ctx.createRadialGradient(W/2,H/2,H*0.3,W/2,H/2,Math.max(W,H)*0.7);
        vig.addColorStop(0,'rgba(0,0,0,0)');
        vig.addColorStop(1,'rgba(0,0,0,0.4)');
        ctx.fillStyle=vig;
        ctx.fillRect(0,0,W,H);
      }catch(e){}
    })();
  </script>'''

new_render_menu = '''function renderMenu(el){
  el.innerHTML=`
  <div class="menu-screen">
    <div class="menu-battlefield">
      <canvas id="coverCanvas" style="width:100%;height:100%;object-fit:cover;opacity:0.95"></canvas>
    </div>
    <div class="poetry-container">
      <div class="poetry-col poetry-col-left">
        <div class="poetry-line">余 霞 散 成 绮</div>
        <div class="poetry-line">池 塘 生 春 草</div>
        <div class="poetry-line">大 江 流 日 夜</div>
        <div class="poetry-line">蝉 噪 林 逾 静</div>
        <div class="poetry-line">泻 水 置 平 地</div>
      </div>
      <div class="poetry-col poetry-col-right">
        <div class="poetry-line">澄 江 静 如 练</div>
        <div class="poetry-line">园 柳 变 鸣 禽</div>
        <div class="poetry-line">客 心 悲 未 央</div>
        <div class="poetry-line">鸟 鸣 山 更 幽</div>
        <div class="poetry-line">各 自 东 西 南 北 流</div>
      </div>
    </div>
    <div class="menu-seal">天下<br>对弈</div>
    <div class="menu-title">南北朝·天下对弈</div>
    <div class="menu-subtitle">— 卡 牌 对 战 —</div>
    <div class="decorative-line" style="width:200px"></div>
    <p style="color:#8B7050;margin:16px 0 28px;font-size:.9em;letter-spacing:2px;line-height:1.8">
      四行布阵·三局两胜<br>运筹帷幄·决胜千里
    </p>
    <button class="btn btn-primary" onclick="G.phase='tutorial';render()">开 始 游 戏</button>
    <div style="margin-top:40px;color:#6B5B47;font-size:.75em;letter-spacing:1px">
      昆特牌风格 · 南北朝历史题材
    </div>
  </div>`;
  // Draw battlefield canvas after DOM insertion
  setTimeout(drawCoverCanvas, 0);
}'''

# Also need to add drawCoverCanvas function before renderMenu
draw_cover_func = '''
function drawCoverCanvas(){
  try{
    var c=document.getElementById('coverCanvas');
    if(!c)return;
    var dpr=Math.min(window.devicePixelRatio||1,2);
    var rect=c.getBoundingClientRect();
    if(rect.width===0||rect.height===0)return;
    c.width=rect.width*dpr;
    c.height=rect.height*dpr;
    var ctx=c.getContext('2d');
    ctx.scale(dpr,dpr);
    var W=rect.width,H=rect.height;
    // 天空
    var sky=ctx.createLinearGradient(0,0,0,H);
    sky.addColorStop(0,'#6b7a8a');
    sky.addColorStop(0.35,'#8a9aa8');
    sky.addColorStop(0.7,'#a09888');
    sky.addColorStop(1,'#5a4a3a');
    ctx.fillStyle=sky;
    ctx.fillRect(0,0,W,H);
    // 远山
    function drawMountain(baseY,h,color,opacity){
      ctx.globalAlpha=opacity;
      ctx.fillStyle=color;
      ctx.beginPath();
      ctx.moveTo(0,H);
      var step=W/6;
      for(var x=0;x<=W;x+=step){
        var y=baseY-Math.abs(Math.sin(x/W*Math.PI*2+h))*h;
        ctx.lineTo(x,y);
      }
      ctx.lineTo(W,H);
      ctx.closePath();
      ctx.fill();
      ctx.globalAlpha=1;
    }
    drawMountain(H*0.5,H*0.16,'#7a8a9a',0.3);
    drawMountain(H*0.55,H*0.13,'#5a6a7a',0.4);
    drawMountain(H*0.62,H*0.1,'#3a4a5a',0.55);
    // 城墙
    var wallY=H*0.64;
    ctx.fillStyle='#3a3530';
    ctx.globalAlpha=0.9;
    ctx.fillRect(W*0.1,wallY,W*0.8,H*0.22);
    ctx.globalAlpha=1;
    // 垛口
    ctx.strokeStyle='#6b6560';
    ctx.lineWidth=2;
    ctx.beginPath();
    var cw=W*0.8/20;
    for(var i=0;i<20;i++){
      var x=W*0.1+i*cw;
      ctx.moveTo(x,wallY);
      ctx.lineTo(x+cw/2,wallY-H*0.035);
      ctx.lineTo(x+cw,wallY);
    }
    ctx.stroke();
    // 城楼
    var tx=W*0.42,ty=wallY-H*0.1,tw=W*0.16,th=H*0.13;
    ctx.fillStyle='#2a2520';
    ctx.fillRect(tx,ty,tw,th);
    ctx.strokeStyle='#6b6560';
    ctx.lineWidth=1.5;
    ctx.strokeRect(tx,ty,tw,th);
    ctx.beginPath();
    ctx.moveTo(tx-12,ty);
    ctx.quadraticCurveTo(tx+tw/2,ty-22,tx+tw+12,ty);
    ctx.quadraticCurveTo(tx+tw/2,ty-6,tx-12,ty);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
    ctx.fillStyle='#1a1510';
    ctx.fillRect(tx+tw*0.35,ty+th*0.25,tw*0.3,th*0.35);
    ctx.fillStyle='#8a7a60';
    ctx.font='bold '+(Math.max(10,W*0.015))+'px "Noto Serif SC","STKaiti",serif';
    ctx.textAlign='center';
    ctx.textBaseline='middle';
    ctx.fillText('天 下',tx+tw/2,ty+th*0.45);
    // 城门
    ctx.fillStyle='#1a1510';
    ctx.beginPath();
    ctx.moveTo(tx+tw*0.15,wallY);
    ctx.lineTo(tx+tw*0.15,wallY+H*0.1);
    ctx.quadraticCurveTo(tx+tw*0.5,wallY+H*0.14,tx+tw*0.85,wallY+H*0.1);
    ctx.lineTo(tx+tw*0.85,wallY);
    ctx.closePath();
    ctx.fill();
    ctx.strokeStyle='#6b6560';
    ctx.lineWidth=2;
    ctx.stroke();
    // 烽火
    function drawBeacon(bx,by,sc){
      var r=Math.max(14,W*0.016)*sc;
      var g=ctx.createRadialGradient(bx,by,0,bx,by,r*2);
      g.addColorStop(0,'rgba(255,140,60,0.85)');
      g.addColorStop(0.35,'rgba(255,100,30,0.45)');
      g.addColorStop(0.7,'rgba(200,60,20,0.12)');
      g.addColorStop(1,'rgba(139,0,0,0)');
      ctx.fillStyle=g;
      ctx.beginPath();
      ctx.arc(bx,by,r*2,0,Math.PI*2);
      ctx.fill();
    }
    drawBeacon(W*0.1,H*0.44,1);
    drawBeacon(W*0.9,H*0.44,0.9);
    // 旌旗
    function drawFlag(fx,fy,dir,sz){
      ctx.strokeStyle='#3a3530';
      ctx.lineWidth=2*sz;
      ctx.beginPath();
      ctx.moveTo(fx,fy);
      ctx.lineTo(fx,fy+H*0.2*sz);
      ctx.stroke();
      ctx.fillStyle='#a82a32';
      ctx.beginPath();
      ctx.moveTo(fx,fy+3*sz);
      ctx.bezierCurveTo(fx+dir*40*sz,fy-2*sz,fx+dir*75*sz,fy+12*sz,fx+dir*90*sz,fy+18*sz);
      ctx.bezierCurveTo(fx+dir*60*sz,fy+28*sz,fx+dir*25*sz,fy+32*sz,fx,fy+26*sz);
      ctx.closePath();
      ctx.fill();
    }
    drawFlag(W*0.13,H*0.36,1,1);
    drawFlag(W*0.87,H*0.35,-1,1);
    // 中旗
    ctx.strokeStyle='#4a4540';
    ctx.lineWidth=3.5;
    ctx.beginPath();
    ctx.moveTo(W*0.5,H*0.32);
    ctx.lineTo(W*0.5,H*0.5);
    ctx.stroke();
    ctx.fillStyle='#a82a32';
    ctx.beginPath();
    ctx.moveTo(W*0.5,H*0.34);
    ctx.bezierCurveTo(W*0.5+W*0.07,H*0.31,W*0.5+W*0.1,H*0.37,W*0.5+W*0.12,H*0.4);
    ctx.bezierCurveTo(W*0.5+W*0.09,H*0.46,W*0.5+W*0.04,H*0.48,W*0.5,H*0.45);
    ctx.closePath();
    ctx.fill();
    ctx.fillStyle='#1a1410';
    ctx.font='bold '+(Math.max(14,W*0.022))+'px "Noto Serif SC","STKaiti",serif';
    ctx.textAlign='center';
    ctx.textBaseline='middle';
    ctx.fillText('征',W*0.5+W*0.06,H*0.4);
    // 烟雾
    function smoke(sx,sy,sr,col,op){
      var g=ctx.createRadialGradient(sx,sy,0,sx,sy,sr);
      g.addColorStop(0,col);
      g.addColorStop(1,'rgba(26,20,16,0)');
      ctx.globalAlpha=op;
      ctx.fillStyle=g;
      ctx.beginPath();
      ctx.arc(sx,sy,sr,0,Math.PI*2);
      ctx.fill();
      ctx.globalAlpha=1;
    }
    smoke(W*0.3,H*0.72,Math.max(70,W*0.09),'rgba(180,170,160,0.45)',0.3);
    smoke(W*0.6,H*0.74,Math.max(85,W*0.11),'rgba(160,150,140,0.4)',0.28);
    smoke(W*0.8,H*0.7,Math.max(60,W*0.08),'rgba(150,140,130,0.35)',0.25);
    // 前景士兵
    ctx.fillStyle='#0f0d0b';
    ctx.beginPath();
    ctx.arc(W*0.06,H*0.91,Math.max(12,W*0.016),0,Math.PI*2);
    ctx.fill();
    ctx.fillRect(W*0.06-6,H*0.91,Math.max(12,W*0.016),H*0.07);
    ctx.beginPath();
    ctx.arc(W*0.94,H*0.91,Math.max(11,W*0.015),0,Math.PI*2);
    ctx.fill();
    ctx.fillRect(W*0.94-5,H*0.91,Math.max(11,W*0.015),H*0.07);
    // 暗角
    var vig=ctx.createRadialGradient(W/2,H/2,H*0.3,W/2,H/2,Math.max(W,H)*0.7);
    vig.addColorStop(0,'rgba(0,0,0,0)');
    vig.addColorStop(1,'rgba(0,0,0,0.4)');
    ctx.fillStyle=vig;
    ctx.fillRect(0,0,W,H);
  }catch(e){}
}

'''

if old_render_menu in content:
    content = content.replace(old_render_menu, draw_cover_func + new_render_menu)
    with open(path, 'w', encoding='utf-8') as f:
        f.write(content)
    print("Fixed renderMenu + added drawCoverCanvas")
else:
    print("old renderMenu not found")
