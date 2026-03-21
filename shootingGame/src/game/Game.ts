import Phaser from 'phaser';

export class Game extends Phaser.Scene {
  private playerContainer: Phaser.GameObjects.Container | null = null;
  private playerBody: Phaser.Physics.Arcade.Body | null = null;
  private bullets: any[] = [];
  private enemies: any[] = [];
  private powerUps: any[] = [];
  private score = 0;
  private scoreText: Phaser.GameObjects.Text | null = null;
  private spawnTimer = 0;
  private spawnInterval = 1500; // 初始敌人出现速度，1.5秒
  private powerUpSpawnTimer = 0;
  private powerUpSpawnInterval = 10000; // 道具出现间隔，10秒
  private powerUpSpawnChance = 0.3; // 道具出现概率，30%
  private lastFireTime = 0; // 上次发射子弹的时间
  private fireCooldown = 300; // 发射冷却时间，300毫秒（每秒最多3.3发）
  private bulletSpeed = 300; // 初始子弹速度
  private difficultyLevel = 1; // 当前难度等级
  private nextDifficultyScore = 100; // 下一次增加难度的分数阈值
  private wKey: Phaser.Input.Keyboard.Key | null = null;
  private aKey: Phaser.Input.Keyboard.Key | null = null;
  private sKey: Phaser.Input.Keyboard.Key | null = null;
  private dKey: Phaser.Input.Keyboard.Key | null = null;

  constructor() {
    super('Game');
  }

