"""性能测试"""

import pytest
import time
import numpy as np
from src.core import CognitionLoop
from src.working_memory import Buffer
from src.long_term_memory import SemanticMemory, EpisodicMemory, ProceduralMemory


class TestPerformance:
    """性能测试"""

    def test_cognition_loop_performance(self):
        """测试认知循环性能"""
        config = {
            'perception': {'embedding_dim': 10},
            'working_memory': {'capacity': 4},
            'long_term_memory': {'embedding_dim': 10},
            'metacognition': {},
            'system': {'max_cycle_time': 0.1}
        }
        
        cognition_loop = CognitionLoop(config)
        
        # 测试单次处理时间
        input_data = {'text': 'test input'}
        
        start_time = time.time()
        output = cognition_loop.process_input(input_data)
        elapsed_time = time.time() - start_time
        
        # 处理时间应该小于最大循环时间
        assert elapsed_time < 0.5  # 给予一定余量
        assert output is not None

    def test_buffer_performance(self):
        """测试缓冲区性能"""
        config = {'capacity': 4}
        buffer = Buffer(config)
        
        # 测试添加性能
        start_time = time.time()
        for i in range(1000):
            buffer.add({'content': f'item_{i}'})
        elapsed_time = time.time() - start_time
        
        # 1000次添加应该在1秒内完成
        assert elapsed_time < 1.0

    def test_semantic_memory_performance(self):
        """测试语义记忆性能"""
        config = {'embedding_dim': 10}
        semantic_memory = SemanticMemory(config)
        
        # 测试存储性能
        start_time = time.time()
        for i in range(100):
            semantic_memory.store({'content': f'concept_{i}'})
        elapsed_time = time.time() - start_time
        
        # 100次存储应该在1秒内完成
        assert elapsed_time < 1.0
        
        # 测试检索性能
        start_time = time.time()
        results = semantic_memory.retrieve(['concept_50'], threshold=0.1)
        elapsed_time = time.time() - start_time
        
        # 检索应该在0.1秒内完成
        assert elapsed_time < 0.1

    def test_episodic_memory_performance(self):
        """测试情景记忆性能"""
        config = {'event_log_size': 1000}
        episodic_memory = EpisodicMemory(config)
        
        # 测试存储性能
        start_time = time.time()
        for i in range(100):
            event = {'content': f'event_{i}'}
            emotion = {'valence': 0.5, 'arousal': 0.5}
            timestamp = time.time() + i
            episodic_memory.store(event, emotion, timestamp)
        elapsed_time = time.time() - start_time
        
        # 100次存储应该在1秒内完成
        assert elapsed_time < 1.0

    def test_procedural_memory_performance(self):
        """测试内隐记忆性能"""
        config = {'skill_library_size': 100}
        procedural_memory = ProceduralMemory(config)
        
        # 测试存储性能
        start_time = time.time()
        for i in range(100):
            skill = {
                'content': f'skill_{i}',
                'trigger': {'context': f'context_{i}'}
            }
            procedural_memory.store(skill)
        elapsed_time = time.time() - start_time
        
        # 100次存储应该在1秒内完成
        assert elapsed_time < 1.0

    def test_memory_usage(self):
        """测试内存使用"""
        import psutil
        import os
        
        process = psutil.Process(os.getpid())
        initial_memory = process.memory_info().rss / 1024 / 1024  # MB
        
        # 创建大量记忆
        config = {'embedding_dim': 10}
        semantic_memory = SemanticMemory(config)
        
        for i in range(1000):
            semantic_memory.store({'content': f'concept_{i}'})
        
        final_memory = process.memory_info().rss / 1024 / 1024  # MB
        memory_increase = final_memory - initial_memory
        
        # 内存增加应该合理（小于100MB）
        assert memory_increase < 100

    def test_concurrent_access(self):
        """测试并发访问"""
        import threading
        
        config = {'capacity': 10}
        buffer = Buffer(config)
        
        def add_items(thread_id):
            for i in range(100):
                buffer.add({'content': f'thread_{thread_id}_item_{i}'})
        
        # 创建多个线程
        threads = []
        for i in range(5):
            thread = threading.Thread(target=add_items, args=(i,))
            threads.append(thread)
            thread.start()
        
        # 等待所有线程完成
        for thread in threads:
            thread.join()
        
        # 缓冲区应该正常工作
        assert buffer.size() <= buffer.capacity


