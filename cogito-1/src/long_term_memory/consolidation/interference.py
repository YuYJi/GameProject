"""记忆干扰检测与解决"""

from typing import Dict, Any, List, Optional
import numpy as np


class InterferenceManager:
    """干扰管理器类"""

    def __init__(self, config: Dict[str, Any]):
        """初始化干扰管理器

        Args:
            config: 配置参数
        """
        self.config = config
        self.detection_threshold = config.get('detection_threshold', 0.7)
        self.resolution_strategy = config.get('resolution_strategy', 'competition')

    def detect_interferences(self, memories: List[Dict[str, Any]]) -> List[List[int]]:
        """检测记忆之间的干扰

        Args:
            memories: 记忆列表

        Returns:
            干扰组列表，每个干扰组包含相互干扰的记忆索引
        """
        interference_groups = []
        memory_count = len(memories)

        # 计算记忆之间的相似度矩阵
        similarity_matrix = self._calculate_similarity_matrix(memories)

        # 检测干扰组
        visited = [False] * memory_count
        for i in range(memory_count):
            if not visited[i]:
                interference_group = self._find_interference_group(i, similarity_matrix, visited)
                if len(interference_group) > 1:
                    interference_groups.append(interference_group)

        return interference_groups

    def resolve_interferences(self, memories: List[Dict[str, Any]], 
                            interference_groups: List[List[int]]) -> List[Dict[str, Any]]:
        """解决记忆干扰

        Args:
            memories: 记忆列表
            interference_groups: 干扰组列表

        Returns:
            解决干扰后的记忆列表
        """
        resolved_memories = memories.copy()

        for group in interference_groups:
            if self.resolution_strategy == 'competition':
                resolved_memories = self._resolve_by_competition(resolved_memories, group)
            elif self.resolution_strategy == 'integration':
                resolved_memories = self._resolve_by_integration(resolved_memories, group)
            elif self.resolution_strategy == 'separation':
                resolved_memories = self._resolve_by_separation(resolved_memories, group)

        return resolved_memories

    def _calculate_similarity_matrix(self, memories: List[Dict[str, Any]]) -> np.ndarray:
        """计算记忆之间的相似度矩阵

        Args:
            memories: 记忆列表

        Returns:
            相似度矩阵
        """
        memory_count = len(memories)
        similarity_matrix = np.zeros((memory_count, memory_count))

        for i in range(memory_count):
            for j in range(i + 1, memory_count):
                similarity = self._calculate_memory_similarity(memories[i], memories[j])
                similarity_matrix[i, j] = similarity
                similarity_matrix[j, i] = similarity

        return similarity_matrix

    def _calculate_memory_similarity(self, memory1: Dict[str, Any], 
                                   memory2: Dict[str, Any]) -> float:
        """计算两个记忆的相似度

        Args:
            memory1: 第一个记忆
            memory2: 第二个记忆

        Returns:
            相似度
        """
        # 简单的相似度计算
        # 在实际应用中，可以使用更复杂的方法
        similarity = 0.0

        # 基于内容的相似度
        content1 = memory1.get('content', {})
        content2 = memory2.get('content', {})
        if isinstance(content1, dict) and isinstance(content2, dict):
            common_keys = set(content1.keys()) & set(content2.keys())
            if common_keys:
                for key in common_keys:
                    if content1[key] == content2[key]:
                        similarity += 1.0 / len(common_keys)

        # 基于时间的相似度
        if 'timestamp' in memory1 and 'timestamp' in memory2:
            time_diff = abs(memory1['timestamp'] - memory2['timestamp'])
            time_similarity = max(0.0, 1.0 - time_diff / 3600)  # 1小时内完全相似
            similarity = (similarity + time_similarity) / 2

        return similarity

    def _find_interference_group(self, index: int, similarity_matrix: np.ndarray, 
                               visited: List[bool]) -> List[int]:
        """找到包含指定索引的干扰组

        Args:
            index: 记忆索引
            similarity_matrix: 相似度矩阵
            visited: 访问标记列表

        Returns:
            干扰组
        """
        group = [index]
        visited[index] = True

        # 查找与当前记忆相似的其他记忆
        for i in range(len(similarity_matrix)):
            if not visited[i] and similarity_matrix[index, i] >= self.detection_threshold:
                subgroup = self._find_interference_group(i, similarity_matrix, visited)
                group.extend(subgroup)

        return group

    def _resolve_by_competition(self, memories: List[Dict[str, Any]], 
                               group: List[int]) -> List[Dict[str, Any]]:
        """通过竞争解决干扰

        Args:
            memories: 记忆列表
            group: 干扰组

        Returns:
            解决干扰后的记忆列表
        """
        # 选择强度最高的记忆保留，其他记忆减弱
        strengths = []
        for idx in group:
            strength = memories[idx].get('strength', 0.5)
            strengths.append((strength, idx))

        # 按强度排序
        strengths.sort(reverse=True)

        # 保留最强的记忆，减弱其他记忆
        for i, (_, idx) in enumerate(strengths):
            if i > 0:
                # 减弱记忆强度
                memories[idx]['strength'] *= 0.5

        return memories

    def _resolve_by_integration(self, memories: List[Dict[str, Any]], 
                               group: List[int]) -> List[Dict[str, Any]]:
        """通过整合解决干扰

        Args:
            memories: 记忆列表
            group: 干扰组

        Returns:
            解决干扰后的记忆列表
        """
        # 整合干扰组中的记忆
        integrated_memory = self._integrate_memories([memories[idx] for idx in group])

        # 替换干扰组中的第一个记忆，删除其他记忆
        first_idx = group[0]
        memories[first_idx] = integrated_memory

        # 删除其他记忆（按索引从大到小删除，避免索引变化）
        for idx in sorted(group[1:], reverse=True):
            memories.pop(idx)

        return memories

    def _resolve_by_separation(self, memories: List[Dict[str, Any]], 
                               group: List[int]) -> List[Dict[str, Any]]:
        """通过分离解决干扰

        Args:
            memories: 记忆列表
            group: 干扰组

        Returns:
            解决干扰后的记忆列表
        """
        # 为每个记忆添加独特的上下文标记，减少干扰
        for idx in group:
            memory = memories[idx]
            # 添加时间戳作为上下文标记
            if 'timestamp' in memory:
                memory['context'] = f"time_{memory['timestamp']}"
            else:
                memory['context'] = f"unique_{idx}"

        return memories

    def _integrate_memories(self, memories: List[Dict[str, Any]]) -> Dict[str, Any]:
        """整合多个记忆

        Args:
            memories: 记忆列表

        Returns:
            整合后的记忆
        """
        if not memories:
            return {}

        # 以第一个记忆为基础
        integrated = memories[0].copy()

        # 整合其他记忆的内容
        for memory in memories[1:]:
            content = memory.get('content', {})
            if isinstance(content, dict):
                for key, value in content.items():
                    if key not in integrated.get('content', {}):
                        if 'content' not in integrated:
                            integrated['content'] = {}
                        integrated['content'][key] = value

        # 计算整合后的强度
        strengths = [m.get('strength', 0.5) for m in memories]
        integrated['strength'] = sum(strengths) / len(strengths)

        return integrated

    def get_interference_stats(self, memories: List[Dict[str, Any]]) -> Dict[str, Any]:
        """获取干扰统计信息

        Args:
            memories: 记忆列表

        Returns:
            统计信息
        """
        interference_groups = self.detect_interferences(memories)
        total_interferences = sum(len(group) for group in interference_groups)

        return {
            'interference_groups': len(interference_groups),
            'total_interferences': total_interferences,
            'interference_rate': total_interferences / len(memories) if memories else 0
        }