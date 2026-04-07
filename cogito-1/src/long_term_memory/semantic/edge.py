"""语义记忆边类"""

from typing import Dict, Any, Optional


class Edge:
    """语义记忆边类"""

    def __init__(self, source: str, target: str, relation_type: str, weight: float):
        """初始化边

        Args:
            source: 源节点ID
            target: 目标节点ID
            relation_type: 关系类型
            weight: 关系权重
        """
        self.source = source
        self.target = target
        self.relation_type = relation_type
        self.weight = weight
        self.creation_time = 0
        self.last_update_time = 0

    def update_weight(self, new_weight: float):
        """更新边权重

        Args:
            new_weight: 新的权重
        """
        # 平滑更新权重
        self.weight = 0.8 * self.weight + 0.2 * new_weight
        # 确保权重在合理范围内
        self.weight = max(0.0, min(1.0, self.weight))
        # 更新时间
        import time
        self.last_update_time = time.time()

    def to_dict(self) -> Dict[str, Any]:
        """将边转换为字典

        Returns:
            边字典
        """
        return {
            'source': self.source,
            'target': self.target,
            'relation_type': self.relation_type,
            'weight': self.weight,
            'creation_time': self.creation_time,
            'last_update_time': self.last_update_time
        }

    @classmethod
    def from_dict(cls, data: Dict[str, Any]) -> 'Edge':
        """从字典创建边

        Args:
            data: 边字典

        Returns:
            边实例
        """
        edge = cls(
            source=data['source'],
            target=data['target'],
            relation_type=data['relation_type'],
            weight=data['weight']
        )
        edge.creation_time = data.get('creation_time', 0)
        edge.last_update_time = data.get('last_update_time', 0)
        return edge

    def __str__(self) -> str:
        """字符串表示

        Returns:
            字符串表示
        """
        return f"Edge({self.source} -> {self.target}, type={self.relation_type}, weight={self.weight})"

    def __repr__(self) -> str:
        """repr表示

        Returns:
            repr表示
        """
        return self.__str__()