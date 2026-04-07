"""工具模块单元测试"""

import pytest
import numpy as np
import tempfile
import os
from src.utils.memory_utils import (
    serialize_memory, deserialize_memory,
    compress_memory, decompress_memory,
    sanitize_memory
)
from src.utils.metrics import (
    calculate_energy_consumption, calculate_forgetting_rate,
    calculate_memory_efficiency, calculate_cognitive_load,
    calculate_system_metrics, generate_performance_report
)
from src.utils.simulator_utils import (
    SleepScheduler, SleepSimulator,
    create_sleep_schedule, update_sleep_schedule, check_sleep_schedule
)


class TestMemoryUtils:
    """测试记忆工具"""

    def test_serialize_memory_json(self):
        """测试 JSON 序列化"""
        memory = {
            'id': 'test_1',
            'content': 'test content',
            'timestamp': 1234567890.0,
            'metadata': {'key': 'value'}
        }
        
        serialized = serialize_memory(memory, format='json')
        assert isinstance(serialized, bytes)
        
        deserialized = deserialize_memory(serialized, format='json')
        assert deserialized == memory

    def test_serialize_memory_pickle(self):
        """测试 Pickle 序列化"""
        memory = {
            'id': 'test_2',
            'data': np.array([1, 2, 3]),
            'nested': {'a': 1, 'b': 2}
        }
        
        serialized = serialize_memory(memory, format='pickle')
        assert isinstance(serialized, bytes)
        
        deserialized = deserialize_memory(serialized, format='pickle')
        assert deserialized['id'] == memory['id']
        assert np.array_equal(deserialized['data'], memory['data'])

    def test_compress_memory(self):
        """测试记忆压缩"""
        memory = {
            'id': 'test_3',
            'content': 'a' * 1000,  # 重复内容，压缩效果好
            'data': np.random.rand(100)
        }
        
        serialized = serialize_memory(memory, format='pickle')
        compressed = compress_memory(serialized)
        
        assert isinstance(compressed, bytes)
        assert len(compressed) < len(serialized)
        
        decompressed = decompress_memory(compressed)
        assert isinstance(decompressed, bytes)

    def test_sanitize_memory(self):
        """测试记忆清理"""
        memory = {
            'id': 'test_6',
            'content': 'test',
            'data': np.array([1, 2, 3]),
            'nested': {'key': 'value'}
        }
        
        sanitized = sanitize_memory(memory)
        
        assert 'id' in sanitized
        assert 'content' in sanitized
        assert 'data' in sanitized
        assert isinstance(sanitized['data'], str)  # numpy 数组被转换为字符串


class TestMetrics:
    """测试性能指标"""

    def test_calculate_energy_consumption(self):
        """测试能耗计算"""
        metrics = {
            'cpu_usage': 50.0,
            'memory_usage': 1024.0,  # MB
            'gpu_usage': 30.0
        }
        
        energy = calculate_energy_consumption(metrics)
        
        assert isinstance(energy, float)
        assert energy > 0

    def test_calculate_forgetting_rate(self):
        """测试遗忘率计算"""
        initial_memory = 100
        current_memory = 80
        time_elapsed = 3600  # 1小时
        
        rate = calculate_forgetting_rate(initial_memory, current_memory, time_elapsed)
        
        assert isinstance(rate, float)
        assert 0.0 <= rate <= 1.0

    def test_calculate_memory_efficiency(self):
        """测试记忆效率计算"""
        memory_stats = {
            'total_memories': 100,
            'accessed_memories': 60,
            'useful_memories': 40
        }
        
        efficiency = calculate_memory_efficiency(memory_stats)
        
        assert isinstance(efficiency, float)
        assert 0.0 <= efficiency <= 1.0

    def test_calculate_cognitive_load(self):
        """测试认知负荷计算"""
        working_memory_stats = {
            'current_items': 3,
            'max_capacity': 4,
            'processing_rate': 0.8
        }
        
        load = calculate_cognitive_load(working_memory_stats)
        
        assert isinstance(load, float)
        assert 0.0 <= load <= 1.0

    def test_calculate_system_metrics(self):
        """测试系统指标计算"""
        system_state = {
            'working_memory': {
                'current_items': 3,
                'max_capacity': 4
            },
            'long_term_memory': {
                'total_memories': 100,
                'accessed_memories': 60
            },
            'emotion': {
                'valence': 0.5,
                'arousal': 0.6
            },
            'curiosity': 0.7
        }
        
        metrics = calculate_system_metrics(system_state)
        
        assert isinstance(metrics, dict)
        assert 'energy_consumption' in metrics
        assert 'memory_efficiency' in metrics
        assert 'cognitive_load' in metrics
        assert 'emotion' in metrics
        assert 'curiosity' in metrics

    def test_generate_performance_report(self):
        """测试生成性能报告"""
        metrics = {
            'energy_consumption': 0.5,
            'memory_efficiency': 0.8,
            'cognitive_load': 0.6,
            'emotion': {'valence': 0.5, 'arousal': 0.6},
            'curiosity': 0.7
        }
        
        report = generate_performance_report(metrics)
        
        assert isinstance(report, str)
        assert '能耗' in report or 'energy' in report.lower()


class TestSimulatorUtils:
    """测试模拟器工具"""

    def test_create_sleep_schedule(self):
        """测试创建睡眠调度"""
        config = {
            'sleep_trigger_interval': 18000,
            'sleep_duration': 3600,
            'sleep_cycles': 5
        }
        
        schedule = create_sleep_schedule(config)
        
        assert isinstance(schedule, dict)
        assert 'interval' in schedule
        assert 'duration' in schedule
        assert 'cycles' in schedule
        assert 'next_sleep_time' in schedule

    def test_update_sleep_schedule(self):
        """测试更新睡眠调度"""
        schedule = {
            'interval': 18000,
            'next_sleep_time': 0
        }
        
        updated = update_sleep_schedule(schedule)
        
        assert updated['next_sleep_time'] > schedule['next_sleep_time']

    def test_check_sleep_schedule(self):
        """测试检查睡眠调度"""
        import time
        
        # 创建一个已经过期的调度
        schedule = {
            'next_sleep_time': time.time() - 1
        }
        
        assert check_sleep_schedule(schedule)
        
        # 创建一个未过期的调度
        schedule = {
            'next_sleep_time': time.time() + 1000
        }
        
        assert not check_sleep_schedule(schedule)

    def test_sleep_scheduler_init(self):
        """测试睡眠调度器初始化"""
        config = {
            'sleep_trigger_interval': 18000
        }
        
        scheduler = SleepScheduler(config)
        
        assert scheduler.interval == 18000
        assert not scheduler.running

    def test_sleep_simulator_init(self):
        """测试睡眠模拟器初始化"""
        config = {
            'sleep_duration': 3600,
            'sleep_cycles': 5
        }
        
        simulator = SleepSimulator(config)
        
        assert simulator.sleep_duration == 3600
        assert simulator.sleep_cycles == 5

    def test_sleep_simulator_get_stats(self):
        """测试获取睡眠统计"""
        config = {
            'sleep_duration': 3600,
            'sleep_cycles': 5
        }
        
        simulator = SleepSimulator(config)
        stats = simulator.get_sleep_stats()
        
        assert 'sleep_duration' in stats
        assert 'sleep_cycles' in stats
        assert 'cycle_duration' in stats
        assert stats['cycle_duration'] == 720  # 3600 / 5
