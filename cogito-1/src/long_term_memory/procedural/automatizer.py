"""从工作记忆到自动化的转换"""

from typing import Dict, Any, List, Optional
import time


class Automatizer:
    """自动化器类"""

    def __init__(self, config: Dict[str, Any]):
        """初始化自动化器

        Args:
            config: 配置参数
        """
        self.config = config
        self.automatization_threshold = config.get('automatization_threshold', 0.9)

        # 自动化技能库
        self.automatized_skills = {}

    def automatize(self, skill: Dict[str, Any]):
        """将技能自动化

        Args:
            skill: 技能信息
        """
        # 生成自动化技能ID
        skill_id = self._generate_automatized_skill_id(skill)

        # 检查技能是否已自动化
        if skill_id not in self.automatized_skills:
            # 创建自动化技能
            self.automatized_skills[skill_id] = {
                'id': skill_id,
                'content': skill,
                'automatization_time': time.time(),
                'last_used': time.time(),
                'use_count': 0
            }
            print(f"Skill automatized: {skill_id}")

    def retrieve_automatized_skill(self, context: Dict[str, Any]) -> Optional[Dict[str, Any]]:
        """检索自动化技能

        Args:
            context: 上下文信息

        Returns:
            自动化技能
        """
        # 找到最匹配的自动化技能
        best_skill = None
        best_relevance = 0.0

        for skill_id, skill_data in self.automatized_skills.items():
            relevance = self._calculate_relevance(skill_data['content'], context)
            if relevance > best_relevance:
                best_relevance = relevance
                best_skill = skill_data

        # 如果找到匹配的技能，更新使用信息
        if best_skill and best_relevance > 0.7:
            best_skill['last_used'] = time.time()
            best_skill['use_count'] += 1
            return best_skill['content']

        return None

    def _calculate_relevance(self, skill: Dict[str, Any], context: Dict[str, Any]) -> float:
        """计算技能与上下文的相关性

        Args:
            skill: 技能信息
            context: 上下文信息

        Returns:
            相关性
        """
        relevance = 0.0

        # 基于技能的触发条件计算相关性
        if 'trigger' in skill:
            trigger = skill['trigger']
            if isinstance(trigger, dict):
                for key, value in trigger.items():
                    if key in context and context[key] == value:
                        relevance += 0.5

        # 基于技能的上下文要求计算相关性
        if 'context' in skill:
            skill_context = skill['context']
            if isinstance(skill_context, dict):
                common_keys = set(skill_context.keys()) & set(context.keys())
                if common_keys:
                    for key in common_keys:
                        if skill_context[key] == context[key]:
                            relevance += 0.5 / len(common_keys)

        return relevance

    def _generate_automatized_skill_id(self, skill: Dict[str, Any]) -> str:
        """生成自动化技能ID

        Args:
            skill: 技能信息

        Returns:
            自动化技能ID
        """
        # 基于技能内容生成ID
        content_str = str(skill)
        return f"automatized_{hash(content_str)}"

    def get_automatized_count(self) -> int:
        """获取自动化技能数量

        Returns:
            自动化技能数量
        """
        return len(self.automatized_skills)

    def get_automatized_stats(self) -> Dict[str, Any]:
        """获取自动化技能统计信息

        Returns:
            统计信息
        """
        if not self.automatized_skills:
            return {
                'automatized_count': 0,
                'average_use_count': 0.0
            }

        total_use_count = sum(skill['use_count'] for skill in self.automatized_skills.values())
        average_use_count = total_use_count / len(self.automatized_skills)

        return {
            'automatized_count': len(self.automatized_skills),
            'average_use_count': average_use_count
        }

    def clear(self):
        """清空自动化技能库"""
        self.automatized_skills = {}