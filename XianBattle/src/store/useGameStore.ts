/**
 * 游戏状态管理Store (Zustand)
 * 集中管理游戏中所有状态和操作方法
 */

import { create } from 'zustand';
import { GameState, Player, Enemy, Projectile, Particle, Skill } from '@/types/game';
import { initialSkills } from '@/utils/skills';

/**
 * 初始玩家数据
 * 游戏开始时玩家的默认属性值
 */
const initialPlayer: Player = {
  x: 0,
  y: 0,
  hp: 100,        // 当前生命值
  maxHp: 100,     // 最大生命值
  exp: 0,         // 当前经验
  maxExp: 100,    // 升级所需经验
  level: 1,       // 等级
  speed: 3,       // 移动速度
  skills: initialSkills,  // 初始技能
  direction: 0,   // 面向角度
};

/**
 * 游戏Store接口定义
 * 继承GameState并定义所有操作方法
 */
interface GameStore extends GameState {
  // 游戏流程控制
  startGame: () => void;           // 开始游戏
  resetGame: () => void;           // 重置游戏

  // 玩家操作
  setPlayerPosition: (x: number, y: number) => void;  // 设置玩家位置
  setPlayerHP: (hp: number) => void;                  // 设置生命值
  setPlayerDirection: (dir: number) => void;         // 设置面向角度
  addExp: (exp: number) => void;                      // 添加经验值（会触发升级检测）

  // 敌人操作
  addEnemy: (enemy: Enemy) => void;       // 添加敌人
  removeEnemy: (index: number) => void;   // 移除敌人
  updateEnemies: (enemies: Enemy[]) => void;  // 更新所有敌人

  // 投射物操作
  addProjectile: (projectile: Projectile) => void;      // 添加投射物
  removeProjectile: (index: number) => void;            // 移除投射物
  updateProjectiles: (projectiles: Projectile[]) => void;  // 更新所有投射物

  // 粒子效果操作
  addParticle: (particle: Particle) => void;       // 添加粒子
  updateParticles: (particles: Particle[]) => void;  // 更新所有粒子

  // 技能操作
  updateSkillCooldown: (skillId: string, delta: number) => void;  // 更新冷却时间
  useSkill: (skillId: string) => void;    // 使用技能（设置冷却）
  advanceSkill: (skillId: string) => void;  // 升级技能

  // 系统操作
  setAutoPlay: (auto: boolean) => void;  // 设置自动战斗模式
  addScore: (points: number) => void;     // 添加分数
  setWave: (wave: number) => void;        // 设置波次
}

/**
 * 创建游戏Store
 * 使用Zustand进行状态管理
 */
