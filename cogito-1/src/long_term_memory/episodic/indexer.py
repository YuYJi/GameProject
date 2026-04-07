"""情景记忆索引器"""

from typing import Dict, Any, List, Optional
import time


class EventIndexer:
    """事件索引器类"""

    def __init__(self, config: Dict[str, Any]):
        """初始化事件索引器

        Args:
            config: 配置参数
        """
        self.config = config
        self.time_bucket_size = config.get('time_bucket_size', 3600)  # 1小时
        self.location_bucket_size = config.get('location_bucket_size', 100)  # 100米
        self.emotion_bucket_size = config.get('emotion_bucket_size', 5)  # 5个情绪等级

        # 时间索引
        self.time_index = {}

        # 地点索引
        self.location_index = {}

        # 情绪索引
        self.emotion_index = {}

        # 内容索引
        self.content_index = {}

    def index_event(self, event: Dict[str, Any]):
        """索引事件

        Args:
            event: 事件信息
        """
        # 索引时间
        self._index_by_time(event)

        # 索引地点
        self._index_by_location(event)

        # 索引情绪
        self._index_by_emotion(event)

        # 索引内容
        self._index_by_content(event)

    def find_events(self, cues: Dict[str, Any]) -> List[Dict[str, Any]]:
        """根据线索查找事件

        Args:
            cues: 检索线索

        Returns:
            匹配的事件
        """
        candidate_events = []

        # 根据时间线索查找
        if 'time' in cues:
            time_events = self._find_by_time(cues['time'])
            candidate_events.extend(time_events)

        # 根据地点线索查找
        if 'location' in cues:
            location_events = self._find_by_location(cues['location'])
            candidate_events.extend(location_events)

        # 根据情绪线索查找
        if 'emotion' in cues:
            emotion_events = self._find_by_emotion(cues['emotion'])
            candidate_events.extend(emotion_events)

        # 根据内容线索查找
        if 'content' in cues:
            content_events = self._find_by_content(cues['content'])
            candidate_events.extend(content_events)

        # 去重
        unique_events = []
        seen_ids = set()
        for event in candidate_events:
            event_id = id(event)
            if event_id not in seen_ids:
                seen_ids.add(event_id)
                unique_events.append(event)

        return unique_events

    def _index_by_time(self, event: Dict[str, Any]):
        """按时间索引事件

        Args:
            event: 事件信息
        """
        if 'timestamp' in event:
            timestamp = event['timestamp']
            # 计算时间桶
            time_bucket = int(timestamp // self.time_bucket_size)
            
            if time_bucket not in self.time_index:
                self.time_index[time_bucket] = []
            
            self.time_index[time_bucket].append(event)

    def _index_by_location(self, event: Dict[str, Any]):
        """按地点索引事件

        Args:
            event: 事件信息
        """
        content = event.get('content', {})
        if isinstance(content, dict) and 'location' in content:
            location = content['location']
            if isinstance(location, (list, tuple)) and len(location) >= 2:
                # 计算地点桶
                lat_bucket = int(location[0] // self.location_bucket_size)
                lon_bucket = int(location[1] // self.location_bucket_size)
                location_bucket = (lat_bucket, lon_bucket)
                
                if location_bucket not in self.location_index:
                    self.location_index[location_bucket] = []
                
                self.location_index[location_bucket].append(event)

    def _index_by_emotion(self, event: Dict[str, Any]):
        """按情绪索引事件

        Args:
            event: 事件信息
        """
        if 'emotion' in event:
            emotion = event['emotion']
            valence = emotion.get('valence', 0)
            arousal = emotion.get('arousal', 0)
            
            # 计算情绪桶
            valence_bucket = int((valence + 1) * self.emotion_bucket_size / 2)
            arousal_bucket = int(arousal * self.emotion_bucket_size)
            emotion_bucket = (valence_bucket, arousal_bucket)
            
            if emotion_bucket not in self.emotion_index:
                self.emotion_index[emotion_bucket] = []
            
            self.emotion_index[emotion_bucket].append(event)

    def _index_by_content(self, event: Dict[str, Any]):
        """按内容索引事件

        Args:
            event: 事件信息
        """
        content = event.get('content', {})
        if isinstance(content, dict):
            for key, value in content.items():
                if isinstance(value, str):
                    # 简单的关键词索引
                    keywords = value.split()
                    for keyword in keywords:
                        keyword = keyword.lower().strip()
                        if keyword:
                            if keyword not in self.content_index:
                                self.content_index[keyword] = []
                            self.content_index[keyword].append(event)

    def _find_by_time(self, timestamp: float) -> List[Dict[str, Any]]:
        """根据时间查找事件

        Args:
            timestamp: 时间戳

        Returns:
            匹配的事件
        """
        time_bucket = int(timestamp // self.time_bucket_size)
        events = []

        # 查找当前时间桶和相邻时间桶的事件
        for bucket_offset in [-1, 0, 1]:
            bucket = time_bucket + bucket_offset
            if bucket in self.time_index:
                events.extend(self.time_index[bucket])

        return events

    def _find_by_location(self, location: List[float]) -> List[Dict[str, Any]]:
        """根据地点查找事件

        Args:
            location: 地点坐标 [lat, lon]

        Returns:
            匹配的事件
        """
        if not isinstance(location, (list, tuple)) or len(location) < 2:
            return []

        lat_bucket = int(location[0] // self.location_bucket_size)
        lon_bucket = int(location[1] // self.location_bucket_size)
        events = []

        # 查找当前地点桶和相邻地点桶的事件
        for lat_offset in [-1, 0, 1]:
            for lon_offset in [-1, 0, 1]:
                bucket = (lat_bucket + lat_offset, lon_bucket + lon_offset)
                if bucket in self.location_index:
                    events.extend(self.location_index[bucket])

        return events

    def _find_by_emotion(self, emotion: Dict[str, float]) -> List[Dict[str, Any]]:
        """根据情绪查找事件

        Args:
            emotion: 情绪状态

        Returns:
            匹配的事件
        """
        valence = emotion.get('valence', 0)
        arousal = emotion.get('arousal', 0)

        valence_bucket = int((valence + 1) * self.emotion_bucket_size / 2)
        arousal_bucket = int(arousal * self.emotion_bucket_size)
        events = []

        # 查找当前情绪桶和相邻情绪桶的事件
        for valence_offset in [-1, 0, 1]:
            for arousal_offset in [-1, 0, 1]:
                bucket = (valence_bucket + valence_offset, arousal_bucket + arousal_offset)
                if bucket in self.emotion_index:
                    events.extend(self.emotion_index[bucket])

        return events

    def _find_by_content(self, content: Dict[str, Any]) -> List[Dict[str, Any]]:
        """根据内容查找事件

        Args:
            content: 内容线索

        Returns:
            匹配的事件
        """
        events = []

        if isinstance(content, dict):
            for value in content.values():
                if isinstance(value, str):
                    # 简单的关键词匹配
                    keywords = value.split()
                    for keyword in keywords:
                        keyword = keyword.lower().strip()
                        if keyword in self.content_index:
                            events.extend(self.content_index[keyword])

        return events

    def get_stats(self) -> Dict[str, Any]:
        """获取索引统计信息

        Returns:
            统计信息
        """
        return {
            'time_buckets': len(self.time_index),
            'location_buckets': len(self.location_index),
            'emotion_buckets': len(self.emotion_index),
            'content_keywords': len(self.content_index)
        }

    def clear(self):
        """清空索引"""
        self.time_index = {}
        self.location_index = {}
        self.emotion_index = {}
        self.content_index = {}