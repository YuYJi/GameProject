/**
 * 技能栏组件
 * 底部显示所有技能图标、冷却状态和升级按钮
 */

import { useGameStore } from '@/store/useGameStore';

/**
 * 技能栏组件属性
 */
interface SkillBarProps {
  onUseSkill: (skillId: string) => void;  // 使用技能回调函数
}

/**
 * 技能栏组件
 * @param onUseSkill - 点击技能图标时调用的函数
 */
export const SkillBar = ({ onUseSkill }: SkillBarProps) => {
  // 从store获取玩家技能和升级函数
  const { player, advanceSkill } = useGameStore();

  return (
    <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex gap-3">
      {/* 遍历渲染每个技能图标 */}
      {player.skills.map((skill, index) => {
        // 计算冷却进度比例
        const cooldownRatio = skill.currentCooldown / skill.cooldown;
        // 技能是否就绪（冷却完毕）
        const isReady = skill.currentCooldown <= 0;

        return (
          <div
            key={skill.id}
            className="relative cursor-pointer"
            // 点击已就绪的技能时触发
            onClick={() => isReady && onUseSkill(skill.id)}
          >
            {/* 技能图标主体 */}
            <div
              className={`w-16 h-16 border-4 flex items-center justify-center text-white font-bold transition-all ${
                isReady ? 'border-white hover:border-yellow-400 hover:scale-105' : 'border-gray-600 opacity-70'
              }`}
              style={{ backgroundColor: skill.color + '40' }}
            >
              <div className="text-center">
                {/* 快捷键数字 */}
                <div className="text-xs">{index + 1}</div>
                {/* 当前等级 */}
                <div className="text-xs mt-1">Lv.{skill.level}</div>
              </div>
            </div>

            {/* 冷却遮罩层（冷却中时显示） */}
            {!isReady && (
              <div
                className="absolute inset-0 bg-black bg-opacity-60 flex items-center justify-center"
                style={{ clipPath: `inset(${(1 - cooldownRatio) * 100}% 0 0 0)` }}
              >
                <span className="text-white text-xs">
                  {/* 显示剩余冷却秒数 */}
                  {Math.ceil(skill.currentCooldown / 1000)}s
                </span>
              </div>
            )}

            {/* 技能名称 */}
            <div className="text-center text-white text-xs mt-1">{skill.name}</div>

            {/* 技能升级按钮（未满级时显示） */}
            {skill.level < skill.maxLevel && (
              <button
                className="absolute -top-2 -right-2 w-5 h-5 bg-yellow-500 text-black text-xs rounded-full hover:bg-yellow-400"
                onClick={(e) => {
                  e.stopPropagation();  // 阻止触发技能使用
                  advanceSkill(skill.id);
                }}
              >
                ↑
              </button>
            )}
          </div>
        );
      })}
    </div>
  );
};
