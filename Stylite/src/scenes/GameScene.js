import { Player } from '../entities/Player.js';
import { Enemy } from '../entities/Enemy.js';
import { Orb } from '../entities/Orb.js';
import { Firedan, Explosion, DamageNumber, Firerain, WaterShield, spawnHitParticles, spawnDeathParticles, spawnBreathParticles } from '../systems/SkillSystem.js';
import { GAME_CONFIG, ENEMY_CONFIG, FIREDAN_CONFIG, BREATH_CONFIG, FIRERAIN_CONFIG, SLASH_CONFIG, WATERSHIELD_CONFIG, UI_CONFIG } from '../config/gameConfig.js';

export class GameScene {
  constructor(canvas) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    this.ctx.imageSmoothingEnabled = false;

    // 游戏状态
    this.gameTime = 0;
    this.killCount = 0;
    this.screenShake = 0;

    // 玩家
    this.player = new Player();

    // 游戏对象
    this.enemies = [];
    this.fireballs = [];
    this.explosions = [];
    this.particles = [];
    this.damageNumbers = [];
    this.firerains = [];
    this.orbs = [];
    this.breathParticles = [];

    // 珠子拾取计数
    this.orbCount = 0;

    // 火弹冷却
    this.skillCooldownTimer = 0;

    // 龙熄术状态
    this.isBreathing = false;
    this.breathTimer = 0;
    this.breathCooldownTimer = 0;

    // 火雨术冷却
    this.firerainCooldownTimer = 0;

    // 挥剑斩击冷却
    this.slashCooldownTimer = 0;
    
    // 记录上一次斩击方向（1=顺时针，-1=逆时针）
    this.lastSlashDirection = 1;

    // 水波罩状态
    this.waterShield = null;
    this.waterShieldCooldownTimer = 0;

    // 输入状态
    this.keys = {};
    this.mouseX = GAME_CONFIG.width / 2;
    this.mouseY = GAME_CONFIG.height / 2;
    this.mouseDown = { left: false, right: false };

    // 敌人生成
    this.enemySpawnTimer = 0;
    this.autoSpawnEnemies = true;
    this.noCooldown = false;

    // UI元素
    this.fireballStatusEl = document.getElementById('fireballStatus');
    this.slashStatusEl = document.getElementById('slashStatus');
    this.breathStatusEl = document.getElementById('breathStatus');
    this.firerainStatusEl = document.getElementById('firerainStatus');
    this.waterShieldStatusEl = document.getElementById('waterShieldStatus');
    this.enemyCountEl = document.getElementById('enemyCount');
    this.killCountEl = document.getElementById('killCount');
    this.orbCountEl = document.getElementById('orbCount');

    // 初始化敌人
    this.initEnemies(6);
    this.enemySpawnTimer = 2;

    // 绑定事件
    this.bindEvents();

