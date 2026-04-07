"""情景记忆子模块单元测试"""

import pytest
import time
import numpy as np
from src.long_term_memory.episodic.indexer import EventIndexer
from src.long_term_memory.episodic.reconstruction import EventReconstructor


class TestEventIndexer:
    """测试事件索引器"""

    def test_init(self):
        """测试初始化"""
        config = {
            'time_bucket_size': 3600,
            'location_bucket_size': 100,
            'emotion_bucket_size': 5
        }
        
        indexer = EventIndexer(config)
        
        assert indexer.time_bucket_size == 3600
        assert indexer.location_bucket_size == 100
        assert indexer.emotion_bucket_size == 5

    def test_index_event(self):
        """测试索引事件"""
        config = {}
        indexer = EventIndexer(config)
        
        # 创建事件
        event = {
            'id': 'event_1',
            'content': {'text': 'test event'},
            'emotion': {'valence': 0.5, 'arousal': 0.6},
            'timestamp': time.time(),
            'location': [40.7128, -74.0060]  # 纽约坐标
        }
        
        # 索引事件
        indexer.index_event(event)
        
        # 检查索引是否创建
        stats = indexer.get_stats()
        assert stats['time_buckets'] > 0
        assert stats['emotion_buckets'] > 0

    def test_find_by_time(self):
        """测试按时间查找"""
        config = {'time_bucket_size': 3600}
        indexer = EventIndexer(config)
        
        current_time = time.time()
        
        # 创建多个事件
        for i in range(5):
            event = {
                'id': f'event_{i}',
                'content': {'text': f'event {i}'},
                'timestamp': current_time + i * 1800  # 每30分钟一个事件
            }
            indexer.index_event(event)
        
        # 查找特定时间的事件
        events = indexer._find_by_time(current_time + 3600)
        
        assert isinstance(events, list)
        assert len(events) > 0

    def test_find_by_emotion(self):
        """测试按情绪查找"""
        config = {'emotion_bucket_size': 5}
        indexer = EventIndexer(config)
        
        # 创建不同情绪的事件
        emotions = [
            {'valence': 0.8, 'arousal': 0.9},  # 快乐
            {'valence': -0.8, 'arousal': 0.8},  # 愤怒
            {'valence': 0.5, 'arousal': 0.5},   # 中性
        ]
        
        for i, emotion in enumerate(emotions):
            event = {
                'id': f'event_{i}',
                'content': {'text': f'event {i}'},
                'emotion': emotion,
                'timestamp': time.time()
            }
            indexer.index_event(event)
        
        # 查找相似情绪的事件
        query_emotion = {'valence': 0.7, 'arousal': 0.8}
        events = indexer._find_by_emotion(query_emotion)
        
        assert isinstance(events, list)

    def test_find_by_content(self):
        """测试按内容查找"""
        config = {}
        indexer = EventIndexer(config)
        
        # 创建包含不同内容的事件
        events_content = [
            "I went to the park today",
            "The weather is beautiful",
            "I had a great lunch",
            "The park was crowded"
        ]
        
        for i, content in enumerate(events_content):
            event = {
                'id': f'event_{i}',
                'content': {'text': content},
                'timestamp': time.time()
            }
            indexer.index_event(event)
        
        # 查找包含特定关键词的事件
        query_content = {'text': 'park'}
        events = indexer._find_by_content(query_content)
        
        assert isinstance(events, list)
        # 应该找到包含 'park' 的事件
        assert len(events) > 0

    def test_find_events(self):
        """测试综合查找事件"""
        config = {}
        indexer = EventIndexer(config)
        
        # 创建多个事件
        current_time = time.time()
        for i in range(10):
            event = {
                'id': f'event_{i}',
                'content': {'text': f'test event {i}'},
                'emotion': {'valence': 0.5, 'arousal': 0.5},
                'timestamp': current_time + i * 60
            }
            indexer.index_event(event)
        
        # 使用多个线索查找
        cues = {
            'content': {'text': 'test'},
            'emotion': {'valence': 0.5, 'arousal': 0.5}
        }
        
        events = indexer.find_events(cues)
        
        assert isinstance(events, list)

    def test_get_stats(self):
        """测试获取统计信息"""
        config = {}
        indexer = EventIndexer(config)
        
        # 创建一些事件
        for i in range(5):
            event = {
                'id': f'event_{i}',
                'content': {'text': f'event {i}'},
                'timestamp': time.time()
            }
            indexer.index_event(event)
        
        stats = indexer.get_stats()
        
        assert isinstance(stats, dict)
        assert 'time_buckets' in stats
        assert 'location_buckets' in stats
        assert 'emotion_buckets' in stats
        assert 'content_keywords' in stats


