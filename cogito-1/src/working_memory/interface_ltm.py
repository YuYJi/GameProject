"""工作记忆与长时记忆的接口"""

from typing import Dict, Any, List, Optional
import time


class LTMInterface:
    """长时记忆接口类"""

    def __init__(self, semantic_memory, episodic_memory, procedural_memory, config: Dict[str, Any]):
        """初始化长时记忆接口

        Args:
            semantic_memory: 语义记忆实例
            episodic_memory: 情景记忆实例
            procedural_memory: 内隐记忆实例
            config: 配置参数
        """
        self.semantic_memory = semantic_memory
        self.episodic_memory = episodic_memory
        self.procedural_memory = procedural_memory
        self.config = config

        self.retrieval_threshold = config.get('retrieval_threshold', 0.6)
        self.consolidation_threshold = config.get('consolidation_threshold', 0.7)
        self.max_retrieval_items = config.get('max_retrieval_items', 5)

    def retrieve(self, focus: Dict[str, Any], buffer: Any) -> List[Dict[str, Any]]:
        """从长时记忆中检索信息

        Args:
            focus: 当前注意焦点
            buffer: 工作记忆缓冲区

        Returns:
            检索到的信息
        """
        retrieved_items = []

        # 从语义记忆中检索
        semantic_items = self._retrieve_from_semantic(focus)
        retrieved_items.extend(semantic_items)

        # 从情景记忆中检索
        episodic_items = self._retrieve_from_episodic(focus)
        retrieved_items.extend(episodic_items)

        # 从内隐记忆中检索
        procedural_items = self._retrieve_from_procedural(focus)
        retrieved_items.extend(procedural_items)

        # 限制返回数量
        return retrieved_items[:self.max_retrieval_items]

    def store(self, processed_info: Dict[str, Any], emotion: Dict[str, float], timestamp: float):
        """将信息存储到长时记忆

        Args:
            processed_info: 处理后的信息
            emotion: 情绪状态
            timestamp: 时间戳
        """
        # 存储到语义记忆
        self._store_to_semantic(processed_info, emotion)

        # 存储到情景记忆
        self._store_to_episodic(processed_info, emotion, timestamp)

        # 存储到内隐记忆
        self._store_to_procedural(processed_info, emotion)

    def _retrieve_from_semantic(self, focus: Dict[str, Any]) -> List[Dict[str, Any]]:
        """从语义记忆中检索

        Args:
            focus: 当前注意焦点

        Returns:
            检索到的语义信息
        """
        # 从焦点中提取关键词
        keywords = self._extract_keywords(focus)

        # 从语义记忆中检索
        if hasattr(self.semantic_memory, 'retrieve'):
            return self.semantic_memory.retrieve(keywords, self.retrieval_threshold)
        return []

    def _retrieve_from_episodic(self, focus: Dict[str, Any]) -> List[Dict[str, Any]]:
        """从情景记忆中检索

        Args:
            focus: 当前注意焦点

        Returns:
            检索到的情景信息
        """
        # 从焦点中提取线索
        cues = self._extract_cues(focus)

        # 从情景记忆中检索
        if hasattr(self.episodic_memory, 'retrieve'):
            return self.episodic_memory.retrieve(cues, self.retrieval_threshold)
        return []

    def _retrieve_from_procedural(self, focus: Dict[str, Any]) -> List[Dict[str, Any]]:
        """从内隐记忆中检索

        Args:
            focus: 当前注意焦点

        Returns:
            检索到的内隐信息
        """
        # 从焦点中提取上下文
        context = self._extract_context(focus)

        # 从内隐记忆中检索
        if hasattr(self.procedural_memory, 'retrieve'):
            return self.procedural_memory.retrieve(context, self.retrieval_threshold)
        return []

    def _store_to_semantic(self, processed_info: Dict[str, Any], emotion: Dict[str, float]):
        """存储到语义记忆

        Args:
            processed_info: 处理后的信息
            emotion: 情绪状态
        """
        # 检查是否达到巩固阈值
        if emotion.get('arousal', 0) > self.consolidation_threshold:
            if hasattr(self.semantic_memory, 'store'):
                self.semantic_memory.store(processed_info)

    def _store_to_episodic(self, processed_info: Dict[str, Any], emotion: Dict[str, float], timestamp: float):
        """存储到情景记忆

        Args:
            processed_info: 处理后的信息
            emotion: 情绪状态
            timestamp: 时间戳
        """
        # 检查是否达到巩固阈值
        if emotion.get('arousal', 0) > self.consolidation_threshold:
            if hasattr(self.episodic_memory, 'store'):
                self.episodic_memory.store(processed_info, emotion, timestamp)

    def _store_to_procedural(self, processed_info: Dict[str, Any], emotion: Dict[str, float]):
        """存储到内隐记忆

        Args:
            processed_info: 处理后的信息
            emotion: 情绪状态
        """
        # 检查是否达到巩固阈值
        if emotion.get('arousal', 0) > self.consolidation_threshold:
            if hasattr(self.procedural_memory, 'store'):
                self.procedural_memory.store(processed_info)

    def _extract_keywords(self, focus: Dict[str, Any]) -> List[str]:
        """从焦点中提取关键词

        Args:
            focus: 当前注意焦点

        Returns:
            关键词列表
        """
        # 简单的关键词提取
        # 在实际应用中，可以使用更复杂的方法
        keywords = []

        if 'combined' in focus:
            # 从组合焦点中提取关键词
            if 'features' in focus['combined']:
                # 假设特征可以转换为关键词
                keywords.append('feature_based')

        for modality, data in focus.get('modalities', {}).items():
            keywords.append(modality)

        return keywords

    def _extract_cues(self, focus: Dict[str, Any]) -> Dict[str, Any]:
        """从焦点中提取线索

        Args:
            focus: 当前注意焦点

        Returns:
            线索字典
        """
        # 简单的线索提取
        # 在实际应用中，可以使用更复杂的方法
        cues = {
            'modalities': list(focus.get('modalities', {}).keys()),
            'strength': focus.get('strength', 0)
        }

        return cues

    def _extract_context(self, focus: Dict[str, Any]) -> Dict[str, Any]:
        """从焦点中提取上下文

        Args:
            focus: 当前注意焦点

        Returns:
            上下文字典
        """
        # 简单的上下文提取
        # 在实际应用中，可以使用更复杂的方法
        context = {
            'modalities': list(focus.get('modalities', {}).keys()),
            'focus_strength': focus.get('strength', 0)
        }

        return context

    def clear(self):
        """清除接口状态"""
        # 清除接口状态
        pass