  preload() {
    // 预加载空资源以确保场景正确初始化
    this.load.image('placeholder', 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==');
  }

  create() {
    // 设置背景颜色
    this.cameras.main.setBackgroundColor('#000000');

    // 创建玩家
    const playerGraphics = this.add.graphics();
    playerGraphics.fillStyle(0xffffff, 1); // 白色填充
    playerGraphics.fillCircle(0, 0, 15);
    playerGraphics.lineStyle(2, 0x000000, 1); // 黑色边框
    playerGraphics.strokeCircle(0, 0, 15);

    // 创建玩家容器
    this.playerContainer = this.add.container(400, 300);
    this.playerContainer.add(playerGraphics);

    // 创建玩家物理体
    this.playerBody = this.physics.add.body(400, 300, 30, 30);
    this.playerBody.setCollideWorldBounds(true);

    // 初始化子弹数组
    this.bullets = [];

    // 初始化敌人数组
    this.enemies = [];

    // 键盘输入
    if (this.input.keyboard) {
      this.wKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.W);
      this.aKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.A);
      this.sKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.S);
      this.dKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.D);
    }

    // 分数文本
    this.scoreText = this.add.text(10, 10, 'Score: 0', {
      fontSize: '16px',
      color: '#ffffff'
    });
  }

  update(_time: number, delta: number) {
    // 确保玩家和其他游戏元素已经创建
    if (!this.playerContainer || !this.playerBody || !this.scoreText) {
      return;
    }

    // 获取鼠标位置
    const mouseX = this.input.mousePointer.x;
    const mouseY = this.input.mousePointer.y;

    // 玩家移动和旋转
    this.updatePlayer(mouseX, mouseY);

    // 射击（鼠标左键）
    if (this.input.mousePointer.leftButtonDown()) {
      const currentTime = this.time.now;
      if (currentTime - this.lastFireTime >= this.fireCooldown) {
        this.fireBullet();
        this.lastFireTime = currentTime;
      }
    }

    // 更新子弹
    for (let i = this.bullets.length - 1; i >= 0; i--) {
      const bullet = this.bullets[i];
      if (bullet && bullet.update) {
        bullet.update();

        // 检查子弹是否需要销毁
        if (!bullet.isActive) {
          this.bullets.splice(i, 1);
        }
      }
    }

    // 更新敌人
    for (let i = this.enemies.length - 1; i >= 0; i--) {
      const enemy = this.enemies[i];
      if (enemy && enemy.update) {
        enemy.update();

        // 检查敌人是否需要销毁
        if (!enemy.isActive) {
          this.enemies.splice(i, 1);
        }
      }
    }

    // 更新道具
    for (let i = this.powerUps.length - 1; i >= 0; i--) {
      const powerUp = this.powerUps[i];
      if (powerUp && powerUp.update) {
        powerUp.update();

        // 检查道具是否需要销毁
        if (!powerUp.isActive) {
          this.powerUps.splice(i, 1);
        }
      }
    }

    // 碰撞检测：子弹 vs 敌人
    for (let i = this.bullets.length - 1; i >= 0; i--) {
      const bullet = this.bullets[i];
      if (bullet && bullet.body) {
        for (let j = this.enemies.length - 1; j >= 0; j--) {
          const enemy = this.enemies[j];
          if (enemy && enemy.body && this.physics.overlap(bullet.body, enemy.body)) {
            // 子弹击中敌人，调用takeDamage方法
            const isDead = enemy.takeDamage();
            
            // 子弹始终销毁
            if (bullet.destroy) {
              bullet.destroy();
            }
            this.bullets.splice(i, 1);
            
            // 只有当敌人生命值为0时才销毁敌人并增加分数
            if (isDead) {
              if (enemy.destroy) {
                enemy.destroy();
              }
              this.enemies.splice(j, 1);
              this.score += 10;
              this.scoreText.setText(`Score: ${this.score}`);

              // 检查是否需要增加难度
              if (this.score >= this.nextDifficultyScore) {
                this.increaseDifficulty();
              }
            }
            break;
          }
        }
      }
    }

    // 碰撞检测：玩家 vs 敌人
    for (let i = this.enemies.length - 1; i >= 0; i--) {
      const enemy = this.enemies[i];
      if (enemy && enemy.body && this.physics.overlap(this.playerBody, enemy.body)) {
        // 游戏结束逻辑
        this.scene.start('GameOver', { score: this.score });
        break;
      }
    }

    // 碰撞检测：玩家 vs 道具
    for (let i = this.powerUps.length - 1; i >= 0; i--) {
      const powerUp = this.powerUps[i];
      if (powerUp && powerUp.body && this.physics.overlap(this.playerBody, powerUp.body)) {
        // 玩家获得道具，增加子弹速度
        this.bulletSpeed *= 1.5; // 子弹速度增加50%
        // 销毁道具
        if (powerUp.destroy) {
          powerUp.destroy();
        }
        this.powerUps.splice(i, 1);
        break;
      }
    }

    // 生成敌人
    this.spawnTimer += delta;
    if (this.spawnTimer >= this.spawnInterval) {
      this.spawnEnemy();
      this.spawnTimer = 0;
    }

    // 生成道具
    this.powerUpSpawnTimer += delta;
    if (this.powerUpSpawnTimer >= this.powerUpSpawnInterval) {
      // 随机概率生成道具
      if (Math.random() < this.powerUpSpawnChance) {
        this.spawnPowerUp();
      }
      this.powerUpSpawnTimer = 0;
    }

    // 更新玩家容器位置，使其与物理体位置保持同步
    this.playerContainer.setPosition(this.playerBody.x, this.playerBody.y);
  }

  private updatePlayer(mouseX: number, mouseY: number) {
    if (!this.playerBody || !this.playerContainer) {
      return;
    }
    
    let velocityX = 0;
    let velocityY = 0;

    // 直接移动
    if (this.wKey && this.wKey.isDown) {
      velocityY = -200;
    } else if (this.sKey && this.sKey.isDown) {
      velocityY = 200;
    }

    if (this.aKey && this.aKey.isDown) {
      velocityX = -200;
    } else if (this.dKey && this.dKey.isDown) {
      velocityX = 200;
    }

    this.playerBody.setVelocity(velocityX, velocityY);

    // 根据鼠标相对画面中心位置旋转
    const centerX = this.cameras.main.width / 2; // 画面中心X坐标
    const centerY = this.cameras.main.height / 2; // 画面中心Y坐标
    const angle = Phaser.Math.Angle.Between(centerX, centerY, mouseX, mouseY);
    this.playerContainer.setRotation(angle);
  }

  private fireBullet() {
    if (!this.playerContainer || !this.playerBody) {
      return;
    }

    // 获取鼠标位置
    const mouseX = this.input.mousePointer.x;
    const mouseY = this.input.mousePointer.y;

    // 创建新子弹
    const bulletGraphics = this.add.graphics();
    bulletGraphics.fillStyle(0xffffff, 1);
    bulletGraphics.fillCircle(0, 0, 3); // 圆形子弹，半径为3

    const bulletContainer = this.add.container(0, 0);
    bulletContainer.add(bulletGraphics);

    // 计算从玩家到鼠标的角度
    const angle = Phaser.Math.Angle.Between(this.playerBody.x, this.playerBody.y, mouseX, mouseY);
    const offsetX = Math.cos(angle) * 20;
    const offsetY = Math.sin(angle) * 20;
    const x = this.playerBody.x + offsetX;
    const y = this.playerBody.y + offsetY;

    const bulletBody = this.physics.add.body(x, y, 6, 6);
    // 设置圆形碰撞体，半径为5，增加碰撞检测的范围
    bulletBody.setCircle(5);

    bulletContainer.setPosition(x, y);
    bulletContainer.setRotation(angle);

    const velocityX = Math.cos(angle) * this.bulletSpeed;
    const velocityY = Math.sin(angle) * this.bulletSpeed;
    bulletBody.setVelocity(velocityX, velocityY);

    const bullet = {
      container: bulletContainer,
      body: bulletBody,
      isActive: true,
      update: function () {
        if (this.isActive) {
          // 更新子弹容器位置，使其与物理体位置保持同步
          this.container.setPosition(this.body.x, this.body.y);
          // 子弹超出边界后销毁
          if (this.body.x < 0 || this.body.x > 800 || this.body.y < 0 || this.body.y > 600) {
            this.destroy();
          }
        }
      },
      destroy: function () {
        this.container.destroy();
        this.body.destroy();
        this.isActive = false;
      }
    };

    this.bullets.push(bullet);
  }

  private increaseDifficulty() {
    this.difficultyLevel++;
    // 减少敌人出现的间隔时间，但最少为300毫秒
    this.spawnInterval = Math.max(300, this.spawnInterval - 200); // 增加难度提升的幅度
    // 根据难度等级设置下一次增加难度的分数阈值
    switch (this.difficultyLevel) {
      case 1:
        this.nextDifficultyScore = 100;
        break;
      case 2:
        this.nextDifficultyScore = 300;
        break;
      case 3:
        this.nextDifficultyScore = 500;
        break;
      case 4:
        this.nextDifficultyScore = 1000;
        break;
      default:
        // 难度等级超过4后，每次增加500分
        this.nextDifficultyScore += 500;
        break;
    }
  }

  private spawnEnemy() {
    if (!this.playerBody) {
      return;
    }

    const side = Phaser.Math.Between(0, 3);
    let x = 0;
    let y = 0;

    switch (side) {
      case 0: // 顶部
        x = Phaser.Math.Between(0, 800);
        y = -50;
        break;
      case 1: // 右侧
        x = 850;
        y = Phaser.Math.Between(0, 600);
        break;
      case 2: // 底部
        x = Phaser.Math.Between(0, 800);
        y = 650;
        break;
      case 3: // 左侧
        x = -50;
        y = Phaser.Math.Between(0, 600);
        break;
    }

    // 随机选择敌人类型
    const enemyType = Phaser.Math.Between(0, 1); // 0: 普通敌人, 1: 二级敌人
    let enemyColor, enemySpeed, enemyHealth;

    if (enemyType === 0) {
      enemyColor = 0xffff00; // 一级敌人：黄色
      enemySpeed = 100; // 一级敌人速度
      enemyHealth = 1; // 一级敌人需要击中1次
    } else {
      enemyColor = 0x3498db; // 二级敌人：蓝色
      enemySpeed = 180; // 二级敌人速度
      enemyHealth = 2; // 二级敌人需要击中2次
    }

    // 创建敌人
    const enemyGraphics = this.add.graphics();
    enemyGraphics.fillStyle(enemyColor, 1);
    enemyGraphics.fillCircle(0, 0, 15); // 圆形敌人，半径为15
    enemyGraphics.lineStyle(2, 0x000000, 1);
    enemyGraphics.strokeCircle(0, 0, 15);

    const enemyContainer = this.add.container(x, y);
    enemyContainer.add(enemyGraphics);

    const enemyBody = this.physics.add.body(x, y, 30, 30);
    // 设置圆形碰撞体，半径为20，增加碰撞检测的范围
    enemyBody.setCircle(20);

    const enemy = {
      container: enemyContainer,
      body: enemyBody,
      speed: enemySpeed,
      health: enemyHealth,
      playerBody: this.playerBody,
      isActive: true,
      originalColor: enemyColor,
      update: function () {
        if (this.playerBody && this.isActive) {
          // 向玩家移动
          const angle = Phaser.Math.Angle.Between(this.body.x, this.body.y, this.playerBody.x, this.playerBody.y);
          const velocityX = Math.cos(angle) * this.speed;
          const velocityY = Math.sin(angle) * this.speed;
          this.body.setVelocity(velocityX, velocityY);
          // 更新敌人容器位置，使其与物理体位置保持同步
          this.container.setPosition(this.body.x, this.body.y);

          // 旋转朝向玩家，确保圆形的方向朝向玩家
          this.container.setRotation(angle);
        }
      },
      takeDamage: function () {
        this.health--;
        // 敌人被击中时闪一下红
        const graphics = this.container.getAt(0);
        if (graphics) {
          graphics.fillStyle(0xff0000, 1);
          graphics.fillCircle(0, 0, 15);
          graphics.lineStyle(2, 0x000000, 1);
          graphics.strokeCircle(0, 0, 15);
          // 0.2秒后恢复原来的颜色
          setTimeout(() => {
            if (this.isActive) {
              graphics.fillStyle(this.originalColor, 1);
              graphics.fillCircle(0, 0, 15);
              graphics.lineStyle(2, 0x000000, 1);
              graphics.strokeCircle(0, 0, 15);
            }
          }, 200);
        }
        return this.health <= 0;
      },
      destroy: function () {
        this.container.destroy();
        this.body.destroy();
        this.isActive = false;
      }
    };

    this.enemies.push(enemy);
  }

  private spawnPowerUp() {
    // 随机位置生成道具
    const x = Phaser.Math.Between(50, 750);
    const y = Phaser.Math.Between(50, 550);

    // 创建绿色方块道具
    const powerUpGraphics = this.add.graphics();
    powerUpGraphics.fillStyle(0x00ff00, 1); // 绿色方块
    powerUpGraphics.fillRect(-10, -10, 20, 20); // 20x20的方块
    powerUpGraphics.lineStyle(2, 0x000000, 1);
    powerUpGraphics.strokeRect(-10, -10, 20, 20);

    const powerUpContainer = this.add.container(x, y);
    powerUpContainer.add(powerUpGraphics);

    const powerUpBody = this.physics.add.body(x, y, 20, 20);
    powerUpBody.setCircle(10); // 圆形碰撞体，半径为10

    const powerUp = {
      container: powerUpContainer,
      body: powerUpBody,
      isActive: true,
      update: function () {
        // 道具不需要移动，只需要存在即可
      },
      destroy: function () {
        this.container.destroy();
        this.body.destroy();
        this.isActive = false;
      }
    };

    this.powerUps.push(powerUp);
  }
}

export class GameOver extends Phaser.Scene {
  constructor() {
    super('GameOver');
  }

  create(data) {
    this.cameras.main.setBackgroundColor('#000000');

    const score = data.score || 0;

    this.add.text(400, 250, 'Game Over', {
      fontSize: '32px',
      color: '#ffffff'
    }).setOrigin(0.5);

    this.add.text(400, 300, `Score: ${score}`, {
      fontSize: '24px',
      color: '#ffffff'
    }).setOrigin(0.5);

    this.add.text(400, 350, 'Click to restart', {
      fontSize: '16px',
      color: '#ffffff'
    }).setOrigin(0.5);

    this.input.on('pointerdown', () => {
      this.scene.start('Game');
    });
  }
}