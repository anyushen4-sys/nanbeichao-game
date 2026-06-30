import re

path = r"G:\Hermes项目\card-game-design\game\index.html"
with open(path, 'r', encoding='utf-8') as f:
    content = f.read()

old = '''    <div class="menu-battlefield">
    <canvas id="coverCanvas" style="width:100%;height:100%;object-fit:cover;opacity:0.9"></canvas>
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
        // 底色
        var bg=ctx.createLinearGradient(0,0,0,H);
        bg.addColorStop(0,'#0f0b08');
        bg.addColorStop(0.45,'#1a1410');
        bg.addColorStop(1,'#0a0806');
        ctx.fillStyle=bg;
        ctx.fillRect(0,0,W,H);
        // 远景山（柔和墨色）
        function drawMountain(yBase,height,color,opacity){
          ctx.globalAlpha=opacity;
          ctx.fillStyle=color;
          ctx.beginPath();
          ctx.moveTo(0,H);
          var step=W/6;
          for(var x=0;x<=W;x+=step){
            var y=yBase-Math.abs(Math.sin(x/W*Math.PI*2+height))*height;
            ctx.lineTo(x,y);
          }
          ctx.lineTo(W,H);
          ctx.closePath();
          ctx.fill();
          ctx.globalAlpha=1;
        }
        drawMountain(H*0.55,H*0.22,'#4a3e32',0.35);
        drawMountain(H*0.6,H*0.18,'#3a3028',0.45);
        drawMountain(H*0.68,H*0.14,'#2a2018',0.55);
        // 城墙
        var wallY=H*0.62;
        ctx.fillStyle='#12100d';
        ctx.globalAlpha=0.85;
        ctx.fillRect(W*0.12,wallY,W*0.76,H*0.22);
        ctx.globalAlpha=1;
        // 垛口
        ctx.strokeStyle='#6b5b45';
        ctx.lineWidth=2.5;
        ctx.beginPath();
        var cw=W*0.76/20;
        for(var i=0;i<20;i++){
          var x=W*0.12+i*cw;
          ctx.moveTo(x,wallY);
          ctx.lineTo(x+cw/2,wallY-12);
          ctx.lineTo(x+cw,wallY);
        }
        ctx.stroke();
        // 城楼
        ctx.fillStyle='#12100d';
        ctx.fillRect(W*0.42,wallY-50,W*0.16,50);
        ctx.strokeStyle='#6b5b45';
        ctx.lineWidth=2;
        ctx.strokeRect(W*0.42,wallY-50,W*0.16,50);
        ctx.beginPath();
        ctx.moveTo(W*0.42,wallY-50);
        ctx.lineTo(W*0.5,wallY-80);
        ctx.lineTo(W*0.58,wallY-50);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();
        ctx.fillStyle='#0a0806';
        ctx.fillRect(W*0.475,wallY-72,W*0.05,22);
        ctx.fillStyle='#D4A840';
        ctx.font='bold '+(Math.max(12,W*0.018))+'px "Noto Serif SC","STKaiti",serif';
        ctx.textAlign='center';
        ctx.fillText('天 下',W*0.5,wallY-55);
        // 城门
        ctx.fillStyle='#0a0806';
        ctx.beginPath();
        ctx.moveTo(W*0.465,wallY);
        ctx.lineTo(W*0.465,wallY+H*0.12);
        ctx.quadraticCurveTo(W*0.5,wallY+H*0.16,W*0.535,wallY+H*0.12);
        ctx.lineTo(W*0.535,wallY);
        ctx.closePath();
        ctx.fill();
        ctx.strokeStyle='#6b5b45';
        ctx.lineWidth=3;
        ctx.stroke();
        // 烽火
        function drawFire(cx,cy,r){
          var g=ctx.createRadialGradient(cx,cy,0,cx,cy,r);
          g.addColorStop(0,'rgba(255,123,46,0.9)');
          g.addColorStop(0.4,'rgba(255,69,0,0.6)');
          g.addColorStop(0.7,'rgba(139,37,0,0.2)');
          g.addColorStop(1,'rgba(139,0,0,0)');
          ctx.fillStyle=g;
          ctx.beginPath();
          ctx.arc(cx,cy,r,0,Math.PI*2);
          ctx.fill();
        }
        drawFire(W*0.08,H*0.42,Math.max(18,W*0.025));
        drawFire(W*0.92,H*0.42,Math.max(18,W*0.025));
        // 旌旗
        function drawFlag(fx,fy,dir){
          ctx.strokeStyle='#4a3e32';
          ctx.lineWidth=3;
          ctx.beginPath();
          ctx.moveTo(fx,fy);
          ctx.lineTo(fx,fy+H*0.18);
          ctx.stroke();
          ctx.fillStyle='#c41e3a';
          ctx.beginPath();
          ctx.moveTo(fx,fy+5);
          ctx.quadraticCurveTo(fx+dir*40,fy,dir*70,fy+15);
          ctx.quadraticCurveTo(fx+dir*40,fy+30,fx,fy+25);
          ctx.closePath();
          ctx.fill();
          ctx.strokeStyle='#5a1018';
          ctx.lineWidth=1.5;
          ctx.stroke();
        }
        drawFlag(W*0.12,H*0.38,1);
        drawFlag(W*0.88,H*0.37,-1);
        // 中旗
        ctx.strokeStyle='#6b5b45';
        ctx.lineWidth=4;
        ctx.beginPath();
        ctx.moveTo(W*0.5,H*0.35);
        ctx.lineTo(W*0.5,H*0.55);
        ctx.stroke();
        ctx.fillStyle='#c41e3a';
        ctx.beginPath();
        ctx.moveTo(W*0.5,H*0.36);
        ctx.quadraticCurveTo(W*0.5+W*0.1,H*0.34,W*0.5+W*0.12,H*0.39);
        ctx.quadraticCurveTo(W*0.5+W*0.1,H*0.45,W*0.5,H*0.42);
        ctx.closePath();
        ctx.fill();
        ctx.strokeStyle='#5a1018';
        ctx.lineWidth=2;
        ctx.stroke();
        ctx.fillStyle='#1a1410';
        ctx.font='bold '+(Math.max(14,W*0.022))+'px "Noto Serif SC","STKaiti",serif';
        ctx.textAlign='center';
        ctx.fillText('征',W*0.5+W*0.06,H*0.42);
        // 烟雾
        for(var i=0;i<3;i++){
          var sx=W*(0.25+i*0.25);
          var sy=H*(0.7+i*0.05);
          var sr=Math.max(60,W*0.12);
          var sg=ctx.createRadialGradient(sx,sy,0,sx,sy,sr);
          sg.addColorStop(0,'rgba(107,91,69,0.35)');
          sg.addColorStop(1,'rgba(26,20,16,0)');
          ctx.fillStyle=sg;
          ctx.beginPath();
          ctx.arc(sx,sy,sr,0,Math.PI*2);
          ctx.fill();
        }
        // 前景人物剪影
        ctx.fillStyle='#0a0806';
        ctx.beginPath();
        ctx.arc(W*0.08,H*0.88,Math.max(14,W*0.018),0,Math.PI*2);
        ctx.fill();
        ctx.fillRect(W*0.08-8,H*0.88,16,H*0.12);
        ctx.beginPath();
        ctx.arc(W*0.92,H*0.88,Math.max(13,W*0.016),0,Math.PI*2);
        ctx.fill();
        ctx.fillRect(W*0.92-7,H*0.88,14,H*0.12);
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

if old in content:
    content = content.replace(old, new)
    with open(path, 'w', encoding='utf-8') as f:
        f.write(content)
    print("replaced cover canvas successfully")
else:
    print("old string not found")
