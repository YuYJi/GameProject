"""导出语义图可视化"""

import argparse
import yaml
import networkx as nx
import matplotlib.pyplot as plt
from src.long_term_memory import SemanticMemory


def load_config(config_path):
    """加载配置文件

    Args:
        config_path: 配置文件路径

    Returns:
        配置字典
    """
    with open(config_path, 'r', encoding='utf-8') as f:
        return yaml.safe_load(f)


def export_memory_graph(config, output_path):
    """导出语义图

    Args:
        config: 配置字典
        output_path: 输出路径
    """
    print("Initializing semantic memory...")
    
    # 初始化语义记忆
    semantic_memory = SemanticMemory(config.get('long_term_memory', {}))

    print("Storing test memories...")
    
    # 存储一些测试记忆
    test_memories = [
        {'content': 'Apple', 'category': 'Fruit'},
        {'content': 'Banana', 'category': 'Fruit'},
        {'content': 'Orange', 'category': 'Fruit'},
        {'content': 'Cat', 'category': 'Animal'},
        {'content': 'Dog', 'category': 'Animal'},
        {'content': 'Bird', 'category': 'Animal'},
        {'content': 'Car', 'category': 'Vehicle'},
        {'content': 'Bike', 'category': 'Vehicle'},
        {'content': 'Plane', 'category': 'Vehicle'}
    ]

    for memory in test_memories:
        semantic_memory.store(memory)

    print("Test memories stored")
    print(f"Semantic memory stats: {semantic_memory.get_graph_stats()}")

    # 获取图
    graph = semantic_memory.graph

    print("Generating visualization...")
    
    # 绘制图
    plt.figure(figsize=(12, 8))
    
    # 提取节点标签
    labels = {}
    for node_id, node_data in graph.nodes(data=True):
        node = node_data['node']
        labels[node_id] = node.content[:20]  # 限制标签长度

    # 绘制节点和边
    pos = nx.spring_layout(graph, seed=42)
    nx.draw_networkx_nodes(graph, pos, node_size=500, node_color='lightblue')
    nx.draw_networkx_edges(graph, pos, width=1.0, alpha=0.5)
    nx.draw_networkx_labels(graph, pos, labels, font_size=10)

    plt.title('Semantic Memory Graph')
    plt.axis('off')
    plt.tight_layout()

    # 保存图像
    plt.savefig(output_path, dpi=300, bbox_inches='tight')
    print(f"Graph exported to {output_path}")


def main():
    """主函数"""
    # 解析命令行参数
    parser = argparse.ArgumentParser(description='Export semantic memory graph visualization')
    parser.add_argument('--config', type=str, default='config/default.yaml', 
                      help='Path to config file')
    parser.add_argument('--output', type=str, default='semantic_memory_graph.png', 
                      help='Output image path')
    args = parser.parse_args()

    # 加载配置
    config = load_config(args.config)
    print(f"Loaded config from {args.config}")

    # 导出语义图
    export_memory_graph(config, args.output)


if __name__ == "__main__":
    main()