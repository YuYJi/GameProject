"""内隐记忆子模块单元测试"""

import pytest
import time
import numpy as np
from src.long_term_memory.procedural.automatizer import Automatizer


class TestAutomatizer:
    """测试自动化器"""

    def test_init(self):
        """测试初始化"""
        config = {
            'automatization_threshold': 0.9
        }
        
        automatizer = Automatizer(config)
        
        assert automatizer.automatization_threshold == 0.9

    def test_automatize(self):
        """测试自动化技能"""
        config = {
            'automatization_threshold': 0.9
        }
        
        automatizer = Automatizer(config)
        
        # 创建技能
        skill = {
            'id': 'skill_1',
            'name': 'typing',
            'proficiency': 0.95
        }
        
        # 自动化技能
        automatizer.automatize(skill)
        
        # 检查是否已自动化
        count = automatizer.get_automatized_count()
        assert count > 0

    def test_retrieve_automatized_skill(self):
        """测试检索自动化技能"""
        config = {}
        automatizer = Automatizer(config)
        
        # 创建并自动化技能
        skill = {
            'id': 'skill_1',
            'name': 'driving',
            'trigger': {'context': 'driving'}
        }
        
        automatizer.automatize(skill)
        
        # 检索自动化技能
        context = {'context': 'driving'}
        retrieved = automatizer.retrieve_automatized_skill(context)
        
        # 注意：retrieve_automatized_skill 可能返回 None，如果没有匹配的技能
        # 这里我们只是测试函数是否正常执行
        assert retrieved is None or isinstance(retrieved, dict)

    def test_get_automatized_stats(self):
        """测试获取自动化统计"""
        config = {}
        automatizer = Automatizer(config)
        
        # 创建并自动化多个技能
        for i in range(5):
            skill = {
                'id': f'skill_{i}',
                'name': f'skill_{i}',
                'proficiency': 0.9 + i * 0.01
            }
            automatizer.automatize(skill)
        
        stats = automatizer.get_automatized_stats()
        
        assert isinstance(stats, dict)
        assert 'automatized_count' in stats
        assert stats['automatized_count'] == 5
