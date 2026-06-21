import { FIREDAN_CONFIG, BREATH_CONFIG, FIRERAIN_CONFIG, GAME_CONFIG, WATERSHIELD_CONFIG } from '../config/gameConfig.js';

// 火弹类
export class Firedan {
  constructor(x, y, angle) {
    this.x = x;
    this.y = y;
    this.angle = angle;
    this.speed = FIREDAN_CONFIG.speed;
    this.size = FIREDAN_CONFIG.size;
    this.alive = true;
    this.distTraveled = 0;
    this.maxDist = FIREDAN_CONFIG.maxDist;
    this.trail = [];
    this.hasExploded = false;
  }

  update(enemies, explosions, particles, damageNumbers, gameTime) {
    if (!this.alive || this.hasExploded) return;

    const dx = Math.cos(this.angle) * this.speed;
    const dy = Math.sin(this.angle) * this.speed;
    this.x += dx;
    this.y += dy;
    this.distTraveled += this.speed;

    // 添加轨迹
    this.trail.push({ x: this.x, y: this.y, life: 12 });
    if (this.trail.length > 20) this.trail.shift();
    for (let i = this.trail.length - 1; i >= 0; i--) {
      this.trail[i].life--;
      if (this.trail[i].life <= 0) this.trail.splice(i, 1);
    }

    // 边界检测 - 出界直接销毁
    if (this.x < 0 || this.x > GAME_CONFIG.width || this.y < 0 || this.y > GAME_CONFIG.height) {
      this.alive = false;
      return;
    }

    // 最大距离检测 - 到最远距离时爆炸
    if (this.distTraveled >= this.maxDist) {
      this.explode(explosions, gameTime);
      return;
    }

    // 碰撞检测 - 击中敌人立即爆炸
    for (const enemy of enemies) {
      if (!enemy.alive) continue;
      const d = Math.hypot(this.x - enemy.x, this.y - enemy.y);
      if (d < this.size / 2 + enemy.size / 2) {
        this.explode(explosions, gameTime);
        return;
      }
    }
  }

  explode(explosions, gameTime) {
    if (this.hasExploded) return;
    this.hasExploded = true;
    this.alive = false;
    explosions.push(new Explosion(this.x, this.y, this.angle, gameTime));
  }

  draw(ctx, gameTime) {
    if (!this.alive) return;
    const x = Math.round(this.x);
    const y = Math.round(this.y);
    const s = this.size;

    // 绘制轨迹
    for (const t of this.trail) {
      const alpha = t.life / 16;
      const size = s * (0.2 + 0.8 * (t.life / 16));
      ctx.globalAlpha = alpha * 0.6;
      this.drawPixelRect(ctx, t.x - size / 2, t.y - size / 2, size, size, '#ff6b00');
      ctx.globalAlpha = alpha * 0.4;
      this.drawPixelRect(ctx, t.x - size / 4, t.y - size / 4 - 1, size / 2, size / 2, '#ffd93d');
    }
    ctx.globalAlpha = 1;

    // 绘制火弹
    this.drawPixelCircle(ctx, x, y, s * 0.9, '#ff4400');
    this.drawPixelCircle(ctx, x, y, s * 0.7, '#ff6b00');
    this.drawPixelCircle(ctx, x - 1, y - 2, s * 0.45, '#ffaa00');
    this.drawPixelCircle(ctx, x + 1, y + 1, s * 0.3, '#ffdd44');
    this.drawPixelRect(ctx, x - 2, y - 4, 3, 3, '#ffee88');

    // 火焰闪烁效果
    const flicker = Math.sin(gameTime * 20 + this.distTraveled) * 0.3 + 0.7;
    for (let i = 0; i < 3; i++) {
      const angle2 = gameTime * 5 + i * 2.1 + this.distTraveled * 0.1;
      const r = s * 0.9 + Math.sin(gameTime * 8 + i) * 2;
      const px = x + Math.cos(angle2) * r * 0.6;
      const py = y + Math.sin(angle2) * r * 0.4 - 2;
      const sz = 2 + Math.sin(gameTime * 10 + i * 2) * 1.5;
      ctx.globalAlpha = 0.5 + 0.4 * flicker;
      this.drawPixelRect(ctx, px - sz / 2, py - sz / 2, sz, sz, '#ff8833');
      this.drawPixelRect(ctx, px - sz / 4, py - sz / 4 - 1, sz / 2, sz / 2, '#ffdd44');
    }
    ctx.globalAlpha = 1;
  }

