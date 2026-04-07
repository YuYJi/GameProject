"""手动触发记忆巩固"""

import argparse
import yaml
import time
from src.long_term_memory import SemanticMemory, EpisodicMemory, ProceduralMemory, MemoryConsolidation


def load_config(config_path):
    """加载配置文件

    Args:
        config_path: 配置文件路径

    Returns:
        配置字典
    """
    with open(config_path, 'r', encoding='utf-8') as f:
        return yaml.safe_load(f)


def simulate_sleep(config):
    """模拟睡眠过程

    Args:
        config: 配置字典
    """
    print("Initializing memory systems...")
    
    # 初始化记忆系统
    semantic_memory = SemanticMemory(config.get('long_term_memory', {}))
    episodic_memory = EpisodicMemory(config.get('long_term_memory', {}))
    procedural_memory = ProceduralMemory(config.get('long_term_memory', {}))

    # 初始化记忆巩固
    memory_consolidation = MemoryConsolidation(config.get('long_term_memory', {}))

    print("Storing test memories...")
    
    # 存储一些测试记忆
    # 语义记忆
    semantic_memory.store({'content': 'Test semantic memory 1'})
    semantic_memory.store({'content': 'Test semantic memory 2'})
    
    # 情景记忆
    current_time = time.time()
    episodic_memory.store(
        {'content': 'Test episodic memory 1'},
        {'valence': 0.5, 'arousal': 0.5},
        current_time
    )
    episodic_memory.store(
        {'content': 'Test episodic memory 2'},
        {'valence': 0.6, 'arousal': 0.6},
        current_time + 10
    )
    
    # 内隐记忆
    procedural_memory.store({'content': 'Test procedural memory 1', 'trigger': {'context': 'test'}})
    procedural_memory.store({'content': 'Test procedural memory 2', 'trigger': {'context': 'test2'}})

    print("Memory systems initialized with test data")
    print("\nBefore consolidation:")
    print(f"Semantic memory: {semantic_memory.get_graph_stats()}")
    print(f"Episodic memory: {episodic_memory.get_event_stats()}")
    print(f"Procedural memory: {procedural_memory.get_skill_stats()}")

    print("\nStarting sleep simulation...")
    start_time = time.time()

    # 执行记忆巩固
    memory_consolidation.consolidate(
        semantic_memory,
        episodic_memory,
        procedural_memory
    )

    end_time = time.time()
    print(f"Sleep simulation completed in {end_time - start_time:.2f} seconds")

    print("\nAfter consolidation:")
    print(f"Semantic memory: {semantic_memory.get_graph_stats()}")
    print(f"Episodic memory: {episodic_memory.get_event_stats()}")
    print(f"Procedural memory: {procedural_memory.get_skill_stats()}")

    print("\nMemory consolidation completed successfully!")


def main():
    """主函数"""
    # 解析命令行参数
    parser = argparse.ArgumentParser(description='Simulate sleep for memory consolidation')
    parser.add_argument('--config', type=str, default='config/default.yaml', 
                      help='Path to config file')
    args = parser.parse_args()

    # 加载配置
    config = load_config(args.config)
    print(f"Loaded config from {args.config}")

    # 模拟睡眠
    simulate_sleep(config)


if __name__ == "__main__":
    main()