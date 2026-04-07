"""艾宾浩斯遗忘曲线实现"""

from typing import Dict, Any, List, Optional
import math


class ForgettingCurve:
    """遗忘曲线类"""

    def __init__(self, config: Dict[str, Any]):
        """初始化遗忘曲线

        Args:
            config: 配置参数
        """
        self.config = config
        self.initial_strength = config.get('initial_strength', 1.0)
        self.decay_constant = config.get('decay_constant', 0.05)
        self.minimum_strength = config.get('minimum_strength', 0.01)

    def calculate_strength(self, initial_strength: float, time_elapsed: float) -> float:
        """计算记忆强度

        Args:
            initial_strength: 初始记忆强度
            time_elapsed: 经过的时间（秒）

        Returns:
            当前记忆强度
        """
        # 艾宾浩斯遗忘曲线公式：S = S0 * e^(-kt)
        # 其中，S是当前强度，S0是初始强度，k是衰减常数，t是时间
        strength = initial_strength * math.exp(-self.decay_constant * time_elapsed / 3600)  # 转换为小时
        return max(self.minimum_strength, strength)

    def get_forgetting_time(self, initial_strength: float, target_strength: float) -> float:
        """计算记忆强度衰减到目标值所需的时间

        Args:
            initial_strength: 初始记忆强度
            target_strength: 目标记忆强度

        Returns:
            所需时间（秒）
        """
        if target_strength >= initial_strength:
            return 0
        if target_strength <= self.minimum_strength:
            # 当目标强度低于最小强度时，返回一个很大的时间值
            return float('inf')

        # 解遗忘曲线方程求时间
        # S = S0 * e^(-kt)
        # ln(S/S0) = -kt
        # t = -ln(S/S0) / k
        time_hours = -math.log(target_strength / initial_strength) / self.decay_constant
        return time_hours * 3600  # 转换为秒

    def update_strength(self, memory: Dict[str, Any], current_time: float) -> float:
        """更新记忆强度

        Args:
            memory: 记忆对象
            current_time: 当前时间

        Returns:
            更新后的记忆强度
        """
        # 获取记忆的创建时间或上次访问时间
        if 'last_access_time' in memory:
            time_elapsed = current_time - memory['last_access_time']
        elif 'creation_time' in memory:
            time_elapsed = current_time - memory['creation_time']
        else:
            return self.initial_strength

        # 获取初始强度
        initial_strength = memory.get('strength', self.initial_strength)

        # 计算当前强度
        current_strength = self.calculate_strength(initial_strength, time_elapsed)

        # 更新记忆强度
        memory['strength'] = current_strength
        memory['last_access_time'] = current_time

        return current_strength

    def should_forget(self, memory: Dict[str, Any]) -> bool:
        """判断是否应该遗忘记忆

        Args:
            memory: 记忆对象

        Returns:
            是否应该遗忘
        """
        strength = memory.get('strength', self.initial_strength)
        return strength <= self.minimum_strength

    def get_retention_rate(self, time_elapsed: float) -> float:
        """获取 retention rate（保持率）

        Args:
            time_elapsed: 经过的时间（秒）

        Returns:
            保持率
        """
        return self.calculate_strength(1.0, time_elapsed)

    def plot_forgetting_curve(self, duration_hours: float = 24) -> Dict[str, List[float]]:
        """绘制遗忘曲线

        Args:
            duration_hours: 持续时间（小时）

        Returns:
            时间和保持率的数据
        """
        times = []
        retention_rates = []

        # 每小时计算一次保持率
        for hour in range(int(duration_hours) + 1):
            time_elapsed = hour * 3600  # 转换为秒
            retention_rate = self.get_retention_rate(time_elapsed)
            times.append(hour)
            retention_rates.append(retention_rate)

        return {
            'times': times,
            'retention_rates': retention_rates
        }