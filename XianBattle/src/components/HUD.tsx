/**
 * 顶部状态栏组件 (HUD)
 * 显示玩家等级、生命值、经验值、得分和当前波次
 */

import { useGameStore } from '@/store/useGameStore';

/**
 * HUD组件
 * 游戏画布上方的状态信息显示
 */
export const HUD = () => {
  // 从store获取游戏状态
  const { player, score, wave } = useGameStore();

  return (
    <div className="absolute top-4 left-4 text-white font-mono">
      {/* 等级显示 */}
      <div className="mb-2">
        <div className="text-yellow-400 text-lg mb-1">等级 {player.level}</div>

        {/* 生命值条 */}
        <div className="flex items-center gap-2">
          <span className="text-red-400">HP</span>
          <div className="w-48 h-4 bg-gray-800 border-2 border-gray-600">
            <div
              className="h-full transition-all duration-200"
              style={{
                width: `${(player.hp / player.maxHp) * 100}%`,
                // 血量颜色：绿色>50%，黄色>25%，红色<=25%
                backgroundColor: player.hp / player.maxHp > 0.5 ? '#22c55e' : player.hp / player.maxHp > 0.25 ? '#eab308' : '#ef4444',
              }}
            />
          </div>
          <span className="text-sm">{Math.ceil(player.hp)}/{player.maxHp}</span>
        </div>

        {/* 经验值条 */}
        <div className="flex items-center gap-2 mt-1">
          <span className="text-blue-400">EXP</span>
          <div className="w-48 h-3 bg-gray-800 border-2 border-gray-600">
            <div
              className="h-full bg-blue-500 transition-all duration-200"
              style={{ width: `${(player.exp / player.maxExp) * 100}%` }}
            />
          </div>
          <span className="text-sm">{player.exp}/{player.maxExp}</span>
        </div>
      </div>

      {/* 得分显示 */}
      <div className="text-cyan-400 text-lg">得分: {score.toLocaleString()}</div>

      {/* 当前波次显示 */}
      <div className="text-purple-400 text-lg">波次: {wave}</div>
    </div>
  );
};
