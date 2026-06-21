import { PLAYER_CONFIG, GAME_CONFIG, SLASH_CONFIG } from '../config/gameConfig.js';

export class Player {
  constructor() {
    this.x = GAME_CONFIG.width / 2;
    this.y = GAME_CONFIG.height / 2 + 40;
    this.size = PLAYER_CONFIG.size;
    this.speed = PLAYER_CONFIG.speed;
    this.dir = 0; // 弧度，面向方向
    this.alive = true;

    // 挥剑斩击状态
    this.isSlashing = false;
    this.slashTimer = 0;
    this.slashAngle = 0; // 斩击的起始角度
    this.slashDirection = 1; // 斩击方向 1=顺时针 -1=逆时针
    this.slashCooldownTimer = 0;
  }

  update(keys, mouseX, mouseY) {
    // 移动
    let dx = 0, dy = 0;
    if (keys.w || keys.up) dy = -1;
    if (keys.s || keys.down) dy = 1;
    if (keys.a || keys.left) dx = -1;
    if (keys.d || keys.right) dx = 1;

    if (dx !== 0 || dy !== 0) {
      const len = Math.hypot(dx, dy);
      dx /= len;
      dy /= len;
      this.x += dx * this.speed;
      this.y += dy * this.speed;

      // 如果不是斩击状态，才更新朝向
      if (!this.isSlashing) {
        this.dir = Math.atan2(dy, dx);
      }
    }

    // 边界限制
    this.x = Math.max(20, Math.min(GAME_CONFIG.width - 20, this.x));
    this.y = Math.max(20, Math.min(GAME_CONFIG.height - 20, this.y));

    // 非斩击时面向鼠标
    if (!this.isSlashing) {
      const angleToMouse = Math.atan2(mouseY - this.y, mouseX - this.x);
      if (Math.hypot(mouseX - this.x, mouseY - this.y) > 5) {
        this.dir = angleToMouse;
      }
    }
  }

  draw(ctx) {
    const x = Math.round(this.x);
    const y = Math.round(this.y);
    const s = this.size;
    const half = s / 2;

    // 阴影
    this.drawPixelRect(ctx, x - half + 4, y + half - 3, s - 8, 4, 'rgba(0,0,0,0.3)');

    // 身体
    this.drawPixelRect(ctx, x - half, y - half + 4, s, s - 8, '#4a7db4');
    this.drawPixelRect(ctx, x - half + 2, y - half + 2, s - 4, 4, '#6a9dd4');
    this.drawPixelRect(ctx, x - half + 4, y + half - 10, s - 8, 6, '#3a6d94');
    this.drawPixelRect(ctx, x - half + 6, y + half - 6, 2, 4, '#2a5d84');
    this.drawPixelRect(ctx, x + half - 8, y + half - 6, 2, 4, '#2a5d84');

    // 头部
    this.drawPixelRect(ctx, x - half + 4, y - half, s - 8, 6, '#f5d0b8');
    this.drawPixelRect(ctx, x - half + 2, y - half - 2, s - 4, 4, '#6a4a3a');
    this.drawPixelRect(ctx, x - half, y - half, 4, 4, '#6a4a3a');
    this.drawPixelRect(ctx, x + half - 4, y - half, 4, 4, '#6a4a3a');

    // 眼睛（跟随朝向）
    const eyeOff = 4;
    const eyeX = x + Math.cos(this.dir) * eyeOff;
    const eyeY = y - 3 + Math.sin(this.dir) * eyeOff * 0.3;
    const eyeOff2 = 3;
    const ex1 = x - eyeOff2 + Math.cos(this.dir) * 2;
    const ey1 = y - 3 + Math.sin(this.dir) * 0.8;
    const ex2 = x + eyeOff2 + Math.cos(this.dir) * 2;
    const ey2 = y - 3 + Math.sin(this.dir) * 0.8;

    this.drawPixelRect(ctx, ex1 - 1, ey1 - 1, 3, 3, '#ffffff');
    this.drawPixelRect(ctx, ex2 - 1, ey2 - 1, 3, 3, '#ffffff');
    const lookX = Math.round(Math.cos(this.dir) * 1.2);
    const lookY = Math.round(Math.sin(this.dir) * 1.2);
    this.drawPixelRect(ctx, ex1 + lookX, ey1 + lookY, 1.5, 1.5, '#1a1a2e');
    this.drawPixelRect(ctx, ex2 + lookX, ey2 + lookY, 1.5, 1.5, '#1a1a2e');

    // 嘴巴
    this.drawPixelRect(ctx, x - 2, y + 3, 4, 1.5, '#b07a6a');

    // 法杖（作为剑）
    const staffX = x + Math.cos(this.dir + 0.5) * half * 0.9;
    const staffY = y + Math.sin(this.dir + 0.5) * half * 0.9;
    this.drawPixelRect(ctx, staffX - 1, staffY - half, 2, half + 4, '#8a7a5a');
    this.drawPixelRect(ctx, staffX - 3, staffY - half - 2, 6, 4, '#c8a86a');
    this.drawPixelRect(ctx, staffX - 2, staffY - half - 4, 4, 3, '#ff8844');

    // 如果正在斩击，绘制剑和斩击特效
    if (this.isSlashing) {
      this.drawSlash(ctx, x, y);
    }
  }

