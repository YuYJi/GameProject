"""认知循环集成测试"""

import pytest
import time
from src.core import CognitionLoop


class TestCognitionLoop:
    """测试认知循环"""

    def test_process_input(self):
        """测试处理输入"""
        # 创建配置
        config = {
            'perception': {
                'embedding_dim': 10
            },
            'working_memory': {
                'capacity': 4
            },
            'long_term_memory': {
                'embedding_dim': 10
            },
            'metacognition': {},
            'system': {
                'max_cycle_time': 0.1
            }
        }

        # 创建认知循环
        cognition_loop = CognitionLoop(config)

        # 测试输入
        input_data = {
            'text': 'Hello, how are you?'
        }

        # 处理输入
        output = cognition_loop.process_input(input_data)
        assert output is not None
        assert 'processed_info' in output
        assert 'emotion' in output
        assert 'confidence' in output
        assert 'strategy' in output

    def test_run(self):
        """测试运行认知循环"""
        # 创建配置
        config = {
            'perception': {
                'embedding_dim': 10
            },
            'working_memory': {
                'capacity': 4
            },
            'long_term_memory': {
                'embedding_dim': 10
            },
            'metacognition': {},
            'system': {
                'max_cycle_time': 0.1
            }
        }

        # 创建认知循环
        cognition_loop = CognitionLoop(config)

        # 创建输入流
        def input_stream():
            for i in range(3):
                yield {
                    'text': f'Test input {i}'
                }
                time.sleep(0.01)

        # 运行认知循环
        outputs = list(cognition_loop.run(input_stream()))
        assert len(outputs) == 3
        for output in outputs:
            assert 'processed_info' in output
            assert 'emotion' in output
            assert 'confidence' in output
            assert 'strategy' in output

    def test_trigger_sleep(self):
        """测试触发睡眠"""
        # 创建配置
        config = {
            'perception': {
                'embedding_dim': 10
            },
            'working_memory': {
                'capacity': 4
            },
            'long_term_memory': {
                'embedding_dim': 10
            },
            'metacognition': {},
            'system': {
                'max_cycle_time': 0.1,
                'sleep_trigger_interval': 0.1  # 缩短睡眠触发间隔以便测试
            }
        }

        # 创建认知循环
        cognition_loop = CognitionLoop(config)

        # 模拟时间过了睡眠触发间隔
        cognition_loop.last_sleep_time = time.time() - 0.2

        # 处理输入，应该触发睡眠
        input_data = {
            'text': 'Test input'
        }

        # 处理输入
        output = cognition_loop.process_input(input_data)
        assert output is not None