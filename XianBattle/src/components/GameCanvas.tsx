/**
 * 游戏画布主组件
 * 游戏的主渲染区域，处理点击发射技能事件
 */

import { useGameStore } from '@/store/useGameStore';
import { useGameEngine } from '@/hooks/useGameEngine';
import { HUD } from './HUD';
import { SkillBar } from './SkillBar';
import { StartScreen } from './StartScreen';

/**
 * 游戏画布组件
 * 包含Canvas渲染层、UI层（开始界面、HUD、技能栏）
 */
export const GameCanvas = () => {
  // 从store获取游戏状态
  const { gameStarted, startGame, player, setAutoPlay, isAutoPlay } = useGameStore();

  // 从游戏引擎获取canvas引用和相关函数
  const { canvasRef, canvasSize, fireProjectile } = useGameEngine();

  /**
   * 处理画布点击事件
   * 点击画面时向点击方向发射已冷却的主动技能
   */
  const handleCanvasClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    // 游戏未开始则忽略
    if (!gameStarted) return;

    const rect = canvasRef.current?.getBoundingClientRect();
    if (!rect) return;

    // 获取点击位置（屏幕坐标）
    const clickX = e.clientX - rect.left;
    const clickY = e.clientY - rect.top;

    // 计算相机偏移（玩家在世界中的位置 - 屏幕中心）
    const camX = player.x - canvasSize.width / 2;
    const camY = player.y - canvasSize.height / 2;

    // 转换为世界坐标
    const worldX = clickX + camX;
    const worldY = clickY + camY;

    // 计算面向角度
    const angle = Math.atan2(worldY - player.y, worldX - player.x);

    // 找到已冷却的主动技能并发射
    const readySkill = player.skills.find(s => s.type === 'active' && s.currentCooldown <= 0);
    if (readySkill) {
      fireProjectile(readySkill.id, angle);
    }
  };

  return (
    <div className="relative w-full h-screen overflow-hidden bg-gray-900">
      {/* 游戏Canvas画布 */}
      <canvas
        ref={canvasRef}
        width={canvasSize.width}
        height={canvasSize.height}
        onClick={handleCanvasClick}
        className="block"
      />

      {/* 游戏未开始时显示开始界面 */}
      {!gameStarted && <StartScreen onStart={startGame} />}

      {/* 游戏开始后显示UI层 */}
      {gameStarted && (
        <>
          {/* 顶部状态栏 */}
          <HUD />

          {/* 底部技能栏 */}
          <SkillBar onUseSkill={fireProjectile} />

          {/* 自动战斗切换按钮 */}
          <button
            onClick={() => setAutoPlay(!isAutoPlay)}
            className={`absolute top-4 right-4 px-4 py-2 rounded-lg font-bold transition-all ${
              isAutoPlay ? 'bg-green-600 text-white' : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
            }`}
          >
            {isAutoPlay ? '自动战斗 ON' : '自动战斗 OFF'}
          </button>
        </>
      )}
    </div>
  );
};
