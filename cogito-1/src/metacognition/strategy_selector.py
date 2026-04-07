"""认知策略选择器"""

from typing import Dict, Any, List, Optional
import numpy as np


class StrategySelector:
    """策略选择器类"""

    def __init__(self, config: Dict[str, Any]):
        """初始化策略选择器

        Args:
            config: 配置参数
        """
        self.config = config
        self.strategies = config.get('strategies', ['exploration', 'exploitation', 'maintenance'])
        self.exploration_threshold = config.get('exploration_threshold', 0.3)
        self.exploitation_threshold = config.get('exploitation_threshold', 0.7)

    def select(self, global_state: Any, emotion: Dict[str, float], 
              confidence: float) -> str:
        """选择认知策略

        Args:
            global_state: 全局状态
            emotion: 情感状态
            confidence: 置信度

        Returns:
            选择的策略
        """
        # 计算各策略的价值
        strategy_values = {
            'exploration': self._calculate_exploration_value(global_state, emotion, confidence),
            'exploitation': self._calculate_exploitation_value(global_state, emotion, confidence),
            'maintenance': self._calculate_maintenance_value(global_state, emotion, confidence)
        }

        # 选择价值最高的策略
        selected_strategy = max(strategy_values, key=strategy_values.get)

        return selected_strategy

    def _calculate_exploration_value(self, global_state: Any, 
                                   emotion: Dict[str, float], 
                                   confidence: float) -> float:
        """计算探索策略的价值

        Args:
            global_state: 全局状态
            emotion: 情感状态
            confidence: 置信度

        Returns:
            探索策略价值
        """
        value = 0.0

        # 好奇心越高，探索价值越高
        curiosity = getattr(global_state, 'curiosity', 0.3)
        value += curiosity * 0.4

        # 唤醒度越高，探索价值越高
        arousal = emotion.get('arousal', 0.0)
        value += arousal * 0.3

        # 置信度越低，探索价值越高
        value += (1 - confidence) * 0.3

        return value

    def _calculate_exploitation_value(self, global_state: Any, 
                                    emotion: Dict[str, float], 
                                    confidence: float) -> float:
        """计算利用策略的价值

        Args:
            global_state: 全局状态
            emotion: 情感状态
            confidence: 置信度

        Returns:
            利用策略价值
        """
        value = 0.0

        # 置信度越高，利用价值越高
        value += confidence * 0.4

        # 效价越高，利用价值越高
        valence = emotion.get('valence', 0.0)
        value += (valence + 1) / 2 * 0.3  # 转换为0-1范围

        # 有明确目标时，利用价值越高
        if getattr(global_state, 'current_goal', None):
            value += 0.3

        return value

    def _calculate_maintenance_value(self, global_state: Any, 
                                   emotion: Dict[str, float], 
                                   confidence: float) -> float:
        """计算维护策略的价值

        Args:
            global_state: 全局状态
            emotion: 情感状态
            confidence: 置信度

        Returns:
            维护策略价值
        """
        value = 0.0

        # 唤醒度越低，维护价值越高
        arousal = emotion.get('arousal', 0.0)
        value += (1 - arousal) * 0.4

        # 置信度中等时，维护价值越高
        value += (1 - abs(confidence - 0.5) * 2) * 0.3

        # 认知负荷越高，维护价值越高
        cognitive_load = getattr(global_state, 'cognitive_load', 0.0)
        value += cognitive_load * 0.3

        return value

    def get_strategy_description(self, strategy: str) -> str:
        """获取策略描述

        Args:
            strategy: 策略名称

        Returns:
            策略描述
        """
        descriptions = {
            'exploration': "探索新信息和经验，寻求新的解决方案",
            'exploitation': "利用现有知识和技能，高效解决问题",
            'maintenance': "巩固和整理现有知识，优化认知系统"
        }

        return descriptions.get(strategy, "未知策略")

    def get_strategy_parameters(self, strategy: str) -> Dict[str, Any]:
        """获取策略参数

        Args:
            strategy: 策略名称

        Returns:
            策略参数
        """
        parameters = {
            'exploration': {
                'attention_breadth': 0.8,
                'memory_consolidation_rate': 0.3,
                'risk_tolerance': 0.7
            },
            'exploitation': {
                'attention_breadth': 0.3,
                'memory_consolidation_rate': 0.7,
                'risk_tolerance': 0.3
            },
            'maintenance': {
                'attention_breadth': 0.5,
                'memory_consolidation_rate': 0.9,
                'risk_tolerance': 0.5
            }
        }

        return parameters.get(strategy, {})

    def adapt_strategy(self, strategy: str, performance: float) -> str:
        """根据性能调整策略

        Args:
            strategy: 当前策略
            performance: 性能评估（0.0-1.0）

        Returns:
            调整后的策略
        """
        # 如果性能好，继续使用当前策略
        if performance > 0.7:
            return strategy

        # 如果性能差，切换策略
        if strategy == 'exploration':
            return 'exploitation'  # 从探索切换到利用
        elif strategy == 'exploitation':
            return 'exploration'  # 从利用切换到探索
        else:  # maintenance
            return 'exploration'  # 从维护切换到探索

    def predict_strategy_utility(self, strategy: str, context: Dict[str, Any]) -> float:
        """预测策略在特定上下文的效用

        Args:
            strategy: 策略名称
            context: 上下文信息

        Returns:
            预测效用
        """
        utility = 0.0

        if strategy == 'exploration':
            # 上下文不确定性越高，探索策略效用越高
            uncertainty = context.get('uncertainty', 0.5)
            utility = uncertainty
        elif strategy == 'exploitation':
            # 上下文确定性越高，利用策略效用越高
            certainty = 1 - context.get('uncertainty', 0.5)
            utility = certainty
        elif strategy == 'maintenance':
            # 上下文复杂度越高，维护策略效用越高
            complexity = context.get('complexity', 0.5)
            utility = complexity

        return utility

    def get_strategy_transition_probabilities(self, current_strategy: str) -> Dict[str, float]:
        """获取策略转移概率

        Args:
            current_strategy: 当前策略

        Returns:
            转移概率字典
        """
        probabilities = {
            'exploration': {
                'exploration': 0.6,
                'exploitation': 0.3,
                'maintenance': 0.1
            },
            'exploitation': {
                'exploration': 0.2,
                'exploitation': 0.7,
                'maintenance': 0.1
            },
            'maintenance': {
                'exploration': 0.3,
                'exploitation': 0.2,
                'maintenance': 0.5
            }
        }

        return probabilities.get(current_strategy, {})