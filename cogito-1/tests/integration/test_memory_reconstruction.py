"""记忆重构集成测试"""

import pytest
import time
from src.long_term_memory import EpisodicMemory


class TestMemoryReconstruction:
    """测试记忆重构"""

    def test_reconstruction(self):
        """测试记忆重构"""
        # 创建配置
        config = {
            'event_log_size': 100,
            'reconstruction_depth': 3
        }

        # 创建情景记忆
        episodic_memory = EpisodicMemory(config)

        # 存储事件
        events = [
            {'content': 'Event 1: First event'},
            {'content': 'Event 2: Second event'},
            {'content': 'Event 3: Third event'}
        ]

        for i, event in enumerate(events):
            emotion = {'valence': 0.5, 'arousal': 0.5}
            timestamp = time.time() + i * 10  # 每个事件间隔10秒
            episodic_memory.store(event, emotion, timestamp)

        # 检索事件
        cues = {'content': {'content': 'event'}}
        results = episodic_memory.retrieve(cues, threshold=0.1)

        # 检查重构结果
        assert len(results) > 0
        for result in results:
            assert 'original' in result
            assert 'reconstructed' in result
            assert 'context' in result
            assert 'narrative' in result
            assert 'reconstruction_time' in result

    def test_event_sequence(self):
        """测试事件序列"""
        # 创建配置
        config = {
            'event_log_size': 100,
            'reconstruction_depth': 3
        }

        # 创建情景记忆
        episodic_memory = EpisodicMemory(config)

        # 存储事件序列
        start_time = time.time()
        events = [
            {'content': 'Morning: Wake up'},
            {'content': 'Morning: Brush teeth'},
            {'content': 'Morning: Eat breakfast'},
            {'content': 'Afternoon: Work'},
            {'content': 'Evening: Dinner'}
        ]

        for i, event in enumerate(events):
            emotion = {'valence': 0.5, 'arousal': 0.5}
            timestamp = start_time + i * 3600  # 每个事件间隔1小时
            episodic_memory.store(event, emotion, timestamp)

        # 获取事件序列
        sequence = episodic_memory.get_event_sequence(start_time, start_time + 5 * 3600)
        assert len(sequence) == 5

        # 检查事件顺序
        expected_order = ['Morning: Wake up', 'Morning: Brush teeth', 'Morning: Eat breakfast', 'Afternoon: Work', 'Evening: Dinner']
        actual_order = [event['content']['content'] for event in sequence]
        assert actual_order == expected_order