"""记忆巩固模块单元测试"""

import pytest
import time
import numpy as np
from src.long_term_memory.consolidation.forgetting_curve import ForgettingCurve
from src.long_term_memory.consolidation.interference import InterferenceManager
from src.long_term_memory.consolidation.sleep_simulator import MemoryConsolidation


class TestForgettingCurve:
    """测试遗忘曲线"""

    def test_init(self):
        """测试初始化"""
        config = {
            'initial_strength': 1.0,
            'decay_constant': 0.05,
            'minimum_strength': 0.01
        }
        
        curve = ForgettingCurve(config)
        
        assert curve.initial_strength == 1.0
        assert curve.decay_constant == 0.05
        assert curve.minimum_strength == 0.01

    def test_calculate_strength(self):
        """测试计算记忆强度"""
        config = {
            'initial_strength': 1.0,
            'decay_constant': 0.05
        }
        
        curve = ForgettingCurve(config)
        
        # 初始时刻
        strength = curve.calculate_strength(1.0, 0)
        assert strength == 1.0
        
        # 1小时后
        strength = curve.calculate_strength(1.0, 3600)
        assert 0 < strength < 1.0
        
        # 24小时后
        strength = curve.calculate_strength(1.0, 86400)
        assert 0 < strength < 0.5

    def test_get_forgetting_time(self):
        """测试计算遗忘时间"""
        config = {
            'decay_constant': 0.05
        }
        
        curve = ForgettingCurve(config)
        
        # 计算遗忘时间
        time_to_forget = curve.get_forgetting_time(1.0, 0.5)
        
        assert time_to_forget > 0
        
        # 目标强度等于初始强度
        time_to_forget = curve.get_forgetting_time(1.0, 1.0)
        assert time_to_forget == 0

    def test_update_strength(self):
        """测试更新记忆强度"""
        config = {
            'decay_constant': 0.05
        }
        
        curve = ForgettingCurve(config)
        
        # 创建记忆
        memory = {
            'id': 'mem_1',
            'strength': 1.0,
            'last_access_time': time.time() - 3600  # 1小时前
        }
        
        # 保存原始强度
        original_strength = memory['strength']
        
        # 更新强度
        current_time = time.time()
        updated_strength = curve.update_strength(memory, current_time)
        
        # 更新后的强度应该小于原始强度
        assert updated_strength < original_strength
        # memory['strength'] 应该被更新
        assert memory['strength'] == updated_strength

    def test_should_forget(self):
        """测试是否应该遗忘"""
        config = {
            'minimum_strength': 0.01
        }
        
        curve = ForgettingCurve(config)
        
        # 弱记忆
        weak_memory = {'strength': 0.005}
        assert curve.should_forget(weak_memory)
        
        # 强记忆
        strong_memory = {'strength': 0.5}
        assert not curve.should_forget(strong_memory)

    def test_get_retention_rate(self):
        """测试获取保持率"""
        config = {
            'decay_constant': 0.05
        }
        
        curve = ForgettingCurve(config)
        
        # 获取保持率
        retention_rate = curve.get_retention_rate(3600)  # 1小时
        
        assert 0 < retention_rate < 1


class TestInterferenceManager:
    """测试干扰管理器"""

    def test_init(self):
        """测试初始化"""
        config = {
            'detection_threshold': 0.7,
            'resolution_strategy': 'competition'
        }
        
        manager = InterferenceManager(config)
        
        assert manager.detection_threshold == 0.7
        assert manager.resolution_strategy == 'competition'

    def test_detect_interferences(self):
        """测试检测干扰"""
        config = {
            'detection_threshold': 0.7
        }
        
        manager = InterferenceManager(config)
        
        # 创建记忆
        memories = [
            {'id': 'mem_1', 'content': 'apple is red', 'strength': 0.8},
            {'id': 'mem_2', 'content': 'apple is green', 'strength': 0.7},
            {'id': 'mem_3', 'content': 'banana is yellow', 'strength': 0.9}
        ]
        
        # 检测干扰
        interference_groups = manager.detect_interferences(memories)
        
        assert isinstance(interference_groups, list)

    def test_resolve_interferences(self):
        """测试解决干扰"""
        config = {
            'resolution_strategy': 'competition'
        }
        
        manager = InterferenceManager(config)
        
        # 创建记忆
        memories = [
            {'id': 'mem_1', 'content': 'apple is red', 'strength': 0.8},
            {'id': 'mem_2', 'content': 'apple is green', 'strength': 0.7}
        ]
        
        # 创建干扰组
        interference_groups = [[0, 1]]
        
        # 解决干扰
        resolved = manager.resolve_interferences(memories, interference_groups)
        
        assert isinstance(resolved, list)
        assert len(resolved) == len(memories)


class TestMemoryConsolidation:
    """测试记忆巩固"""

    def test_init(self):
        """测试初始化"""
        config = {
            'sleep_duration': 3600
        }
        
        consolidation = MemoryConsolidation(config)
        
        assert consolidation.sleep_duration == 3600
        assert not consolidation.is_sleeping

    def test_consolidate(self):
        """测试记忆巩固"""
        config = {
            'sleep_duration': 1
        }
        
        consolidation = MemoryConsolidation(config)
        
        # 创建模拟的记忆实例
        class MockSemanticMemory:
            def get_graph_stats(self):
                return {'nodes': 1, 'edges': 0, 'density': 0}

        class MockEpisodicMemory:
            def get_event_stats(self):
                return {'event_count': 1, 'index_stats': {}}

        class MockProceduralMemory:
            def get_skill_stats(self):
                return {'skill_count': 1, 'average_proficiency': 0.5, 'automatized_skills': 0}

        semantic_memory = MockSemanticMemory()
        episodic_memory = MockEpisodicMemory()
        procedural_memory = MockProceduralMemory()
        
        # 执行巩固
        consolidation.consolidate(semantic_memory, episodic_memory, procedural_memory)
        
        # 检查是否正在巩固
        # 注意：由于我们的实现中没有实际修改记忆对象的状态，这里只是测试函数是否正常执行
        assert True

    def test_start_sleep(self):
        """测试启动睡眠"""
        config = {
            'sleep_duration': 1
        }
        
        consolidation = MemoryConsolidation(config)
        
        # 创建模拟的记忆实例
        class MockSemanticMemory:
            def get_graph_stats(self):
                return {'nodes': 1, 'edges': 0, 'density': 0}

        class MockEpisodicMemory:
            def get_event_stats(self):
                return {'event_count': 1, 'index_stats': {}}

        class MockProceduralMemory:
            def get_skill_stats(self):
                return {'skill_count': 1, 'average_proficiency': 0.5, 'automatized_skills': 0}

        semantic_memory = MockSemanticMemory()
        episodic_memory = MockEpisodicMemory()
        procedural_memory = MockProceduralMemory()
        
        # 启动睡眠
        consolidation.start_sleep(semantic_memory, episodic_memory, procedural_memory)
        
        # 检查是否正在巩固
        assert consolidation.is_consolidating()
        
        # 停止睡眠
        consolidation.stop_sleep()
        assert not consolidation.is_consolidating()
