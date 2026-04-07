"""记忆持久化测试"""

import pytest
import os
import json
import time
import tempfile
import shutil
import networkx as nx
from src.utils.persistence import MemoryPersistence


class TestMemoryPersistence:
    """测试记忆持久化"""

    @pytest.fixture(autouse=True)
    def setup(self):
        """设置测试环境"""
        self.temp_dir = tempfile.mkdtemp()
        self.config = {
            'storage_path': self.temp_dir,
            'auto_save': False,
            'save_interval': 300,
            'format': 'json'
        }
        self.persistence = MemoryPersistence(self.config)
        yield
        shutil.rmtree(self.temp_dir)

    def test_init(self):
        """测试初始化"""
        assert self.persistence.storage_path == self.temp_dir
        assert self.persistence.auto_save == False
        assert self.persistence.save_interval == 300
        assert self.persistence.format == 'json'
        assert os.path.exists(self.temp_dir)

    def test_save_semantic_memory(self):
        """测试保存语义记忆"""
        graph = nx.Graph()
        graph.add_node('node_1', content='test content 1', embedding=[0.1, 0.2, 0.3])
        graph.add_node('node_2', content='test content 2', embedding=[0.4, 0.5, 0.6])
        graph.add_edge('node_1', 'node_2', weight=0.8, relation_type='related')
        
        result = self.persistence.save_semantic_memory(graph)
        
        assert result == True
        
        filepath = os.path.join(self.temp_dir, 'semantic_memory.json')
        assert os.path.exists(filepath)
        
        with open(filepath, 'r', encoding='utf-8') as f:
            data = json.load(f)
        
        assert 'nodes' in data
        assert 'edges' in data
        assert 'metadata' in data
        assert len(data['nodes']) == 2
        assert len(data['edges']) == 1

    def test_load_semantic_memory(self):
        """测试加载语义记忆"""
        graph = nx.Graph()
        graph.add_node('node_1', content='test content 1', embedding=[0.1, 0.2, 0.3])
        graph.add_node('node_2', content='test content 2', embedding=[0.4, 0.5, 0.6])
        graph.add_edge('node_1', 'node_2', weight=0.8, relation_type='related')
        
        self.persistence.save_semantic_memory(graph)
        
        loaded_graph = self.persistence.load_semantic_memory()
        
        assert loaded_graph is not None
        assert loaded_graph.number_of_nodes() == 2
        assert loaded_graph.number_of_edges() == 1

    def test_save_episodic_memory(self):
        """测试保存情景记忆"""
        events = [
            {
                'id': 'event_1',
                'content': {'text': 'event 1'},
                'emotion': {'valence': 0.5, 'arousal': 0.6},
                'timestamp': time.time()
            },
            {
                'id': 'event_2',
                'content': {'text': 'event 2'},
                'emotion': {'valence': 0.7, 'arousal': 0.4},
                'timestamp': time.time()
            }
        ]
        
        result = self.persistence.save_episodic_memory(events)
        
        assert result == True
        
        filepath = os.path.join(self.temp_dir, 'episodic_memory.json')
        assert os.path.exists(filepath)
        
        with open(filepath, 'r', encoding='utf-8') as f:
            data = json.load(f)
        
        assert 'events' in data
        assert 'metadata' in data
        assert len(data['events']) == 2

    def test_load_episodic_memory(self):
        """测试加载情景记忆"""
        events = [
            {
                'id': 'event_1',
                'content': {'text': 'event 1'},
                'emotion': {'valence': 0.5, 'arousal': 0.6},
                'timestamp': time.time()
            }
        ]
        
        self.persistence.save_episodic_memory(events)
        
        loaded_events = self.persistence.load_episodic_memory()
        
        assert loaded_events is not None
        assert len(loaded_events) == 1
        assert loaded_events[0]['id'] == 'event_1'

    def test_save_procedural_memory(self):
        """测试保存内隐记忆"""
        skills = {
            'skill_1': {
                'id': 'skill_1',
                'content': {'name': 'typing'},
                'proficiency': 0.8,
                'use_count': 10
            },
            'skill_2': {
                'id': 'skill_2',
                'content': {'name': 'driving'},
                'proficiency': 0.9,
                'use_count': 20
            }
        }
        
        result = self.persistence.save_procedural_memory(skills)
        
        assert result == True
        
        filepath = os.path.join(self.temp_dir, 'procedural_memory.json')
        assert os.path.exists(filepath)
        
        with open(filepath, 'r', encoding='utf-8') as f:
            data = json.load(f)
        
        assert 'skills' in data
        assert 'metadata' in data
        assert len(data['skills']) == 2

    def test_load_procedural_memory(self):
        """测试加载内隐记忆"""
        skills = {
            'skill_1': {
                'id': 'skill_1',
                'content': {'name': 'typing'},
                'proficiency': 0.8,
                'use_count': 10
            }
        }
        
        self.persistence.save_procedural_memory(skills)
        
        loaded_skills = self.persistence.load_procedural_memory()
        
        assert loaded_skills is not None
        assert len(loaded_skills) == 1
        assert 'skill_1' in loaded_skills

    def test_save_all(self):
        """测试保存所有记忆"""
        graph = nx.Graph()
        graph.add_node('node_1', content='test')
        
        events = [{'id': 'event_1', 'content': {}}]
        skills = {'skill_1': {'id': 'skill_1'}}
        
        results = self.persistence.save_all(graph, events, skills)
        
        assert results['semantic'] == True
        assert results['episodic'] == True
        assert results['procedural'] == True
        
        assert os.path.exists(os.path.join(self.temp_dir, 'semantic_memory.json'))
        assert os.path.exists(os.path.join(self.temp_dir, 'episodic_memory.json'))
        assert os.path.exists(os.path.join(self.temp_dir, 'procedural_memory.json'))

    def test_load_all(self):
        """测试加载所有记忆"""
        graph = nx.Graph()
        graph.add_node('node_1', content='test')
        
        events = [{'id': 'event_1', 'content': {}}]
        skills = {'skill_1': {'id': 'skill_1'}}
        
        self.persistence.save_all(graph, events, skills)
        
        loaded = self.persistence.load_all()
        
        assert loaded['semantic'] is not None
        assert loaded['episodic'] is not None
        assert loaded['procedural'] is not None

    def test_get_storage_info(self):
        """测试获取存储信息"""
        graph = nx.Graph()
        graph.add_node('node_1', content='test')
        
        self.persistence.save_semantic_memory(graph)
        
        info = self.persistence.get_storage_info()
        
        assert info['storage_path'] == self.temp_dir
        assert info['format'] == 'json'
        assert len(info['files']) == 1
        assert info['files'][0]['name'] == 'semantic_memory.json'

    def test_clear_storage(self):
        """测试清空存储"""
        graph = nx.Graph()
        graph.add_node('node_1', content='test')
        
        self.persistence.save_semantic_memory(graph)
        
        assert os.path.exists(os.path.join(self.temp_dir, 'semantic_memory.json'))
        
        self.persistence.clear_storage('semantic')
        
        assert not os.path.exists(os.path.join(self.temp_dir, 'semantic_memory.json'))

    def test_clear_all_storage(self):
        """测试清空所有存储"""
        graph = nx.Graph()
        graph.add_node('node_1', content='test')
        
        events = [{'id': 'event_1', 'content': {}}]
        skills = {'skill_1': {'id': 'skill_1'}}
        
        self.persistence.save_all(graph, events, skills)
        
        self.persistence.clear_storage()
        
        assert not os.path.exists(os.path.join(self.temp_dir, 'semantic_memory.json'))
        assert not os.path.exists(os.path.join(self.temp_dir, 'episodic_memory.json'))
        assert not os.path.exists(os.path.join(self.temp_dir, 'procedural_memory.json'))

    def test_should_save(self):
        """测试是否应该保存"""
        # 刚初始化时，last_save_time 被设置为当前时间
        # 所以第一次调用 should_save() 返回 False
        assert self.persistence.should_save() == False
        
        # 设置 last_save_time 为很久以前
        self.persistence.last_save_time = time.time() - 400
        
        assert self.persistence.should_save() == True
        
        # 设置 last_save_time 为当前时间
        self.persistence.last_save_time = time.time()
        
        assert self.persistence.should_save() == False

    def test_load_nonexistent_file(self):
        """测试加载不存在的文件"""
        loaded = self.persistence.load_semantic_memory('nonexistent.json')
        assert loaded is None
        
        loaded = self.persistence.load_episodic_memory('nonexistent.json')
        assert loaded is None
        
        loaded = self.persistence.load_procedural_memory('nonexistent.json')
        assert loaded is None
