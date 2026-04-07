"""语义记忆节点类"""

from typing import Dict, Any, Optional
import numpy as np


class Node:
    """语义记忆节点类"""

    def __init__(self, node_id: str, content: str, embedding: np.ndarray):
        """初始化节点

        Args:
            node_id: 节点ID
            content: 节点内容
            embedding: 节点嵌入向量
        """
        self.id = node_id
        self.content = content
        self.embedding = embedding
        self.relevance = 0.0
        self.creation_time = 0
        self.last_access_time = 0
        self.access_count = 0

    def update_embedding(self, new_embedding: np.ndarray):
        """更新节点嵌入

        Args:
            new_embedding: 新的嵌入向量
        """
        # 平滑更新嵌入
        self.embedding = 0.8 * self.embedding + 0.2 * new_embedding
        # 归一化
        self.embedding = self.embedding / np.linalg.norm(self.embedding)

    def update_access_info(self):
        """更新访问信息"""
        import time
        self.last_access_time = time.time()
        self.access_count += 1

    def to_dict(self) -> Dict[str, Any]:
        """将节点转换为字典

        Returns:
            节点字典
        """
        return {
            'id': self.id,
            'content': self.content,
            'embedding': self.embedding.tolist(),
            'relevance': self.relevance,
            'creation_time': self.creation_time,
            'last_access_time': self.last_access_time,
            'access_count': self.access_count
        }

    @classmethod
    def from_dict(cls, data: Dict[str, Any]) -> 'Node':
        """从字典创建节点

        Args:
            data: 节点字典

        Returns:
            节点实例
        """
        node = cls(
            node_id=data['id'],
            content=data['content'],
            embedding=np.array(data['embedding'])
        )
        node.relevance = data.get('relevance', 0.0)
        node.creation_time = data.get('creation_time', 0)
        node.last_access_time = data.get('last_access_time', 0)
        node.access_count = data.get('access_count', 0)
        return node

    def __str__(self) -> str:
        """字符串表示

        Returns:
            字符串表示
        """
        return f"Node(id={self.id}, content={self.content[:50]}...)"

    def __repr__(self) -> str:
        """repr表示

        Returns:
            repr表示
        """
        return self.__str__()