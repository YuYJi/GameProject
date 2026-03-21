import Phaser from 'phaser';

export class Bullet extends Phaser.GameObjects.Container {
  private graphics: Phaser.GameObjects.Graphics;
  private body: Phaser.Physics.Arcade.Body;
  private speed = 400;
  private active = false;

  constructor(scene: Phaser.Scene, x: number, y: number) {
    super(scene, x, y);
    
    // 创建图形
    this.graphics = scene.add.graphics();
    this.graphics.fillStyle(0xffffff, 1);
    this.graphics.fillRect(0, 0, 6, 12);
    
    // 添加图形到容器
    this.add(this.graphics);
    
    // 添加物理体
    this.body = scene.physics.add.body(x, y, 6, 12);
    this.body.setVisible(false);
    
    // 添加容器到场景
    scene.add.existing(this);
    this.setVisible(false);
  }

  fire(x: number, y: number, angle: number) {
    // 从玩家前端发射，而不是中心
    const offsetX = Math.cos(angle) * 20;
    const offsetY = Math.sin(angle) * 20;
    this.body.setPosition(x + offsetX, y + offsetY);
    this.setPosition(x + offsetX, y + offsetY);
    this.setRotation(angle);
    this.active = true;
    this.setVisible(true);
    this.body.setVisible(true);
    const velocityX = Math.cos(angle) * this.speed;
    const velocityY = Math.sin(angle) * this.speed;
    this.body.setVelocity(velocityX, velocityY);
  }

  update() {
    if (this.active) {
      this.setPosition(this.body.x, this.body.y);
      // 子弹超出边界后销毁
      if (this.body.x < 0 || this.body.x > 800 || this.body.y < 0 || this.body.y > 600) {
        this.destroy();
      }
    }
  }

  getBody() {
    return this.body;
  }

  isActive() {
    return this.active;
  }

  setActive(active: boolean) {
    this.active = active;
    this.setVisible(active);
    this.body.setVisible(active);
  }

  setVisible(visible: boolean) {
    super.setVisible(visible);
    this.body.setVisible(visible);
  }

  destroy() {
    this.graphics.destroy();
    this.body.destroy();
    super.destroy();
  }
}