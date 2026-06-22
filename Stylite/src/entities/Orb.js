// 珠子类
export class Orb {
  constructor(x, y) {
    this.x = x;
    this.y = y;
    this.radius = 6;
    this.alive = true;
    this.life = 15; // 存活时间（秒）
    this.bobTimer = Math.random() * Math.PI * 2; // 上下浮动计时器
    this.glowPhase = Math.random() * Math.PI * 2; // 发光相位
  }

  update(dt) {
    if (!this.alive) return;

    this.life -= dt;
    if (this.life <= 0) {
      this.alive = false;
      return;
    }

    // 上下浮动效果
    this.bobTimer += dt * 3;
    this.glowPhase += dt * 4;
  }

  draw(ctx) {
    if (!this.alive) return;

    const bobOffset = Math.sin(this.bobTimer) * 3;
    const drawY = this.y + bobOffset;
    const glowIntensity = 0.5 + Math.sin(this.glowPhase) * 0.3;

    // 发光效果
    ctx.globalAlpha = glowIntensity * 0.4;
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.arc(this.x, drawY, this.radius * 2, 0, Math.PI * 2);
    ctx.fill();

    // 珠子本体
    ctx.globalAlpha = 0.9;
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.arc(this.x, drawY, this.radius, 0, Math.PI * 2);
    ctx.fill();

    // 高光
    ctx.globalAlpha = 1;
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.arc(this.x - 2, drawY - 2, this.radius * 0.4, 0, Math.PI * 2);
    ctx.fill();

    // 即将消失时的闪烁
    if (this.life < 3) {
      ctx.globalAlpha = (Math.sin(this.life * 10) + 1) * 0.5;
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(this.x, drawY, this.radius + 2, 0, Math.PI * 2);
      ctx.stroke();
    }

    ctx.globalAlpha = 1;
  }
}
