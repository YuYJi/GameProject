"""好奇心系统"""

from typing import Dict, Any, List, Optional
import numpy as np


class CuriositySystem:
    """好奇心系统类"""

    def __init__(self, config: Dict[str, Any]):
        """初始化好奇心系统

        Args:
            config: 配置参数
        """
        self.config = config
        self.prediction_error_weight = config.get('prediction_error_weight', 0.8)
        self.novelty_weight = config.get('novelty_weight', 0.2)
        self.baseline = config.get('baseline', 0.3)
        self.max_value = config.get('max_value', 1.0)

        # 当前好奇心水平
        self.current_curiosity = self.baseline

    def calculate(self, processed_info: Dict[str, Any], 
                 retrieved_memories: List[Dict[str, Any]]) -> float:
        """计算好奇心水平

        Args:
            processed_info: 处理后的信息
            retrieved_memories: 检索到的记忆

        Returns:
            好奇心水平
        """
        # 计算预测误差
        prediction_error = self._calculate_prediction_error(processed_info, retrieved_memories)

        # 计算新颖性
        novelty = self._calculate_novelty(processed_info, retrieved_memories)

        # 计算总好奇心
        curiosity = (
            self.prediction_error_weight * prediction_error +
            self.novelty_weight * novelty +
            self.baseline
        )

        # 限制在有效范围内
        curiosity = max(0.0, min(self.max_value, curiosity))

        # 更新当前好奇心水平
        self.current_curiosity = curiosity

        return curiosity

    def _calculate_prediction_error(self, processed_info: Dict[str, Any], 
                                  retrieved_memories: List[Dict[str, Any]]) -> float:
        """计算预测误差

        Args:
            processed_info: 处理后的信息
            retrieved_memories: 检索到的记忆

        Returns:
            预测误差
        """
        if not retrieved_memories:
            return 1.0  # 没有检索到记忆，预测误差高

        # 计算处理信息与检索记忆的差异
        error = 0.0
        comparison_count = 0

        # 比较处理信息中的比较结果
        if 'comparisons' in processed_info:
            for comparison in processed_info['comparisons']:
                error += 1 - comparison.get('similarity', 0.5)
                comparison_count += 1

        # 比较处理信息中的推理结果
        if 'inferences' in processed_info:
            for inference in processed_info['inferences']:
                # 简单的推理误差计算
                error += 0.5
                comparison_count += 1

        if comparison_count > 0:
            return error / comparison_count
        else:
            return 0.5  # 默认误差

    def _calculate_novelty(self, processed_info: Dict[str, Any], 
                         retrieved_memories: List[Dict[str, Any]]) -> float:
        """计算新颖性

        Args:
            processed_info: 处理后的信息
            retrieved_memories: 检索到的记忆

        Returns:
            新颖性
        """
        if not retrieved_memories:
            return 1.0  # 没有检索到记忆，新颖性高

        # 计算处理信息的特征
        processed_features = self._extract_features(processed_info)

        # 计算检索记忆的特征
        memory_features = []
        for memory in retrieved_memories:
            memory_features.append(self._extract_features(memory))

        # 计算新颖性
        novelty = 0.0
        for mem_feat in memory_features:
            distance = self._calculate_feature_distance(processed_features, mem_feat)
            novelty += distance

        if memory_features:
            return novelty / len(memory_features)
        else:
            return 0.5  # 默认新颖性

    def _extract_features(self, data: Dict[str, Any]) -> np.ndarray:
        """从数据中提取特征

        Args:
            data: 输入数据

        Returns:
            特征向量
        """
        features = []

        # 提取比较结果特征
        if 'comparisons' in data:
            comparisons = data['comparisons']
            features.append(len(comparisons))
            if comparisons:
                avg_similarity = np.mean([c.get('similarity', 0.5) for c in comparisons])
                features.append(avg_similarity)
            else:
                features.append(0.5)

        # 提取绑定结果特征
        if 'bindings' in data:
            features.append(len(data['bindings']))

        # 提取模拟结果特征
        if 'simulations' in data:
            features.append(len(data['simulations']))

        # 提取推理结果特征
        if 'inferences' in data:
            features.append(len(data['inferences']))

        # 提取内容特征
        content = data.get('content', {})
        if isinstance(content, dict):
            features.append(len(content))

        # 确保特征向量长度一致
        while len(features) < 5:
            features.append(0.0)
        while len(features) > 5:
            features = features[:5]

        return np.array(features)

    def _calculate_feature_distance(self, feat1: np.ndarray, 
                                  feat2: np.ndarray) -> float:
        """计算特征距离

        Args:
            feat1: 第一个特征向量
            feat2: 第二个特征向量

        Returns:
            距离
        """
        # 使用欧几里得距离
        distance = np.linalg.norm(feat1 - feat2)
        # 归一化到0-1范围
        return min(1.0, distance / np.sqrt(len(feat1)))

    def get_curiosity_level(self) -> float:
        """获取当前好奇心水平

        Returns:
            好奇心水平
        """
        return self.current_curiosity

    def get_curiosity_interpretation(self, curiosity: Optional[float] = None) -> str:
        """获取好奇心解释

        Args:
            curiosity: 好奇心水平，默认为当前水平

        Returns:
            好奇心解释
        """
        if curiosity is None:
            curiosity = self.current_curiosity

        if curiosity >= 0.8:
            return "非常好奇"
        elif curiosity >= 0.6:
            return "比较好奇"
        elif curiosity >= 0.4:
            return "有点好奇"
        else:
            return "不怎么好奇"

    def update_baseline(self, new_baseline: float):
        """更新好奇心基线

        Args:
            new_baseline: 新的基线值
        """
        self.baseline = max(0.0, min(self.max_value, new_baseline))

    def get_exploration_targets(self, curiosity: Optional[float] = None) -> List[str]:
        """获取探索目标

        Args:
            curiosity: 好奇心水平，默认为当前水平

        Returns:
            探索目标列表
        """
        if curiosity is None:
            curiosity = self.current_curiosity

        targets = []

        if curiosity >= 0.8:
            targets = ["新领域探索", "复杂问题解决", "创新思维"]
        elif curiosity >= 0.6:
            targets = ["相关领域探索", "中等难度问题", "创意表达"]
        elif curiosity >= 0.4:
            targets = ["熟悉领域深化", "简单问题解决", "知识巩固"]
        else:
            targets = ["现有知识应用", "常规任务执行", "休息调整"]

        return targets

    def predict_exploration_value(self, target: str, context: Dict[str, Any]) -> float:
        """预测探索目标的价值

        Args:
            target: 探索目标
            context: 上下文信息

        Returns:
            预测价值
        """
        # 简单的价值预测
        value = 0.0

        # 基于目标类型
        if target in ["新领域探索", "复杂问题解决", "创新思维"]:
            value = 0.9
        elif target in ["相关领域探索", "中等难度问题", "创意表达"]:
            value = 0.7
        elif target in ["熟悉领域深化", "简单问题解决", "知识巩固"]:
            value = 0.5
        else:
            value = 0.3

        # 基于上下文调整
        uncertainty = context.get('uncertainty', 0.5)
        value *= (0.5 + uncertainty * 0.5)

        return value

    def reset(self):
        """重置好奇心系统"""
        self.current_curiosity = self.baseline