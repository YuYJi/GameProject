"""性能指标计算"""

from typing import Dict, Any, List, Optional
import time
import psutil
import numpy as np


def calculate_energy_consumption(start_time: float, end_time: float) -> Dict[str, float]:
    """计算能耗

    Args:
        start_time: 开始时间
        end_time: 结束时间

    Returns:
        能耗信息
    """
    # 计算执行时间
    execution_time = end_time - start_time

    # 获取CPU使用率
    cpu_percent = psutil.cpu_percent(interval=execution_time)

    # 获取内存使用情况
    memory_info = psutil.virtual_memory()
    memory_used = memory_info.used / (1024 ** 3)  # 转换为GB

    # 简单的能耗估算（基于CPU使用率和执行时间）
    # 假设CPU功率为100W
    cpu_power = 100  # 瓦特
    energy = (cpu_power * cpu_percent / 100) * execution_time / 3600  # 转换为千瓦时

    return {
        'execution_time': execution_time,
        'cpu_percent': cpu_percent,
        'memory_used_gb': memory_used,
        'energy_kwh': energy
    }


def calculate_forgetting_rate(memories: List[Dict[str, Any]], 
                            time_elapsed: float) -> float:
    """计算遗忘率

    Args:
        memories: 记忆列表
        time_elapsed: 经过的时间

    Returns:
        遗忘率
    """
    if not memories:
        return 0.0

    # 计算记忆强度的平均衰减
    initial_strengths = []
    current_strengths = []

    for memory in memories:
        if 'initial_strength' in memory and 'strength' in memory:
            initial_strengths.append(memory['initial_strength'])
            current_strengths.append(memory['strength'])

    if not initial_strengths:
        return 0.0

    # 计算遗忘率
    avg_initial_strength = np.mean(initial_strengths)
    avg_current_strength = np.mean(current_strengths)
    forgetting_rate = (avg_initial_strength - avg_current_strength) / avg_initial_strength

    return max(0.0, min(1.0, forgetting_rate))


def calculate_memory_efficiency(memories: List[Dict[str, Any]]) -> Dict[str, float]:
    """计算记忆效率

    Args:
        memories: 记忆列表

    Returns:
        记忆效率信息
    """
    if not memories:
        return {
            'memory_count': 0,
            'average_strength': 0.0,
            'retention_rate': 0.0,
            'efficiency': 0.0
        }

    # 计算记忆强度
    strengths = [m.get('strength', 0.5) for m in memories]
    avg_strength = np.mean(strengths)

    # 计算保留率
    strong_memories = [s for s in strengths if s > 0.5]
    retention_rate = len(strong_memories) / len(strengths)

    # 计算效率
    efficiency = avg_strength * retention_rate

    return {
        'memory_count': len(memories),
        'average_strength': avg_strength,
        'retention_rate': retention_rate,
        'efficiency': efficiency
    }


def calculate_cognitive_load(working_memory: Any) -> float:
    """计算认知负荷

    Args:
        working_memory: 工作记忆对象

    Returns:
        认知负荷
    """
    if not working_memory:
        return 0.0

    # 获取工作记忆大小和容量
    if hasattr(working_memory, 'size') and hasattr(working_memory, 'capacity'):
        size = working_memory.size()
        capacity = working_memory.capacity
        return min(1.0, size / capacity)
    else:
        return 0.5  # 默认值


def calculate_response_time(start_time: float, end_time: float) -> float:
    """计算响应时间

    Args:
        start_time: 开始时间
        end_time: 结束时间

    Returns:
        响应时间
    """
    return end_time - start_time


def calculate_accuracy(predictions: List[Any], ground_truth: List[Any]) -> float:
    """计算准确率

    Args:
        predictions: 预测结果
        ground_truth: 真实结果

    Returns:
        准确率
    """
    if not predictions or not ground_truth:
        return 0.0

    # 计算正确预测的数量
    correct = 0
    for pred, truth in zip(predictions, ground_truth):
        if pred == truth:
            correct += 1

    return correct / min(len(predictions), len(ground_truth))


def calculate_precision(positive_predictions: List[Any], actual_positives: List[Any]) -> float:
    """计算精确率

    Args:
        positive_predictions: 预测为正的结果
        actual_positives: 实际为正的结果

    Returns:
        精确率
    """
    if not positive_predictions:
        return 0.0

    # 计算真正例
    true_positives = len(set(positive_predictions) & set(actual_positives))

    return true_positives / len(positive_predictions)


