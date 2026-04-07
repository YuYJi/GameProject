"""内隐记忆技能库"""

from typing import Dict, Any, List, Optional
import time

from .automatizer import Automatizer


class ProceduralMemory:
    """内隐记忆类"""

    def __init__(self, config: Dict[str, Any]):
        """初始化内隐记忆

        Args:
            config: 配置参数
        """
        self.config = config
        self.skill_library_size = config.get('skill_library_size', 1000)
        self.automatization_threshold = config.get('automatization_threshold', 0.9)
        self.skill_update_rate = config.get('skill_update_rate', 0.1)

        # 技能库
        self.skills = {}

        # 初始化自动化器
        self.automatizer = Automatizer(config)
        
        # 持久化管理器
        self.persistence = None

    def store(self, skill: Dict[str, Any]):
        """存储技能到内隐记忆

        Args:
            skill: 技能信息
        """
        # 提取技能ID
        skill_id = skill.get('id', self._generate_skill_id(skill))

        # 检查技能是否已存在
        if skill_id in self.skills:
            # 更新现有技能
            self._update_skill(skill_id, skill)
        else:
            # 限制技能库大小
            if len(self.skills) >= self.skill_library_size:
                self._remove_least_used_skill()

            # 添加新技能
            self.skills[skill_id] = {
                'id': skill_id,
                'content': skill,
                'proficiency': 0.1,  # 初始熟练度
                'last_used': time.time(),
                'use_count': 1
            }

    def retrieve(self, context: Dict[str, Any], threshold: float = 0.6) -> List[Dict[str, Any]]:
        """从内隐记忆中检索技能

        Args:
            context: 上下文信息
            threshold: 相关性阈值

        Returns:
            检索到的技能
        """
        relevant_skills = []

        # 计算每个技能与上下文的相关性
        for skill_id, skill_data in self.skills.items():
            relevance = self._calculate_relevance(skill_data['content'], context)
            if relevance >= threshold:
                # 更新技能使用信息
                skill_data['last_used'] = time.time()
                skill_data['use_count'] += 1
                
                # 增加熟练度
                skill_data['proficiency'] = min(1.0, skill_data['proficiency'] + 0.01)

                relevant_skills.append({
                    'id': skill_id,
                    'content': skill_data['content'],
                    'proficiency': skill_data['proficiency'],
                    'relevance': relevance
                })

        # 排序
        relevant_skills.sort(key=lambda x: x['relevance'], reverse=True)

        return relevant_skills

    def _update_skill(self, skill_id: str, new_skill: Dict[str, Any]):
        """更新技能

        Args:
            skill_id: 技能ID
            new_skill: 新技能信息
        """
        if skill_id in self.skills:
            skill_data = self.skills[skill_id]
            # 平滑更新技能内容
            for key, value in new_skill.items():
                if key != 'id':
                    if key in skill_data['content']:
                        # 对于数值型数据，使用平滑更新
                        if isinstance(skill_data['content'][key], (int, float)) and \
                           isinstance(value, (int, float)):
                            skill_data['content'][key] = (
                                skill_data['content'][key] * (1 - self.skill_update_rate) +
                                value * self.skill_update_rate
                            )
                        else:
                            skill_data['content'][key] = value
                    else:
                        skill_data['content'][key] = value

            # 更新使用信息
            skill_data['last_used'] = time.time()
            skill_data['use_count'] += 1

            # 增加熟练度
            skill_data['proficiency'] = min(1.0, skill_data['proficiency'] + 0.05)

            # 检查是否可以自动化
            if skill_data['proficiency'] >= self.automatization_threshold:
                self.automatizer.automatize(skill_data['content'])

    def _remove_least_used_skill(self):
        """移除最少使用的技能"""
        if not self.skills:
            return

        # 找到最少使用的技能
        least_used = None
        least_usage = float('inf')

        for skill_id, skill_data in self.skills.items():
            usage = skill_data['use_count'] / (time.time() - skill_data['last_used'] + 1)
            if usage < least_usage:
                least_usage = usage
                least_used = skill_id

        if least_used:
            del self.skills[least_used]

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
                        relevance += 0.3

        # 基于技能的上下文要求计算相关性
        if 'context' in skill:
            skill_context = skill['context']
            if isinstance(skill_context, dict):
                common_keys = set(skill_context.keys()) & set(context.keys())
                if common_keys:
                    for key in common_keys:
                        if skill_context[key] == context[key]:
                            relevance += 0.7 / len(common_keys)

        return relevance

    def _generate_skill_id(self, skill: Dict[str, Any]) -> str:
        """生成技能ID

        Args:
            skill: 技能信息

        Returns:
            技能ID
        """
        # 基于技能内容生成ID
        content_str = str(skill)
        return f"skill_{hash(content_str)}"

    def get_skill_stats(self) -> Dict[str, Any]:
        """获取技能统计信息

        Returns:
            统计信息
        """
        if not self.skills:
            return {
                'skill_count': 0,
                'average_proficiency': 0.0
            }

        total_proficiency = sum(skill['proficiency'] for skill in self.skills.values())
        average_proficiency = total_proficiency / len(self.skills)

        return {
            'skill_count': len(self.skills),
            'average_proficiency': average_proficiency,
            'automatized_skills': self.automatizer.get_automatized_count()
        }

    def clear(self):
        """清空内隐记忆"""
        self.skills = {}
        self.automatizer.clear()

    def set_persistence(self, persistence):
        """设置持久化管理器

        Args:
            persistence: 持久化管理器实例
        """
        self.persistence = persistence

    def save(self, filename: str = 'procedural_memory.json') -> bool:
        """保存内隐记忆到文件

        Args:
            filename: 文件名

        Returns:
            是否保存成功
        """
        if self.persistence:
            return self.persistence.save_procedural_memory(self.skills, filename)
        return False

    def load(self, filename: str = 'procedural_memory.json') -> bool:
        """从文件加载内隐记忆

        Args:
            filename: 文件名

        Returns:
            是否加载成功
        """
        if self.persistence:
            skills = self.persistence.load_procedural_memory(filename)
            if skills is not None:
                self.skills = skills
                return True
        return False