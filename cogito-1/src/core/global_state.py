"""全局状态管理"""

from typing import Dict, Any, Optional


class GlobalState:
    """全局状态类"""

    def __init__(self):
        """初始化全局状态"""
        # 情绪状态
        self.emotion = {
            "valence": 0.0,  # 效价：-1.0（消极）到 1.0（积极）
            "arousal": 0.0   # 唤醒度：0.0（平静）到 1.0（兴奋）
        }

        # 置信度
        self.confidence = 0.5  # 0.0（不确定）到 1.0（确定）

        # 认知策略
        self.strategy = "exploitation"  # exploration, exploitation, maintenance

        # 好奇心水平
        self.curiosity = 0.3  # 0.0（低）到 1.0（高）

        # 当前目标
        self.current_goal: Optional[str] = None

        # 目标堆栈
        self.goal_stack = []

        # 注意力焦点
        self.attention_focus: Optional[Dict[str, Any]] = None

        # 认知负荷
        self.cognitive_load = 0.0  # 0.0（低）到 1.0（高）

        # 时间信息
        self.current_time = 0

    def update(self, emotion: Dict[str, float], confidence: float, 
               strategy: str, curiosity: float):
        """更新全局状态

        Args:
            emotion: 情绪状态
            confidence: 置信度
            strategy: 认知策略
            curiosity: 好奇心水平
        """
        self.emotion = emotion
        self.confidence = confidence
        self.strategy = strategy
        self.curiosity = curiosity

    def set_goal(self, goal: str):
        """设置当前目标

        Args:
            goal: 目标描述
        """
        if self.current_goal:
            self.goal_stack.append(self.current_goal)
        self.current_goal = goal

    def complete_goal(self):
        """完成当前目标"""
        if self.goal_stack:
            self.current_goal = self.goal_stack.pop()
        else:
            self.current_goal = None

    def set_attention_focus(self, focus: Dict[str, Any]):
        """设置注意力焦点

        Args:
            focus: 注意力焦点信息
        """
        self.attention_focus = focus

    def update_cognitive_load(self, load: float):
        """更新认知负荷

        Args:
            load: 认知负荷值
        """
        self.cognitive_load = max(0.0, min(1.0, load))

    def update_time(self, time: int):
        """更新时间信息

        Args:
            time: 当前时间
        """
        self.current_time = time

    def get_state(self) -> Dict[str, Any]:
        """获取当前状态

        Returns:
            当前状态字典
        """
        return {
            "emotion": self.emotion,
            "confidence": self.confidence,
            "strategy": self.strategy,
            "curiosity": self.curiosity,
            "current_goal": self.current_goal,
            "goal_stack": self.goal_stack,
            "attention_focus": self.attention_focus,
            "cognitive_load": self.cognitive_load,
            "current_time": self.current_time
        }

    def reset(self):
        """重置全局状态"""
        self.__init__()