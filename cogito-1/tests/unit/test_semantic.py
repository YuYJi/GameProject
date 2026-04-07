"""语义记忆子模块单元测试"""

import pytest
import numpy as np
from src.long_term_memory.semantic.node import Node
from src.long_term_memory.semantic.edge import Edge
from src.long_term_memory.semantic.inference import GraphInference


class TestNode:
    """测试语义节点"""

    def test_init(self):
        """测试初始化"""
        node_id = "test_node_1"
        content = "test content"
        embedding = np.random.rand(512)
        
        node = Node(node_id, content, embedding)
        
        assert node.id == node_id
        assert node.content == content
        assert np.array_equal(node.embedding, embedding)
        assert node.strength == 1.0
        assert node.access_count == 0

    def test_update_embedding(self):
        """测试更新嵌入"""
        node = Node("test_node_2", "test", np.random.rand(512))
        
        new_embedding = np.random.rand(512)
        node.update_embedding(new_embedding)
        
        assert np.array_equal(node.embedding, new_embedding)

    def test_update_strength(self):
        """测试更新强度"""
        node = Node("test_node_3", "test", np.random.rand(512))
        
        # 增加强度
        node.update_strength(0.1)
        assert node.strength == 1.1
        
        # 减少强度
        node.update_strength(-0.2)
        assert node.strength == 0.9
        
        # 强度不能为负
        node.update_strength(-1.0)
        assert node.strength == 0.0

    def test_access(self):
        """测试访问"""
        node = Node("test_node_4", "test", np.random.rand(512))
        
        # 访问节点
        node.access()
        assert node.access_count == 1
        
        # 再次访问
        node.access()
        assert node.access_count == 2

    def test_similarity(self):
        """测试相似度计算"""
        embedding1 = np.array([1.0, 0.0, 0.0])
        embedding2 = np.array([0.9, 0.1, 0.0])
        embedding3 = np.array([0.0, 1.0, 0.0])
        
        node1 = Node("node_1", "test1", embedding1)
        node2 = Node("node_2", "test2", embedding2)
        node3 = Node("node_3", "test3", embedding3)
        
        # 相似节点
        sim1 = node1.similarity(node2)
        assert sim1 > 0.8
        
        # 不相似节点
        sim2 = node1.similarity(node3)
        assert sim2 < 0.5

    def test_to_dict(self):
        """测试转换为字典"""
        node = Node("test_node_5", "test content", np.array([1.0, 2.0, 3.0]))
        
        node_dict = node.to_dict()
        
        assert isinstance(node_dict, dict)
        assert node_dict['id'] == "test_node_5"
        assert node_dict['content'] == "test content"
        assert 'embedding' in node_dict
        assert 'strength' in node_dict
        assert 'access_count' in node_dict


class TestEdge:
    """测试语义边"""

    def test_init(self):
        """测试初始化"""
        source_id = "node_1"
        target_id = "node_2"
        relation_type = "is_a"
        weight = 0.8
        
        edge = Edge(source_id, target_id, relation_type, weight)
        
        assert edge.source_id == source_id
        assert edge.target_id == target_id
        assert edge.relation_type == relation_type
        assert edge.weight == weight

    def test_update_weight(self):
        """测试更新权重"""
        edge = Edge("node_1", "node_2", "is_a", 0.5)
        
        # 增加权重
        edge.update_weight(0.2)
        assert edge.weight == 0.7
        
        # 减少权重
        edge.update_weight(-0.3)
        assert edge.weight == 0.4
        
        # 权重范围限制
        edge.update_weight(1.0)
        assert edge.weight == 1.0
        
        edge.update_weight(-2.0)
        assert edge.weight == 0.0

    def test_strengthen(self):
        """测试增强连接"""
        edge = Edge("node_1", "node_2", "is_a", 0.5)
        
        edge.strengthen()
        assert edge.weight > 0.5

    def test_weaken(self):
        """测试减弱连接"""
        edge = Edge("node_1", "node_2", "is_a", 0.5)
        
        edge.weaken()
        assert edge.weight < 0.5

    def test_to_dict(self):
        """测试转换为字典"""
        edge = Edge("node_1", "node_2", "is_a", 0.8)
        
        edge_dict = edge.to_dict()
        
        assert isinstance(edge_dict, dict)
        assert edge_dict['source_id'] == "node_1"
        assert edge_dict['target_id'] == "node_2"
        assert edge_dict['relation_type'] == "is_a"
        assert edge_dict['weight'] == 0.8


