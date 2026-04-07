"""工作记忆操作器"""

from typing import Dict, Any, List, Optional
import numpy as np

from .buffer import Buffer


class Operator:
    """工作记忆操作器类"""

    def __init__(self, config: Dict[str, Any]):
        """初始化操作器

        Args:
            config: 配置参数
        """
        self.config = config
        self.max_operations = config.get('max_operations', 10)
        self.comparison_threshold = config.get('comparison_threshold', 0.8)
        self.simulation_depth = config.get('simulation_depth', 3)

    def process(self, buffer: Buffer) -> Dict[str, Any]:
        """处理工作记忆中的信息

        Args:
            buffer: 工作记忆缓冲区

        Returns:
            处理结果
        """
        # 获取缓冲区内容
        items = buffer.get_all()
        if not items:
            return {}

        # 执行操作
        results = {
            'comparisons': [],
            'bindings': [],
            'simulations': [],
            'inferences': []
        }

        # 比较操作
        if len(items) >= 2:
            results['comparisons'] = self._compare_items(items)

        # 绑定操作
        if len(items) >= 2:
            results['bindings'] = self._bind_items(items)

        # 反事实模拟
        results['simulations'] = self._simulate_counterfactuals(items)

        # 推理操作
        results['inferences'] = self._perform_inferences(items)

        return results

    def _compare_items(self, items: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
        """比较项目

        Args:
            items: 项目列表

        Returns:
            比较结果
        """
        comparisons = []
        operation_count = 0

        # 比较每对项目
        for i in range(len(items)):
            for j in range(i + 1, len(items)):
                if operation_count >= self.max_operations:
                    break

                similarity = self._calculate_similarity(items[i], items[j])
                comparisons.append({
                    'items': [i, j],
                    'similarity': similarity,
                    'is_similar': similarity > self.comparison_threshold
                })
                operation_count += 1

        return comparisons

    def _bind_items(self, items: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
        """绑定项目

        Args:
            items: 项目列表

        Returns:
            绑定结果
        """
        bindings = []
        operation_count = 0

        # 尝试绑定相关项目
        for i in range(len(items)):
            for j in range(len(items)):
                if i != j and operation_count < self.max_operations:
                    if self._are_bindable(items[i], items[j]):
                        binding = self._create_binding(items[i], items[j])
                        bindings.append({
                            'items': [i, j],
                            'binding': binding
                        })
                        operation_count += 1

        return bindings

    def _simulate_counterfactuals(self, items: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
        """模拟反事实情况

        Args:
            items: 项目列表

        Returns:
            模拟结果
        """
        simulations = []
        operation_count = 0

        # 对每个项目进行反事实模拟
        for i, item in enumerate(items):
            if operation_count >= self.max_operations:
                break

            simulation = self._simulate_counterfactual(item, self.simulation_depth)
            simulations.append({
                'item': i,
                'simulation': simulation
            })
            operation_count += 1

        return simulations

    def _perform_inferences(self, items: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
        """执行推理

        Args:
            items: 项目列表

        Returns:
            推理结果
        """
        inferences = []
        operation_count = 0

        # 基于项目执行推理
        for i, item in enumerate(items):
            if operation_count >= self.max_operations:
                break

            inference = self._infer_from_item(item)
            if inference:
                inferences.append({
                    'item': i,
                    'inference': inference
                })
                operation_count += 1

        return inferences

    def _calculate_similarity(self, item1: Dict[str, Any], item2: Dict[str, Any]) -> float:
        """计算两个项目的相似度

        Args:
            item1: 第一个项目
            item2: 第二个项目

        Returns:
            相似度
        """
        # 简单的相似度计算
        # 在实际应用中，可以使用更复杂的方法
        try:
            # 提取特征向量
            feat1 = self._extract_features(item1)
            feat2 = self._extract_features(item2)

            # 计算余弦相似度
            if len(feat1) > 0 and len(feat2) > 0:
                dot_product = np.dot(feat1, feat2)
                norm1 = np.linalg.norm(feat1)
                norm2 = np.linalg.norm(feat2)
                if norm1 > 0 and norm2 > 0:
                    return float(dot_product / (norm1 * norm2))
        except Exception:
            pass

        return 0.0

    def _extract_features(self, item: Dict[str, Any]) -> np.ndarray:
        """从项目中提取特征

        Args:
            item: 项目

        Returns:
            特征向量
        """
        # 简单的特征提取
        # 在实际应用中，可以使用更复杂的方法
        features = []

        # 提取数值特征
        if isinstance(item, dict):
            for value in item.values():
                if isinstance(value, (int, float)):
                    features.append(value)
                elif isinstance(value, (list, np.ndarray)):
                    for v in value:
                        if isinstance(v, (int, float)):
                            features.append(v)

        # 如果没有提取到特征，返回默认向量
        if not features:
            return np.zeros(10)  # 默认特征维度

        # 归一化
        features = np.array(features)
        if np.max(features) > 0:
            features = features / np.max(features)

        # 截断或填充到固定长度
        max_length = 10
        if len(features) > max_length:
            features = features[:max_length]
        elif len(features) < max_length:
            features = np.pad(features, (0, max_length - len(features)))

        return features

    def _are_bindable(self, item1: Dict[str, Any], item2: Dict[str, Any]) -> bool:
        """判断两个项目是否可绑定

        Args:
            item1: 第一个项目
            item2: 第二个项目

        Returns:
            是否可绑定
        """
        # 简单的绑定条件判断
        # 在实际应用中，可以使用更复杂的方法
        similarity = self._calculate_similarity(item1, item2)
        return similarity > 0.3

    def _create_binding(self, item1: Dict[str, Any], item2: Dict[str, Any]) -> Dict[str, Any]:
        """创建项目绑定

        Args:
            item1: 第一个项目
            item2: 第二个项目

        Returns:
            绑定结果
        """
        # 简单的绑定创建
        # 在实际应用中，可以使用更复杂的方法
        binding = {
            'type': 'binding',
            'items': [item1, item2],
            'similarity': self._calculate_similarity(item1, item2)
        }

        return binding

    def _simulate_counterfactual(self, item: Dict[str, Any], depth: int) -> Dict[str, Any]:
        """模拟反事实情况

        Args:
            item: 原始项目
            depth: 模拟深度

        Returns:
            模拟结果
        """
        # 简单的反事实模拟
        # 在实际应用中，可以使用更复杂的方法
        simulation = {
            'original': item,
            'counterfactuals': []
        }

        # 生成反事实情况
        for i in range(min(depth, 3)):
            counterfactual = self._generate_counterfactual(item, i)
            simulation['counterfactuals'].append(counterfactual)

        return simulation

    def _generate_counterfactual(self, item: Dict[str, Any], variation: int) -> Dict[str, Any]:
        """生成反事实情况

        Args:
            item: 原始项目
            variation: 变异类型

        Returns:
            反事实情况
        """
        # 简单的反事实生成
        # 在实际应用中，可以使用更复杂的方法
        counterfactual = item.copy()

        # 对数值字段进行变异
        if isinstance(counterfactual, dict):
            for key, value in counterfactual.items():
                if isinstance(value, (int, float)):
                    # 根据变异类型进行不同的修改
                    if variation == 0:
                        counterfactual[key] = value * 0.8  # 减少
                    elif variation == 1:
                        counterfactual[key] = value * 1.2  # 增加
                    elif variation == 2:
                        counterfactual[key] = -value  # 反转

        return counterfactual

    def _infer_from_item(self, item: Dict[str, Any]) -> Optional[Dict[str, Any]]:
        """从项目中执行推理

        Args:
            item: 项目

        Returns:
            推理结果
        """
        # 简单的推理
        # 在实际应用中，可以使用更复杂的方法
        if isinstance(item, dict):
            # 基于项目内容进行推理
            if 'features' in item:
                return {
                    'type': 'feature_based_inference',
                    'input': item,
                    'conclusion': 'Inferred from features'
                }
        return None