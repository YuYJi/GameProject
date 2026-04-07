"""自下而上显著性检测"""

from typing import Dict, Any, Optional
import numpy as np


class SaliencyDetector:
    """显著性检测器类"""

    def __init__(self, config: Dict[str, Any]):
        """初始化显著性检测器

        Args:
            config: 配置参数
        """
        self.config = config
        self.window_size = config.get('window_size', 10)
        self.threshold = config.get('threshold', 0.7)
        self.model = config.get('model', 'deepgaze')

    def detect(self, encoded_input: Dict[str, Any]) -> Dict[str, Any]:
        """检测输入中的显著区域

        Args:
            encoded_input: 编码后的输入特征

        Returns:
            显著性图
        """
        saliency_map = {}

        # 处理融合特征
        if 'fused' in encoded_input:
            saliency_map['fused'] = self._calculate_saliency(encoded_input['fused'])

        # 处理图像特征
        if 'image' in encoded_input:
            saliency_map['image'] = self._calculate_saliency(encoded_input['image'])

        # 处理文本特征
        if 'text' in encoded_input:
            saliency_map['text'] = self._calculate_saliency(encoded_input['text'])

        # 处理音频特征
        if 'audio' in encoded_input:
            saliency_map['audio'] = self._calculate_saliency(encoded_input['audio'])

        return saliency_map

    def _calculate_saliency(self, features: np.ndarray) -> np.ndarray:
        """计算特征的显著性

        Args:
            features: 输入特征

        Returns:
            显著性得分
        """
        # 简单的显著性计算：基于特征的方差和激活值
        # 在实际应用中，可以使用更复杂的模型，如 DeepGaze
        
        # 计算特征的激活强度
        activation = np.abs(features)
        
        # 计算局部对比度
        if len(features) > self.window_size:
            local_std = np.zeros_like(features)
            for i in range(len(features)):
                start = max(0, i - self.window_size // 2)
                end = min(len(features), i + self.window_size // 2 + 1)
                local_std[i] = np.std(features[start:end])
        else:
            local_std = np.ones_like(features) * np.std(features)
        
        # 组合激活强度和局部对比度
        saliency = activation * local_std
        
        # 归一化
        if np.max(saliency) > 0:
            saliency = saliency / np.max(saliency)
        
        return saliency

    def get_salient_regions(self, saliency_map: Dict[str, Any], 
                           top_k: int = 3) -> Dict[str, Any]:
        """获取最显著的区域

        Args:
            saliency_map: 显著性图
            top_k: 返回前k个显著区域

        Returns:
            显著区域信息
        """
        salient_regions = {}

        for modality, saliency in saliency_map.items():
            # 找到top_k个显著位置
            top_indices = np.argsort(saliency)[-top_k:][::-1]
            salient_regions[modality] = {
                'indices': top_indices.tolist(),
                'scores': saliency[top_indices].tolist()
            }

        return salient_regions