  drawPixelRect(ctx, x, y, w, h, color) {
    ctx.fillStyle = color;
    ctx.fillRect(Math.round(x), Math.round(y), Math.round(w), Math.round(h));
  }

  drawPixelCircle(ctx, cx, cy, r, color) {
    ctx.fillStyle = color;
    const steps = 12;
    const angleStep = (Math.PI * 2) / steps;
    ctx.beginPath();
    for (let i = 0; i <= steps; i++) {
      const a = i * angleStep;
      const px = cx + Math.cos(a) * r;
      const py = cy + Math.sin(a) * r;
      i === 0 ? ctx.moveTo(px, py) : ctx.lineTo(px, py);
    }
    ctx.closePath();
    ctx.fill();
  }
}

// 爆炸类
export class Explosion {
  constructor(x, y, angle, gameTime) {
    this.x = x;
    this.y = y;
    this.radius = 0;
    this.maxRadius = FIREDAN_CONFIG.explosionRadius;
    this.life = 28;
    this.maxLife = 28;
    this.alive = true;
    this.doneDamage = false;
    this.particles = [];

    // 创建爆炸粒子
    for (let i = 0; i < 45; i++) {
      const ang = Math.random() * Math.PI * 2;
      const speed = Math.random() * 5 + 1.5;
      const size = Math.random() * 4 + 2;
      const colors = ['#ff4400', '#ff6b00', '#ff8800', '#ffaa00', '#ffdd44', '#ffffff'];
      this.particles.push({
        x: x + (Math.random() - 0.5) * 12,
        y: y + (Math.random() - 0.5) * 12,
        vx: Math.cos(ang) * speed * (Math.random() * 0.8 + 0.6),
        vy: Math.sin(ang) * speed * (Math.random() * 0.8 + 0.6),
        size: size,
        color: colors[Math.floor(Math.random() * colors.length)],
        life: Math.random() * 16 + 12,
        maxLife: 28,
      });
    }
  }

  update(enemies, particles, damageNumbers) {
    if (!this.alive) return;
    this.life--;
    this.radius = this.maxRadius * (1 - (this.life / this.maxLife) * 0.3);
    if (this.life <= 0) {
      this.alive = false;
      return;
    }

    // 更新粒子
    for (const p of this.particles) {
      p.x += p.vx;
      p.y += p.vy;
      p.vx *= 0.97;
      p.vy *= 0.97;
      p.vy += 0.05;
      p.life--;
      p.size *= 0.98;
    }

    // 应用爆炸伤害
    if (!this.doneDamage) {
      this.doneDamage = true;
      this.applyExplosionDamage(enemies, particles, damageNumbers);
    }
  }

  applyExplosionDamage(enemies, particles, damageNumbers) {
    for (const enemy of enemies) {
      if (!enemy.alive) continue;
      const d = Math.hypot(this.x - enemy.x, this.y - enemy.y);
      if (d > FIREDAN_CONFIG.explosionRadius) continue;
      const factor = 1 - (d / FIREDAN_CONFIG.explosionRadius);
      const damageFactor = 0.15 + 0.85 * factor;
      const impact = FIREDAN_CONFIG.damageImpactExplosionCenter * damageFactor;
      const burn = FIREDAN_CONFIG.damageBurnExplosionCenter * damageFactor;
      enemy.takeDamage(impact, burn);

      const color = factor > 0.6 ? '#ff4444' : '#ff8844';
      spawnHitParticles(particles, enemy.x, enemy.y, 8 + Math.floor(factor * 8), color);
      damageNumbers.push(new DamageNumber(enemy.x, enemy.y - 18, `-${Math.round(impact)}`, color));
    }
  }