def calculate_recall(positive_predictions: List[Any], actual_positives: List[Any]) -> float:
    """计算召回率

    Args:
        positive_predictions: 预测为正的结果
        actual_positives: 实际为正的结果

    Returns:
        召回率
    """
    if not actual_positives:
        return 0.0

    # 计算真正例
    true_positives = len(set(positive_predictions) & set(actual_positives))

    return true_positives / len(actual_positives)


def calculate_f1_score(precision: float, recall: float) -> float:
    """计算F1分数

    Args:
        precision: 精确率
        recall: 召回率

    Returns:
        F1分数
    """
    if precision + recall == 0:
        return 0.0

    return 2 * (precision * recall) / (precision + recall)


def calculate_system_metrics(system: Any) -> Dict[str, Any]:
    """计算系统整体指标

    Args:
        system: 系统对象

    Returns:
        系统指标
    """
    metrics = {}

    # 计算工作记忆指标
    if hasattr(system, 'buffer'):
        metrics['working_memory'] = {
            'size': system.buffer.size(),
            'capacity': system.buffer.capacity,
            'load': calculate_cognitive_load(system.buffer)
        }

    # 计算长时记忆指标
    if hasattr(system, 'semantic_memory'):
        if hasattr(system.semantic_memory, 'get_graph_stats'):
            metrics['semantic_memory'] = system.semantic_memory.get_graph_stats()

    if hasattr(system, 'episodic_memory'):
        if hasattr(system.episodic_memory, 'get_event_stats'):
            metrics['episodic_memory'] = system.episodic_memory.get_event_stats()

    if hasattr(system, 'procedural_memory'):
        if hasattr(system.procedural_memory, 'get_skill_stats'):
            metrics['procedural_memory'] = system.procedural_memory.get_skill_stats()

    # 计算元认知指标
    if hasattr(system, 'emotion_engine'):
        metrics['emotion'] = system.emotion_engine.current_emotion

    if hasattr(system, 'confidence_evaluator'):
        # 这里需要获取最新的置信度
        pass

    if hasattr(system, 'curiosity_system'):
        metrics['curiosity'] = system.curiosity_system.current_curiosity

    return metrics


def generate_performance_report(metrics: Dict[str, Any]) -> str:
    """生成性能报告

    Args:
        metrics: 指标字典

    Returns:
        性能报告字符串
    """
    report = "# 系统性能报告\n\n"

    # 添加工作记忆指标
    if 'working_memory' in metrics:
        wm = metrics['working_memory']
        report += f"## 工作记忆\n"
        report += f"- 大小: {wm['size']}/{wm['capacity']}\n"
        report += f"- 负荷: {wm['load']:.2f}\n\n"

    # 添加长时记忆指标
    if 'semantic_memory' in metrics:
        sm = metrics['semantic_memory']
        report += f"## 语义记忆\n"
        report += f"- 节点数: {sm.get('nodes', 0)}\n"
        report += f"- 边数: {sm.get('edges', 0)}\n"
        report += f"- 密度: {sm.get('density', 0):.4f}\n\n"

    if 'episodic_memory' in metrics:
        em = metrics['episodic_memory']
        report += f"## 情景记忆\n"
        report += f"- 事件数: {em.get('event_count', 0)}\n\n"

    if 'procedural_memory' in metrics:
        pm = metrics['procedural_memory']
        report += f"## 内隐记忆\n"
        report += f"- 技能数: {pm.get('skill_count', 0)}\n"
        report += f"- 平均熟练度: {pm.get('average_proficiency', 0):.2f}\n"
        report += f"- 自动化技能数: {pm.get('automatized_skills', 0)}\n\n"

    # 添加元认知指标
    if 'emotion' in metrics:
        emotion = metrics['emotion']
        report += f"## 情感状态\n"
        report += f"- 效价: {emotion.get('valence', 0):.2f}\n"
        report += f"- 唤醒度: {emotion.get('arousal', 0):.2f}\n\n"

    if 'curiosity' in metrics:
        report += f"## 好奇心\n"
        report += f"- 水平: {metrics['curiosity']:.2f}\n\n"

    return report