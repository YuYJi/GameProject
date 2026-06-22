/**
 * 游戏引擎Hook
 * 核心游戏逻辑：游戏循环、敌人生成、技能发射、碰撞检测、渲染
 */

import { useEffect, useRef, useState } from 'react';
import { useGameStore } from '@/store/useGameStore';
import { Enemy, Projectile, Particle } from '@/types/game';
import { distance, checkCollision } from '@/utils/collision';

/**
 * 游戏引擎Hook
 * 返回canvas引用、画布尺寸、开始游戏循环函数和发射技能函数
 */
export const useGameEngine = () => {
  // Canvas引用
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // 键盘状态引用（避免闭包问题）
  const keysRef = useRef<{ [key: string]: boolean }>({});

  // 时间追踪引用
  const lastTimeRef = useRef<number>(0);           // 上一帧时间戳
  const enemySpawnTimerRef = useRef<number>(0);     // 敌人生成计时器
  const waveTimerRef = useRef<number>(0);          // 波次计时器

  // Store引用（避免在useEffect中直接使用store）
  const storeRef = useRef<any>(null);

  // 动画帧ID引用（用于取消动画帧）
  const frameRef = useRef<number>();

  // 画布尺寸状态
  const [canvasSize, setCanvasSize] = useState({ width: 800, height: 600 });

  // 保存store引用
  const store = useGameStore();
  useEffect(() => {
    storeRef.current = store;
  }, [store]);

  // 监听窗口大小变化
  useEffect(() => {
    const handleResize = () => {
      setCanvasSize({
        width: window.innerWidth,
        height: window.innerHeight,
      });
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // 键盘事件监听
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // 记录按键状态
      keysRef.current[e.key.toLowerCase()] = true;

      // 游戏未开始则忽略技能按键
      if (storeRef.current && !storeRef.current.gameStarted) return;

      // 数字键1-5触发对应技能
      if (e.key === '1') fireProjectile('fireball');
      if (e.key === '2') fireProjectile('lightning');
      if (e.key === '3') fireProjectile('slash');
      if (e.key === '4') fireProjectile('heal');
      if (e.key === '5') fireProjectile('shield');
    };
    const handleKeyUp = (e: KeyboardEvent) => {
      keysRef.current[e.key.toLowerCase()] = false;
    };
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, []);

  /**
   * 生成敌人
   * 根据当前波次生成随机类型敌人，出现在玩家周围环形区域
   */
  const spawnEnemy = () => {
    if (!storeRef.current) return;
    const { player, wave, addEnemy } = storeRef.current;

    // 敌人类型配置（随波次增强）
    const types = [
      { type: 'slime', color: '#ef4444', size: 15, hp: 30 + wave * 5, damage: 5, speed: 1.2, exp: 15 },      // 史莱姆
      { type: 'bat', color: '#dc2626', size: 12, hp: 20 + wave * 3, damage: 8, speed: 2.5, exp: 20 },         // 蝙蝠
      { type: 'skeleton', color: '#b91c1c', size: 18, hp: 50 + wave * 8, damage: 10, speed: 1, exp: 30 },     // 骷髅
    ];

    // 随机选择敌人类型
    const type = types[Math.floor(Math.random() * types.length)];

    // 计算生成位置（玩家周围的随机环形区域）
    const angle = Math.random() * Math.PI * 2;
    const dist = 200 + Math.random() * 150;

    // 创建敌人对象
    const enemy: Enemy = {
      x: player.x + Math.cos(angle) * dist,
      y: player.y + Math.sin(angle) * dist,
      hp: type.hp,
      maxHp: type.hp,
      damage: type.damage,
      speed: type.speed,
      type: type.type,
      expReward: type.exp,
      color: type.color,
      size: type.size,
    };

    console.log(`[敌人生成] 类型: ${enemy.type} | 位置: (${Math.round(enemy.x)}, ${Math.round(enemy.y)}) | HP: ${enemy.hp} | 伤害: ${enemy.damage} | 波次: ${wave}`);
    
    addEnemy(enemy);
  };

  /**
   * 创建粒子效果
   * @param x - 粒子生成X坐标
   * @param y - 粒子生成Y坐标
   * @param color - 粒子颜色
   * @param count - 生成粒子数量
   */
  const createParticles = (x: number, y: number, color: string, count: number = 5) => {
    if (!storeRef.current) return;
    const { addParticle } = storeRef.current;

    for (let i = 0; i < count; i++) {
      // 随机方向和速度
      const angle = Math.random() * Math.PI * 2;
      const speed = 1 + Math.random() * 3;
      addParticle({
        x,
        y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        life: 30,
        maxLife: 30,
        color,
        size: 2 + Math.random() * 3,
      });
    }
  };

  /**
   * 发射技能/投射物
   * @param skillId - 技能ID
   * @param targetAngle - 目标角度（可选，默认使用玩家面向方向）
   */
  const fireProjectile = (skillId: string, targetAngle?: number) => {
    if (!storeRef.current) return;
    const { player, useSkill, setPlayerHP, addProjectile, enemies, addExp, addScore, updateEnemies } = storeRef.current;

    // 检查技能是否存在且冷却完毕
    const skill = player.skills.find(s => s.id === skillId);
    if (!skill || skill.currentCooldown > 0) return;

    // 使用技能（进入冷却）
    useSkill(skillId);

    // 被动技能处理（如治疗术）
    if (skill.type === 'passive') {
      if (skillId === 'heal') {
        setPlayerHP(Math.min(player.hp + 20, player.maxHp));
        createParticles(player.x, player.y, '#4ade80', 10);
      }
      return;
    }

    // 确定发射角度
    let angle = targetAngle !== undefined ? targetAngle : player.direction;

    // 烈焰斩技能：扇形范围伤害
    if (skillId === 'slash') {
      const newEnemies = [...enemies];
      const fanAngle = Math.PI / 3;  // 60度扇形

      // 遍历所有敌人，检测是否在扇形范围内
      for (let i = newEnemies.length - 1; i >= 0; i--) {
        const enemy = newEnemies[i];
        const dx = enemy.x - player.x;
        const dy = enemy.y - player.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        const enemyAngle = Math.atan2(dy, dx);

        // 计算角度差（处理角度环绕）
        const angleDiff = Math.abs(enemyAngle - angle);
        const normalizedAngle = Math.min(angleDiff, Math.PI * 2 - angleDiff);

        // 在范围内且在射程内则造成伤害
        if (dist <= skill.range && normalizedAngle <= fanAngle) {
          enemy.hp -= skill.damage;
          createParticles(enemy.x, enemy.y, skill.color, 8);

          // 敌人死亡处理
          if (enemy.hp <= 0) {
            addExp(enemy.expReward);
            addScore(enemy.expReward * 10);
            createParticles(enemy.x, enemy.y, enemy.color, 15);
            newEnemies.splice(i, 1);
          }
        }
      }
      updateEnemies(newEnemies);

      // 创建视觉特效粒子
      for (let i = 0; i < 15; i++) {
        const spreadAngle = angle - fanAngle + (Math.random() * fanAngle * 2);
        const dist = Math.random() * skill.range;
        createParticles(
          player.x + Math.cos(spreadAngle) * dist,
          player.y + Math.sin(spreadAngle) * dist,
          skill.color,
          1
        );
      }
      return;
    }

    // 创建投射物（火球、闪电等）
    const projectile: Projectile = {
      x: player.x,
      y: player.y,
      vx: Math.cos(angle) * 6,
      vy: Math.sin(angle) * 6,
      damage: skill.damage,
      range: 0,
      maxRange: skill.range,
      color: skill.color,
      size: 6,
    };

    addProjectile(projectile);
  };

  /**
   * 游戏主循环
   * 每帧执行：移动处理、敌人生成、波次更新、碰撞检测、投射物更新、粒子更新、渲染
   * @param time - requestAnimationFrame传入的时间戳
   */
  const gameLoop = (time: number) => {
    if (!storeRef.current) return;

    const state = storeRef.current;

    // 计算时间增量（限制最大50ms防止跳帧）
    const deltaTime = time - lastTimeRef.current;
    lastTimeRef.current = time;
    const dt = Math.min(deltaTime, 50);

    // ===== 玩家移动处理 =====
    let dx = 0, dy = 0;
    if (!state.isAutoPlay) {
      // 手动控制：WASD或方向键
      if (keysRef.current['w'] || keysRef.current['arrowup']) dy -= 1;
      if (keysRef.current['s'] || keysRef.current['arrowdown']) dy += 1;
      if (keysRef.current['a'] || keysRef.current['arrowleft']) dx -= 1;
      if (keysRef.current['d'] || keysRef.current['arrowright']) dx += 1;
    } else {
      // 自动战斗：追踪最近的敌人
      if (state.enemies.length > 0) {
        let nearestDist = Infinity;
        let nearestEnemy = null;
        state.enemies.forEach(enemy => {
          const d = distance(state.player.x, state.player.y, enemy.x, enemy.y);
          if (d < nearestDist) {
            nearestDist = d;
            nearestEnemy = enemy;
          }
        });

        if (nearestEnemy) {
          const angle = Math.atan2(nearestEnemy.y - state.player.y, nearestEnemy.x - state.player.x);
          // 距离过远则靠近，距离过近则后退
          if (nearestDist > 100) {
            dx = Math.cos(angle);
            dy = Math.sin(angle);
          } else if (nearestDist < 80) {
            dx = -Math.cos(angle);
            dy = -Math.sin(angle);
          }
          state.setPlayerDirection(angle);
        }
      }
    }

    // 归一化移动向量并更新位置
    if (dx !== 0 || dy !== 0) {
      const len = Math.sqrt(dx * dx + dy * dy);
      dx /= len;
      dy /= len;
      state.setPlayerPosition(state.player.x + dx * state.player.speed, state.player.y + dy * state.player.speed);
      if (dx !== 0 || dy !== 0) {
        state.setPlayerDirection(Math.atan2(dy, dx));
      }
    }

    // ===== 敌人生成 =====
    enemySpawnTimerRef.current += dt;
    // 生成间隔随波次减少（难度增加）
    const spawnInterval = Math.max(500, 2000 - state.wave * 100);
    if (enemySpawnTimerRef.current > spawnInterval) {
      enemySpawnTimerRef.current = 0;
      // 每波生成敌人数量随波次增加
      const count = Math.min(5, 1 + Math.floor(state.wave / 3));
      console.log(`[生成调度] 波次: ${state.wave} | 生成敌人数量: ${count} | 间隔: ${spawnInterval}ms`);
      for (let i = 0; i < count; i++) {
        spawnEnemy();
      }
    }

    // ===== 波次更新 =====
    waveTimerRef.current += dt;
    if (waveTimerRef.current > 30000) {  // 每30秒一波
      waveTimerRef.current = 0;
      console.log(`[波次更新] 进入第 ${state.wave + 1} 波`);
      state.setWave(state.wave + 1);
    }

    // ===== 敌人移动和碰撞 =====
    console.log(`[敌人状态] 当前敌人数量: ${state.enemies.length}`);
    const updatedEnemies = state.enemies.map(enemy => {
      // 面向玩家移动
      const angle = Math.atan2(state.player.y - enemy.y, state.player.x - enemy.x);
      const newEnemy = {
        ...enemy,
        x: enemy.x + Math.cos(angle) * enemy.speed,
        y: enemy.y + Math.sin(angle) * enemy.speed,
      };

      // 检测与玩家的碰撞（造成伤害）
      if (checkCollision(newEnemy.x, newEnemy.y, newEnemy.size, state.player.x, state.player.y, 15)) {
        console.log(`[碰撞检测] 敌人(${enemy.type}) 攻击玩家，造成 ${newEnemy.damage * 0.1} 伤害`);
        state.setPlayerHP(Math.max(0, state.player.hp - newEnemy.damage * 0.1));
        createParticles(state.player.x, state.player.y, '#ef4444', 3);
      }

      return newEnemy;
    });
    state.updateEnemies(updatedEnemies);

    // ===== 投射物更新 =====
    const updatedProjectiles: Projectile[] = [];
    state.projectiles.forEach(proj => {
      // 移动投射物
      const newProj = {
        ...proj,
        x: proj.x + proj.vx,
        y: proj.y + proj.vy,
        range: proj.range + Math.sqrt(proj.vx ** 2 + proj.vy ** 2),
      };

      // 检测是否超出最大射程
      if (newProj.range < newProj.maxRange) {
        let hit = false;
        const newEnemies = [...state.enemies];

        // 检测与敌人的碰撞
        for (let i = newEnemies.length - 1; i >= 0; i--) {
          const enemy = newEnemies[i];
          if (checkCollision(newProj.x, newProj.y, newProj.size, enemy.x, enemy.y, enemy.size)) {
            enemy.hp -= newProj.damage;
            console.log(`[投射物命中] 敌人(${enemy.type}) 受到 ${newProj.damage} 伤害，剩余HP: ${enemy.hp}`);
            createParticles(enemy.x, enemy.y, enemy.color, 5);
            hit = true;

            // 敌人死亡处理
            if (enemy.hp <= 0) {
              console.log(`[敌人死亡] 敌人(${enemy.type}) 被击杀，获得 ${enemy.expReward} 经验和 ${enemy.expReward * 10} 分数`);
              state.addExp(enemy.expReward);
              state.addScore(enemy.expReward * 10);
              createParticles(enemy.x, enemy.y, enemy.color, 15);
              newEnemies.splice(i, 1);
            }
            break;  // 击中后投射物消失
          }
        }
        state.updateEnemies(newEnemies);

        // 未击中任何敌人则保留投射物
        if (!hit) {
          updatedProjectiles.push(newProj);
        }
      }
    });
    state.updateProjectiles(updatedProjectiles);

    // ===== 粒子效果更新 =====
    const updatedParticles: Particle[] = [];
    state.particles.forEach(particle => {
      // 移动粒子并应用阻尼
      const newParticle = {
        ...particle,
        x: particle.x + particle.vx,
        y: particle.y + particle.vy,
        life: particle.life - 1,
        vx: particle.vx * 0.95,
        vy: particle.vy * 0.95,
      };
      // 保留存活的粒子
      if (newParticle.life > 0) {
        updatedParticles.push(newParticle);
      }
    });
    state.updateParticles(updatedParticles);

    // ===== 技能冷却更新 =====
    state.player.skills.forEach(skill => {
      state.updateSkillCooldown(skill.id, dt);
    });

    // ===== 自动战斗AI =====
    if (state.isAutoPlay && state.enemies.length > 0) {
      // 找到最近的敌人
      const nearest = state.enemies.reduce((best: any, enemy: any) => {
        const d = distance(state.player.x, state.player.y, enemy.x, enemy.y);
        return d < best.dist ? { enemy, dist: d } : best;
      }, { enemy: state.enemies[0], dist: Infinity });

      const angle = Math.atan2(nearest.enemy.y - state.player.y, nearest.enemy.x - state.player.x);

      // 发射已冷却的主动技能
      const activeSkills = state.player.skills.filter((s: any) => s.type === 'active' && s.currentCooldown <= 0);
      if (activeSkills.length > 0) {
        fireProjectile(activeSkills[0].id, angle);
      }

      // 血量低于50%时使用治疗术
      const healSkill = state.player.skills.find((s: any) => s.id === 'heal');
      if (healSkill && healSkill.currentCooldown <= 0 && state.player.hp < state.player.maxHp * 0.5) {
        fireProjectile('heal');
      }
    }

    // 渲染当前帧
    render();

    // 继续下一帧
    if (state.gameStarted) {
      frameRef.current = requestAnimationFrame(gameLoop);
    }
  };

  /**
   * 渲染函数
   * 绘制背景网格、粒子、敌人、投射物、玩家
   */
  const render = () => {
    if (!storeRef.current) return;
    const state = storeRef.current;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // 计算相机偏移（玩家居中）
    const camX = state.player.x - canvasSize.width / 2;
    const camY = state.player.y - canvasSize.height / 2;

    // 绘制背景
    ctx.fillStyle = '#1a1a2e';
    ctx.fillRect(0, 0, canvasSize.width, canvasSize.height);

    // 应用相机变换
    ctx.save();
    ctx.translate(-camX, -camY);

    // 绘制网格背景
    const gridSize = 50;
    ctx.strokeStyle = '#16213e';
    ctx.lineWidth = 1;
    const startX = Math.floor((camX - 100) / gridSize) * gridSize;
    const startY = Math.floor((camY - 100) / gridSize) * gridSize;
    for (let x = startX; x < camX + canvasSize.width + 100; x += gridSize) {
      ctx.beginPath();
      ctx.moveTo(x, camY - 100);
      ctx.lineTo(x, camY + canvasSize.height + 100);
      ctx.stroke();
    }
    for (let y = startY; y < camY + canvasSize.height + 100; y += gridSize) {
      ctx.beginPath();
      ctx.moveTo(camX - 100, y);
      ctx.lineTo(camX + canvasSize.width + 100, y);
      ctx.stroke();
    }

    // 绘制粒子（带透明度）
    state.particles.forEach((particle: Particle) => {
      ctx.globalAlpha = particle.life / particle.maxLife;
      ctx.fillStyle = particle.color;
      const px = Math.floor(particle.x / 2) * 2;
      const py = Math.floor(particle.y / 2) * 2;
      ctx.fillRect(px - particle.size / 2, py - particle.size / 2, particle.size, particle.size);
    });
    ctx.globalAlpha = 1;

    // 绘制敌人（八边形）
    state.enemies.forEach((enemy: Enemy) => {
      ctx.fillStyle = enemy.color;
      const ex = Math.floor(enemy.x / 2) * 2;
      const ey = Math.floor(enemy.y / 2) * 2;

      ctx.beginPath();
      for (let i = 0; i < 8; i++) {
        const angle = (i / 8) * Math.PI * 2;
        const px = ex + Math.cos(angle) * enemy.size;
        const py = ey + Math.sin(angle) * enemy.size;
        if (i === 0) ctx.moveTo(px, py);
        else ctx.lineTo(px, py);
      }
      ctx.closePath();
      ctx.fill();

      // 绘制血条
      const hpRatio = enemy.hp / enemy.maxHp;
      ctx.fillStyle = '#1f2937';
      ctx.fillRect(ex - 15, ey - enemy.size - 10, 30, 4);
      ctx.fillStyle = hpRatio > 0.5 ? '#22c55e' : hpRatio > 0.25 ? '#eab308' : '#ef4444';
      ctx.fillRect(ex - 15, ey - enemy.size - 10, 30 * hpRatio, 4);
    });

    // 绘制投射物（带发光效果）
    state.projectiles.forEach((proj: Projectile) => {
      ctx.fillStyle = proj.color;
      ctx.shadowColor = proj.color;
      ctx.shadowBlur = 10;
      const px = Math.floor(proj.x / 2) * 2;
      const py = Math.floor(proj.y / 2) * 2;
      ctx.beginPath();
      ctx.arc(px, py, proj.size, 0, Math.PI * 2);
      ctx.fill();
      ctx.shadowBlur = 0;
    });

    // 绘制玩家（蓝色六边形）
    ctx.fillStyle = '#60a5fa';
    const px = Math.floor(state.player.x / 2) * 2;
    const py = Math.floor(state.player.y / 2) * 2;

    ctx.beginPath();
    for (let i = 0; i < 6; i++) {
      const angle = (i / 6) * Math.PI * 2 - Math.PI / 2;
      const cx = px + Math.cos(angle) * 15;
      const cy = py + Math.sin(angle) * 15;
      if (i === 0) ctx.moveTo(cx, cy);
      else ctx.lineTo(cx, cy);
    }
    ctx.closePath();
    ctx.fill();

    // 绘制玩家朝向指示线
    ctx.strokeStyle = '#93c5fd';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(px, py);
    ctx.lineTo(px + Math.cos(state.player.direction) * 25, py + Math.sin(state.player.direction) * 25);
    ctx.stroke();

    ctx.restore();
  };

  /**
   * 开始游戏循环
   * 重置计时器并启动requestAnimationFrame
   */
  const startGameLoop = () => {
    if (frameRef.current) cancelAnimationFrame(frameRef.current);
    lastTimeRef.current = performance.now();
    enemySpawnTimerRef.current = 1900 - 100;  // 初始值设置为略小于生成间隔
    waveTimerRef.current = 0;
    frameRef.current = requestAnimationFrame(gameLoop);
  };

  // 监听游戏开始状态
  useEffect(() => {
    if (store.gameStarted && storeRef.current) {
      startGameLoop();
    }
    return () => {
      if (frameRef.current) cancelAnimationFrame(frameRef.current);
    };
  }, [store.gameStarted]);

  // 返回给组件使用的接口
  return {
    canvasRef,
    canvasSize,
    startGameLoop,
    fireProjectile,
  };
};