class TestBoundaryConditions:
    """边界条件测试"""

    def test_empty_input(self):
        """测试空输入"""
        config = {
            'perception': {'embedding_dim': 10},
            'working_memory': {'capacity': 4},
            'long_term_memory': {'embedding_dim': 10},
            'metacognition': {},
            'system': {'max_cycle_time': 0.1}
        }
        
        cognition_loop = CognitionLoop(config)
        
        # 空输入
        output = cognition_loop.process_input({})
        assert output is not None

    def test_large_input(self):
        """测试大输入"""
        config = {
            'perception': {'embedding_dim': 10},
            'working_memory': {'capacity': 4},
            'long_term_memory': {'embedding_dim': 10},
            'metacognition': {},
            'system': {'max_cycle_time': 0.1}
        }
        
        cognition_loop = CognitionLoop(config)
        
        # 大输入
        large_text = 'a' * 10000
        output = cognition_loop.process_input({'text': large_text})
        assert output is not None

    def test_buffer_overflow(self):
        """测试缓冲区溢出"""
        config = {'capacity': 4}
        buffer = Buffer(config)
        
        # 添加超过容量的项目
        for i in range(10):
            buffer.add({'content': f'item_{i}'})
        
        # 缓冲区大小应该不超过容量
        assert buffer.size() <= buffer.capacity

    def test_memory_exhaustion(self):
        """测试内存耗尽"""
        config = {'event_log_size': 100}
        episodic_memory = EpisodicMemory(config)
        
        # 添加超过日志大小的事件
        for i in range(200):
            event = {'content': f'event_{i}'}
            emotion = {'valence': 0.5, 'arousal': 0.5}
            timestamp = time.time() + i
            episodic_memory.store(event, emotion, timestamp)
        
        # 事件数量应该不超过日志大小
        stats = episodic_memory.get_event_stats()
        assert stats['event_count'] <= config['event_log_size']

    def test_extreme_values(self):
        """测试极端值"""
        config = {
            'perception': {'embedding_dim': 10},
            'working_memory': {'capacity': 4},
            'long_term_memory': {'embedding_dim': 10},
            'metacognition': {},
            'system': {'max_cycle_time': 0.1}
        }
        
        cognition_loop = CognitionLoop(config)
        
        # 极端值输入
        extreme_inputs = [
            {'text': ''},  # 空字符串
            {'text': ' ' * 1000},  # 空白字符串
            {'text': '\n' * 100},  # 换行符
            {'text': '😀' * 100},  # 特殊字符
            {'number': 1e308},  # 极大数字
            {'number': -1e308},  # 极小数字
        ]
        
        for input_data in extreme_inputs:
            output = cognition_loop.process_input(input_data)
            assert output is not None

    def test_special_characters(self):
        """测试特殊字符"""
        config = {
            'perception': {'embedding_dim': 10},
            'working_memory': {'capacity': 4},
            'long_term_memory': {'embedding_dim': 10},
            'metacognition': {},
            'system': {'max_cycle_time': 0.1}
        }
        
        cognition_loop = CognitionLoop(config)
        
        # 特殊字符输入
        special_chars = [
            'test\nwith\nnewlines',
            'test\twith\ttabs',
            'test with "quotes"',
            "test with 'quotes'",
            'test\\with\\backslashes',
            'test/with/slashes',
        ]
        
        for text in special_chars:
            output = cognition_loop.process_input({'text': text})
            assert output is not None

    def test_unicode_handling(self):
        """测试 Unicode 处理"""
        config = {
            'perception': {'embedding_dim': 10},
            'working_memory': {'capacity': 4},
            'long_term_memory': {'embedding_dim': 10},
            'metacognition': {},
            'system': {'max_cycle_time': 0.1}
        }
        
        cognition_loop = CognitionLoop(config)
        
        # Unicode 输入
        unicode_texts = [
            '你好世界',  # 中文
            'こんにちは世界',  # 日文
            '안녕하세요 세계',  # 韩文
            'Привет мир',  # 俄文
            'مرحبا بالعالم',  # 阿拉伯文
        ]
        
        for text in unicode_texts:
            output = cognition_loop.process_input({'text': text})
            assert output is not None