class TestEventReconstructor:
    """测试事件重构器"""

    def test_init(self):
        """测试初始化"""
        config = {
            'reconstruction_depth': 3,
            'context_window': 5
        }
        
        reconstructor = EventReconstructor(config)
        
        assert reconstructor.reconstruction_depth == 3
        assert reconstructor.context_window == 5

    def test_reconstruct(self):
        """测试重构事件"""
        config = {}
        reconstructor = EventReconstructor(config)
        
        # 创建目标事件
        target_event = {
            'id': 'event_5',
            'content': {'text': 'I had lunch at noon'},
            'emotion': {'valence': 0.6, 'arousal': 0.4},
            'timestamp': time.time()
        }
        
        # 创建上下文事件
        all_events = []
        for i in range(10):
            event = {
                'id': f'event_{i}',
                'content': {'text': f'event {i}'},
                'emotion': {'valence': 0.5, 'arousal': 0.5},
                'timestamp': time.time() + i * 60
            }
            all_events.append(event)
        
        # 重构事件
        reconstructed = reconstructor.reconstruct(target_event, all_events)
        
        assert isinstance(reconstructed, dict)
        assert 'original' in reconstructed
        assert 'reconstructed' in reconstructed
        assert 'context' in reconstructed
        assert 'narrative' in reconstructed
        assert 'reconstruction_time' in reconstructed

    def test_build_context(self):
        """测试构建上下文"""
        config = {'context_window': 3}
        reconstructor = EventReconstructor(config)
        
        # 创建事件序列
        events = []
        for i in range(10):
            event = {
                'id': f'event_{i}',
                'content': {'text': f'event {i}'},
                'timestamp': time.time() + i * 60
            }
            events.append(event)
        
        # 为中间事件构建上下文
        target_event = events[5]
        context = reconstructor._build_context(target_event, events)
        
        assert isinstance(context, list)
        # 上下文应该包含目标事件前后的几个事件
        assert len(context) <= 2 * config['context_window'] + 1

    def test_generate_narrative(self):
        """测试生成叙事"""
        config = {}
        reconstructor = EventReconstructor(config)
        
        # 创建事件
        event = {
            'id': 'event_1',
            'content': {'text': 'I went to the store'},
            'emotion': {'valence': 0.5, 'arousal': 0.3},
            'timestamp': time.time()
        }
        
        # 生成叙事
        narrative = reconstructor._generate_narrative(event)
        
        assert isinstance(narrative, str)
        assert len(narrative) > 0

    def test_fill_gaps(self):
        """测试填补空白"""
        config = {}
        reconstructor = EventReconstructor(config)
        
        # 创建有空白的事件序列
        events = [
            {'id': 'event_1', 'content': {'text': 'event 1'}, 'timestamp': time.time()},
            {'id': 'event_2', 'content': {'text': 'event 2'}, 'timestamp': time.time() + 120},
            # 空白：缺少 event_3
            {'id': 'event_4', 'content': {'text': 'event 4'}, 'timestamp': time.time() + 240},
        ]
        
        # 填补空白
        filled = reconstructor._fill_gaps(events)
        
        assert isinstance(filled, list)
        # 可能会插入推断的事件

    def test_smooth_transition(self):
        """测试平滑过渡"""
        config = {}
        reconstructor = EventReconstructor(config)
        
        # 创建事件序列
        events = [
            {'id': 'event_1', 'content': {'text': 'I woke up'}},
            {'id': 'event_2', 'content': {'text': 'I had breakfast'}},
            {'id': 'event_3', 'content': {'text': 'I went to work'}}
        ]
        
        # 平滑过渡
        smoothed = reconstructor._smooth_transition(events)
        
        assert isinstance(smoothed, list)
        assert len(smoothed) == len(events)

    def test_reconstruct_with_emotion(self):
        """测试带情绪的重构"""
        config = {}
        reconstructor = EventReconstructor(config)
        
        # 创建带情绪的事件
        event = {
            'id': 'event_1',
            'content': {'text': 'I won the lottery'},
            'emotion': {'valence': 0.9, 'arousal': 0.9},
            'timestamp': time.time()
        }
        
        all_events = [event]
        
        # 重构
        reconstructed = reconstructor.reconstruct(event, all_events)
        
        # 情绪应该影响重构结果
        assert 'emotion' in reconstructed['original']
        assert reconstructed['original']['emotion']['valence'] > 0.5
