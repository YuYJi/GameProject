import Phaser from 'phaser';

export class Enemy extends Phaser.GameObjects.Container {
  private graphics: Phaser.GameObjects.Graphics;
  private body: Phaser.Physics.Arcade.Body;
  private speed = 100;
  private player: any;
  private active = false;

  constructor(scene: Phaser.Scene, x: number, y: number) {
    super(scene, x, y);
    
    // 创建图形
    this.graphics = scene.add.graphics();
    this.graphics.fillStyle(0xe74c3c, 1);
    this.graphics.beginPath();
    this.graphics.moveTo(0, -15);
    this.graphics.lineTo(-10, 10);
    this.graphics.lineTo(10, 10);
    this.graphics.closePath();
    this.graphics.fillPath();
    this.graphics.lineStyle(2, 0x000000, 1);
    this.graphics.strokePath();
    
    // 添加图形到容器
    this.add(this.graphics);
    
    // 添加物理体
    this.body = scene.physics.add.body(x, y, 30, 30);
    this.body.setVisible(false);
    
    // 添加容器到场景
    scene.add.existing(this);
    this.setVisible(false);
  }

  spawn(x: number, y: number, player: any) {
    this.body.setPosition(x, y);
    this.setPosition(x, y);
    this.player = player;
    this.active = true;
    this.setVisible(true);
    this.body.setVisible(true);
  }

  update() {
    if (this.player && this.active) {
      // 向玩家移动
      const angle = Phaser.Math.Angle.Between(this.body.x, this.body.y, this.player.body.x, this.player.body.y);
      const velocityX = Math.cos(angle) * this.speed;
      const velocityY = Math.sin(angle) * this.speed;
      this.body.setVelocity(velocityX, velocityY);
      this.setPosition(this.body.x, this.body.y);
      
      // 旋转朝向玩家
      this.setRotation(angle);
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