/**
 * 技能系统工具函数
 * 负责技能的创建、初始化和升级逻辑
 */

import { Skill } from '@/types/game';

/**
 * 创建技能对象的工厂函数
 * @param id - 技能唯一标识符
 * @param name - 技能显示名称
 * @param type - 技能类型（主动/被动）
 * @param damage - 基础伤害值
 * @param cooldown - 冷却时间（毫秒）
 * @param range - 技能范围/射程
 * @param color - 技能显示颜色
 * @param description - 技能描述
 * @returns 完整的技能对象
 */
export const createSkill = (id: string, name: string, type: 'active' | 'passive', damage: number, cooldown: number, range: number, color: string, description: string): Skill => ({
  id,
  name,
  damage,
  cooldown,
  currentCooldown: 0,
  level: 1,
  maxLevel: 5,
  type,
  range,
  color,
  description,
});

/**
 * 游戏初始技能列表
 * 包含5种基础技能：火球术、闪电链、烈焰斩、治疗术、护盾
 */
export const initialSkills: Skill[] = [
  createSkill('fireball', '火球术', 'active', 25, 1000, 200, '#e94560', '发射一枚火球'),
  createSkill('lightning', '闪电链', 'active', 15, 800, 150, '#00d4ff', '闪电攻击'),
  createSkill('slash', '烈焰斩', 'active', 30, 1500, 150, '#f97316', '向前方扇形区域造成伤害'),
  createSkill('heal', '治疗术', 'passive', 0, 3000, 0, '#4ade80', '恢复生命'),
  createSkill('shield', '护盾', 'passive', 0, 5000, 50, '#60a5fa', '获得护盾'),
];

/**
 * 技能升级函数
 * 升级时提升伤害、缩小冷却时间、增加范围
 * @param skill - 要升级的技能
 * @returns 升级后的新技能对象
 */
export const advanceSkill = (skill: Skill): Skill => ({
  ...skill,
  level: Math.min(skill.level + 1, skill.maxLevel),
  damage: skill.damage * 1.3,
  cooldown: Math.max(skill.cooldown * 0.9, 200),
  range: skill.range * 1.1,
});
