"""记忆持久化管理器"""

from typing import Dict, Any, List, Optional
import os
import json
import pickle
import time
import threading
from pathlib import Path

import networkx as nx


class MemoryPersistence:
    """记忆持久化管理器类"""

    def __init__(self, config: Dict[str, Any]):
        """初始化持久化管理器

        Args:
            config: 配置参数
        """
        self.config = config
        self.storage_path = config.get('storage_path', './data/memory/')
        self.auto_save = config.get('auto_save', True)
        self.save_interval = config.get('save_interval', 300)  # 秒
        self.format = config.get('format', 'json')  # json, pickle
        
        self.last_save_time = time.time()
        self.save_thread = None
        self.is_running = False
        
        self._ensure_storage_path()

    def _ensure_storage_path(self):
        """确保存储路径存在"""
        Path(self.storage_path).mkdir(parents=True, exist_ok=True)

    def save_semantic_memory(self, graph: nx.Graph, filename: str = 'semantic_memory.json') -> bool:
        """保存语义记忆

        Args:
            graph: NetworkX 图结构
            filename: 文件名

        Returns:
            是否保存成功
        """
        try:
            filepath = os.path.join(self.storage_path, filename)
            
            if self.format == 'json':
                data = {
                    'nodes': [],
                    'edges': [],
                    'metadata': {
                        'save_time': time.time(),
                        'node_count': graph.number_of_nodes(),
                        'edge_count': graph.number_of_edges()
                    }
                }
                
                for node_id, node_data in graph.nodes(data=True):
                    node_entry = {'id': node_id}
                    node_entry.update(node_data)
                    if 'embedding' in node_entry and isinstance(node_entry['embedding'], list):
                        node_entry['embedding'] = list(node_entry['embedding'])
                    data['nodes'].append(node_entry)
                
                for source, target, edge_data in graph.edges(data=True):
                    edge_entry = {'source': source, 'target': target}
                    edge_entry.update(edge_data)
                    data['edges'].append(edge_entry)
                
                with open(filepath, 'w', encoding='utf-8') as f:
                    json.dump(data, f, ensure_ascii=False, indent=2)
            else:
                with open(filepath + '.pkl', 'wb') as f:
                    pickle.dump(graph, f)
            
            print(f"Semantic memory saved to {filepath}")
            return True
            
        except Exception as e:
            print(f"Error saving semantic memory: {e}")
            return False

    def load_semantic_memory(self, filename: str = 'semantic_memory.json') -> Optional[nx.Graph]:
        """加载语义记忆

        Args:
            filename: 文件名

        Returns:
            NetworkX 图结构，如果加载失败返回 None
        """
        try:
            filepath = os.path.join(self.storage_path, filename)
            
            if self.format == 'json':
                if not os.path.exists(filepath):
                    print(f"File not found: {filepath}")
                    return None
                
                with open(filepath, 'r', encoding='utf-8') as f:
                    data = json.load(f)
                
                graph = nx.Graph()
                
                for node in data['nodes']:
                    node_id = node.pop('id')
                    graph.add_node(node_id, **node)
                
                for edge in data['edges']:
                    source = edge.pop('source')
                    target = edge.pop('target')
                    graph.add_edge(source, target, **edge)
                
                print(f"Semantic memory loaded from {filepath}")
                print(f"Loaded {graph.number_of_nodes()} nodes and {graph.number_of_edges()} edges")
                return graph
            else:
                pkl_path = filepath + '.pkl'
                if not os.path.exists(pkl_path):
                    print(f"File not found: {pkl_path}")
                    return None
                
                with open(pkl_path, 'rb') as f:
                    graph = pickle.load(f)
                
                print(f"Semantic memory loaded from {pkl_path}")
                return graph
                
        except Exception as e:
            print(f"Error loading semantic memory: {e}")
            return None

    def save_episodic_memory(self, events: List[Dict[str, Any]], filename: str = 'episodic_memory.json') -> bool:
        """保存情景记忆

        Args:
            events: 事件列表
            filename: 文件名

        Returns:
            是否保存成功
        """
        try:
            filepath = os.path.join(self.storage_path, filename)
            
            data = {
                'events': events,
                'metadata': {
                    'save_time': time.time(),
                    'event_count': len(events)
                }
            }
            
            if self.format == 'json':
                with open(filepath, 'w', encoding='utf-8') as f:
                    json.dump(data, f, ensure_ascii=False, indent=2, default=str)
            else:
                with open(filepath + '.pkl', 'wb') as f:
                    pickle.dump(data, f)
            
            print(f"Episodic memory saved to {filepath}")
            return True
            
        except Exception as e:
            print(f"Error saving episodic memory: {e}")
            return False

    def load_episodic_memory(self, filename: str = 'episodic_memory.json') -> Optional[List[Dict[str, Any]]]:
        """加载情景记忆

        Args:
            filename: 文件名

        Returns:
            事件列表，如果加载失败返回 None
        """
        try:
            filepath = os.path.join(self.storage_path, filename)
            
            if self.format == 'json':
                if not os.path.exists(filepath):
                    print(f"File not found: {filepath}")
                    return None
                
                with open(filepath, 'r', encoding='utf-8') as f:
                    data = json.load(f)
                
                events = data.get('events', [])
                print(f"Episodic memory loaded from {filepath}")
                print(f"Loaded {len(events)} events")
                return events
            else:
                pkl_path = filepath + '.pkl'
                if not os.path.exists(pkl_path):
                    print(f"File not found: {pkl_path}")
                    return None
                
                with open(pkl_path, 'rb') as f:
                    data = pickle.load(f)
                
                events = data.get('events', [])
                print(f"Episodic memory loaded from {pkl_path}")
                return events
                
        except Exception as e:
            print(f"Error loading episodic memory: {e}")
            return None

    def save_procedural_memory(self, skills: Dict[str, Any], filename: str = 'procedural_memory.json') -> bool:
        """保存内隐记忆

        Args:
            skills: 技能字典
            filename: 文件名

        Returns:
            是否保存成功
        """
        try:
            filepath = os.path.join(self.storage_path, filename)
            
            data = {
                'skills': skills,
                'metadata': {
                    'save_time': time.time(),
                    'skill_count': len(skills)
                }
            }
            
            if self.format == 'json':
                with open(filepath, 'w', encoding='utf-8') as f:
                    json.dump(data, f, ensure_ascii=False, indent=2, default=str)
            else:
                with open(filepath + '.pkl', 'wb') as f:
                    pickle.dump(data, f)
            
            print(f"Procedural memory saved to {filepath}")
            return True
            
        except Exception as e:
            print(f"Error saving procedural memory: {e}")
            return False

    def load_procedural_memory(self, filename: str = 'procedural_memory.json') -> Optional[Dict[str, Any]]:
        """加载内隐记忆

        Args:
            filename: 文件名

        Returns:
            技能字典，如果加载失败返回 None
        """
        try:
            filepath = os.path.join(self.storage_path, filename)
            
            if self.format == 'json':
                if not os.path.exists(filepath):
                    print(f"File not found: {filepath}")
                    return None
                
                with open(filepath, 'r', encoding='utf-8') as f:
                    data = json.load(f)
                
                skills = data.get('skills', {})
                print(f"Procedural memory loaded from {filepath}")
                print(f"Loaded {len(skills)} skills")
                return skills
            else:
                pkl_path = filepath + '.pkl'
                if not os.path.exists(pkl_path):
                    print(f"File not found: {pkl_path}")
                    return None
                
                with open(pkl_path, 'rb') as f:
                    data = pickle.load(f)
                
                skills = data.get('skills', {})
                print(f"Procedural memory loaded from {pkl_path}")
                return skills
                
        except Exception as e:
            print(f"Error loading procedural memory: {e}")
            return None

    def save_all(self, semantic_graph: nx.Graph, episodic_events: List[Dict[str, Any]], 
                 procedural_skills: Dict[str, Any]) -> Dict[str, bool]:
        """保存所有记忆

        Args:
            semantic_graph: 语义记忆图
            episodic_events: 情景记忆事件列表
            procedural_skills: 内隐记忆技能字典

        Returns:
            各类型记忆的保存结果
        """
        results = {
            'semantic': self.save_semantic_memory(semantic_graph),
            'episodic': self.save_episodic_memory(episodic_events),
            'procedural': self.save_procedural_memory(procedural_skills)
        }
        
        self.last_save_time = time.time()
        
        return results

    def load_all(self) -> Dict[str, Any]:
        """加载所有记忆

        Returns:
            各类型记忆的数据
        """
        return {
            'semantic': self.load_semantic_memory(),
            'episodic': self.load_episodic_memory(),
            'procedural': self.load_procedural_memory()
        }

    def start_auto_save(self, semantic_memory, episodic_memory, procedural_memory):
        """启动自动保存

        Args:
            semantic_memory: 语义记忆实例
            episodic_memory: 情景记忆实例
            procedural_memory: 内隐记忆实例
        """
        if not self.auto_save:
            return
        
        self.is_running = True
        
        def auto_save_loop():
            while self.is_running:
                time.sleep(self.save_interval)
                if self.is_running:
                    self.save_all(
                        semantic_memory.graph,
                        episodic_memory.events,
                        procedural_memory.skills
                    )
        
        self.save_thread = threading.Thread(target=auto_save_loop, daemon=True)
        self.save_thread.start()
        print(f"Auto-save started with interval {self.save_interval} seconds")

    def stop_auto_save(self):
        """停止自动保存"""
        self.is_running = False
        if self.save_thread:
            self.save_thread.join(timeout=5)
        print("Auto-save stopped")

    def should_save(self) -> bool:
        """检查是否应该保存

        Returns:
            是否应该保存
        """
        return time.time() - self.last_save_time >= self.save_interval

    def get_storage_info(self) -> Dict[str, Any]:
        """获取存储信息

        Returns:
            存储信息
        """
        info = {
            'storage_path': self.storage_path,
            'format': self.format,
            'auto_save': self.auto_save,
            'save_interval': self.save_interval,
            'last_save_time': self.last_save_time,
            'files': []
        }
        
        if os.path.exists(self.storage_path):
            for filename in os.listdir(self.storage_path):
                filepath = os.path.join(self.storage_path, filename)
                if os.path.isfile(filepath):
                    info['files'].append({
                        'name': filename,
                        'size': os.path.getsize(filepath),
                        'modified_time': os.path.getmtime(filepath)
                    })
        
        return info

    def clear_storage(self, memory_type: Optional[str] = None):
        """清空存储

        Args:
            memory_type: 记忆类型，None 表示清空所有
        """
        if memory_type is None:
            filenames = ['semantic_memory.json', 'episodic_memory.json', 'procedural_memory.json']
        elif memory_type == 'semantic':
            filenames = ['semantic_memory.json']
        elif memory_type == 'episodic':
            filenames = ['episodic_memory.json']
        elif memory_type == 'procedural':
            filenames = ['procedural_memory.json']
        else:
            return
        
        for filename in filenames:
            filepath = os.path.join(self.storage_path, filename)
            if os.path.exists(filepath):
                os.remove(filepath)
                print(f"Removed {filepath}")
            
            pkl_path = filepath + '.pkl'
            if os.path.exists(pkl_path):
                os.remove(pkl_path)
                print(f"Removed {pkl_path}")
