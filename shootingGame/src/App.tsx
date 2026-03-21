import { useEffect, useRef } from 'react'
import Phaser from 'phaser'
import { Game, GameOver } from './game/Game'
import './App.css'

function App() {
  const gameContainerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!gameContainerRef.current) return

    // 获取容器的实际大小
    const updateGameSize = () => {
      if (gameContainerRef.current) {
        const rect = gameContainerRef.current.getBoundingClientRect();
        return {
          width: Math.floor(rect.width),
          height: Math.floor(rect.height)
        };
      }
      return { width: 800, height: 600 };
    };

    const size = updateGameSize();

    const config: Phaser.Types.Core.GameConfig = {
      type: Phaser.AUTO,
      width: size.width,
      height: size.height,
      parent: gameContainerRef.current,
      physics: {
        default: 'arcade',
        arcade: {
          gravity: { x: 0, y: 0 },
          debug: false
        }
      },
      scene: [Game, GameOver],
      scale: {
        mode: Phaser.Scale.FIT,
        autoCenter: Phaser.Scale.CENTER_BOTH
      }
    }

    const game = new Phaser.Game(config)

    // 监听窗口大小变化
    const handleResize = () => {
      const newSize = updateGameSize();
      game.scale.resize(newSize.width, newSize.height);
    };

    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      game.destroy(true);
    }
  }, [])

  return (
    <div className="app">
      <div ref={gameContainerRef} className="game-container"></div>
    </div>
  )
}

export default App
