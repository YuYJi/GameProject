/**
 * 游戏类型定义文件
 * 定义游戏中各种实体和状态的TypeScript接口
 */

/**
 * 技能接口
 * @property id - 技能唯一标识符
 * @property name - 技能显示名称
 * @property damage - 技能伤害值
 * @property cooldown - 技能冷却时间（毫秒）
 * @property currentCooldown - 当前剩余冷却时间
 * @property level - 当前等级
 * @property maxLevel - 最大等级
 * @property type - 技能类型：'active'主动技能 | 'passive'被动技能
 * @property range - 技能范围/射程
 * @property color - 技能显示颜色
 * @property description - 技能描述文本
 */
export interface Skill {
  id: string;
  name: string;
  damage: number;
  cooldown: number;
  currentCooldown: number;
  level: number;
  maxLevel: number;
  type: 'active' | 'passive';
  range: number;
  color: string;
  description: string;
}

/**
 * 玩家接口
 * @property x - 世界坐标X
 * @property y - 世界坐标Y
 * @property hp - 当前生命值
 * @property maxHp - 最大生命值
 * @property exp - 当前经验值
 * @property maxExp - 升级所需经验值
 * @property level - 玩家等级
 * @property speed - 移动速度
 * @property skills - 拥有的技能数组
 * @property direction - 面向角度（弧度）
 */
export interface Player {
  x: number;
  y: number;
  hp: number;
  maxHp: number;
  exp: number;
  maxExp: number;
  level: number;
  speed: number;
  skills: Skill[];
  direction: number;
}

/**
 * 敌人接口
 * @property x - 世界坐标X
 * @property y - 世界坐标Y
 * @property hp - 当前生命值
 * @property maxHp - 最大生命值
 * @property damage - 攻击力
 * @property speed - 移动速度
 * @property type - 敌人类型（如'slime'、'bat'、'skeleton'）
 * @property expReward - 击杀奖励经验值
 * @property color - 显示颜色
 * @property size - 碰撞体积半径
 */
export interface Enemy {
  x: number;
  y: number;
  hp: number;
  maxHp: number;
  damage: number;
  speed: number;
  type: string;
  expReward: number;
  color: string;
  size: number;
}

/**
 * 投射物接口（技能子弹/炮弹）
 * @property x - 世界坐标X
 * @property y - 世界坐标Y
 * @property vx - X轴速度分量
 * @property vy - Y轴速度分量
 * @property damage - 伤害值
 * @property range - 已飞行距离
 * @property maxRange - 最大飞行距离
 * @property color - 显示颜色
 * @property size - 半径大小
 */
export interface Projectile {
  x: number;
  y: number;
  vx: number;
  vy: number;
  damage: number;
  range: number;
  maxRange: number;
  color: string;
  size: number;
}

/**
 * 粒子效果接口
 * @property x - 世界坐标X
 * @property y - 世界坐标Y
 * @property vx - X轴速度分量
 * @property vy - Y轴速度分量
 * @property life - 剩余生命周期
 * @property maxLife - 最大生命周期
 * @property color - 显示颜色
 * @property size - 粒子大小
 */
export interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  maxLife: number;
  color: string;
  size: number;
}

/**
 * 游戏状态接口
 * @property player - 玩家数据
 * @property enemies - 场景中所有敌人数组
 * @property projectiles - 场景中所有投射物数组
 * @property particles - 场景中所有粒子数组
 * @property gameStarted - 游戏是否已开始
 * @property isAutoPlay - 是否开启自动战斗
 * @property score - 当前得分
 * @property wave - 当前波次
 */
export interface GameState {
  player: Player;
  enemies: Enemy[];
  projectiles: Projectile[];
  particles: Particle[];
  gameStarted: boolean;
  isAutoPlay: boolean;
  score: number;
  wave: number;
}
