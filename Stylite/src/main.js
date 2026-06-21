import { GameScene } from './scenes/GameScene.js';

// 获取canvas元素
const canvas = document.getElementById('gameCanvas');

// 启动游戏
const game = new GameScene(canvas);
window.gameInstance = game;

console.log('🔥 火弹术 + 🐉 龙熄术 已启动!');
console.log('左键: 火弹 | 按住右键: 龙熄喷射 | WASD移动');