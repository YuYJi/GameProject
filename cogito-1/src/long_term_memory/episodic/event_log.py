"""情景记忆事件日志"""

from typing import Dict, Any, List, Optional
import time

from .reconstruction import EventReconstructor
from .indexer import EventIndexer


class EpisodicMemory:
    """情景记忆类"""

    def __init__(self, config: Dict[str, Any]):
        """初始化情景记忆

        Args:
            config: 配置参数
        """
        self.config = config
        self.event_log_size = config.get('event_log_size', 10000)
        self.reconstruction_depth = config.get('reconstruction_depth', 5)

        # 事件日志
        self.events = []

        # 初始化索引器
        self.indexer = EventIndexer(config.get('indexer', {}))

        # 初始化重构器
        self.reconstructor = EventReconstructor(config)
        
        # 持久化管理器
        self.persistence = None

    def store(self, event: Dict[str, Any], emotion: Dict[str, float], timestamp: float):
        """存储事件到情景记忆

        Args:
            event: 事件信息
            emotion: 情绪状态
            timestamp: 时间戳
        """
        # 创建事件对象
        event_obj = {
            'id': f"event_{len(self.events)}",
            'content': event,
            'emotion': emotion,
            'timestamp': timestamp,
            'creation_time': time.time()
        }

        # 添加到事件日志
        self.events.append(event_obj)

        # 限制日志大小
        if len(self.events) > self.event_log_size:
            self.events = self.events[-self.event_log_size:]

        # 更新索引
        self.indexer.index_event(event_obj)

    def retrieve(self, cues: Dict[str, Any], threshold: float = 0.6) -> List[Dict[str, Any]]:
        """从情景记忆中检索事件

        Args:
            cues: 检索线索
            threshold: 相关性阈值

        Returns:
            检索到的事件
        """
        # 使用索引器查找相关事件
        candidate_events = self.indexer.find_events(cues)

        # 计算相关性
        relevant_events = []
        for event in candidate_events:
            relevance = self._calculate_relevance(event, cues)
            if relevance >= threshold:
                event['relevance'] = relevance
                relevant_events.append(event)

        # 排序
        relevant_events.sort(key=lambda x: x['relevance'], reverse=True)

        # 对事件进行重构
        reconstructed_events = []
        for event in relevant_events:
            reconstructed = self.reconstructor.reconstruct(event, self.events)
            reconstructed_events.append(reconstructed)

        return reconstructed_events

    def get_event_sequence(self, start_time: float, end_time: float) -> List[Dict[str, Any]]:
        """获取指定时间范围内的事件序列

        Args:
            start_time: 开始时间
            end_time: 结束时间

        Returns:
            事件序列
        """
        sequence = []

        for event in self.events:
            if start_time <= event['timestamp'] <= end_time:
                sequence.append(event)

        # 按时间排序
        sequence.sort(key=lambda x: x['timestamp'])

        return sequence

    def _calculate_relevance(self, event: Dict[str, Any], cues: Dict[str, Any]) -> float:
        """计算事件与线索的相关性

        Args:
            event: 事件
            cues: 线索

        Returns:
            相关性
        """
        relevance = 0.0

        # 基于时间线索的相关性
        if 'time' in cues:
            time_diff = abs(event['timestamp'] - cues['time'])
            # 时间差越小，相关性越高
            time_relevance = max(0.0, 1.0 - time_diff / 3600)  # 1小时内完全相关
            relevance += time_relevance * 0.3

        # 基于情绪线索的相关性
        if 'emotion' in cues and 'emotion' in event:
            emotion_similarity = self._calculate_emotion_similarity(
                event['emotion'], cues['emotion']
            )
            relevance += emotion_similarity * 0.3

        # 基于内容线索的相关性
        if 'content' in cues:
            content_similarity = self._calculate_content_similarity(
                event['content'], cues['content']
            )
            relevance += content_similarity * 0.4

        return relevance

    def _calculate_emotion_similarity(self, emotion1: Dict[str, float], 
                                    emotion2: Dict[str, float]) -> float:
        """计算情绪相似度

        Args:
            emotion1: 第一个情绪
            emotion2: 第二个情绪

        Returns:
            相似度
        """
        # 简单的情绪相似度计算
        # 基于效价和唤醒度的欧几里得距离
        valence_diff = abs(emotion1.get('valence', 0) - emotion2.get('valence', 0))
        arousal_diff = abs(emotion1.get('arousal', 0) - emotion2.get('arousal', 0))

        # 转换为相似度（0-1）
        distance = (valence_diff + arousal_diff) / 2
        similarity = max(0.0, 1.0 - distance)

        return similarity

    def _calculate_content_similarity(self, content1: Dict[str, Any], 
                                     content2: Dict[str, Any]) -> float:
        """计算内容相似度

        Args:
            content1: 第一个内容
            content2: 第二个内容

        Returns:
            相似度
        """
        # 简单的内容相似度计算
        # 在实际应用中，可以使用更复杂的方法
        if not isinstance(content1, dict) or not isinstance(content2, dict):
            return 0.0

        # 计算共同键的数量
        common_keys = set(content1.keys()) & set(content2.keys())
        if not common_keys:
            return 0.0

        # 计算共同键的值相似度
        similarity_sum = 0.0
        for key in common_keys:
            val1 = content1[key]
            val2 = content2[key]
            
            # 如果两个值都是字符串，检查包含关系
            if isinstance(val1, str) and isinstance(val2, str):
                # 检查是否包含
                if val2.lower() in val1.lower():
                    similarity_sum += 1.0
                elif val1.lower() in val2.lower():
                    similarity_sum += 1.0
                else:
                    # 计算词重叠率
                    words1 = set(val1.lower().split())
                    words2 = set(val2.lower().split())
                    if words1 and words2:
                        overlap = len(words1 & words2)
                        total = len(words1 | words2)
                        similarity_sum += overlap / total
            elif val1 == val2:
                similarity_sum += 1.0

        return similarity_sum / len(common_keys)

    def get_event_stats(self) -> Dict[str, Any]:
        """获取事件统计信息

        Returns:
            统计信息
        """
        return {
            'event_count': len(self.events),
            'index_stats': self.indexer.get_stats()
        }

    def clear(self):
        """清空情景记忆"""
        self.events = []
        self.indexer.clear()

    def set_persistence(self, persistence):
        """设置持久化管理器

        Args:
            persistence: 持久化管理器实例
        """
        self.persistence = persistence

    def save(self, filename: str = 'episodic_memory.json') -> bool:
        """保存情景记忆到文件

        Args:
            filename: 文件名

        Returns:
            是否保存成功
        """
        if self.persistence:
            return self.persistence.save_episodic_memory(self.events, filename)
        return False

    def load(self, filename: str = 'episodic_memory.json') -> bool:
        """从文件加载情景记忆

        Args:
            filename: 文件名

        Returns:
            是否加载成功
        """
        if self.persistence:
            events = self.persistence.load_episodic_memory(filename)
            if events is not None:
                self.events = events
                # 重建索引
                for event in self.events:
                    self.indexer.index_event(event)
                return True
        return False