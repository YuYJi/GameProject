"""语义记忆图数据库封装"""

from typing import Dict, Any, List, Optional
import networkx as nx
import numpy as np

from .node import Node
from .edge import Edge
from .inference import GraphInference


class SemanticMemory:
    """语义记忆类"""

    def __init__(self, config: Dict[str, Any]):
        """初始化语义记忆

        Args:
            config: 配置参数
        """
        self.config = config
        self.graph_store = config.get('graph_store', 'networkx')
        self.embedding_dim = config.get('embedding_dim', 512)
        self.connection_threshold = config.get('connection_threshold', 0.5)
        self.max_neighbors = config.get('max_neighbors', 10)

        # 初始化图结构
        self.graph = nx.Graph()

        # 初始化推理器
        self.inference = GraphInference(self.graph, config)
        
        # 持久化管理器
        self.persistence = None

    def store(self, information: Dict[str, Any]):
        """存储信息到语义记忆

        Args:
            information: 要存储的信息
        """
        # 提取概念和关系
        concepts = self._extract_concepts(information)
        relationships = self._extract_relationships(information, concepts)

        # 添加节点
        for concept in concepts:
            self._add_node(concept)

        # 添加边
        for relationship in relationships:
            self._add_edge(relationship)

    def retrieve(self, query: List[str], threshold: float = 0.6) -> List[Dict[str, Any]]:
        """从语义记忆中检索信息

        Args:
            query: 查询关键词
            threshold: 相关性阈值

        Returns:
            检索到的信息
        """
        results = []

        # 查找相关节点
        for keyword in query:
            related_nodes = self._find_related_nodes(keyword, threshold)
            for node in related_nodes:
                result = {
                    'type': 'semantic',
                    'content': node.content,
                    'relevance': node.relevance,
                    'neighbors': self._get_node_neighbors(node.id)
                }
                results.append(result)

        # 去重并排序
        results = self._deduplicate_results(results)
        results.sort(key=lambda x: x['relevance'], reverse=True)

        return results

    def _add_node(self, concept: Dict[str, Any]):
        """添加节点

        Args:
            concept: 概念信息
        """
        node_id = concept.get('id', self._generate_node_id(concept))
        content = concept.get('content', '')
        embedding = concept.get('embedding', self._generate_embedding(content))

        # 检查节点是否已存在
        if node_id not in self.graph:
            node = Node(node_id, content, embedding)
            self.graph.add_node(node_id, node=node)
        else:
            # 更新现有节点
            node = self.graph.nodes[node_id]['node']
            node.update_embedding(embedding)

    def _add_edge(self, relationship: Dict[str, Any]):
        """添加边

        Args:
            relationship: 关系信息
        """
        source_id = relationship.get('source')
        target_id = relationship.get('target')
        relation_type = relationship.get('type', 'related')
        weight = relationship.get('weight', 1.0)

        # 检查源节点和目标节点是否存在
        if source_id in self.graph and target_id in self.graph:
            # 检查边是否已存在
            if not self.graph.has_edge(source_id, target_id):
                edge = Edge(source_id, target_id, relation_type, weight)
                self.graph.add_edge(source_id, target_id, edge=edge)
            else:
                # 更新现有边的权重
                edge = self.graph.edges[source_id, target_id]['edge']
                edge.update_weight(weight)

    def _find_related_nodes(self, keyword: str, threshold: float) -> List[Node]:
        """查找相关节点

        Args:
            keyword: 关键词
            threshold: 相关性阈值

        Returns:
            相关节点列表
        """
        related_nodes = []

        # 生成关键词的嵌入
        keyword_embedding = self._generate_embedding(keyword)

        # 计算与所有节点的相似度
        for node_id, node_data in self.graph.nodes(data=True):
            node = node_data['node']
            similarity = self._calculate_similarity(keyword_embedding, node.embedding)
            if similarity >= threshold:
                node.relevance = similarity
                related_nodes.append(node)

        # 排序
        related_nodes.sort(key=lambda x: x.relevance, reverse=True)

        return related_nodes

    def _get_node_neighbors(self, node_id: str) -> List[Dict[str, Any]]:
        """获取节点的邻居

        Args:
            node_id: 节点ID

        Returns:
            邻居列表
        """
        neighbors = []

        if node_id in self.graph:
            # 获取所有邻居
            for neighbor_id in self.graph.neighbors(node_id):
                edge = self.graph.edges[node_id, neighbor_id]['edge']
                neighbor_node = self.graph.nodes[neighbor_id]['node']
                neighbors.append({
                    'id': neighbor_id,
                    'content': neighbor_node.content,
                    'relation': edge.relation_type,
                    'weight': edge.weight
                })

            # 按权重排序，取前max_neighbors个
            neighbors.sort(key=lambda x: x['weight'], reverse=True)
            neighbors = neighbors[:self.max_neighbors]

        return neighbors

    def _extract_concepts(self, information: Dict[str, Any]) -> List[Dict[str, Any]]:
        """从信息中提取概念

        Args:
            information: 信息

        Returns:
            概念列表
        """
        # 简单的概念提取
        # 在实际应用中，可以使用更复杂的方法
        concepts = []

        if isinstance(information, dict):
            for key, value in information.items():
                if isinstance(value, str):
                    concepts.append({
                        'id': f"{key}_{hash(value)}",
                        'content': value,
                        'embedding': self._generate_embedding(value)
                    })

        return concepts

    def _extract_relationships(self, information: Dict[str, Any], 
                              concepts: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
        """从信息中提取关系

        Args:
            information: 信息
            concepts: 概念列表

        Returns:
            关系列表
        """
        # 简单的关系提取
        # 在实际应用中，可以使用更复杂的方法
        relationships = []

        # 为相邻概念创建关系
        for i in range(len(concepts) - 1):
            relationships.append({
                'source': concepts[i]['id'],
                'target': concepts[i + 1]['id'],
                'type': 'sequential',
                'weight': 0.8
            })

        return relationships

    def _generate_node_id(self, concept: Dict[str, Any]) -> str:
        """生成节点ID

        Args:
            concept: 概念信息

        Returns:
            节点ID
        """
        content = concept.get('content', '')
        return f"node_{hash(content)}"

    def _generate_embedding(self, text: str) -> np.ndarray:
        """生成文本的嵌入

        Args:
            text: 文本

        Returns:
            嵌入向量
        """
        # 简单的嵌入生成
        # 在实际应用中，可以使用预训练的语言模型
        embedding = np.random.rand(self.embedding_dim)
        return embedding / np.linalg.norm(embedding)  # 归一化

    def _calculate_similarity(self, embedding1: np.ndarray, 
                             embedding2: np.ndarray) -> float:
        """计算两个嵌入的相似度

        Args:
            embedding1: 第一个嵌入
            embedding2: 第二个嵌入

        Returns:
            相似度
        """
        return float(np.dot(embedding1, embedding2))

    def _deduplicate_results(self, results: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
        """去重结果

        Args:
            results: 结果列表

        Returns:
            去重后的结果
        """
        seen = set()
        unique_results = []

        for result in results:
            content = result['content']
            if content not in seen:
                seen.add(content)
                unique_results.append(result)

        return unique_results

    def get_graph_stats(self) -> Dict[str, Any]:
        """获取图统计信息

        Returns:
            统计信息
        """
        return {
            'nodes': self.graph.number_of_nodes(),
            'edges': self.graph.number_of_edges(),
            'density': nx.density(self.graph)
        }

    def clear(self):
        """清空语义记忆"""
        self.graph.clear()

    def set_persistence(self, persistence):
        """设置持久化管理器

        Args:
            persistence: 持久化管理器实例
        """
        self.persistence = persistence

    def save(self, filename: str = 'semantic_memory.json') -> bool:
        """保存语义记忆到文件

        Args:
            filename: 文件名

        Returns:
            是否保存成功
        """
        if self.persistence:
            return self.persistence.save_semantic_memory(self.graph, filename)
        return False

    def load(self, filename: str = 'semantic_memory.json') -> bool:
        """从文件加载语义记忆

        Args:
            filename: 文件名

        Returns:
            是否加载成功
        """
        if self.persistence:
            graph = self.persistence.load_semantic_memory(filename)
            if graph is not None:
                self.graph = graph
                self.inference = GraphInference(self.graph, self.config)
                return True
        return False