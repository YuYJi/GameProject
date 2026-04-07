"""感知系统单元测试"""

import pytest
import numpy as np
from src.perception import Encoder, SaliencyDetector, AttentionController, FocusGenerator
from src.core.global_state import GlobalState


class TestEncoder:
    """测试编码器"""

    def test_encode(self):
        """测试编码功能"""
        config = {'embedding_dim': 10}
        encoder = Encoder(config)

        # 测试图像输入
        image_input = {'image': np.random.rand(64, 64, 3)}
        encoded = encoder.encode(image_input)
        assert 'image' in encoded
        assert 'fused' in encoded
        assert len(encoded['fused']) == 10

        # 测试文本输入
        text_input = {'text': 'Hello world'}
        encoded = encoder.encode(text_input)
        assert 'text' in encoded
        assert 'fused' in encoded
        assert len(encoded['fused']) == 10

        # 测试多模态输入
        multi_input = {'image': np.random.rand(64, 64, 3), 'text': 'Hello world'}
        encoded = encoder.encode(multi_input)
        assert 'image' in encoded
        assert 'text' in encoded
        assert 'fused' in encoded
        assert len(encoded['fused']) == 10


class TestSaliencyDetector:
    """测试显著性检测器"""

    def test_detect(self):
        """测试显著性检测功能"""
        config = {'window_size': 5, 'threshold': 0.7}
        detector = SaliencyDetector(config)

        # 测试融合特征
        encoded_input = {'fused': np.random.rand(10)}
        saliency_map = detector.detect(encoded_input)
        assert 'fused' in saliency_map
        assert len(saliency_map['fused']) == 10

        # 测试多模态特征
        encoded_input = {
            'fused': np.random.rand(10),
            'image': np.random.rand(10),
            'text': np.random.rand(10)
        }
        saliency_map = detector.detect(encoded_input)
        assert 'fused' in saliency_map
        assert 'image' in saliency_map
        assert 'text' in saliency_map

    def test_get_salient_regions(self):
        """测试获取显著区域"""
        config = {'window_size': 5, 'threshold': 0.7}
        detector = SaliencyDetector(config)

        # 创建显著性图
        saliency_map = {
            'fused': np.array([0.1, 0.5, 0.9, 0.3, 0.7])
        }

        # 获取显著区域
        salient_regions = detector.get_salient_regions(saliency_map, top_k=2)
        assert 'fused' in salient_regions
        assert len(salient_regions['fused']['indices']) == 2
        assert salient_regions['fused']['indices'][0] == 2  # 最高值的索引


class TestAttentionController:
    """测试注意力控制器"""

    def test_control(self):
        """测试注意力控制功能"""
        config = {'top_down_weight': 0.6, 'bottom_up_weight': 0.4}
        controller = AttentionController(config)
        global_state = GlobalState()

        # 创建显著性图
        saliency_map = {
            'fused': np.array([0.1, 0.5, 0.9, 0.3, 0.7])
        }

        # 控制注意力
        attention_weights = controller.control(saliency_map, global_state)
        assert 'fused' in attention_weights
        assert len(attention_weights['fused']) == 5

    def test_get_attention_focus(self):
        """测试获取注意力焦点"""
        config = {'top_down_weight': 0.6, 'bottom_up_weight': 0.4}
        controller = AttentionController(config)

        # 创建注意力权重
        attention_weights = {
            'fused': np.array([0.1, 0.5, 0.9, 0.3, 0.7])
        }

        # 获取注意力焦点
        focus = controller.get_attention_focus(attention_weights)
        assert 'fused' in focus
        assert focus['fused']['index'] == 2  # 最高权重的索引
        assert focus['fused']['weight'] == 0.9  # 最高权重值


class TestFocusGenerator:
    """测试注意焦点生成器"""

    def test_generate(self):
        """测试生成注意焦点"""
        config = {'max_focus_items': 2, 'focus_shift_threshold': 0.5}
        generator = FocusGenerator(config)

        # 创建编码输入和注意力权重
        encoded_input = {
            'fused': np.random.rand(10),
            'image': np.random.rand(10)
        }
        attention_weights = {
            'fused': np.array([0.1, 0.9, 0.3, 0.7, 0.5, 0.2, 0.8, 0.4, 0.6, 0.1]),
            'image': np.array([0.5, 0.3, 0.9, 0.1, 0.7, 0.2, 0.4, 0.8, 0.6, 0.1])
        }

        # 生成注意焦点
        focus = generator.generate(encoded_input, attention_weights)
        assert 'modalities' in focus
        assert 'fused' in focus['modalities']
        assert 'image' in focus['modalities']
        assert 'combined' in focus
        assert 'strength' in focus

    def test_should_shift_focus(self):
        """测试是否应该转移焦点"""
        config = {'max_focus_items': 2, 'focus_shift_threshold': 0.5}
        generator = FocusGenerator(config)

        # 创建当前焦点和新焦点
        current_focus = {'strength': 0.3}
        new_focus = {'strength': 0.9}

        # 测试应该转移焦点
        assert generator.should_shift_focus(current_focus, new_focus)

        # 测试不应该转移焦点
        current_focus = {'strength': 0.8}
        new_focus = {'strength': 0.9}
        assert not generator.should_shift_focus(current_focus, new_focus)

    def test_merge_focus(self):
        """测试合并焦点"""
        config = {'max_focus_items': 2, 'focus_shift_threshold': 0.5}
        generator = FocusGenerator(config)

        # 创建两个焦点
        focus1 = {
            'modalities': {
                'fused': {'indices': [1, 2], 'weights': [0.9, 0.8]}
            },
            'combined': {'indices': [1, 2], 'weights': [0.9, 0.8]},
            'strength': 0.9
        }
        focus2 = {
            'modalities': {
                'fused': {'indices': [2, 3], 'weights': [0.8, 0.7]}
            },
            'combined': {'indices': [2, 3], 'weights': [0.8, 0.7]},
            'strength': 0.8
        }

        # 合并焦点
        merged = generator.merge_focus(focus1, focus2)
        assert 'modalities' in merged
        assert 'fused' in merged['modalities']
        assert 'combined' in merged
        assert 'strength' in merged
