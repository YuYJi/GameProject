"""情感引擎"""

from typing import Dict, Any, Optional, List
import time
import numpy as np


class EmotionEngine:
    """情感引擎类"""

    def __init__(self, config: Dict[str, Any]):
        """初始化情感引擎

        Args:
            config: 配置参数
        """
        self.config = config
        self.valence_range = config.get('valence_range', [-1.0, 1.0])
        self.arousal_range = config.get('arousal_range', [0.0, 1.0])
        self.update_rate = config.get('update_rate', 0.1)
        self.memory_decay = config.get('memory_decay', 0.05)

        # 当前情感状态
        self.current_emotion = {
            'valence': 0.0,  # 效价：-1.0（消极）到 1.0（积极）
            'arousal': 0.0   # 唤醒度：0.0（平静）到 1.0（兴奋）
        }

        # 情感历史
        self.emotion_history = []

        # 上次更新时间
        self.last_update_time = time.time()

    def evaluate(self, processed_info: Dict[str, Any], 
                global_state: Any) -> Dict[str, float]:
        """评估情感状态

        Args:
            processed_info: 处理后的信息
            global_state: 全局状态

        Returns:
            情感状态
        """
        current_time = time.time()
        time_elapsed = current_time - self.last_update_time

        # 计算基础情感反应
        base_emotion = self._calculate_base_emotion(processed_info)

        # 考虑情感历史
        historical_influence = self._calculate_historical_influence(time_elapsed)

        # 整合情感
        new_emotion = {
            'valence': self._clamp_valence(
                self.current_emotion['valence'] * (1 - self.update_rate) +
                base_emotion['valence'] * self.update_rate +
                historical_influence['valence']
            ),
            'arousal': self._clamp_arousal(
                self.current_emotion['arousal'] * (1 - self.update_rate) +
                base_emotion['arousal'] * self.update_rate +
                historical_influence['arousal']
            )
        }

        # 更新当前情感状态
        self.current_emotion = new_emotion

        # 记录情感历史
        self._record_emotion_history(new_emotion, current_time)

        # 更新上次更新时间
        self.last_update_time = current_time

        return new_emotion

    def _calculate_base_emotion(self, processed_info: Dict[str, Any]) -> Dict[str, float]:
        """计算基础情感反应

        Args:
            processed_info: 处理后的信息

        Returns:
            基础情感反应
        """
        valence = 0.0
        arousal = 0.0

        # 基于比较结果计算情感
        if 'comparisons' in processed_info:
            for comparison in processed_info['comparisons']:
                if comparison['is_similar']:
                    valence += 0.1  # 相似性带来积极情感
                else:
                    valence -= 0.05  # 差异带来消极情感

        # 基于绑定结果计算情感
        if 'bindings' in processed_info:
            arousal += len(processed_info['bindings']) * 0.05  # 绑定增加唤醒度

        # 基于模拟结果计算情感
        if 'simulations' in processed_info:
            for simulation in processed_info['simulations']:
                # 模拟增加唤醒度
                arousal += 0.03

        # 基于推理结果计算情感
        if 'inferences' in processed_info:
            for inference in processed_info['inferences']:
                # 推理增加积极情感
                valence += 0.05

        return {
            'valence': valence,
            'arousal': arousal
        }

    def _calculate_historical_influence(self, time_elapsed: float) -> Dict[str, float]:
        """计算历史情感的影响

        Args:
            time_elapsed: 经过的时间

        Returns:
            历史情感影响
        """
        influence = {
            'valence': 0.0,
            'arousal': 0.0
        }

        # 基于时间衰减历史情感影响
        decay = np.exp(-self.memory_decay * time_elapsed)

        # 计算最近情感的影响
        recent_emotions = self.emotion_history[-5:]  # 最近5个情感状态
        for i, (emotion, _) in enumerate(reversed(recent_emotions)):
            weight = decay * (0.8 ** i)  # 越近的情感权重越大
            influence['valence'] += emotion['valence'] * weight
            influence['arousal'] += emotion['arousal'] * weight

        return influence

    def _record_emotion_history(self, emotion: Dict[str, float], timestamp: float):
        """记录情感历史

        Args:
            emotion: 情感状态
            timestamp: 时间戳
        """
        self.emotion_history.append((emotion, timestamp))

        # 限制历史长度
        if len(self.emotion_history) > 100:
            self.emotion_history = self.emotion_history[-100:]

    def _clamp_valence(self, value: float) -> float:
        """限制效价在有效范围内

        Args:
            value: 效价值

        Returns:
            限制后的效价值
        """
        min_valence, max_valence = self.valence_range
        return max(min_valence, min(max_valence, value))

    def _clamp_arousal(self, value: float) -> float:
        """限制唤醒度在有效范围内

        Args:
            value: 唤醒度值

        Returns:
            限制后的唤醒度值
        """
        min_arousal, max_arousal = self.arousal_range
        return max(min_arousal, min(max_arousal, value))

    def get_emotion_label(self, emotion: Optional[Dict[str, float]] = None) -> str:
        """获取情感标签

        Args:
            emotion: 情感状态，默认为当前情感

        Returns:
            情感标签
        """
        if emotion is None:
            emotion = self.current_emotion

        valence = emotion['valence']
        arousal = emotion['arousal']

        # 简单的情感标签映射
        if valence > 0.5 and arousal > 0.5:
            return "快乐"
        elif valence > 0.5 and arousal < 0.5:
            return "满足"
        elif valence < -0.5 and arousal > 0.5:
            return "愤怒"
        elif valence < -0.5 and arousal < 0.5:
            return "悲伤"
        elif arousal > 0.7:
            return "兴奋"
        elif arousal < 0.3:
            return "平静"
        else:
            return "中性"

    def get_emotion_history(self, start_time: Optional[float] = None, 
                          end_time: Optional[float] = None) -> List[Dict[str, Any]]:
        """获取情感历史

        Args:
            start_time: 开始时间
            end_time: 结束时间

        Returns:
            情感历史
        """
        history = []

        for emotion, timestamp in self.emotion_history:
            if (start_time is None or timestamp >= start_time) and \
               (end_time is None or timestamp <= end_time):
                history.append({
                    'emotion': emotion,
                    'label': self.get_emotion_label(emotion),
                    'timestamp': timestamp
                })

        return history

    def reset(self):
        """重置情感引擎"""
        self.current_emotion = {
            'valence': 0.0,
            'arousal': 0.0
        }
        self.emotion_history = []
        self.last_update_time = time.time()