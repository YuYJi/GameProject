"""工作记忆缓冲区"""

from typing import Dict, Any, List, Optional
import time
import numpy as np


class Buffer:
    """工作记忆缓冲区类"""

    def __init__(self, config: Dict[str, Any]):
        """初始化缓冲区

        Args:
            config: 配置参数
        """
        self.capacity = config.get('capacity', 4)  # 4±1 组块
        self.chunk_size = config.get('chunk_size', 256)
        self.decay_rate = config.get('decay_rate', 0.1)
        self.refresh_threshold = config.get('refresh_threshold', 0.3)

        # 缓冲区内容
        self.chunks: List[Dict[str, Any]] = []
        self.last_access_time: Dict[int, float] = {}

    def add(self, item: Dict[str, Any]) -> bool:
        """添加项目到缓冲区

        Args:
            item: 要添加的项目

        Returns:
            是否添加成功
        """
        # 如果缓冲区已满，移除最不重要的项目
        if len(self.chunks) >= self.capacity:
            self._remove_least_important()

        # 添加新项目
        chunk = {
            'content': item,
            'strength': 1.0,  # 初始强度
            'timestamp': time.time(),
            'access_count': 1
        }
        self.chunks.append(chunk)
        self.last_access_time[len(self.chunks) - 1] = time.time()

        return True

    def add_all(self, items: List[Dict[str, Any]]) -> int:
        """添加多个项目到缓冲区

        Args:
            items: 要添加的项目列表

        Returns:
            添加成功的项目数
        """
        count = 0
        for item in items:
            if self.add(item):
                count += 1
        return count

    def get(self, index: int) -> Optional[Dict[str, Any]]:
        """获取缓冲区中的项目

        Args:
            index: 项目索引

        Returns:
            项目内容
        """
        if 0 <= index < len(self.chunks):
            # 更新访问时间和强度
            self.last_access_time[index] = time.time()
            self.chunks[index]['access_count'] += 1
            self.chunks[index]['strength'] = min(1.0, self.chunks[index]['strength'] + 0.1)
            return self.chunks[index]['content']
        return None

    def get_all(self) -> List[Dict[str, Any]]:
        """获取缓冲区中的所有项目

        Returns:
            所有项目内容
        """
        return [chunk['content'] for chunk in self.chunks]

    def remove(self, index: int) -> bool:
        """移除缓冲区中的项目

        Args:
            index: 项目索引

        Returns:
            是否移除成功
        """
        if 0 <= index < len(self.chunks):
            self.chunks.pop(index)
            # 更新last_access_time
            new_last_access = {}
            for i, time_val in self.last_access_time.items():
                if i < index:
                    new_last_access[i] = time_val
                elif i > index:
                    new_last_access[i - 1] = time_val
            self.last_access_time = new_last_access
            return True
        return False

    def clear(self):
        """清空缓冲区"""
        self.chunks = []
        self.last_access_time = {}

    def size(self) -> int:
        """获取缓冲区大小

        Returns:
            缓冲区中的项目数
        """
        return len(self.chunks)

    def is_full(self) -> bool:
        """检查缓冲区是否已满

        Returns:
            是否已满
        """
        return len(self.chunks) >= self.capacity

    def update_strengths(self):
        """更新所有项目的强度（模拟遗忘）"""
        current_time = time.time()
        for i, chunk in enumerate(self.chunks):
            # 基于时间的衰减
            time_elapsed = current_time - chunk['timestamp']
            chunk['strength'] = max(0.0, chunk['strength'] - self.decay_rate * time_elapsed)

    def _remove_least_important(self):
        """移除最不重要的项目"""
        if not self.chunks:
            return

        # 计算每个项目的重要性分数
        importance_scores = []
        current_time = time.time()
        
        for i, chunk in enumerate(self.chunks):
            # 重要性 = 强度 * 访问频率
            time_since_access = current_time - self.last_access_time.get(i, current_time)
            recency_factor = max(0.1, 1.0 - 0.1 * time_since_access)
            importance = chunk['strength'] * chunk['access_count'] * recency_factor
            importance_scores.append((i, importance))

        # 找到重要性最低的项目
        importance_scores.sort(key=lambda x: x[1])
        least_important_index = importance_scores[0][0]

        # 移除该项目
        self.remove(least_important_index)

    def get_strengths(self) -> List[float]:
        """获取所有项目的强度

        Returns:
            强度列表
        """
        self.update_strengths()
        return [chunk['strength'] for chunk in self.chunks]

    def get_chunk_info(self) -> List[Dict[str, Any]]:
        """获取所有项目的信息

        Returns:
            项目信息列表
        """
        self.update_strengths()
        info = []
        for i, chunk in enumerate(self.chunks):
            info.append({
                'index': i,
                'strength': chunk['strength'],
                'access_count': chunk['access_count'],
                'last_access': self.last_access_time.get(i, 0),
                'content_summary': str(chunk['content'])[:100] + '...' if len(str(chunk['content'])) > 100 else str(chunk['content'])
            })
        return info