  draw(ctx) {
    if (!this.alive) return;
    const x = Math.round(this.x);
    const y = Math.round(this.y);
    const r = Math.round(this.radius);
    const alpha = this.life / this.maxLife;

    // 绘制爆炸圈
    ctx.globalAlpha = alpha * 0.3;
    this.drawPixelCircle(ctx, x, y, r, '#ff4400');
    ctx.globalAlpha = alpha * 0.5;
    this.drawPixelCircle(ctx, x, y, r * 0.8, '#ff6600');
    ctx.globalAlpha = alpha * 0.7;
    this.drawPixelCircle(ctx, x, y, r * 0.55, '#ff8800');
    ctx.globalAlpha = alpha * 0.9;
    this.drawPixelCircle(ctx, x, y, r * 0.3, '#ffcc00');
    ctx.globalAlpha = 1;

    this.drawPixelCircle(ctx, x, y, r * 0.15, '#ffffff');

    // 绘制粒子
    for (const p of this.particles) {
      if (p.life <= 0 || p.size < 0.3) continue;
      const pa = p.life / p.maxLife;
      ctx.globalAlpha = pa * 0.9;
      const sz = Math.max(1, Math.round(p.size));
      this.drawPixelRect(ctx, p.x - sz / 2, p.y - sz / 2, sz, sz, p.color);
    }
    ctx.globalAlpha = 1;

    // 闪光效果
    if (this.life > this.maxLife * 0.7) {
      const flashAlpha = (this.life - this.maxLife * 0.7) / (this.maxLife * 0.3) * 0.3;
      ctx.globalAlpha = flashAlpha;
      this.drawPixelRect(ctx, 0, 0, GAME_CONFIG.width, GAME_CONFIG.height, '#ffffff');
      ctx.globalAlpha = 1;
    }
  }

  drawPixelRect(ctx, x, y, w, h, color) {
    ctx.fillStyle = color;
    ctx.fillRect(Math.round(x), Math.round(y), Math.round(w), Math.round(h));
  }

  drawPixelCircle(ctx, cx, cy, r, color) {
    ctx.fillStyle = color;
    const steps = 12;
    const angleStep = (Math.PI * 2) / steps;
    ctx.beginPath();
    for (let i = 0; i <= steps; i++) {
      const a = i * angleStep;
      const px = cx + Math.cos(a) * r;
      const py = cy + Math.sin(a) * r;
      i === 0 ? ctx.moveTo(px, py) : ctx.lineTo(px, py);
    }
    ctx.closePath();
    ctx.fill();
  }
}

// 伤害数字类
export class DamageNumber {
  constructor(x, y, text, color) {
    this.x = x;
    this.y = y;
    this.text = text;
    this.color = color;
    this.life = 40;
    this.maxLife = 40;
    this.alive = true;
    this.vy = -1.8;
    this.vx = (Math.random() - 0.5) * 1.2;
    this.size = 10 + (text.length > 3 ? 0 : 2);
  }

  update() {
    this.y += this.vy;
    this.vy *= 0.96;
    this.x += this.vx;
    this.life--;
    if (this.life <= 0) this.alive = false;
  }

  draw(ctx) {
    if (!this.alive) return;
    const alpha = this.life / this.maxLife;
    ctx.globalAlpha = alpha;
    ctx.font = `${this.size}px "Press Start 2P", monospace`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillStyle = 'rgba(0,0,0,0.6)';
    ctx.fillText(this.text, this.x + 1, this.y + 2);
    ctx.fillStyle = this.color;
    ctx.fillText(this.text, this.x, this.y);
    ctx.globalAlpha = 1;
  }
}

// 粒子生成函数
export function spawnHitParticles(particles, x, y, count, color) {
  for (let i = 0; i < count; i++) {
    const angle = Math.random() * Math.PI * 2;
    const speed = Math.random() * 3 + 1;
    particles.push({
      x: x + (Math.random() - 0.5) * 8,
      y: y + (Math.random() - 0.5) * 8,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed - 1,
      size: Math.random() * 3 + 2,
      color: color,
      life: Math.random() * 12 + 10,
      maxLife: 22,
      gravity: 0.08,
    });
  }
}

export function spawnDeathParticles(particles, x, y) {
  for (let i = 0; i < 20; i++) {
    const angle = Math.random() * Math.PI * 2;
    const speed = Math.random() * 5 + 1;
    const colors = ['#ff4444', '#ff8844', '#ffcc44', '#aa44ff'];
    particles.push({
      x: x + (Math.random() - 0.5) * 12,
      y: y + (Math.random() - 0.5) * 12,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed - 2,
      size: Math.random() * 4 + 2,
      color: colors[Math.floor(Math.random() * colors.length)],
      life: Math.random() * 20 + 15,
      maxLife: 35,
      gravity: 0.06,
    });
  }
}

