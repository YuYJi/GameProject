"""注意焦点生成"""

from typing import Dict, Any, Optional
import numpy as np


class FocusGenerator:
    """注意焦点生成器类"""

    def __init__(self, config: Dict[str, Any]):
        """初始化注意焦点生成器

        Args:
            config: 配置参数
        """
        self.config = config
        self.max_focus_items = config.get('max_focus_items', 3)
        self.focus_shift_threshold = config.get('focus_shift_threshold', 0.5)

    def generate(self, encoded_input: Dict[str, Any], 
                 attention_weights: Dict[str, Any]) -> Dict[str, Any]:
        """生成注意焦点

        Args:
            encoded_input: 编码后的输入特征
            attention_weights: 注意力权重

        Returns:
            注意焦点
        """
        focus = {
            'modalities': {},
            'combined': {}
        }

        # 为每个模态生成焦点
        for modality, weights in attention_weights.items():
            if modality in encoded_input:
                # 找到权重最高的位置
                top_indices = np.argsort(weights)[-self.max_focus_items:][::-1]
                focus['modalities'][modality] = {
                    'indices': top_indices.tolist(),
                    'weights': weights[top_indices].tolist(),
                    'features': encoded_input[modality][top_indices].tolist()
                }

        # 生成组合焦点
        if 'fused' in encoded_input and 'fused' in attention_weights:
            fused_weights = attention_weights['fused']
            top_indices = np.argsort(fused_weights)[-self.max_focus_items:][::-1]
            focus['combined'] = {
                'indices': top_indices.tolist(),
                'weights': fused_weights[top_indices].tolist(),
                'features': encoded_input['fused'][top_indices].tolist()
            }

        # 计算焦点强度
        focus['strength'] = self._calculate_focus_strength(focus)

        return focus

    def _calculate_focus_strength(self, focus: Dict[str, Any]) -> float:
        """计算焦点强度

        Args:
            focus: 注意焦点

        Returns:
            焦点强度
        """
        strengths = []

        # 计算每个模态的焦点强度
        for modality, data in focus['modalities'].items():
            if data['weights']:
                strengths.append(np.max(data['weights']))

        # 计算组合焦点强度
        if focus['combined'] and focus['combined']['weights']:
            strengths.append(np.max(focus['combined']['weights']))

        if not strengths:
            return 0.0

        # 返回平均强度
        return float(np.mean(strengths))

    def should_shift_focus(self, current_focus: Dict[str, Any], 
                          new_focus: Dict[str, Any]) -> bool:
        """判断是否应该转移焦点

        Args:
            current_focus: 当前焦点
            new_focus: 新焦点

        Returns:
            是否应该转移焦点
        """
        # 计算焦点强度差异
        current_strength = current_focus.get('strength', 0.0)
        new_strength = new_focus.get('strength', 0.0)

        # 如果新焦点强度明显高于当前焦点，或者当前焦点强度很低，则转移焦点
        if new_strength - current_strength > self.focus_shift_threshold or current_strength < 0.1:
            return True

        return False

    def merge_focus(self, focus1: Dict[str, Any], 
                   focus2: Dict[str, Any]) -> Dict[str, Any]:
        """合并两个焦点

        Args:
            focus1: 第一个焦点
            focus2: 第二个焦点

        Returns:
            合并后的焦点
        """
        merged = {
            'modalities': {},
            'combined': {},
            'strength': 0.0
        }

        # 合并模态焦点
        for modality in set(focus1['modalities'].keys()) | set(focus2['modalities'].keys()):
            if modality in focus1['modalities'] and modality in focus2['modalities']:
                # 合并两个模态的焦点
                merged['modalities'][modality] = self._merge_modality_focus(
                    focus1['modalities'][modality],
                    focus2['modalities'][modality]
                )
            elif modality in focus1['modalities']:
                merged['modalities'][modality] = focus1['modalities'][modality]
            else:
                merged['modalities'][modality] = focus2['modalities'][modality]

        # 合并组合焦点
        if focus1['combined'] and focus2['combined']:
            merged['combined'] = self._merge_modality_focus(
                focus1['combined'],
                focus2['combined']
            )
        elif focus1['combined']:
            merged['combined'] = focus1['combined']
        else:
            merged['combined'] = focus2['combined']

        # 计算合并后的焦点强度
        merged['strength'] = self._calculate_focus_strength(merged)

        return merged

    def _merge_modality_focus(self, focus1: Dict[str, Any], 
                             focus2: Dict[str, Any]) -> Dict[str, Any]:
        """合并两个模态的焦点

        Args:
            focus1: 第一个模态焦点
            focus2: 第二个模态焦点

        Returns:
            合并后的模态焦点
        """
        # 合并索引和权重
        indices = list(set(focus1['indices'] + focus2['indices']))
        
        # 计算每个索引的权重
        weight_dict = {}
        for i, w in zip(focus1['indices'], focus1['weights']):
            weight_dict[i] = w
        for i, w in zip(focus2['indices'], focus2['weights']):
            if i in weight_dict:
                weight_dict[i] = max(weight_dict[i], w)
            else:
                weight_dict[i] = w
        
        # 按权重排序，取前max_focus_items个
        sorted_indices = sorted(weight_dict.keys(), key=lambda x: weight_dict[x], reverse=True)[:self.max_focus_items]
        sorted_weights = [weight_dict[i] for i in sorted_indices]
        
        return {
            'indices': sorted_indices,
            'weights': sorted_weights,
            'features': []  # 特征需要根据具体情况重新计算
        }