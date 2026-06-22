import { ENEMY_CONFIG, BURN_CONFIG } from '../config/gameConfig.js';

export class Enemy {
  constructor(x, y, gameTime) {
    this.x = x;
    this.y = y;
    this.size = ENEMY_CONFIG.size;
    this.hp = ENEMY_CONFIG.maxHp;
    this.maxHp = ENEMY_CONFIG.maxHp;
    this.speed = Math.random() * 0.7 + 0.5; // 0.5-1.2
    this.dir = Math.random() * Math.PI * 2;
    this.alive = true;
    this.hitFlash = 0;
    this.burnTimer = 0;
    this.burnDamagePerSec = 0;
    this.id = Math.random();

    // 随机颜色变体
    const hue = Math.floor(Math.random() * 20) + 340;
    this.colorMain = `hsl(${hue}, 70%, 48%)`;
    this.colorDark = `hsl(${hue}, 65%, 32%)`;
    this.colorLight = `hsl(${hue}, 75%, 58%)`;
    this.moveTimer = 0;
    this.gameTime = gameTime || 0;
  }

  takeDamage(impact, burnPerSec) {
    this.hp -= impact;
    this.hitFlash = 10;
    if (burnPerSec > 0) {
      this.burnTimer = BURN_CONFIG.duration;
      this.burnDamagePerSec = Math.max(this.burnDamagePerSec, burnPerSec);
    }
    if (this.hp <= 0) {
      this.hp = 0;
      this.justDied = true;
      this.alive = false;
    }
  }

  update(player, dt) {
    if (!this.alive) return;

    // 灼烧持续伤害
    if (this.burnTimer > 0) {
      this.burnTimer -= dt;
      const burnTick = this.burnDamagePerSec * dt;
      this.hp -= burnTick;
      if (this.hp <= 0) {
        this.hp = 0;
        this.justDied = true;
        this.alive = false;
        return;
      }
    }

    // 闪白衰减
    if (this.hitFlash > 0) this.hitFlash--;

    // 简单AI：缓慢向玩家靠近，带随机游走
    this.moveTimer -= dt;
    if (this.moveTimer <= 0) {
      this.moveTimer = Math.random() * 1.7 + 0.8; // 0.8-2.5
      const angleToPlayer = Math.atan2(player.y - this.y, player.x - this.x);
      this.dir = angleToPlayer + (Math.random() - 0.5) * 1.2;
    }
    const spd = this.speed * 0.8;
    this.x += Math.cos(this.dir) * spd;
    this.y += Math.sin(this.dir) * spd;

    // 边界限制
    this.x = Math.max(30, Math.min(800 - 30, this.x));
    this.y = Math.max(30, Math.min(600 - 30, this.y));
  }

  draw(ctx, gameTime) {
    if (!this.alive) return;
    const s = this.size;
    const x = Math.round(this.x);
    const y = Math.round(this.y);
    const half = s / 2;

    // 阴影
    this.drawPixelRect(ctx, x - half + 3, y + half - 2, s - 6, 4, 'rgba(0,0,0,0.3)');

    // 身体
    const baseColor = this.hitFlash > 0 ? '#ffffff' : this.colorMain;
    this.drawPixelRect(ctx, x - half, y - half + 2, s, s - 4, baseColor);
    this.drawPixelRect(ctx, x - half + 2, y - half, s - 4, 4, this.colorDark);

    // 眼睛
    const eyeY = y - 3;
    const eyeSpacing = 6;
    this.drawPixelRect(ctx, x - eyeSpacing - 3, eyeY - 2, 4, 4, '#ffffff');
    this.drawPixelRect(ctx, x + eyeSpacing - 1, eyeY - 2, 4, 4, '#ffffff');
    this.drawPixelRect(ctx, x - eyeSpacing - 2, eyeY - 1, 2, 2, '#1a1a2e');
    this.drawPixelRect(ctx, x + eyeSpacing, eyeY - 1, 2, 2, '#1a1a2e');

    // 嘴巴
    this.drawPixelRect(ctx, x - 3, y + 4, 6, 2, this.colorDark);

    // 血条
    const hpW = s + 6;
    const hpH = 4;
    const hpX = x - hpW / 2;
    const hpY = y - half - 8;
    this.drawPixelRect(ctx, hpX, hpY, hpW, hpH, '#2a1a1a');
    const hpRatio = this.hp / this.maxHp;
    const hpColor = hpRatio > 0.5 ? '#4ade80' : hpRatio > 0.25 ? '#facc15' : '#f87171';
    this.drawPixelRect(ctx, hpX + 1, hpY + 1, Math.max(0, (hpW - 2) * hpRatio), hpH - 2, hpColor);

    // 灼烧特效
    if (this.burnTimer > 0) {
      const intensity = Math.min(1, this.burnTimer / 0.5);
      const flicker = Math.sin(gameTime * 20 + this.id * 100) * 0.2 + 0.8;
      const alpha = intensity * 0.7 * flicker;
      const r = half + 4 + Math.sin(gameTime * 10 + this.id) * 2;

      for (let i = 0; i < 4; i++) {
        const angle = gameTime * 3 + i * 1.57 + this.id * 2;
        const px = x + Math.cos(angle) * r * 0.7;
        const py = y + Math.sin(angle) * r * 0.5 - 2;
        const size = 3 + Math.sin(gameTime * 8 + i + this.id) * 1.5;
        ctx.globalAlpha = alpha * (0.6 + 0.4 * Math.sin(gameTime * 6 + i + this.id));
        this.drawPixelRect(ctx, px - size / 2, py - size / 2, size, size, '#ff6b35');
        this.drawPixelRect(ctx, px - size / 4, py - size / 4 - 1, size / 2, size / 2, '#ffd93d');
      }
      ctx.globalAlpha = 1;

      const flicker2 = Math.sin(gameTime * 15 + this.id * 50) * 0.3 + 0.7;
      this.drawPixelRect(ctx, x - 4, y - half - 14, 8, 4 + flicker2 * 2, '#ff6b35');
      this.drawPixelRect(ctx, x - 2, y - half - 16 - flicker2 * 2, 4, 4, '#ffd93d');
    }
  }

  drawPixelRect(ctx, x, y, w, h, color) {
    ctx.fillStyle = color;
    ctx.fillRect(Math.round(x), Math.round(y), Math.round(w), Math.round(h));
  }
}