// 龙熄术粒子
export function spawnBreathParticles(breathParticles, player, gameTime) {
  const angle = player.dir;
  const startX = player.x + Math.cos(angle) * 20;
  const startY = player.y + Math.sin(angle) * 20;

  for (let i = 0; i < 3; i++) {
    const spread = (Math.random() - 0.5) * BREATH_CONFIG.width * 0.5;
    const a = angle + spread;
    const dist = Math.random() * (BREATH_CONFIG.range - 10) + 10;
    const px = startX + Math.cos(a) * dist;
    const py = startY + Math.sin(a) * dist;
    const size = Math.random() * 5 + 3;
    const colors = ['#ff4400', '#ff6600', '#ff8800', '#ffaa00', '#ffcc44'];
    breathParticles.push({
      x: px,
      y: py,
      vx: (Math.random() - 0.5) * 1.2,
      vy: (Math.random() - 0.5) * 1.2 - Math.random() * 0.5,
      size: size,
      color: colors[Math.floor(Math.random() * colors.length)],
      life: Math.random() * 10 + 8,
      maxLife: 18,
    });
  }
}

// 流星类
export class Meteor {
  constructor(x, y, targetY, radius) {
    this.x = x;
    this.y = y;
    this.startY = y;
    this.targetY = targetY;
    this.radius = radius;
    this.size = 12;
    this.speed = FIRERAIN_CONFIG.meteorSpeed;
    this.alive = true;
    this.streakPoints = []; // 天空拖尾
    this.explosionFrame = 0;
  }

  update(enemies, particles, damageNumbers, gameTime) {
    if (!this.alive) return;

    // 记录轨迹点
    this.streakPoints.push({ x: this.x, y: this.y, age: 0 });
    if (this.streakPoints.length > 15) {
      this.streakPoints.shift();
    }
    for (const point of this.streakPoints) {
      point.age++;
    }

    // 快速下落
    this.y += this.speed;

    // 碰撞检测
    let hitEnemy = false;
    for (const enemy of enemies) {
      if (!enemy.alive) continue;
      const dToCenter = Math.hypot(this.x - enemy.x, this.y - enemy.y);
      if (dToCenter > this.radius + enemy.size + 20) continue;

      const d = Math.hypot(this.x - enemy.x, this.y - enemy.y);
      if (d < this.size / 2 + enemy.size / 2 + 15) {
        enemy.takeDamage(FIRERAIN_CONFIG.damagePerTick, FIRERAIN_CONFIG.damagePerTick * 0.5);
        spawnHitParticles(particles, this.x, this.y, 15, '#ff6600');
        damageNumbers.push(new DamageNumber(enemy.x, enemy.y - 16, `-${FIRERAIN_CONFIG.damagePerTick}`, '#ff6600'));
        this.createExplosion(particles, damageNumbers, enemies);
        hitEnemy = true;
        break;
      }
    }

    if (hitEnemy) {
      this.alive = false;
      return;
    }

    // 落地爆炸
    if (this.y >= this.targetY) {
      this.y = this.targetY;
      for (const enemy of enemies) {
        if (!enemy.alive) continue;
        const d = Math.hypot(this.x - enemy.x, this.y - enemy.y);
        if (d < this.radius * 0.7) {
          enemy.takeDamage(FIRERAIN_CONFIG.damagePerTick * 0.7, FIRERAIN_CONFIG.damagePerTick * 0.35);
          spawnHitParticles(particles, this.x, this.y, 10, '#ff8800');
          damageNumbers.push(new DamageNumber(enemy.x, enemy.y - 16, `-${Math.round(FIRERAIN_CONFIG.damagePerTick * 0.7)}`, '#ff8800'));
        }
      }
      this.createExplosion(particles, damageNumbers, enemies);
      this.alive = false;
    }
  }

