"""基于图的推理"""

from typing import Dict, Any, List, Optional
import networkx as nx
import numpy as np


class GraphInference:
    """图推理类"""

    def __init__(self, graph: nx.Graph, config: Dict[str, Any]):
        """初始化推理器

        Args:
            graph: 语义图
            config: 配置参数
        """
        self.graph = graph
        self.config = config

    def infer(self, query: Dict[str, Any]) -> List[Dict[str, Any]]:
        """执行推理

        Args:
            query: 查询信息

        Returns:
            推理结果
        """
        results = []

        # 执行路径推理
        path_results = self._path_inference(query)
        results.extend(path_results)

        # 执行相似性推理
        similarity_results = self._similarity_inference(query)
        results.extend(similarity_results)

        # 执行聚类推理
        cluster_results = self._cluster_inference(query)
        results.extend(cluster_results)

        return results

    def _path_inference(self, query: Dict[str, Any]) -> List[Dict[str, Any]]:
        """基于路径的推理

        Args:
            query: 查询信息

        Returns:
            推理结果
        """
        results = []

        # 提取查询中的节点
        query_nodes = self._extract_query_nodes(query)

        # 对每对节点执行路径推理
        for i in range(len(query_nodes)):
            for j in range(len(query_nodes)):
                if i != j:
                    paths = self._find_paths(query_nodes[i], query_nodes[j])
                    for path in paths:
                        results.append({
                            'type': 'path_inference',
                            'path': path,
                            'confidence': self._calculate_path_confidence(path)
                        })

        return results

    def _similarity_inference(self, query: Dict[str, Any]) -> List[Dict[str, Any]]:
        """基于相似性的推理

        Args:
            query: 查询信息

        Returns:
            推理结果
        """
        results = []

        # 提取查询中的节点
        query_nodes = self._extract_query_nodes(query)

        # 对每个节点执行相似性推理
        for node_id in query_nodes:
            similar_nodes = self._find_similar_nodes(node_id)
            for similar_node in similar_nodes:
                results.append({
                    'type': 'similarity_inference',
                    'source': node_id,
                    'target': similar_node['id'],
                    'similarity': similar_node['similarity'],
                    'confidence': similar_node['similarity']
                })

        return results

    def _cluster_inference(self, query: Dict[str, Any]) -> List[Dict[str, Any]]:
        """基于聚类的推理

        Args:
            query: 查询信息

        Returns:
            推理结果
        """
        results = []

        # 提取查询中的节点
        query_nodes = self._extract_query_nodes(query)

        # 对每个节点执行聚类推理
        for node_id in query_nodes:
            cluster = self._find_node_cluster(node_id)
            if len(cluster) > 1:
                results.append({
                    'type': 'cluster_inference',
                    'node': node_id,
                    'cluster': cluster,
                    'confidence': 0.8  # 简化处理
                })

        return results

    def _extract_query_nodes(self, query: Dict[str, Any]) -> List[str]:
        """从查询中提取节点

        Args:
            query: 查询信息

        Returns:
            节点ID列表
        """
        # 简单的节点提取
        # 在实际应用中，可以使用更复杂的方法
        nodes = []

        if isinstance(query, dict):
            for value in query.values():
                if isinstance(value, str):
                    # 尝试查找匹配的节点
                    for node_id, node_data in self.graph.nodes(data=True):
                        node = node_data['node']
                        if value in node.content:
                            nodes.append(node_id)

        return nodes

    def _find_paths(self, source: str, target: str, max_length: int = 3) -> List[List[str]]:
        """查找两个节点之间的路径

        Args:
            source: 源节点ID
            target: 目标节点ID
            max_length: 最大路径长度

        Returns:
            路径列表
        """
        paths = []

        if source in self.graph and target in self.graph:
            try:
                # 使用networkx的shortest_path函数
                for path in nx.all_simple_paths(self.graph, source, target, cutoff=max_length):
                    paths.append(path)
            except nx.NetworkXNoPath:
                pass

        return paths

    def _calculate_path_confidence(self, path: List[str]) -> float:
        """计算路径的置信度

        Args:
            path: 路径

        Returns:
            置信度
        """
        if len(path) < 2:
            return 0.0

        # 计算路径上所有边的权重平均值
        weights = []
        for i in range(len(path) - 1):
            edge = self.graph.edges[path[i], path[i+1]]['edge']
            weights.append(edge.weight)

        if not weights:
            return 0.0

        return float(np.mean(weights))

    def _find_similar_nodes(self, node_id: str, top_k: int = 5) -> List[Dict[str, Any]]:
        """查找与指定节点相似的节点

        Args:
            node_id: 节点ID
            top_k: 返回前k个相似节点

        Returns:
            相似节点列表
        """
        similar_nodes = []

        if node_id in self.graph:
            source_node = self.graph.nodes[node_id]['node']

            # 计算与所有其他节点的相似度
            for other_id, node_data in self.graph.nodes(data=True):
                if other_id != node_id:
                    other_node = node_data['node']
                    similarity = self._calculate_node_similarity(source_node, other_node)
                    similar_nodes.append({
                        'id': other_id,
                        'similarity': similarity
                    })

            # 排序并返回前k个
            similar_nodes.sort(key=lambda x: x['similarity'], reverse=True)
            similar_nodes = similar_nodes[:top_k]

        return similar_nodes

    def _calculate_node_similarity(self, node1, node2) -> float:
        """计算两个节点的相似度

        Args:
            node1: 第一个节点
            node2: 第二个节点

        Returns:
            相似度
        """
        # 使用嵌入向量的余弦相似度
        return float(np.dot(node1.embedding, node2.embedding))

    def _find_node_cluster(self, node_id: str, radius: float = 0.7) -> List[str]:
        """查找节点所在的聚类

        Args:
            node_id: 节点ID
            radius: 聚类半径

        Returns:
            聚类中的节点ID列表
        """
        cluster = [node_id]

        if node_id in self.graph:
            source_node = self.graph.nodes[node_id]['node']

            # 查找相似度大于半径的节点
            for other_id, node_data in self.graph.nodes(data=True):
                if other_id != node_id:
                    other_node = node_data['node']
                    similarity = self._calculate_node_similarity(source_node, other_node)
                    if similarity > radius:
                        cluster.append(other_id)

        return cluster

    def validate_inference(self, inference: Dict[str, Any]) -> bool:
        """验证推理结果

        Args:
            inference: 推理结果

        Returns:
            是否有效
        """
        # 检查置信度
        confidence = inference.get('confidence', 0.0)
        if confidence < 0.5:
            return False

        # 检查推理类型
        inference_type = inference.get('type', '')
        if inference_type not in ['path_inference', 'similarity_inference', 'cluster_inference']:
            return False

        return True