class TestGraphInference:
    """测试图推理"""

    def test_init(self):
        """测试初始化"""
        import networkx as nx
        
        graph = nx.Graph()
        config = {
            'max_hops': 3,
            'min_confidence': 0.5
        }
        
        inference = GraphInference(graph, config)
        
        assert inference.max_hops == 3
        assert inference.min_confidence == 0.5

    def test_find_path(self):
        """测试查找路径"""
        import networkx as nx
        
        # 创建测试图
        graph = nx.Graph()
        graph.add_edge("A", "B", weight=0.8)
        graph.add_edge("B", "C", weight=0.7)
        graph.add_edge("A", "D", weight=0.9)
        
        config = {'max_hops': 3}
        inference = GraphInference(graph, config)
        
        # 查找路径
        path = inference.find_path("A", "C")
        
        assert isinstance(path, list)
        assert "A" in path
        assert "C" in path

    def test_infer_relation(self):
        """测试推理关系"""
        import networkx as nx
        
        # 创建测试图
        graph = nx.Graph()
        graph.add_node("A", node=Node("A", "apple", np.random.rand(10)))
        graph.add_node("B", node=Node("B", "fruit", np.random.rand(10)))
        graph.add_edge("A", "B", relation="is_a")
        
        config = {}
        inference = GraphInference(graph, config)
        
        # 推理关系
        relation = inference.infer_relation("A", "B")
        
        assert relation is not None

    def test_find_similar_nodes(self):
        """测试查找相似节点"""
        import networkx as nx
        
        # 创建测试图
        graph = nx.Graph()
        embedding1 = np.array([1.0, 0.0, 0.0])
        embedding2 = np.array([0.9, 0.1, 0.0])
        embedding3 = np.array([0.0, 1.0, 0.0])
        
        graph.add_node("A", node=Node("A", "apple", embedding1))
        graph.add_node("B", node=Node("B", "apple pie", embedding2))
        graph.add_node("C", node=Node("C", "banana", embedding3))
        
        config = {'similarity_threshold': 0.8}
        inference = GraphInference(graph, config)
        
        # 查找相似节点
        similar = inference.find_similar_nodes("A", threshold=0.8)
        
        assert isinstance(similar, list)
        assert "B" in similar
        assert "C" not in similar

    def test_spread_activation(self):
        """测试激活扩散"""
        import networkx as nx
        
        # 创建测试图
        graph = nx.Graph()
        graph.add_edge("A", "B", weight=0.8)
        graph.add_edge("B", "C", weight=0.7)
        graph.add_edge("A", "D", weight=0.6)
        
        config = {'decay_factor': 0.5}
        inference = GraphInference(graph, config)
        
        # 激活扩散
        activated = inference.spread_activation(["A"], hops=2)
        
        assert isinstance(activated, dict)
        assert "A" in activated
        assert activated["A"] == 1.0  # 初始激活节点
        assert "B" in activated
        assert "D" in activated

    def test_get_node_neighbors(self):
        """测试获取节点邻居"""
        import networkx as nx
        
        # 创建测试图
        graph = nx.Graph()
        graph.add_edge("A", "B", weight=0.8)
        graph.add_edge("A", "C", weight=0.7)
        graph.add_edge("B", "D", weight=0.6)
        
        config = {}
        inference = GraphInference(graph, config)
        
        # 获取邻居
        neighbors = inference.get_node_neighbors("A")
        
        assert isinstance(neighbors, list)
        assert "B" in neighbors
        assert "C" in neighbors
        assert "D" not in neighbors  # D 不是 A 的直接邻居