  createExplosion(particles, damageNumbers, enemies) {
    // 大型爆炸特效
    for (let i = 0; i < 15; i++) {
      const angle = (i / 15) * Math.PI * 2 + Math.random() * 0.3;
      const speed = 2 + Math.random() * 4;
      const size = 4 + Math.random() * 6;
      particles.push({
        x: this.x,
        y: this.y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed - 2,
        size: size,
        color: Math.random() > 0.5 ? '#ff6600' : '#ffaa00',
        life: Math.random() * 15 + 12,
        maxLife: 27,
        gravity: 0.08,
      });
    }
    // 火焰核心
    for (let i = 0; i < 8; i++) {
      particles.push({
        x: this.x + (Math.random() - 0.5) * 20,
        y: this.y + (Math.random() - 0.5) * 10,
        vx: (Math.random() - 0.5) * 3,
        vy: -Math.random() * 3 - 1,
        size: 6 + Math.random() * 4,
        color: '#ff4400',
        life: Math.random() * 10 + 8,
        maxLife: 18,
        gravity: 0.02,
      });
    }
  }

  draw(ctx, gameTime) {
    if (!this.alive) return;

    // 绘制天空拖尾
    if (this.streakPoints.length > 1) {
      for (let i = 0; i < this.streakPoints.length - 1; i++) {
        const p1 = this.streakPoints[i];
        const p2 = this.streakPoints[i + 1];
        const alpha = (i / this.streakPoints.length) * 0.8;
        const width = (i / this.streakPoints.length) * this.size * 2;
        
        ctx.globalAlpha = alpha;
        ctx.strokeStyle = '#ff4400';
        ctx.lineWidth = width;
        ctx.lineCap = 'round';
        ctx.beginPath();
        ctx.moveTo(p1.x, p1.y);
        ctx.lineTo(p2.x, p2.y);
        ctx.stroke();
        
        // 内部亮线
        if (i > this.streakPoints.length * 0.5) {
          ctx.globalAlpha = alpha * 0.6;
          ctx.strokeStyle = '#ffaa00';
          ctx.lineWidth = width * 0.4;
          ctx.beginPath();
          ctx.moveTo(p1.x, p1.y);
          ctx.lineTo(p2.x, p2.y);
          ctx.stroke();
        }
      }
      ctx.globalAlpha = 1;
    }

    const x = Math.round(this.x);
    const y = Math.round(this.y);
    const s = this.size;

    // 流星头部 - 火焰核心
    ctx.fillStyle = '#ff2200';
    ctx.beginPath();
    ctx.arc(x, y, s * 1.5, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = '#ff5500';
    ctx.beginPath();
    ctx.arc(x, y, s * 1.1, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = '#ff8800';
    ctx.beginPath();
    ctx.arc(x, y, s * 0.8, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = '#ffcc00';
    ctx.beginPath();
    ctx.arc(x, y, s * 0.5, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.arc(x, y, s * 0.2, 0, Math.PI * 2);
    ctx.fill();

    // 周围火焰
    const flicker = Math.sin(gameTime * 20 + this.x) * 0.3 + 0.7;
    for (let i = 0; i < 6; i++) {
      const angle = gameTime * 12 + i * (Math.PI / 3);
      const dist = s * 1.8;
      const px = x + Math.cos(angle) * dist;
      const py = y + Math.sin(angle) * dist * 0.6;
      const sz = 5 + Math.sin(gameTime * 18 + i * 1.5) * 2;
      ctx.globalAlpha = 0.6 * flicker;
      ctx.fillStyle = '#ff6600';
      ctx.fillRect(px - sz / 2, py - sz / 2, sz, sz);
    }
    ctx.globalAlpha = 1;
  }

  drawPixelRect(ctx, x, y, w, h, color) {
    ctx.fillStyle = color;
    ctx.fillRect(Math.round(x), Math.round(y), Math.round(w), Math.round(h));
  }
}

// 火雨术类
export class Firerain {
  constructor(x, y) {
    this.x = x;
    this.y = y;
    this.radius = FIRERAIN_CONFIG.range;
    this.duration = FIRERAIN_CONFIG.duration;
    this.elapsed = 0;
    this.meteorTimer = 0;
    this.alive = true;
    this.meteors = [];
    
    // 预计算均匀分布的流星位置（网格+抖动）
    this.meteorPositions = this.generateMeteorPositions();
    this.meteorIndex = 0;
  }

  generateMeteorPositions() {
    const positions = [];
    const count = FIRERAIN_CONFIG.meteorCount;
    const r = this.radius * 0.85; // 有效范围
    
    // 使用黄金角分布实现更均匀的分布
    const goldenAngle = Math.PI * (3 - Math.sqrt(5));
    for (let i = 0; i < count; i++) {
      // 径向距离使用平方根实现均匀面积分布
      const radiusRatio = Math.sqrt((i + 0.5) / count);
      const angle = i * goldenAngle;
      const dist = radiusRatio * r;
      
      // 添加小量随机抖动避免完全规律
      const jitterX = (Math.random() - 0.5) * r * 0.15;
      const jitterY = (Math.random() - 0.5) * r * 0.15;
      
      positions.push({
        x: this.x + Math.cos(angle) * dist + jitterX,
        y: this.y + Math.sin(angle) * dist + jitterY,
        fallTime: 1.2 + Math.random() * 0.8 // 随机下落时间，让流星错开落地
      });
    }
    
    return positions;
  }

  update(enemies, particles, damageNumbers, gameTime, dt) {
    if (!this.alive) return;

    this.elapsed += dt;
    if (this.elapsed >= this.duration) {
      this.alive = false;
      return;
    }

    // 生成流星（固定间隔，持续生成直到技能结束）
    this.meteorTimer += dt;
    if (this.meteorTimer >= FIRERAIN_CONFIG.meteorInterval) {
      this.meteorTimer = 0;
      
      // 循环使用预计算的位置
      const posIndex = this.meteorIndex % this.meteorPositions.length;
      const pos = this.meteorPositions[posIndex];
      
      // 流星从非常高处快速落下
      const meteorX = pos.x + (Math.random() - 0.5) * 20;
      const meteorY = this.y - this.radius - 200; // 从很高处开始
      const targetY = pos.y; // 落到预定位置
      
      this.meteors.push(new Meteor(meteorX, meteorY, targetY, this.radius * 0.5));
      this.meteorIndex++;
    }

    // 更新流星
    for (const meteor of this.meteors) {
      meteor.update(enemies, particles, damageNumbers, gameTime);
    }
    this.meteors = this.meteors.filter(m => m.alive);

    // 对范围内敌人持续伤害
    for (const enemy of enemies) {
      if (!enemy.alive) continue;
      const d = Math.hypot(this.x - enemy.x, this.y - enemy.y);
      if (d < this.radius) {
        enemy.takeDamage(0, FIRERAIN_CONFIG.damagePerTick * 0.15);
      }
    }
  }

  draw(ctx) {
    if (!this.alive) return;
    const x = Math.round(this.x);
    const y = Math.round(this.y);
    const r = this.radius;

    // 绘制范围指示 - 更明显的火焰区域
    const progress = this.elapsed / this.duration;
    let alpha;
    if (progress < 0.15) {
      alpha = progress * 8 * 0.25;
    } else if (progress > 0.85) {
      alpha = (1 - progress) * 6.67 * 0.25;
    } else {
      alpha = 0.25;
    }

    // 外圈火焰区域
    ctx.globalAlpha = alpha;
    ctx.fillStyle = '#cc2200';
    ctx.beginPath();
    ctx.arc(x, y, r, 0, Math.PI * 2);
    ctx.fill();

    // 内圈更亮
    ctx.globalAlpha = alpha * 0.7;
    ctx.fillStyle = '#ff4400';
    ctx.beginPath();
    ctx.arc(x, y, r * 0.7, 0, Math.PI * 2);
    ctx.fill();

    // 核心区域
    ctx.globalAlpha = alpha * 0.5;
    ctx.fillStyle = '#ff6600';
    ctx.beginPath();
    ctx.arc(x, y, r * 0.4, 0, Math.PI * 2);
    ctx.fill();

    // 边缘火焰闪烁效果
    ctx.globalAlpha = 0.5 + Math.sin(this.elapsed * 12) * 0.2;
    ctx.strokeStyle = '#ffcc00';
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.arc(x, y, r, 0, Math.PI * 2);
    ctx.stroke();
    ctx.globalAlpha = 1;

    // 绘制流星
    for (const meteor of this.meteors) {
      meteor.draw(ctx, this.elapsed);
    }
  }
}

// 水波罩类
export class WaterShield {
  constructor(x, y) {
    this.x = x;
    this.y = y;
    this.radius = WATERSHIELD_CONFIG.radius;
    this.elapsed = 0;
    this.alive = true;
    
    // 水波效果
    this.ripples = [];
    this.rippleTimer = 0;
  }

  update(x, y, dt) {
    if (!this.alive) return;

    this.x = x;
    this.y = y;
    this.elapsed += dt;

    // 生成水波
    this.rippleTimer += dt;
    if (this.rippleTimer >= WATERSHIELD_CONFIG.rippleInterval) {
      this.rippleTimer = 0;
      this.addRipple();
    }

    // 更新水波 - 基于阻尼系数的物理衰减
    for (const ripple of this.ripples) {
      const distToEdge = ripple.maxRadius - ripple.radius;
      
      // 应用阻尼系数（类似波动方程中的衰减）
      ripple.speed *= ripple.damping;
      
      // 计算速度比例（用于颜色变淡）
      const speedRatio = ripple.speed / ripple.initialSpeed;
      
      // 颜色透明度随速度比例变化
      ripple.alpha = speedRatio;
      
      // 当到达边缘时停止
      if (distToEdge <= ripple.speed || ripple.speed < 0.01) {
        ripple.radius = ripple.maxRadius;
        ripple.alpha = 0;
      } else {
        ripple.radius += ripple.speed;
      }
    }
    this.ripples = this.ripples.filter(r => r.alpha > 0.01);

    // 限制水波数量
    while (this.ripples.length > WATERSHIELD_CONFIG.maxRipples) {
      this.ripples.shift();
    }
  }

  addRipple() {
    this.ripples.push({
      radius: 5,
      speed: 1.2, // 初始速度
      initialSpeed: 1.2, // 保存初始速度用于计算比例
      alpha: 1.0,
      maxRadius: this.radius,
      damping: 0.980, // 阻尼系数
    });
  }

  draw(ctx) {
    if (!this.alive) return;

    const x = Math.round(this.x);
    const y = Math.round(this.y);
    const r = this.radius;

    // 水球主体 - 半透明蓝色渐变
    const gradient = ctx.createRadialGradient(x, y, 0, x, y, r);
    gradient.addColorStop(0, 'rgba(60, 180, 255, 0.15)');
    gradient.addColorStop(0.4, 'rgba(40, 150, 255, 0.25)');
    gradient.addColorStop(0.7, 'rgba(30, 120, 230, 0.35)');
    gradient.addColorStop(1, 'rgba(20, 100, 200, 0.2)');

    ctx.globalAlpha = 0.8 + Math.sin(this.elapsed * 3) * 0.1;
    ctx.fillStyle = gradient;
    ctx.beginPath();
    ctx.arc(x, y, r, 0, Math.PI * 2);
    ctx.fill();

    // 水球边缘高光
    ctx.globalAlpha = 0.4 + Math.sin(this.elapsed * 4) * 0.1;
    ctx.strokeStyle = '#88ddff';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(x, y, r, 0, Math.PI * 2);
    ctx.stroke();

    // 绘制水波
    for (const ripple of this.ripples) {
      if (ripple.alpha <= 0) continue;
      
      // 根据速度比例计算粗细
      const speedRatio = ripple.speed / ripple.initialSpeed;
      const lineWidth = 2 + speedRatio * 1.5;
      
      // 主水波
      ctx.globalAlpha = ripple.alpha * 0.9;
      ctx.strokeStyle = '#88ddff';
      ctx.lineWidth = lineWidth;
      ctx.beginPath();
      ctx.arc(x, y, ripple.radius, 0, Math.PI * 2);
      ctx.stroke();

      // 第二层水波
      ctx.globalAlpha = ripple.alpha * 0.5;
      ctx.strokeStyle = '#aaddff';
      ctx.lineWidth = lineWidth * 0.6;
      ctx.beginPath();
      ctx.arc(x, y, ripple.radius + 4, 0, Math.PI * 2);
      ctx.stroke();
    }

    ctx.globalAlpha = 1;
  }

  canBlockDamage(damage) {
    return damage <= WATERSHIELD_CONFIG.minDamageToBlock;
  }

  reduceDamage(damage) {
    return damage * (1 - WATERSHIELD_CONFIG.damageReduction);
  }
}