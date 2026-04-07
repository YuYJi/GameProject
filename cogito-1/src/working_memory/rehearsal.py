"""工作记忆复述与保持机制"""

from typing import Dict, Any, List
import time

from .buffer import Buffer


class Rehearsal:
    """复述与保持机制类"""

    def __init__(self, config: Dict[str, Any]):
        """初始化复述机制

        Args:
            config: 配置参数
        """
        self.config = config
        self.interval = config.get('interval', 2.0)  # 复述间隔（秒）
        self.max_rehearsal_count = config.get('max_rehearsal_count', 5)
        self.rehearsal_strength = config.get('rehearsal_strength', 0.8)

        # 复述历史
        self.rehearsal_history: Dict[int, int] = {}  # 项目索引 -> 复述次数
        self.last_rehearsal_time: Dict[int, float] = {}  # 项目索引 -> 上次复述时间

    def rehearse(self, buffer: Buffer):
        """执行复述操作

        Args:
            buffer: 工作记忆缓冲区
        """
        current_time = time.time()

        # 更新缓冲区强度
        buffer.update_strengths()

        # 获取缓冲区中的项目
        strengths = buffer.get_strengths()

        # 对强度低于阈值的项目进行复述
        for i, strength in enumerate(strengths):
            # 检查是否需要复述
            if strength < 0.5 and self._should_rehearse(i, current_time):
                self._rehearse_item(buffer, i)

    def _should_rehearse(self, index: int, current_time: float) -> bool:
        """判断是否应该复述项目

        Args:
            index: 项目索引
            current_time: 当前时间

        Returns:
            是否应该复述
        """
        # 检查复述次数是否超过上限
        if self.rehearsal_history.get(index, 0) >= self.max_rehearsal_count:
            return False

        # 检查上次复述时间
        last_time = self.last_rehearsal_time.get(index, 0)
        if current_time - last_time < self.interval:
            return False

        return True

    def _rehearse_item(self, buffer: Buffer, index: int):
        """复述项目

        Args:
            buffer: 工作记忆缓冲区
            index: 项目索引
        """
        # 获取项目
        item = buffer.get(index)
        if item:
            # 增强项目强度
            # 注意：这里需要修改 Buffer 类，添加增强强度的方法
            # 为了简化，我们假设 Buffer 类有一个 update_strength 方法
            if hasattr(buffer, 'update_strength'):
                buffer.update_strength(index, self.rehearsal_strength)
            else:
                # 如果没有该方法，我们可以通过重新添加项目来模拟
                buffer.remove(index)
                buffer.add(item)

            # 更新复述历史
            self.rehearsal_history[index] = self.rehearsal_history.get(index, 0) + 1
            self.last_rehearsal_time[index] = time.time()

    def reset_rehearsal_history(self):
        """重置复述历史"""
        self.rehearsal_history = {}
        self.last_rehearsal_time = {}

    def get_rehearsal_stats(self) -> Dict[str, Any]:
        """获取复述统计信息

        Returns:
            复述统计信息
        """
        total_rehearsals = sum(self.rehearsal_history.values())
        average_rehearsals = total_rehearsals / len(self.rehearsal_history) if self.rehearsal_history else 0

        return {
            'total_rehearsals': total_rehearsals,
            'average_rehearsals': average_rehearsals,
            'rehearsal_counts': self.rehearsal_history.copy()
        }

    def adjust_rehearsal_interval(self, new_interval: float):
        """调整复述间隔

        Args:
            new_interval: 新的复述间隔
        """
        self.interval = max(0.1, new_interval)

    def adjust_rehearsal_strength(self, new_strength: float):
        """调整复述强度

        Args:
            new_strength: 新的复述强度
        """
        self.rehearsal_strength = max(0.1, min(1.0, new_strength))