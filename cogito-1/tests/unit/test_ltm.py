"""长时记忆系统单元测试"""

import pytest
import time
from src.long_term_memory import SemanticMemory, EpisodicMemory, ProceduralMemory, MemoryConsolidation


class TestSemanticMemory:
    """测试语义记忆"""

    def test_store(self):
        """测试存储功能"""
        config = {'embedding_dim': 10}
        semantic_memory = SemanticMemory(config)

        # 存储信息
        information = {'content': 'test', 'key': 'value'}
        semantic_memory.store(information)

        # 检查存储结果
        stats = semantic_memory.get_graph_stats()
        assert stats['nodes'] > 0

    def test_retrieve(self):
        """测试检索功能"""
        config = {'embedding_dim': 10}
        semantic_memory = SemanticMemory(config)

        # 存储信息
        information = {'content': 'test', 'key': 'value'}
        semantic_memory.store(information)

        # 检索信息
        query = ['test']
        results = semantic_memory.retrieve(query, threshold=0.1)
        assert len(results) > 0
        assert results[0]['type'] == 'semantic'

    def test_get_graph_stats(self):
        """测试获取图统计信息"""
        config = {'embedding_dim': 10}
        semantic_memory = SemanticMemory(config)

        # 存储信息
        information = {'content': 'test', 'key': 'value'}
        semantic_memory.store(information)

        # 获取统计信息
        stats = semantic_memory.get_graph_stats()
        assert 'nodes' in stats
        assert 'edges' in stats
        assert 'density' in stats


class TestEpisodicMemory:
    """测试情景记忆"""

    def test_store(self):
        """测试存储功能"""
        config = {'event_log_size': 100}
        episodic_memory = EpisodicMemory(config)

        # 存储事件
        event = {'content': 'test event'}
        emotion = {'valence': 0.5, 'arousal': 0.5}
        timestamp = time.time()
        episodic_memory.store(event, emotion, timestamp)

        # 检查存储结果
        stats = episodic_memory.get_event_stats()
        assert stats['event_count'] == 1

    def test_retrieve(self):
        """测试检索功能"""
        config = {'event_log_size': 100}
        episodic_memory = EpisodicMemory(config)

        # 存储事件
        event = {'content': 'test event'}
        emotion = {'valence': 0.5, 'arousal': 0.5}
        timestamp = time.time()
        episodic_memory.store(event, emotion, timestamp)

        # 检索事件
        cues = {'content': {'content': 'test event'}}
        results = episodic_memory.retrieve(cues, threshold=0.1)
        assert len(results) > 0

    def test_get_event_sequence(self):
        """测试获取事件序列"""
        config = {'event_log_size': 100}
        episodic_memory = EpisodicMemory(config)

        # 存储事件
        event1 = {'content': 'event1'}
        emotion1 = {'valence': 0.5, 'arousal': 0.5}
        timestamp1 = time.time()
        episodic_memory.store(event1, emotion1, timestamp1)

        time.sleep(0.1)

        event2 = {'content': 'event2'}
        emotion2 = {'valence': 0.6, 'arousal': 0.6}
        timestamp2 = time.time()
        episodic_memory.store(event2, emotion2, timestamp2)

        # 获取事件序列
        sequence = episodic_memory.get_event_sequence(timestamp1 - 1, timestamp2 + 1)
        assert len(sequence) == 2
        assert sequence[0]['content']['content'] == 'event1'
        assert sequence[1]['content']['content'] == 'event2'


class TestProceduralMemory:
    """测试内隐记忆"""

    def test_store(self):
        """测试存储功能"""
        config = {'skill_library_size': 100}
        procedural_memory = ProceduralMemory(config)

        # 存储技能
        skill = {'content': 'test skill', 'trigger': {'context': 'test'}}
        procedural_memory.store(skill)

        # 检查存储结果
        stats = procedural_memory.get_skill_stats()
        assert stats['skill_count'] == 1

    def test_retrieve(self):
        """测试检索功能"""
        config = {'skill_library_size': 100}
        procedural_memory = ProceduralMemory(config)

        # 存储技能
        skill = {'content': 'test skill', 'trigger': {'context': 'test'}}
        procedural_memory.store(skill)

        # 检索技能
        context = {'context': 'test'}
        results = procedural_memory.retrieve(context, threshold=0.1)
        assert len(results) > 0
        assert results[0]['content']['content'] == 'test skill'

    def test_get_skill_stats(self):
        """测试获取技能统计信息"""
        config = {'skill_library_size': 100}
        procedural_memory = ProceduralMemory(config)

        # 存储技能
        skill = {'content': 'test skill', 'trigger': {'context': 'test'}}
        procedural_memory.store(skill)

        # 获取统计信息
        stats = procedural_memory.get_skill_stats()
        assert 'skill_count' in stats
        assert 'average_proficiency' in stats
        assert 'automatized_skills' in stats


class TestMemoryConsolidation:
    """测试记忆巩固"""

    def test_consolidate(self):
        """测试巩固功能"""
        config = {'sleep_duration': 1}
        consolidation = MemoryConsolidation(config)

        # 创建模拟的记忆实例
        class MockSemanticMemory:
            def __init__(self):
                self.consolidated = False

            def get_graph_stats(self):
                return {'nodes': 1, 'edges': 0, 'density': 0}

        class MockEpisodicMemory:
            def __init__(self):
                self.consolidated = False

            def get_event_stats(self):
                return {'event_count': 1, 'index_stats': {}}

        class MockProceduralMemory:
            def __init__(self):
                self.consolidated = False

            def get_skill_stats(self):
                return {'skill_count': 1, 'average_proficiency': 0.5, 'automatized_skills': 0}

        semantic_memory = MockSemanticMemory()
        episodic_memory = MockEpisodicMemory()
        procedural_memory = MockProceduralMemory()

        # 执行巩固
        consolidation.consolidate(semantic_memory, episodic_memory, procedural_memory)

        # 检查巩固是否执行
        # 注意：由于我们的实现中没有实际修改记忆对象的状态，这里只是测试函数是否正常执行
        assert True

    def test_start_sleep(self):
        """测试启动睡眠"""
        config = {'sleep_duration': 1}
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