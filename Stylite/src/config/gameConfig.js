// 游戏配置
export const GAME_CONFIG = {
  width: 800,
  height: 600,
  tileSize: 32,
};

// 玩家配置
export const PLAYER_CONFIG = {
  speed: 2.6,
  size: 28,
};

// 敌人配置
export const ENEMY_CONFIG = {
  size: 26,
  maxHp: 100,
  spawnInterval: 3000,
  maxEnemies: 12,
};

// 火弹术配置
export const FIREDAN_CONFIG = {
  size: 14,
  speed: 5.2,
  maxDist: 480,
  explosionRadius: 130,
  damageImpactPath: 28,
  damageBurnPath: 8, // 每秒灼烧伤害
  damageImpactExplosionCenter: 55,
  damageBurnExplosionCenter: 14, // 每秒灼烧伤害
  cooldown: 0.8, // 秒
};

// 龙熄术配置
export const BREATH_CONFIG = {
  duration: 2.2, // 持续喷射秒数
  cooldown: 1.8, // 冷却秒数
  damagePerSec: 42, // 每秒灼烧伤害
  range: 160, // 喷射距离
  width: 0.8, // 弧度 (约45度锥形)
};

// 火雨术配置
export const FIRERAIN_CONFIG = {
  duration: 5.0, // 持续时间（秒）
  cooldown: 10.0, // 冷却时间（秒）
  damagePerTick: 20, // 每次流星伤害
  range: 130, // 范围半径
  meteorInterval: 0.25, // 流星生成间隔（秒）
  meteorSpeed: 18, // 流星下落速度
  meteorCount: 18, // 流星总数（持续期间循环生成）
};

// 挥剑斩击配置
export const SLASH_CONFIG = {
  duration: 0.4, // 斩击持续时间（秒）
  cooldown: 0.6, // 冷却时间（秒）
  damage: 30, // 伤害
  range: 55, // 斩击范围
  knockback: 12, // 击退力度
  arc: Math.PI * 1.5, // 斩击弧度270度
};

// 灼烧配置
export const BURN_CONFIG = {
  duration: 2.8, // 秒
};

// 水波罩配置
export const WATERSHIELD_CONFIG = {
  duration: 10.0, // 持续时间（秒）
  cooldown: 20.0, // 冷却时间（秒）
  radius: 55, // 水球半径
  damageReduction: 0.6, // 伤害减免比例（60%）
  minDamageToBlock: 15, // 可抵御的最小伤害阈值
  rippleInterval: 3.5, // 水波生成间隔（秒）
  maxRipples: 5, // 最大水波数量
};

// UI配置
export const UI_CONFIG = {
  fogRadius: 150, // 清晰视野半径
  fogEdgeRadius: 300, // 迷雾边缘半径（完全黑暗）
  healthBarWidth: 200,
  healthBarHeight: 20,
  expBarWidth: 200,
  expBarHeight: 10,
  skillSlotSize: 50,
  skillSlotSpacing: 10,
};