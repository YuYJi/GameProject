"""情景记忆动态重构叙事"""

from typing import Dict, Any, List, Optional
import time


class EventReconstructor:
    """事件重构器类"""

    def __init__(self, config: Dict[str, Any]):
        """初始化事件重构器

        Args:
            config: 配置参数
        """
        self.config = config
        self.reconstruction_depth = config.get('reconstruction_depth', 5)

    def reconstruct(self, event: Dict[str, Any], all_events: List[Dict[str, Any]]) -> Dict[str, Any]:
        """重构事件

        Args:
            event: 要重构的事件
            all_events: 所有事件

        Returns:
            重构后的事件
        """
        # 构建事件上下文
        context = self._build_context(event, all_events)

        # 填补事件空白
        reconstructed_event = self._fill_gaps(event, context)

        # 生成叙事
        narrative = self._generate_narrative(reconstructed_event, context)

        # 整合结果
        result = {
            'original': event,
            'reconstructed': reconstructed_event,
            'context': context,
            'narrative': narrative,
            'reconstruction_time': time.time()
        }

        return result

    def _build_context(self, event: Dict[str, Any], all_events: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
        """构建事件上下文

        Args:
            event: 目标事件
            all_events: 所有事件

        Returns:
            上下文事件列表
        """
        context = []

        # 按时间排序所有事件
        sorted_events = sorted(all_events, key=lambda x: x['timestamp'])

        # 找到目标事件的位置
        event_index = -1
        for i, e in enumerate(sorted_events):
            if e['id'] == event['id']:
                event_index = i
                break

        if event_index == -1:
            return context

        # 收集前后的事件作为上下文
        start = max(0, event_index - self.reconstruction_depth)
        end = min(len(sorted_events), event_index + self.reconstruction_depth + 1)

        for i in range(start, end):
            if i != event_index:
                context.append(sorted_events[i])

        return context

    def _fill_gaps(self, event: Dict[str, Any], context: List[Dict[str, Any]]) -> Dict[str, Any]:
        """填补事件空白

        Args:
            event: 原始事件
            context: 上下文事件

        Returns:
            填补空白后的事件
        """
        reconstructed = event.copy()

        # 填补时间空白
        if 'timestamp' in reconstructed:
            # 可以根据上下文事件的时间戳推断缺失的时间信息
            pass

        # 填补内容空白
        if 'content' in reconstructed:
            content = reconstructed['content']
            if isinstance(content, dict):
                # 基于上下文填补缺失的内容
                for ctx_event in context:
                    ctx_content = ctx_event.get('content', {})
                    if isinstance(ctx_content, dict):
                        for key, value in ctx_content.items():
                            if key not in content:
                                content[key] = value

        return reconstructed

    def _generate_narrative(self, event: Dict[str, Any], context: List[Dict[str, Any]]) -> str:
        """生成事件叙事

        Args:
            event: 重构后的事件
            context: 上下文事件

        Returns:
            事件叙事
        """
        # 简单的叙事生成
        # 在实际应用中，可以使用更复杂的方法，如语言模型
        narrative_parts = []

        # 添加上下文事件的描述
        for ctx_event in context:
            ctx_content = ctx_event.get('content', {})
            if ctx_content:
                narrative_parts.append(f"之前发生了: {str(ctx_content)[:50]}...")

        # 添加目标事件的描述
        event_content = event.get('content', {})
        if event_content:
            narrative_parts.append(f"然后发生了: {str(event_content)[:100]}...")

        # 组合叙事
        narrative = " ".join(narrative_parts)
        return narrative if narrative else "没有足够的信息生成叙事"

    def reconstruct_sequence(self, events: List[Dict[str, Any]]) -> Dict[str, Any]:
        """重构事件序列

        Args:
            events: 事件序列

        Returns:
            重构结果
        """
        # 按时间排序事件
        sorted_events = sorted(events, key=lambda x: x['timestamp'])

        # 重构每个事件
        reconstructed_events = []
        for event in sorted_events:
            reconstructed = self.reconstruct(event, sorted_events)
            reconstructed_events.append(reconstructed)

        # 生成序列叙事
        sequence_narrative = self._generate_sequence_narrative(reconstructed_events)

        return {
            'events': reconstructed_events,
            'narrative': sequence_narrative,
            'reconstruction_time': time.time()
        }

    def _generate_sequence_narrative(self, reconstructed_events: List[Dict[str, Any]]) -> str:
        """生成序列叙事

        Args:
            reconstructed_events: 重构后的事件序列

        Returns:
            序列叙事
        """
        # 简单的序列叙事生成
        narrative_parts = []

        for i, event in enumerate(reconstructed_events):
            event_narrative = event.get('narrative', '')
            if event_narrative:
                narrative_parts.append(f"{i+1}. {event_narrative}")

        return "\n".join(narrative_parts) if narrative_parts else "没有足够的信息生成序列叙事"

    def evaluate_reconstruction(self, original: Dict[str, Any], 
                              reconstructed: Dict[str, Any]) -> float:
        """评估重构质量

        Args:
            original: 原始事件
            reconstructed: 重构后的事件

        Returns:
            重构质量分数
        """
        # 简单的重构质量评估
        # 在实际应用中，可以使用更复杂的评估方法
        score = 0.0

        # 评估内容相似度
        original_content = original.get('content', {})
        reconstructed_content = reconstructed.get('reconstructed', {}).get('content', {})

        if isinstance(original_content, dict) and isinstance(reconstructed_content, dict):
            common_keys = set(original_content.keys()) & set(reconstructed_content.keys())
            if common_keys:
                correct = 0
                for key in common_keys:
                    if original_content[key] == reconstructed_content[key]:
                        correct += 1
                score = correct / len(common_keys)

        return score