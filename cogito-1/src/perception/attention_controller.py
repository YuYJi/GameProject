"""自上而下注意控制"""

from typing import Dict, Any, Optional
import numpy as np

from ..core.global_state import GlobalState


class AttentionController:
    """注意力控制器类"""

    def __init__(self, config: Dict[str, Any]):
        """初始化注意力控制器

        Args:
            config: 配置参数
        """
        self.config = config
        self.top_down_weight = config.get('top_down_weight', 0.6)
        self.bottom_up_weight = config.get('bottom_up_weight', 0.4)
        self.attention_duration = config.get('attention_duration', 5.0)

    def control(self, saliency_map: Dict[str, Any], 
                global_state: GlobalState) -> Dict[str, Any]:
        """控制注意力分配

        Args:
            saliency_map: 自下而上的显著性图
            global_state: 全局状态

        Returns:
            注意力权重
        """
        attention_weights = {}

        # 获取自上而下的注意力引导
        top_down_attention = self._get_top_down_attention(global_state)

        # 结合自下而上的显著性和自上而下的引导
        for modality, saliency in saliency_map.items():
            # 计算自下而上的注意力
            bottom_up = saliency
            
            # 计算自上而下的注意力
            if modality in top_down_attention:
                top_down = top_down_attention[modality]
            else:
                # 如果没有特定模态的自上而下引导，使用默认值
                top_down = np.ones_like(bottom_up) * 0.5
            
            # 组合两种注意力
            combined = self.top_down_weight * top_down + self.bottom_up_weight * bottom_up
            
            # 归一化
            if np.max(combined) > 0:
                combined = combined / np.max(combined)
            
            attention_weights[modality] = combined

        return attention_weights

    def _get_top_down_attention(self, global_state: GlobalState) -> Dict[str, np.ndarray]:
        """获取自上而下的注意力引导

        Args:
            global_state: 全局状态

        Returns:
            自上而下的注意力引导
        """
        top_down_attention = {}

        # 根据当前目标生成注意力引导
        if global_state.current_goal:
            # 这里可以根据目标生成特定的注意力引导
            # 为了简化，这里使用一个虚拟的实现
            top_down_attention['fused'] = np.random.rand(512)  # 假设特征维度为512
        
        # 根据情绪状态调整注意力
        if global_state.emotion['arousal'] > 0.7:
            # 高唤醒度时，注意力更加集中
            if 'fused' in top_down_attention:
                top_down_attention['fused'] = np.exp(top_down_attention['fused']) / np.sum(np.exp(top_down_attention['fused']))
        
        return top_down_attention

    def update_attention_span(self, duration: float):
        """更新注意力持续时间

        Args:
            duration: 新的注意力持续时间
        """
        self.attention_duration = max(0.1, duration)

    def get_attention_focus(self, attention_weights: Dict[str, Any]) -> Dict[str, Any]:
        """获取注意力焦点

        Args:
            attention_weights: 注意力权重

        Returns:
            注意力焦点
        """
        focus = {}

        for modality, weights in attention_weights.items():
            # 找到权重最高的位置
            max_index = np.argmax(weights)
            focus[modality] = {
                'index': int(max_index),
                'weight': float(weights[max_index])
            }

        return focus