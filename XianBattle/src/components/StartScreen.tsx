/**
 * 开始界面组件
 * 游戏未开始时显示的欢迎界面，展示技能信息和开始按钮
 */

import { useGameStore } from '@/store/useGameStore';
import { Play, Zap, Shield, Heart } from 'lucide-react';

/**
 * 开始界面组件属性
 */
interface StartScreenProps {
  onStart: () => void;  // 开始游戏回调函数
}

/**
 * 开始界面组件
 * @param onStart - 点击开始按钮时调用的函数
 */
export const StartScreen = ({ onStart }: StartScreenProps) => {
  // 获取玩家初始技能信息
  const { player } = useGameStore();

  return (
    <div className="absolute inset-0 flex flex-col items-center justify-center bg-gradient-to-b from-indigo-950 to-gray-900">
      {/* 游戏标题 */}
      <h1 className="text-6xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 via-pink-500 to-red-500 mb-4">
        仙战
      </h1>
      <p className="text-gray-400 text-lg mb-8">像素割草战斗游戏</p>

      {/* 技能展示区域 */}
      <div className="grid grid-cols-2 gap-4 mb-8 max-w-md">
        {player.skills.map(skill => (
          <div
            key={skill.id}
            className="p-4 rounded-lg border-2 border-gray-700 bg-gray-800 bg-opacity-50"
          >
            {/* 技能名称行 */}
            <div className="flex items-center gap-2 mb-2">
              {/* 技能图标 */}
              <div
                className="w-8 h-8 rounded flex items-center justify-center"
                style={{ backgroundColor: skill.color + '40', color: skill.color }}
              >
                {skill.id === 'fireball' && <Zap size={16} />}
                {skill.id === 'lightning' && <Zap size={16} />}
                {skill.id === 'heal' && <Heart size={16} />}
                {skill.id === 'shield' && <Shield size={16} />}
              </div>
              <span className="text-white font-semibold">{skill.name}</span>
            </div>
            {/* 技能描述 */}
            <p className="text-gray-400 text-sm">{skill.description}</p>
          </div>
        ))}
      </div>

      {/* 操作说明 */}
      <div className="text-gray-500 text-sm mb-8 text-center">
        <p>WASD 或 方向键移动</p>
        <p>1-4 使用技能</p>
      </div>

      {/* 开始游戏按钮 */}
      <button
        onClick={onStart}
        className="group relative px-12 py-4 bg-gradient-to-r from-purple-600 to-pink-600 rounded-lg text-white text-xl font-bold hover:from-purple-500 hover:to-pink-500 transition-all transform hover:scale-105"
      >
        <div className="flex items-center gap-2">
          <Play size={24} />
          开始游戏
        </div>
      </button>
    </div>
  );
};
