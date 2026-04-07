"""记忆持久化使用示例"""

import yaml
from src.core import CognitionLoop


def load_config(config_path: str = 'config/default.yaml'):
    """加载配置文件

    Args:
        config_path: 配置文件路径

    Returns:
        配置字典
    """
    with open(config_path, 'r', encoding='utf-8') as f:
        config = yaml.safe_load(f)
    return config


def example_with_persistence():
    """使用持久化功能的示例"""
    
    # 加载配置
    config = load_config()
    
    # 确保持久化配置已启用
    if 'persistence' not in config.get('long_term_memory', {}):
        config.setdefault('long_term_memory', {})['persistence'] = {
            'storage_path': './data/memory/',
            'auto_save': True,
            'save_interval': 300,
            'format': 'json',
            'load_on_start': True
        }
    
    # 创建认知循环实例
    print("Initializing Cogito-1 with persistence...")
    cognition_loop = CognitionLoop(config)
    
    # 处理一些输入
    print("\nProcessing inputs...")
    for i in range(5):
        input_data = {'text': f'This is input number {i + 1}'}
        output = cognition_loop.process_input(input_data)
        print(f"Processed input {i + 1}: {output is not None}")
    
    # 手动保存记忆
    print("\nManually saving memories...")
    results = cognition_loop.save_memories()
    print(f"Save results: {results}")
    
    # 查看存储信息
    if cognition_loop.persistence:
        info = cognition_loop.persistence.get_storage_info()
        print(f"\nStorage info:")
        print(f"  Path: {info['storage_path']}")
        print(f"  Format: {info['format']}")
        print(f"  Files: {len(info['files'])}")
        for file_info in info['files']:
            print(f"    - {file_info['name']}: {file_info['size']} bytes")
    
    # 关闭系统（自动保存记忆）
    print("\nShutting down...")
    cognition_loop.shutdown()


def example_manual_save_load():
    """手动保存和加载记忆的示例"""
    
    from src.long_term_memory import SemanticMemory, EpisodicMemory, ProceduralMemory
    from src.utils.persistence import MemoryPersistence
    import time
    
    # 配置
    config = {
        'embedding_dim': 10,
        'event_log_size': 100,
        'skill_library_size': 100
    }
    
    persistence_config = {
        'storage_path': './data/memory/',
        'auto_save': False,
        'format': 'json'
    }
    
    # 创建持久化管理器
    persistence = MemoryPersistence(persistence_config)
    
    # 创建记忆实例
    semantic_memory = SemanticMemory(config)
    episodic_memory = EpisodicMemory(config)
    procedural_memory = ProceduralMemory(config)
    
    # 设置持久化管理器
    semantic_memory.set_persistence(persistence)
    episodic_memory.set_persistence(persistence)
    procedural_memory.set_persistence(persistence)
    
    # 添加一些数据
    print("Adding data to memories...")
    
    # 语义记忆
    semantic_memory.store({'content': 'Python is a programming language'})
    semantic_memory.store({'content': 'Machine learning uses algorithms'})
    
    # 情景记忆
    episodic_memory.store(
        {'text': 'Learned about neural networks'},
        {'valence': 0.7, 'arousal': 0.6},
        time.time()
    )
    
    # 内隐记忆
    procedural_memory.store({
        'id': 'skill_1',
        'name': 'coding',
        'trigger': {'context': 'programming'}
    })
    
    # 手动保存
    print("\nSaving memories...")
    semantic_memory.save()
    episodic_memory.save()
    procedural_memory.save()
    
    # 清空记忆
    print("\nClearing memories...")
    semantic_memory.clear()
    episodic_memory.clear()
    procedural_memory.clear()
    
    print(f"Semantic memory nodes: {semantic_memory.graph.number_of_nodes()}")
    print(f"Episodic memory events: {len(episodic_memory.events)}")
    print(f"Procedural memory skills: {len(procedural_memory.skills)}")
    
    # 从文件加载
    print("\nLoading memories from disk...")
    semantic_memory.load()
    episodic_memory.load()
    procedural_memory.load()
    
    print(f"Semantic memory nodes: {semantic_memory.graph.number_of_nodes()}")
    print(f"Episodic memory events: {len(episodic_memory.events)}")
    print(f"Procedural memory skills: {len(procedural_memory.skills)}")


def example_auto_save():
    """自动保存的示例"""
    
    from src.long_term_memory import SemanticMemory, EpisodicMemory, ProceduralMemory
    from src.utils.persistence import MemoryPersistence
    import time
    
    # 配置
    config = {
        'embedding_dim': 10,
        'event_log_size': 100,
        'skill_library_size': 100
    }
    
    persistence_config = {
        'storage_path': './data/memory/',
        'auto_save': True,
        'save_interval': 10,  # 每10秒保存一次
        'format': 'json'
    }
    
    # 创建持久化管理器
    persistence = MemoryPersistence(persistence_config)
    
    # 创建记忆实例
    semantic_memory = SemanticMemory(config)
    episodic_memory = EpisodicMemory(config)
    procedural_memory = ProceduralMemory(config)
    
    # 设置持久化管理器
    semantic_memory.set_persistence(persistence)
    episodic_memory.set_persistence(persistence)
    procedural_memory.set_persistence(persistence)
    
    # 启动自动保存
    print("Starting auto-save...")
    persistence.start_auto_save(semantic_memory, episodic_memory, procedural_memory)
    
    # 添加数据
    for i in range(10):
        semantic_memory.store({'content': f'Concept {i}'})
        episodic_memory.store(
            {'text': f'Event {i}'},
            {'valence': 0.5, 'arousal': 0.5},
            time.time()
        )
        procedural_memory.store({
            'id': f'skill_{i}',
            'name': f'Skill {i}'
        })
        time.sleep(1)
    
    # 停止自动保存
    print("\nStopping auto-save...")
    persistence.stop_auto_save()
    
    # 最终保存
    persistence.save_all(
        semantic_memory.graph,
        episodic_memory.events,
        procedural_memory.skills
    )
    
    print("Done!")


if __name__ == '__main__':
    print("=" * 60)
    print("Example 1: Using persistence with CognitionLoop")
    print("=" * 60)
    example_with_persistence()
    
    print("\n" + "=" * 60)
    print("Example 2: Manual save and load")
    print("=" * 60)
    example_manual_save_load()
    
    print("\n" + "=" * 60)
    print("Example 3: Auto-save")
    print("=" * 60)
    print("(Skipping auto-save example - it takes time)")
    # example_auto_save()
