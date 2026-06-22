/**
 * 碰撞检测工具函数
 * 提供游戏中的距离计算和碰撞检测功能
 */

/**
 * 计算两点之间的欧几里得距离
 * @param x1 - 第一个点的X坐标
 * @param y1 - 第一个点的Y坐标
 * @param x2 - 第二个点的X坐标
 * @param y2 - 第二个点的Y坐标
 * @returns 两点之间的距离值
 */
export const distance = (x1: number, y1: number, x2: number, y2: number): number => {
  return Math.sqrt((x2 - x1) ** 2 + (y2 - y1) ** 2);
};

/**
 * 检测两个圆形物体是否发生碰撞（基于碰撞半径）
 * 使用距离公式判断两圆是否重叠
 * @param x1 - 物体1的X坐标
 * @param y1 - 物体1的Y坐标
 * @param r1 - 物体1的碰撞半径
 * @param x2 - 物体2的X坐标
 * @param y2 - 物体2的Y坐标
 * @param r2 - 物体2的碰撞半径
 * @returns 是否发生碰撞
 */
export const checkCollision = (x1: number, y1: number, r1: number, x2: number, y2: number, r2: number): boolean => {
  return distance(x1, y1, x2, y2) < r1 + r2;
};