    // 启动游戏循环
    this.gameLoop();
  }

  initEnemies(count) {
    for (let i = 0; i < count; i++) {
      this.spawnEnemy();
    }
  }

  spawnEnemy() {
    if (this.enemies.filter(e => e.alive).length >= ENEMY_CONFIG.maxEnemies) return;

    let x, y, attempts = 0;
    do {
      const margin = 50;
      x = Math.random() * (GAME_CONFIG.width - 2 * margin) + margin;
      y = Math.random() * (GAME_CONFIG.height - 2 * margin) + margin;
      attempts++;
    } while (Math.hypot(x - this.player.x, y - this.player.y) < 150 && attempts < 30);

    const enemy = new Enemy(x, y, this.gameTime);
    this.enemies.push(enemy);
  }

  shootFiredan() {
    if (this.skillCooldownTimer > 0) return;

    const angle = Math.atan2(this.mouseY - this.player.y, this.mouseX - this.player.x);
    const fb = new Firedan(this.player.x, this.player.y, angle);
    this.fireballs.push(fb);
    this.skillCooldownTimer = this.noCooldown ? 0 : FIREDAN_CONFIG.cooldown;

    // 发射粒子效果
    for (let i = 0; i < 8; i++) {
      const a = angle + (Math.random() - 0.5) * 0.8;
      const spd = Math.random() * 2 + 0.5;
      this.particles.push({
        x: this.player.x + Math.cos(angle) * 16,
        y: this.player.y + Math.sin(angle) * 16,
        vx: Math.cos(a) * spd,
        vy: Math.sin(a) * spd - 0.5,
        size: Math.random() * 2 + 2,
        color: ['#ff6600', '#ffaa00', '#ff4400'][Math.floor(Math.random() * 3)],
        life: Math.random() * 8 + 6,
        maxLife: 14,
        gravity: 0.02,
      });
    }
  }

  shootFirerain() {
    if (this.firerainCooldownTimer > 0) return;

    // 在鼠标位置创建火雨术
    const fr = new Firerain(this.mouseX, this.mouseY);
    this.firerains.push(fr);
    this.firerainCooldownTimer = this.noCooldown ? 0 : FIRERAIN_CONFIG.cooldown;

    if (this.firerainStatusEl) {
      this.firerainStatusEl.textContent = `${FIRERAIN_CONFIG.cooldown.toFixed(1)}s`;
      this.firerainStatusEl.className = 'skill-status cooldown';
    }

    // 召唤特效
    for (let i = 0; i < 12; i++) {
      const angle = (i / 12) * Math.PI * 2;
      const dist = FIRERAIN_CONFIG.range * 0.8;
      const px = this.mouseX + Math.cos(angle) * dist;
      const py = this.mouseY + Math.sin(angle) * dist;
      this.particles.push({
        x: px,
        y: py,
        vx: (Math.random() - 0.5) * 3,
        vy: -Math.random() * 2 - 1,
        size: Math.random() * 4 + 3,
        color: '#ff6600',
        life: Math.random() * 15 + 10,
        maxLife: 25,
        gravity: 0.03,
      });
    }
  }

  activateWaterShield() {
    // 如果水波罩已激活，则关闭它
    if (this.waterShield && this.waterShield.alive) {
      this.waterShield.alive = false;
      this.waterShield = null;
      this.waterShieldCooldownTimer = this.noCooldown ? 0 : WATERSHIELD_CONFIG.cooldown;
      if (this.waterShieldStatusEl) {
        this.waterShieldStatusEl.textContent = '关闭';
        this.waterShieldStatusEl.className = 'skill-status cooldown';
      }
      return;
    }

    // 如果冷却中则返回
    if (this.waterShieldCooldownTimer > 0) return;

    // 创建水波罩
    this.waterShield = new WaterShield(this.player.x, this.player.y);

    if (this.waterShieldStatusEl) {
      this.waterShieldStatusEl.textContent = '进行中';
      this.waterShieldStatusEl.className = 'skill-status cooldown';
    }

    // 激活特效
    for (let i = 0; i < 20; i++) {
      const angle = (i / 20) * Math.PI * 2;
      const dist = WATERSHIELD_CONFIG.radius * 1.5;
      const px = this.player.x + Math.cos(angle) * dist;
      const py = this.player.y + Math.sin(angle) * dist;
      this.particles.push({
        x: px,
        y: py,
        vx: -Math.cos(angle) * 3,
        vy: -Math.sin(angle) * 3,
        size: Math.random() * 5 + 3,
        color: '#66ccff',
        life: Math.random() * 15 + 10,
        maxLife: 25,
        gravity: 0.02,
      });
    }
  }

  startBreath() {
    if (this.breathCooldownTimer > 0) return;
    if (this.isBreathing) return;

    this.isBreathing = true;
    this.breathTimer = BREATH_CONFIG.duration;
    this.player.isBreathing = true;
  }

  stopBreath() {
    this.isBreathing = false;
    this.breathTimer = 0;
    this.player.isBreathing = false;
  }

  updateBreath(dt) {
    // 冷却计时
    if (this.breathCooldownTimer > 0) {
      this.breathCooldownTimer -= dt;
      if (this.breathCooldownTimer <= 0) {
        this.breathCooldownTimer = 0;
        if (this.breathStatusEl) {
          this.breathStatusEl.textContent = '就绪';
          this.breathStatusEl.className = 'skill-status ready';
        }
      } else if (this.breathStatusEl) {
        this.breathStatusEl.textContent = `${this.breathCooldownTimer.toFixed(1)}s`;
      }
    }

    if (!this.isBreathing) return;

    // 持续时间减少
    this.breathTimer -= dt;
    if (this.breathTimer <= 0) {
      this.isBreathing = false;
      this.breathCooldownTimer = this.noCooldown ? 0 : BREATH_CONFIG.cooldown;
      this.player.isBreathing = false;
      if (this.breathStatusEl) {
        this.breathStatusEl.textContent = '冷却中';
        this.breathStatusEl.className = 'skill-status cooldown';
      }
      return;
    }

    // 更新玩家朝向鼠标
    const angleToMouse = Math.atan2(this.mouseY - this.player.y, this.mouseX - this.player.x);
    if (Math.hypot(this.mouseX - this.player.x, this.mouseY - this.player.y) > 5) {
      this.player.dir = angleToMouse;
    }

    // 喷射火焰粒子
    spawnBreathParticles(this.breathParticles, this.player, this.gameTime);

    // 伤害检测：锥形范围
    const range = BREATH_CONFIG.range;
    const halfWidth = BREATH_CONFIG.width / 2;
    const angle = this.player.dir;

    for (const enemy of this.enemies) {
      if (!enemy.alive) continue;
      const dx = enemy.x - this.player.x;
      const dy = enemy.y - this.player.y;
      const d = Math.hypot(dx, dy);
      if (d > range) continue;

      // 角度差
      let ang = Math.atan2(dy, dx);
      let diff = ang - angle;
      while (diff > Math.PI) diff -= 2 * Math.PI;
      while (diff < -Math.PI) diff += 2 * Math.PI;
      if (Math.abs(diff) > halfWidth) continue;

      // 施加伤害
      const damagePerSec = BREATH_CONFIG.damagePerSec;
      const impact = damagePerSec * dt;
      const burn = damagePerSec;
      enemy.takeDamage(impact, burn);

      // 粒子反馈
      spawnHitParticles(this.particles, enemy.x, enemy.y, 2, '#ff8844');
    }

    // 更新UI
    if (this.breathStatusEl) {
      this.breathStatusEl.textContent = `喷射 ${this.breathTimer.toFixed(1)}s`;
    }
  }

  updateSlash(dt) {
    // 冷却计时
    if (this.slashCooldownTimer > 0) {
      this.slashCooldownTimer -= dt;
      if (this.slashCooldownTimer <= 0) {
        this.slashCooldownTimer = 0;
        if (this.slashStatusEl) {
          this.slashStatusEl.textContent = '就绪';
          this.slashStatusEl.className = 'skill-status ready';
        }
      } else if (this.slashStatusEl) {
        this.slashStatusEl.textContent = `${this.slashCooldownTimer.toFixed(1)}s`;
      }
    }

    if (!this.player.isSlashing) return;

    // 斩击持续时间减少
    this.player.slashTimer -= dt;
    if (this.player.slashTimer <= 0) {
      this.player.isSlashing = false;
      return;
    }

    // 更新玩家朝向鼠标
    const angleToMouse = Math.atan2(this.mouseY - this.player.y, this.mouseX - this.player.x);
    if (Math.hypot(this.mouseX - this.player.x, this.mouseY - this.player.y) > 5) {
      this.player.dir = angleToMouse;
    }
  }

  performSlash() {
    if (this.slashCooldownTimer > 0) return;
    if (this.player.isSlashing) return;

    this.player.isSlashing = true;
    this.player.slashTimer = SLASH_CONFIG.duration;
    // 设置斩击起点为鼠标方向
    const angleToMouse = Math.atan2(this.mouseY - this.player.y, this.mouseX - this.player.x);
    this.player.slashAngle = angleToMouse;
    // 使用上一次斩击的相反方向
    this.player.slashDirection = -this.lastSlashDirection;
    this.lastSlashDirection = this.player.slashDirection;
    this.slashCooldownTimer = this.noCooldown ? 0 : SLASH_CONFIG.cooldown;

    if (this.slashStatusEl) {
      this.slashStatusEl.textContent = `${SLASH_CONFIG.cooldown.toFixed(1)}s`;
      this.slashStatusEl.className = 'skill-status cooldown';
    }

    // 更新玩家朝向鼠标
    this.player.dir = angleToMouse;

    // 斩击范围检测
    const range = SLASH_CONFIG.range;
    const arc = SLASH_CONFIG.arc;
    const angle = this.player.slashAngle;
    const direction = this.player.slashDirection;
    const startAngle = angle - arc / 2 * direction;
    const endAngle = angle + arc / 2 * direction;

    for (const enemy of this.enemies) {
      if (!enemy.alive) continue;
      const dx = enemy.x - this.player.x;
      const dy = enemy.y - this.player.y;
      const d = Math.hypot(dx, dy);
      if (d > range + enemy.size / 2) continue;

      // 角度检测（考虑方向）
      let ang = Math.atan2(dy, dx);
      let diff = ang - angle;
      while (diff > Math.PI) diff -= 2 * Math.PI;
      while (diff < -Math.PI) diff += 2 * Math.PI;
      // 顺时针时：角度从-startAngle到+startAngle
      // 逆时针时：角度从+startAngle到-startAngle
      if (Math.abs(diff) > arc / 2) continue;

      // 施加伤害
      enemy.takeDamage(SLASH_CONFIG.damage, 0);

      // 击退效果
      const knockbackAngle = Math.atan2(dy, dx);
      enemy.x += Math.cos(knockbackAngle) * SLASH_CONFIG.knockback;
      enemy.y += Math.sin(knockbackAngle) * SLASH_CONFIG.knockback;

      // 粒子反馈
      spawnHitParticles(this.particles, enemy.x, enemy.y, 10, '#ffffff');
      this.damageNumbers.push(new DamageNumber(enemy.x, enemy.y - 16, `-${SLASH_CONFIG.damage}`, '#ffffff'));

      // 屏幕震动
      this.screenShake = 0.15;
    }

    // 斩击特效粒子（根据方向生成）
    for (let i = 0; i < 18; i++) {
      const t = i / 18;
      const a = startAngle + (endAngle - startAngle) * t;
      const dist = range * 0.8;
      const px = this.player.x + Math.cos(a) * dist;
      const py = this.player.y + Math.sin(a) * dist;
      this.particles.push({
        x: px,
        y: py,
        vx: Math.cos(a) * 2,
        vy: Math.sin(a) * 2,
        size: 4 + Math.random() * 4,
        color: '#ffffff',
        life: Math.random() * 12 + 10,
        maxLife: 22,
        gravity: 0,
      });
    }
  }

  update() {
    const dt = 1 / 60;
    this.gameTime += dt;

    // 火雨术冷却
    if (this.firerainCooldownTimer > 0) {
      this.firerainCooldownTimer -= dt;
      if (this.firerainCooldownTimer <= 0) {
        this.firerainCooldownTimer = 0;
        if (this.firerainStatusEl) {
          this.firerainStatusEl.textContent = '就绪';
          this.firerainStatusEl.className = 'skill-status ready';
        }
      } else if (this.firerainStatusEl) {
        this.firerainStatusEl.textContent = `${this.firerainCooldownTimer.toFixed(1)}s`;
      }
    }

    // 火球冷却
    if (this.skillCooldownTimer > 0) {
      this.skillCooldownTimer -= dt;
      if (this.skillCooldownTimer < 0) this.skillCooldownTimer = 0;
      this.fireballStatusEl.textContent = '冷却中';
      this.fireballStatusEl.className = 'skill-status cooldown';
    } else {
      this.fireballStatusEl.textContent = '就绪';
      this.fireballStatusEl.className = 'skill-status';
    }

    // 水波罩冷却
    if (this.waterShieldCooldownTimer > 0) {
      this.waterShieldCooldownTimer -= dt;
      if (this.waterShieldCooldownTimer <= 0) {
        this.waterShieldCooldownTimer = 0;
        if (this.waterShieldStatusEl) {
          this.waterShieldStatusEl.textContent = '就绪';
          this.waterShieldStatusEl.className = 'skill-status';
        }
      } else if (this.waterShieldStatusEl && !(this.waterShield && this.waterShield.alive)) {
        this.waterShieldStatusEl.textContent = `${this.waterShieldCooldownTimer.toFixed(1)}s`;
      }
    }

    // 更新水波罩
    if (this.waterShield && this.waterShield.alive) {
      this.waterShield.update(this.player.x, this.player.y, dt);
    }

    // 更新挥剑斩击
    this.updateSlash(dt);

    // 更新龙熄术
    this.updateBreath(dt);

    // 玩家移动
    this.player.update(this.keys, this.mouseX, this.mouseY);

    // 更新敌人
    for (const enemy of this.enemies) {
      enemy.update(this.player, dt);
    }

    // 敌人死亡掉落珠子
    for (const enemy of this.enemies) {
      if (!enemy.alive && enemy.justDied) {
        enemy.justDied = false;
        // 掉落1-2个珠子
        const orbCount = Math.floor(Math.random() * 2) + 1;
        for (let i = 0; i < orbCount; i++) {
          const offsetX = (Math.random() - 0.5) * 20;
          const offsetY = (Math.random() - 0.5) * 20;
          this.orbs.push(new Orb(enemy.x + offsetX, enemy.y + offsetY));
        }
      }
    }
    this.enemies = this.enemies.filter(e => e.alive);

    // 更新火球
    for (const fb of this.fireballs) {
      fb.update(this.enemies, this.explosions, this.particles, this.damageNumbers, this.gameTime);
    }
    this.fireballs = this.fireballs.filter(fb => fb.alive);

    // 更新爆炸
    for (const exp of this.explosions) {
      exp.update(this.enemies, this.particles, this.damageNumbers);
    }
    this.explosions = this.explosions.filter(exp => exp.alive);

    // 更新火雨术
    for (const fr of this.firerains) {
      fr.update(this.enemies, this.particles, this.damageNumbers, this.gameTime, dt);
    }
    this.firerains = this.firerains.filter(fr => fr.alive);

    // 更新珠子
    for (const orb of this.orbs) {
      orb.update(dt);
    }
    this.orbs = this.orbs.filter(orb => orb.alive);

    // 珠子拾取检测
    const pickupRadius = 25;
    for (let i = this.orbs.length - 1; i >= 0; i--) {
      const orb = this.orbs[i];
      const dist = Math.hypot(orb.x - this.player.x, orb.y - this.player.y);
      if (dist < pickupRadius) {
        orb.alive = false;
        this.orbCount++;
        if (this.orbCountEl) {
          this.orbCountEl.textContent = this.orbCount;
        }
        // 拾取特效
        for (let j = 0; j < 8; j++) {
          const angle = (j / 8) * Math.PI * 2;
          this.particles.push({
            x: orb.x,
            y: orb.y,
            vx: Math.cos(angle) * 2,
            vy: Math.sin(angle) * 2,
            size: 3,
            color: '#ffffff',
            life: 10,
            maxLife: 10,
            gravity: 0,
          });
        }
      }
    }

    // 更新粒子
    for (const p of this.particles) {
      p.x += p.vx;
      p.y += p.vy;
      p.vy += p.gravity || 0.04;
      p.life--;
      p.size *= 0.98;
    }
    this.particles = this.particles.filter(p => p.life > 0 && p.size > 0.3);

    // 更新龙熄术粒子
    for (const p of this.breathParticles) {
      p.x += p.vx;
      p.y += p.vy;
      p.vy += 0.02;
      p.life--;
      p.size *= 0.97;
    }
    this.breathParticles = this.breathParticles.filter(p => p.life > 0 && p.size > 0.5);

    // 更新伤害数字
    for (const dn of this.damageNumbers) {
      dn.update();
    }
    this.damageNumbers = this.damageNumbers.filter(dn => dn.alive);

    // 屏幕震动
    if (this.screenShake > 0) this.screenShake *= 0.9;
    if (this.screenShake < 0.1) this.screenShake = 0;

    // 敌人生成
    if (this.autoSpawnEnemies) {
      this.enemySpawnTimer -= dt;
      if (this.enemySpawnTimer <= 0) {
        const alive = this.enemies.filter(e => e.alive).length;
        if (alive < ENEMY_CONFIG.maxEnemies) {
          this.spawnEnemy();
        }
        this.enemySpawnTimer = Math.random() * 2.5 + 2.0;
      }
    }

    // 统计击杀数
    const newKillCount = this.enemies.filter(e => !e.alive).length;
    if (newKillCount > this.killCount) {
      this.killCount = newKillCount;
    }

    // 更新UI
    const aliveCount = this.enemies.filter(e => e.alive).length;
    this.enemyCountEl.textContent = aliveCount;
    this.killCountEl.textContent = this.killCount;
  }

  draw() {
    this.ctx.save();

    // 屏幕震动
    if (this.screenShake > 0) {
      const shakeX = (Math.random() - 0.5) * this.screenShake * 1.2;
      const shakeY = (Math.random() - 0.5) * this.screenShake * 1.2;
      this.ctx.translate(shakeX, shakeY);
    }

    // 绘制背景
    this.drawBackground();

    // 绘制敌人
    for (const enemy of this.enemies) {
      enemy.draw(this.ctx, this.gameTime);
    }

    // 绘制火球
    for (const fb of this.fireballs) {
      fb.draw(this.ctx, this.gameTime);
    }

    // 绘制龙熄术粒子
    for (const p of this.breathParticles) {
      const alpha = p.life / p.maxLife;
      this.ctx.globalAlpha = alpha * 0.9;
      const sz = Math.max(1, Math.round(p.size));
      this.drawPixelRect(this.ctx, p.x - sz / 2, p.y - sz / 2, sz, sz, p.color);
      if (sz > 3) {
        this.ctx.globalAlpha = alpha * 0.5;
        this.drawPixelRect(this.ctx, p.x - sz / 4, p.y - sz / 4 - 1, sz / 2, sz / 2, '#ffdd44');
      }
    }
    this.ctx.globalAlpha = 1;

    // 绘制爆炸
    for (const exp of this.explosions) {
      exp.draw(this.ctx);
    }

    // 绘制火雨术
    for (const fr of this.firerains) {
      fr.draw(this.ctx);
    }

    // 绘制珠子
    for (const orb of this.orbs) {
      orb.draw(this.ctx);
    }

    // 绘制粒子
    for (const p of this.particles) {
      const alpha = p.life / p.maxLife;
      this.ctx.globalAlpha = alpha * 0.9;
      const sz = Math.max(1, Math.round(p.size));
      this.drawPixelRect(this.ctx, p.x - sz / 2, p.y - sz / 2, sz, sz, p.color);
    }
    this.ctx.globalAlpha = 1;

    // 绘制伤害数字
    for (const dn of this.damageNumbers) {
      dn.draw(this.ctx);
    }

    // 绘制水波罩（在玩家之前绘制，让玩家在水罩内）
    if (this.waterShield && this.waterShield.alive) {
      this.waterShield.draw(this.ctx);
    }

    // 绘制玩家
    this.player.draw(this.ctx);

    // 绘制瞄准指示器
    this.player.drawAim(this.ctx);

    // 绘制龙熄术指示器
    if (this.isBreathing) {
      this.drawBreathIndicator();
    }

    // 绘制火球轨迹预览
    if (this.skillCooldownTimer <= 0) {
      this.drawAimLine();
    }

    // 绘制底部信息
    this.drawBottomInfo();

    // 绘制战争迷雾
    this.drawFog();

    this.ctx.restore();
  }

  drawBackground() {
    this.drawPixelRect(this.ctx, 0, 0, GAME_CONFIG.width, GAME_CONFIG.height, '#2d5a27');

    const gridSize = 32;
    for (let x = 0; x < GAME_CONFIG.width; x += gridSize) {
      for (let y = 0; y < GAME_CONFIG.height; y += gridSize) {
        const bright = ((Math.floor(x / gridSize) + Math.floor(y / gridSize)) % 2 === 0) ? '#3a6a32' : '#2d5a27';
        this.drawPixelRect(this.ctx, x, y, gridSize, gridSize, bright);
      }
    }

    // 草地装饰
    for (let i = 0; i < 80; i++) {
      const x = (i * 137 + 50) % GAME_CONFIG.width;
      const y = (i * 251 + 30) % GAME_CONFIG.height;
      const size = 2 + (i % 3);
      const shade = i % 2 === 0 ? '#4a7a3a' : '#3a6a32';
      this.drawPixelRect(this.ctx, x, y, size, size + 2, shade);
      this.drawPixelRect(this.ctx, x + size, y + 1, size, size + 1, shade);
    }
  }

  drawAimLine() {
    const x = this.player.x;
    const y = this.player.y;
    const angle = this.player.dir;
    const maxDist = FIREDAN_CONFIG.maxDist;

    this.ctx.globalAlpha = 0.12;
    this.ctx.fillStyle = '#ff6600';
    for (let i = 0; i < maxDist; i += 6) {
      const px = x + Math.cos(angle) * i;
      const py = y + Math.sin(angle) * i;
      const size = 1 + (i / maxDist) * 2;
      this.drawPixelRect(this.ctx, px - size / 2, py - size / 2, size, size, '#ff8844');
    }
    this.ctx.globalAlpha = 1;

    const endX = x + Math.cos(angle) * maxDist;
    const endY = y + Math.sin(angle) * maxDist;
    this.ctx.globalAlpha = 0.3;
    this.ctx.strokeStyle = '#ff4400';
    this.ctx.lineWidth = 1;
    this.ctx.beginPath();
    this.ctx.arc(endX, endY, 8, 0, Math.PI * 2);
    this.ctx.stroke();
    this.ctx.globalAlpha = 0.15;
    this.drawPixelCircle(this.ctx, endX, endY, 12, '#ff4400');
    this.ctx.globalAlpha = 1;
  }

  drawBreathIndicator() {
    const x = this.player.x;
    const y = this.player.y;
    const angle = this.player.dir;
    const range = BREATH_CONFIG.range;
    const halfWidth = BREATH_CONFIG.width / 2;

    // 锥形范围
    this.ctx.globalAlpha = 0.15;
    this.ctx.fillStyle = '#ff4400';
    this.ctx.beginPath();
    this.ctx.moveTo(x, y);
    const steps = 20;
    for (let i = 0; i <= steps; i++) {
      const t = i / steps;
      const a = angle - halfWidth + t * BREATH_CONFIG.width;
      const r = range * (0.8 + 0.2 * Math.sin(t * Math.PI));
      const px = x + Math.cos(a) * r;
      const py = y + Math.sin(a) * r;
      i === 0 ? this.ctx.moveTo(px, py) : this.ctx.lineTo(px, py);
    }
    this.ctx.closePath();
    this.ctx.fill();

    // 边缘线
    this.ctx.globalAlpha = 0.3;
    this.ctx.strokeStyle = '#ff8844';
    this.ctx.lineWidth = 1;
    this.ctx.setLineDash([3, 5]);
    for (let side = -1; side <= 1; side += 2) {
      this.ctx.beginPath();
      const a = angle + side * halfWidth;
      this.ctx.moveTo(x + Math.cos(a) * 10, y + Math.sin(a) * 10);
      this.ctx.lineTo(x + Math.cos(a) * range, y + Math.sin(a) * range);
      this.ctx.stroke();
    }
    this.ctx.setLineDash([]);
    this.ctx.globalAlpha = 1;
  }

  drawBottomInfo() {
    this.ctx.font = '8px "Press Start 2P", monospace';
    this.ctx.fillStyle = 'rgba(0,0,0,0.5)';
    this.drawPixelRect(this.ctx, 10, GAME_CONFIG.height - 22, 200, 16, '#1a1a2e');
    this.ctx.fillStyle = '#8899bb';
    this.ctx.fillText('🔥1火弹 ⚔左键斩击 🐉2龙熄 · WASD', 16, GAME_CONFIG.height - 11);
  }

  drawFog() {
    // 计算屏幕震动后的角色位置
    const shakeX = this.screenShake > 0 ? (Math.random() - 0.5) * this.screenShake * 1.2 : 0;
    const shakeY = this.screenShake > 0 ? (Math.random() - 0.5) * this.screenShake * 1.2 : 0;

    // 角色在画布上的位置
    const px = this.player.x + shakeX;
    const py = this.player.y + shakeY;

    // 创建径向渐变迷雾
    const gradient = this.ctx.createRadialGradient(
      px, py, UI_CONFIG.fogRadius,
      px, py, UI_CONFIG.fogEdgeRadius
    );

    // 从清晰到完全黑暗
    gradient.addColorStop(0, 'rgba(0, 0, 0, 0)');
    gradient.addColorStop(0.3, 'rgba(0, 0, 0, 0.1)');
    gradient.addColorStop(0.5, 'rgba(0, 0, 0, 0.3)');
    gradient.addColorStop(0.7, 'rgba(0, 0, 0, 0.6)');
    gradient.addColorStop(1, 'rgba(0, 0, 0, 0.85)');

    // 绘制迷雾层
    this.ctx.fillStyle = gradient;
    this.ctx.fillRect(0, 0, GAME_CONFIG.width, GAME_CONFIG.height);
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

  bindEvents() {
    // 键盘事件
    document.addEventListener('keydown', (e) => {
      this.keys[e.key.toLowerCase()] = true;
      if (e.key === '1') {
        this.shootFiredan();
      }
      if (e.key === '2') {
        this.startBreath();
      }
      if (e.key === '3') {
        this.shootFirerain();
      }
      if (e.key === '4') {
        this.activateWaterShield();
      }
    });

    document.addEventListener('keyup', (e) => {
      this.keys[e.key.toLowerCase()] = false;
      if (e.key === '2') {
        this.stopBreath();
      }
    });

    // 鼠标事件
    this.canvas.addEventListener('mousemove', (e) => {
      const rect = this.canvas.getBoundingClientRect();
      const scaleX = this.canvas.width / rect.width;
      const scaleY = this.canvas.height / rect.height;
      this.mouseX = Math.max(0, Math.min(GAME_CONFIG.width, (e.clientX - rect.left) * scaleX));
      this.mouseY = Math.max(0, Math.min(GAME_CONFIG.height, (e.clientY - rect.top) * scaleY));
    });

    this.canvas.addEventListener('mousedown', (e) => {
      if (e.button === 0) {
        this.performSlash();
      }
    });

    this.canvas.addEventListener('contextmenu', (e) => e.preventDefault());

    // 触摸支持
    this.canvas.addEventListener('touchstart', (e) => {
      e.preventDefault();
      const rect = this.canvas.getBoundingClientRect();
      const scaleX = this.canvas.width / rect.width;
      const scaleY = this.canvas.height / rect.height;
      const touch = e.touches[0];
      this.mouseX = Math.max(0, Math.min(GAME_CONFIG.width, (touch.clientX - rect.left) * scaleX));
      this.mouseY = Math.max(0, Math.min(GAME_CONFIG.height, (touch.clientY - rect.top) * scaleY));
      this.shootFiredan();
    }, { passive: false });

    this.canvas.addEventListener('touchmove', (e) => {
      e.preventDefault();
      const rect = this.canvas.getBoundingClientRect();
      const scaleX = this.canvas.width / rect.width;
      const scaleY = this.canvas.height / rect.height;
      const touch = e.touches[0];
      this.mouseX = Math.max(0, Math.min(GAME_CONFIG.width, (touch.clientX - rect.left) * scaleX));
      this.mouseY = Math.max(0, Math.min(GAME_CONFIG.height, (touch.clientY - rect.top) * scaleY));
    }, { passive: false });
  }

  gameLoop() {
    this.update();
    this.draw();
    requestAnimationFrame(() => this.gameLoop());
  }
}