import re

path = r"G:\Hermes项目\card-game-design\game\index.html"
with open(path, 'r', encoding='utf-8') as f:
    content = f.read()

old = '''    <div class="menu-battlefield">
    <canvas id="coverCanvas" style="width:100%;height:100%;object-fit:cover;opacity:0.95"></canvas>
  </div>
  <script>
    (function(){
      try{
        var c=document.getElementById('coverCanvas');
        if(!c)return;
        var dpr=window.devicePixelRatio||1;
        var rect=c.getBoundingClientRect();
        c.width=rect.width*dpr;
        c.height=rect.height*dpr;
        var ctx=c.getContext('2d');
        ctx.scale(dpr,dpr);
        var W=rect.width,H=rect.height;
        // === 天空：冷灰蓝到暖土黄 ===
        var sky=ctx.createLinearGradient(0,0,0,H);
        sky.addColorStop(0,'#6b7a8a');
        sky.addColorStop(0.35,'#8a9aa8');
        sky.addColorStop(0.7,'#a09888');
        sky.addColorStop(1,'#5a4a3a');
        ctx.fillStyle=sky;
        ctx.fillRect(0,0,W,H);
        // === 远山（空气透视） ===
        function drawInkMountain(baseY,height,color,opacity,blur){
          ctx.save();
          ctx.filter='blur('+blur+'px)';
          ctx.globalAlpha=opacity;
          ctx.fillStyle=color;
          ctx.beginPath();
          ctx.moveTo(-10,H);
          var peaks=5+Math.floor(W/200);
          var seg=W/(peaks-1);
          for(var i=0;i<peaks;i++){
            var x=i*seg;
            var y=baseY-Math.abs(Math.sin(i*1.3+0.5))*height-Math.random()*height*0.2;
            if(i===0) ctx.moveTo(x,y);
            else ctx.lineTo(x,y);
          }
          ctx.lineTo(W+10,H);
          ctx.closePath();
          ctx.fill();
          ctx.restore();
        }
        drawInkMountain(H*0.45,H*0.18,'#7a8a9a',0.35,18);
        drawInkMountain(H*0.5,H*0.15,'#6a7a8a',0.45,14);
        drawInkMountain(H*0.56,H*0.12,'#5a6a7a',0.55,10);
        drawInkMountain(H*0.62,H*0.1,'#4a5a6a',0.65,6);
        // === 城墙主体 ===
        var wallY=H*0.64;
        var wallH=H*0.22;
        var wallGrad=ctx.createLinearGradient(0,wallY,0,wallY+wallH);
        wallGrad.addColorStop(0,'#4a4540');
        wallGrad.addColorStop(0.5,'#3a3530');
        wallGrad.addColorStop(1,'#2a2520');
        ctx.fillStyle=wallGrad;
        ctx.globalAlpha=0.9;
        ctx.fillRect(W*0.08,wallY,W*0.84,wallH);
        ctx.globalAlpha=1;
        // 城墙纹理
        ctx.strokeStyle='#5a5550';
        ctx.lineWidth=1;
        ctx.globalAlpha=0.3;
        for(var i=0;i<80;i++){
          var lx=W*0.08+Math.random()*W*0.84;
          var ly=wallY+Math.random()*wallH;
          ctx.beginPath();
          ctx.moveTo(lx,ly);
          ctx.lineTo(lx+20+Math.random()*40,ly+(Math.random()-0.5)*8);
          ctx.stroke();
        }
        ctx.globalAlpha=1;
        // 垛口
        ctx.strokeStyle='#6b6560';
        ctx.lineWidth=2.5;
        ctx.beginPath();
        var cw=W*0.84/24;
        for(var i=0;i<24;i++){
          var x=W*0.08+i*cw;
          ctx.moveTo(x,wallY);
          ctx.lineTo(x+cw/2,wallY-H*0.04);
          ctx.lineTo(x+cw,wallY);
        }
        ctx.stroke();
        // === 城楼 ===
        var towerX=W*0.42;
        var towerY=wallY-H*0.12;
        var towerW=W*0.16;
        var towerH=H*0.14;
        ctx.fillStyle='#3a3530';
        ctx.fillRect(towerX,towerY,towerW,towerH);
        ctx.strokeStyle='#6b6560';
        ctx.lineWidth=2;
        ctx.strokeRect(towerX,towerY,towerW,towerH);
        ctx.fillStyle='#2a2520';
        ctx.beginPath();
        ctx.moveTo(towerX-15,towerY);
        ctx.quadraticCurveTo(towerX+towerW/2,towerY-25,towerX+towerW+15,towerY);
        ctx.quadraticCurveTo(towerX+towerW/2,towerY-8,towerX-15,towerY);
        ctx.closePath();
        ctx.fill();
        ctx.strokeStyle='#6b6560';
        ctx.lineWidth=1.5;
        ctx.stroke();
        ctx.fillStyle='#1a1510';
        ctx.fillRect(towerX+towerW*0.35,towerY+towerH*0.25,towerW*0.3,towerH*0.35);
        ctx.fillStyle='#8a7a60';
        ctx.font='bold '+(Math.max(11,W*0.016))+'px "Noto Serif SC","STKaiti",serif';
        ctx.textAlign='center';
        ctx.textBaseline='middle';
        ctx.fillText('天 下',towerX+towerW/2,towerY+towerH*0.45);
        // === 城门 ===
        ctx.fillStyle='#1a1510';
        ctx.beginPath();
        ctx.moveTo(towerX+towerW*0.15,wallY);
        ctx.lineTo(towerX+towerW*0.15,wallY+H*0.1);
        ctx.quadraticCurveTo(towerX+towerW*0.5,wallY+H*0.15,towerX+towerW*0.85,wallY+H*0.1);
        ctx.lineTo(towerX+towerW*0.85,wallY);
        ctx.closePath();
        ctx.fill();
        ctx.strokeStyle='#6b6560';
        ctx.lineWidth=2.5;
        ctx.stroke();
        // === 烽火 ===
        function drawBeacon(bx,by,scale){
          var sr=Math.max(16,W*0.018)*scale;
          var g1=ctx.createRadialGradient(bx,by,0,bx,by,sr*2.5);
          g1.addColorStop(0,'rgba(255,140,60,0.9)');
          g1.addColorStop(0.3,'rgba(255,100,30,0.5)');
          g1.addColorStop(0.6,'rgba(200,60,20,0.15)');
          g1.addColorStop(1,'rgba(139,0,0,0)');
          ctx.fillStyle=g1;
          ctx.beginPath();
          ctx.arc(bx,by,sr*2.5,0,Math.PI*2);
          ctx.fill();
          var g2=ctx.createRadialGradient(bx,by-sr*0.3,0,bx,by,sr);
          g2.addColorStop(0,'rgba(255,200,120,1)');
          g2.addColorStop(0.4,'rgba(255,120,40,0.8)');
          g2.addColorStop(1,'rgba(200,50,20,0)');
          ctx.fillStyle=g2;
          ctx.beginPath();
          ctx.arc(bx,by-sr*0.2,sr,0,Math.PI*2);
          ctx.fill();
        }
        drawBeacon(W*0.1,H*0.44,1);
        drawBeacon(W*0.9,H*0.44,0.9);
        // === 旌旗 ===
        function drawBanner(fx,fy,dir,size){
          ctx.save();
          ctx.strokeStyle='#3a3530';
          ctx.lineWidth=2.5*size;
          ctx.beginPath();
          ctx.moveTo(fx,fy);
          ctx.lineTo(fx,fy+H*0.22*size);
          ctx.stroke();
          var flagW=55*size;
          var flagH=28*size;
          ctx.fillStyle='#a82a32';
          ctx.beginPath();
          ctx.moveTo(fx,fy+4*size);
          ctx.bezierCurveTo(fx+dir*flagW*0.4,fy-2*size,fx+dir*flagW*0.8,fy+flagH*0.3,fx+dir*flagW,fy+flagH*0.4);
          ctx.bezierCurveTo(fx+dir*flagW*0.7,fy+flagH*0.8,fx+dir*flagW*0.3,fy+flagH*1.1,fx,fy+flagH*0.9);
          ctx.closePath();
          ctx.fill();
          ctx.strokeStyle='#5a1018';
          ctx.lineWidth=1*size;
          ctx.stroke();
          ctx.restore();
        }
        drawBanner(W*0.14,H*0.36,1,1);
        drawBanner(W*0.86,H*0.35,-1,1);
        // 中旗
        ctx.strokeStyle='#4a4540';
        ctx.lineWidth=4;
        ctx.beginPath();
        ctx.moveTo(W*0.5,H*0.32);
        ctx.lineTo(W*0.5,H*0.52);
        ctx.stroke();
        ctx.fillStyle='#a82a32';
        ctx.beginPath();
        ctx.moveTo(W*0.5,H*0.34);
        ctx.bezierCurveTo(W*0.5+W*0.08,H*0.31,W*0.5+W*0.11,H*0.38,W*0.5+W*0.13,H*0.41);
        ctx.bezierCurveTo(W*0.5+W*0.1,H*0.48,W*0.5+W*0.05,H*0.5,W*0.5,H*0.47);
        ctx.closePath();
        ctx.fill();
        ctx.strokeStyle='#5a1018';
        ctx.lineWidth=2;
        ctx.stroke();
        ctx.fillStyle='#1a1410';
        ctx.font='bold '+(Math.max(16,W*0.024))+'px "Noto Serif SC","STKaiti",serif';
        ctx.textAlign='center';
        ctx.textBaseline='middle';
        ctx.fillText('征',W*0.5+W*0.065,H*0.42);
        // === 烟雾 ===
        function drawSmoke(sx,sy,sr,color,opacity){
          var g=ctx.createRadialGradient(sx,sy,0,sx,sy,sr);
          g.addColorStop(0,color);
          g.addColorStop(1,'rgba(26,20,16,0)');
          ctx.globalAlpha=opacity;
          ctx.fillStyle=g;
          ctx.beginPath();
          ctx.arc(sx,sy,sr,0,Math.PI*2);
          ctx.fill();
          ctx.globalAlpha=1;
        }
        ctx.save();
        ctx.globalCompositeOperation='screen';
        drawSmoke(W*0.25,H*0.72,Math.max(80,W*0.1),'rgba(200,190,180,0.5)',0.35);
        drawSmoke(W*0.45,H*0.75,Math.max(100,W*0.13),'rgba(180,170,160,0.4)',0.3);
        drawSmoke(W*0.65,H*0.73,Math.max(90,W*0.11),'rgba(190,180,170,0.45)',0.32);
        drawSmoke(W*0.8,H*0.7,Math.max(70,W*0.09),'rgba(170,160,150,0.35)',0.28);
        drawSmoke(W*0.3,H*0.6,Math.max(60,W*0.08),'rgba(150,140,130,0.3)',0.2);
        drawSmoke(W*0.7,H*0.58,Math.max(50,W*0.07),'rgba(140,130,120,0.25)',0.18);
        ctx.restore();
        // === 攻城器械 ===
        ctx.globalAlpha=0.75;
        ctx.fillStyle='#3a3530';
        ctx.fillRect(W*0.04,H*0.68,W*0.06,Math.max(6,H*0.012));
        ctx.fillRect(W*0.055,H*0.66,W*0.01,H*0.04);
        ctx.strokeStyle='#4a4540';
        ctx.lineWidth=3;
        ctx.beginPath();
        ctx.moveTo(W*0.065,H*0.66);
        ctx.lineTo(W*0.1,H*0.62);
        ctx.stroke();
        ctx.beginPath();
        ctx.arc(W*0.04,H*0.71,Math.max(10,W*0.015),0,Math.PI*2);
        ctx.stroke();
        ctx.beginPath();
        ctx.arc(W*0.1,H*0.71,Math.max(10,W*0.015),0,Math.PI*2);
        ctx.stroke();
        ctx.fillStyle='#2a2520';
        ctx.fillRect(W*0.88,H*0.67,W*0.08,H*0.06);
        ctx.fillStyle='#1a1510';
        ctx.fillRect(W*0.89,H*0.69,W*0.06,H*0.03);
        ctx.strokeStyle='#4a4540';
        ctx.lineWidth=3;
        ctx.beginPath();
        ctx.arc(W*0.9,H*0.75,Math.max(12,W*0.018),0,Math.PI*2);
        ctx.stroke();
        ctx.beginPath();
        ctx.arc(W*0.95,H*0.75,Math.max(12,W*0.018),0,Math.PI*2);
        ctx.stroke();
        ctx.globalAlpha=1;
        // === 前景 ===
        ctx.fillStyle='#0f0d0b';
        ctx.beginPath();
        ctx.arc(W*0.06,H*0.92,Math.max(14,W*0.02),0,Math.PI*2);
        ctx.fill();
        ctx.fillRect(W*0.06-7,H*0.92,Math.max(14,W*0.02),H*0.08);
        ctx.beginPath();
        ctx.arc(W*0.94,H*0.92,Math.max(13,W*0.019),0,Math.PI*2);
        ctx.fill();
        ctx.fillRect(W*0.94-6,H*0.92,Math.max(13,W*0.019),H*0.08);
        ctx.fillStyle='#1a1510';
        ctx.fillRect(W*0.2,H*0.88,W*0.08,H*0.015);
        ctx.fillRect(W*0.75,H*0.89,W*0.06,H*0.012);
        ctx.strokeStyle='#5a5045';
        ctx.lineWidth=1.5;
        ctx.globalAlpha=0.3;
        ctx.beginPath();
        ctx.moveTo(0,H*0.96);
        ctx.bezierCurveTo(W*0.3,H*0.95,W*0.7,H*0.97,W,H*0.955);
        ctx.stroke();
        ctx.globalAlpha=1;
        // === 暗角 ===
        var vig=ctx.createRadialGradient(W/2,H/2,H*0.35,W/2,H/2,Math.max(W,H)*0.75);
        vig.addColorStop(0,'rgba(0,0,0,0)');
        vig.addColorStop(1,'rgba(0,0,0,0.45)');
        ctx.fillStyle=vig;
        ctx.fillRect(0,0,W,H);
      }catch(e){}
    })();
  </script>'''

new = '''    <div class="menu-battlefield">
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

if old in content:
    content = content.replace(old, new)
    with open(path, 'w', encoding='utf-8') as f:
        f.write(content)
    print("replaced with lightweight canvas")
else:
    print("old string not found")