  drawSlash(ctx, playerX, playerY) {
    const swordLen = 50;
    const arc = SLASH_CONFIG.arc; // 270度
    
    // 斩击进度 (0 -> 1)
    const progress = 1 - (this.slashTimer / SLASH_CONFIG.duration);
    
    // 根据方向计算角度：顺时针(slashDirection=1)或逆时针(slashDirection=-1)
    const direction = this.slashDirection;
    const startAngle = this.slashAngle - arc / 2 * direction;
    const endAngle = this.slashAngle + arc / 2 * direction;
    const currentAngle = startAngle + (endAngle - startAngle) * progress;
    
    // 计算剑尖位置
    const swordEndX = playerX + Math.cos(currentAngle) * swordLen;
    const swordEndY = playerY + Math.sin(currentAngle) * swordLen;
    
    // 绘制残影（过去的位置）
    for (let i = 0; i < 8; i++) {
      const trailProgress = Math.max(0, progress - i * 0.08);
      const trailAngle = startAngle + (endAngle - startAngle) * trailProgress;
      const trailEndX = playerX + Math.cos(trailAngle) * swordLen * (0.9 - i * 0.08);
      const trailEndY = playerY + Math.sin(trailAngle) * swordLen * (0.9 - i * 0.08);
      
      const alpha = (1 - i / 8) * 0.4 * (1 - progress * 0.5);
      const lineWidth = 6 - i * 0.5;
      
      ctx.globalAlpha = alpha;
      ctx.strokeStyle = '#aaccff';
      ctx.lineWidth = lineWidth;
      ctx.lineCap = 'round';
      ctx.beginPath();
      ctx.moveTo(playerX, playerY);
      ctx.lineTo(trailEndX, trailEndY);
      ctx.stroke();
    }
    
    // 绘制主剑身
    ctx.globalAlpha = 0.9;
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 6;
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.moveTo(playerX, playerY);
    ctx.lineTo(swordEndX, swordEndY);
    ctx.stroke();
    
    // 剑刃高光
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(playerX, playerY);
    ctx.lineTo(swordEndX, swordEndY);
    ctx.stroke();
    
    // 绘制白刃轨迹（从起点到当前位置的弧形光刃）
    ctx.strokeStyle = `rgba(200, 230, 255, ${0.6 * (1 - progress * 0.5)})`;
    ctx.lineWidth = 8 - progress * 4;
    ctx.lineCap = 'round';
    // 确保arc按正确方向绘制
    const arcStartAngle = direction === 1 ? startAngle : currentAngle;
    const arcEndAngle = direction === 1 ? currentAngle : startAngle;
    ctx.beginPath();
    ctx.arc(playerX, playerY, swordLen * 0.85, arcStartAngle, arcEndAngle);
    ctx.stroke();
    
    // 内层光弧
    ctx.strokeStyle = `rgba(255, 255, 255, ${0.5 * (1 - progress * 0.3)})`;
    ctx.lineWidth = 4 - progress * 2;
    ctx.beginPath();
    ctx.arc(playerX, playerY, swordLen * 0.7, arcStartAngle, arcEndAngle);
    ctx.stroke();
    
    // 剑尖闪光
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.arc(swordEndX, swordEndY, 4 + Math.sin(progress * 10) * 2, 0, Math.PI * 2);
    ctx.fill();
    
    ctx.globalAlpha = 1;
  }

  drawPixelRect(ctx, x, y, w, h, color) {
    ctx.fillStyle = color;
    ctx.fillRect(Math.round(x), Math.round(y), Math.round(w), Math.round(h));
  }

  drawAim(ctx) {
    const x = this.x;
    const y = this.y;
    const angle = this.dir;
    const len = 40;

    ctx.strokeStyle = 'rgba(255,255,255,0.25)';
    ctx.lineWidth = 1;
    ctx.setLineDash([4, 6]);
    ctx.beginPath();
    ctx.moveTo(x + Math.cos(angle) * 18, y + Math.sin(angle) * 18);
    ctx.lineTo(x + Math.cos(angle) * len, y + Math.sin(angle) * len);
    ctx.stroke();
    ctx.setLineDash([]);

    const cx = x + Math.cos(angle) * len;
    const cy = y + Math.sin(angle) * len;
    ctx.strokeStyle = 'rgba(255,255,255,0.3)';
    ctx.lineWidth = 1;
    ctx.strokeRect(cx - 4, cy - 4, 8, 8);
    ctx.strokeRect(cx - 1, cy - 7, 2, 4);
    ctx.strokeRect(cx - 1, cy + 3, 2, 4);
    ctx.strokeRect(cx - 7, cy - 1, 4, 2);
    ctx.strokeRect(cx + 3, cy - 1, 4, 2);
  }
}