export const useGameStore = create<GameStore>((set, get) => {
  return {
    // 初始状态
    player: initialPlayer,
    enemies: [],           // 当前场景中的敌人
    projectiles: [],       // 当前场景中的投射物
    particles: [],         // 当前场景中的粒子
    gameStarted: false,   // 游戏是否已开始
    isAutoPlay: false,    // 是否自动战斗
    score: 0,             // 当前得分
    wave: 1,              // 当前波次

    /**
     * 开始游戏
     * 设置gameStarted为true，触发游戏循环
     */
    startGame: () => set({ gameStarted: true }),

    /**
     * 重置游戏
     * 恢复到初始状态，清空所有实体
     */
    resetGame: () => set({
      player: initialPlayer,
      enemies: [],
      projectiles: [],
      particles: [],
      gameStarted: false,
      score: 0,
      wave: 1,
    }),

    /**
     * 设置玩家位置
     * @param x - 新的X坐标
     * @param y - 新的Y坐标
     */
    setPlayerPosition: (x, y) => set(state => ({
      player: { ...state.player, x, y }
    })),

    /**
     * 设置玩家生命值
     * 自动限制在0到最大生命值之间
     * @param hp - 新的生命值
     */
    setPlayerHP: (hp) => set(state => ({
      player: { ...state.player, hp: Math.max(0, Math.min(hp, state.player.maxHp)) }
    })),

    /**
     * 添加经验值
     * 会检测是否升级，升级时增加最大生命值
     * @param exp - 要添加的经验值
     */
    addExp: (exp) => set(state => {
      let newExp = state.player.exp + exp;
      let newLevel = state.player.level;
      let newMaxExp = state.player.maxExp;
      let newMaxHp = state.player.maxHp;

      // 升级检测循环（支持一次获得大量经验连升多级）
      while (newExp >= newMaxExp) {
        newExp -= newMaxExp;
        newLevel++;
        newMaxExp = Math.floor(newMaxExp * 1.5);  // 升级所需经验增长1.5倍
        newMaxHp += 10;  // 升级增加10点最大生命
      }

      return {
        player: {
          ...state.player,
          exp: newExp,
          level: newLevel,
          maxExp: newMaxExp,
          maxHp: newMaxHp,
          hp: Math.min(state.player.hp + 10, newMaxHp),  // 升级恢复10点血
        }
      };
    }),

    /**
     * 添加敌人到场景
     * @param enemy - 敌人对象
     */
    addEnemy: (enemy) => set(state => ({
      enemies: [...state.enemies, enemy]
    })),

    /**
     * 按索引移除敌人
     * @param index - 要移除的敌人索引
     */
    removeEnemy: (index) => set(state => ({
      enemies: state.enemies.filter((_, i) => i !== index)
    })),

    /**
     * 更新所有敌人（批量替换）
     * @param enemies - 新的敌人数组
     */
    updateEnemies: (enemies) => set({ enemies }),

    /**
     * 添加投射物
     * @param projectile - 投射物对象
     */
    addProjectile: (projectile) => set(state => ({
      projectiles: [...state.projectiles, projectile]
    })),

    /**
     * 按索引移除投射物
     * @param index - 要移除的投射物索引
     */
    removeProjectile: (index) => set(state => ({
      projectiles: state.projectiles.filter((_, i) => i !== index)
    })),

    /**
     * 更新所有投射物（批量替换）
     * @param projectiles - 新的投射物数组
     */
    updateProjectiles: (projectiles) => set({ projectiles }),

    /**
     * 添加粒子效果
     * @param particle - 粒子对象
     */
    addParticle: (particle) => set(state => ({
      particles: [...state.particles, particle]
    })),

    /**
     * 更新所有粒子（批量替换）
     * @param particles - 新的粒子数组
     */
    updateParticles: (particles) => set({ particles }),

    /**
     * 更新技能冷却时间
     * 每帧调用，逐步减少冷却
     * @param skillId - 技能ID
     * @param delta - 时间增量（毫秒）
     */
    updateSkillCooldown: (skillId, delta) => set(state => ({
      player: {
        ...state.player,
        skills: state.player.skills.map(skill =>
          skill.id === skillId
            ? { ...skill, currentCooldown: Math.max(0, skill.currentCooldown - delta) }
            : skill
        )
      }
    })),

    /**
     * 使用技能
     * 设置技能进入冷却状态
     * @param skillId - 技能ID
     */
    useSkill: (skillId) => set(state => ({
      player: {
        ...state.player,
        skills: state.player.skills.map(skill =>
          skill.id === skillId && skill.currentCooldown <= 0
            ? { ...skill, currentCooldown: skill.cooldown }
            : skill
        )
      }
    })),

    /**
     * 升级技能
     * 提升伤害、缩短冷却、增加范围
     * @param skillId - 技能ID
     */
    advanceSkill: (skillId) => set(state => ({
      player: {
        ...state.player,
        skills: state.player.skills.map(skill =>
          skill.id === skillId && skill.level < skill.maxLevel
            ? {
                ...skill,
                level: skill.level + 1,
                damage: skill.damage * 1.3,      // 伤害提升30%
                cooldown: Math.max(skill.cooldown * 0.9, 200),  // 冷却缩短10%，最低200ms
                range: skill.range * 1.1,       // 范围提升10%
              }
            : skill
        )
      }
    })),

    /**
     * 设置自动战斗模式
     * @param auto - 是否开启自动战斗
     */
    setAutoPlay: (auto) => set({ isAutoPlay: auto }),

    /**
     * 添加分数
     * @param points - 要添加的分数
     */
    addScore: (points) => set(state => ({ score: state.score + points })),

    /**
     * 设置当前波次
     * @param wave - 波次数字
     */
    setWave: (wave) => set({ wave }),

    /**
     * 设置玩家面向角度
     * @param dir - 角度（弧度）
     */
    setPlayerDirection: (dir) => set(state => ({
      player: { ...state.player, direction: dir }
    })),
  };
});
