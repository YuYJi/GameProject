"""工作记忆系统单元测试"""

import pytest
import time
from src.working_memory import Buffer, Operator, Rehearsal, LTMInterface


class TestBuffer:
    """测试工作记忆缓冲区"""

    def test_add(self):
        """测试添加项目"""
        config = {'capacity': 2}
        buffer = Buffer(config)

        # 添加项目
        item1 = {'content': 'test1'}
        item2 = {'content': 'test2'}
        item3 = {'content': 'test3'}

        assert buffer.add(item1)
        assert buffer.size() == 1

        assert buffer.add(item2)
        assert buffer.size() == 2

        # 缓冲区已满，应该替换最不重要的项目
        assert buffer.add(item3)
        assert buffer.size() == 2

    def test_get(self):
        """测试获取项目"""
        config = {'capacity': 2}
        buffer = Buffer(config)

        # 添加项目
        item1 = {'content': 'test1'}
        item2 = {'content': 'test2'}
        buffer.add(item1)
        buffer.add(item2)

        # 获取项目
        assert buffer.get(0)['content'] == 'test1'
        assert buffer.get(1)['content'] == 'test2'
        assert buffer.get(2) is None

    def test_remove(self):
        """测试移除项目"""
        config = {'capacity': 2}
        buffer = Buffer(config)

        # 添加项目
        item1 = {'content': 'test1'}
        item2 = {'content': 'test2'}
        buffer.add(item1)
        buffer.add(item2)

        # 移除项目
        assert buffer.remove(0)
        assert buffer.size() == 1
        assert buffer.get(0)['content'] == 'test2'

    def test_clear(self):
        """测试清空缓冲区"""
        config = {'capacity': 2}
        buffer = Buffer(config)

        # 添加项目
        item1 = {'content': 'test1'}
        item2 = {'content': 'test2'}
        buffer.add(item1)
        buffer.add(item2)

        # 清空缓冲区
        buffer.clear()
        assert buffer.size() == 0

    def test_is_full(self):
        """测试缓冲区是否已满"""
        config = {'capacity': 2}
        buffer = Buffer(config)

        # 缓冲区为空
        assert not buffer.is_full()

        # 添加一个项目
        buffer.add({'content': 'test1'})
        assert not buffer.is_full()

        # 添加第二个项目
        buffer.add({'content': 'test2'})
        assert buffer.is_full()


class TestOperator:
    """测试工作记忆操作器"""

    def test_process(self):
        """测试处理功能"""
        config = {'max_operations': 10, 'comparison_threshold': 0.8}
        operator = Operator(config)

        # 创建缓冲区模拟对象
        class MockBuffer:
            def get_all(self):
                return [
                    {'content': 'test1', 'features': [0.1, 0.2, 0.3]},
                    {'content': 'test2', 'features': [0.1, 0.2, 0.4]}
                ]

        buffer = MockBuffer()

        # 处理缓冲区内容
        result = operator.process(buffer)
        assert 'comparisons' in result
        assert 'bindings' in result
        assert 'simulations' in result
        assert 'inferences' in result


class TestRehearsal:
    """测试复述机制"""

    def test_rehearse(self):
        """测试复述功能"""
        config = {'interval': 0.1, 'max_rehearsal_count': 2}
        rehearsal = Rehearsal(config)

        # 创建缓冲区模拟对象
        class MockBuffer:
            def __init__(self):
                self.chunks = [
                    {'content': 'test1', 'strength': 0.3},
                    {'content': 'test2', 'strength': 0.6}
                ]

            def update_strengths(self):
                pass

            def get_strengths(self):
                return [chunk['strength'] for chunk in self.chunks]

            def get(self, index):
                return self.chunks[index]['content']

            def remove(self, index):
                self.chunks.pop(index)
                return True

            def add(self, item):
                self.chunks.append({'content': item, 'strength': 0.8})
                return True

        buffer = MockBuffer()

        # 执行复述
        rehearsal.rehearse(buffer)
        # 第一个项目强度较低，应该被复述
        assert len(buffer.chunks) == 2


class TestLTMInterface:
    """测试长时记忆接口"""

    def test_retrieve(self):
        """测试检索功能"""
        # 创建模拟的记忆实例
        class MockSemanticMemory:
            def retrieve(self, keywords, threshold):
                return [{'type': 'semantic', 'content': 'semantic memory'}]

        class MockEpisodicMemory:
            def retrieve(self, cues, threshold):
                return [{'type': 'episodic', 'content': 'episodic memory'}]

        class MockProceduralMemory:
            def retrieve(self, context, threshold):
                return [{'type': 'procedural', 'content': 'procedural memory'}]

        semantic_memory = MockSemanticMemory()
        episodic_memory = MockEpisodicMemory()
        procedural_memory = MockProceduralMemory()

        config = {'retrieval_threshold': 0.6, 'max_retrieval_items': 5}
        ltm_interface = LTMInterface(semantic_memory, episodic_memory, procedural_memory, config)

        # 创建焦点和缓冲区模拟对象
        focus = {'modalities': {'fused': {}}, 'strength': 0.5}

        class MockBuffer:
            def get_all(self):
                return []

        buffer = MockBuffer()

        # 检索记忆
        retrieved = ltm_interface.retrieve(focus, buffer)
        assert len(retrieved) == 3
        assert retrieved[0]['type'] == 'semantic'
        assert retrieved[1]['type'] == 'episodic'
        assert retrieved[2]['type'] == 'procedural'

    def test_store(self):
        """测试存储功能"""
        # 创建模拟的记忆实例
        class MockSemanticMemory:
            def __init__(self):
                self.stored = []

            def store(self, info):
                self.stored.append(info)

        class MockEpisodicMemory:
            def __init__(self):
                self.stored = []

            def store(self, info, emotion, timestamp):
                self.stored.append((info, emotion, timestamp))

        class MockProceduralMemory:
            def __init__(self):
                self.stored = []

            def store(self, info):
                self.stored.append(info)

        semantic_memory = MockSemanticMemory()
        episodic_memory = MockEpisodicMemory()
        procedural_memory = MockProceduralMemory()

        config = {'consolidation_threshold': 0.7}
        ltm_interface = LTMInterface(semantic_memory, episodic_memory, procedural_memory, config)

        # 存储记忆
        processed_info = {'content': 'test'}
        emotion = {'valence': 0.8, 'arousal': 0.9}  # 高于巩固阈值
        timestamp = time.time()

        ltm_interface.store(processed_info, emotion, timestamp)

        # 检查是否存储成功
        assert len(semantic_memory.stored) == 1
        assert len(episodic_memory.stored) == 1
        assert len(procedural_memory.stored) == 1