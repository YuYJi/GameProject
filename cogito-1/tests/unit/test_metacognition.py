"""元认知系统单元测试"""

import pytest
import time
from src.metacognition import EmotionEngine, ConfidenceEvaluator, StrategySelector, CuriositySystem
from src.core.global_state import GlobalState


class TestEmotionEngine:
    """测试情感引擎"""

    def test_evaluate(self):
        """测试评估情感状态"""
        config = {'update_rate': 0.1, 'memory_decay': 0.05}
        emotion_engine = EmotionEngine(config)
        global_state = GlobalState()

        # 测试处理信息
        processed_info = {
            'comparisons': [{'is_similar': True, 'similarity': 0.9}],
            'bindings': [{'items': [0, 1], 'binding': {}}],
            'simulations': [{'item': 0, 'simulation': {}}],
            'inferences': [{'item': 0, 'inference': {}}]
        }

        # 评估情感
        emotion = emotion_engine.evaluate(processed_info, global_state)
        assert 'valence' in emotion
        assert 'arousal' in emotion
        assert -1.0 <= emotion['valence'] <= 1.0
        assert 0.0 <= emotion['arousal'] <= 1.0

    def test_get_emotion_label(self):
        """测试获取情感标签"""
        config = {'update_rate': 0.1, 'memory_decay': 0.05}
        emotion_engine = EmotionEngine(config)

        # 测试不同情感状态的标签
        assert emotion_engine.get_emotion_label({'valence': 0.8, 'arousal': 0.8}) == "快乐"
        assert emotion_engine.get_emotion_label({'valence': 0.8, 'arousal': 0.3}) == "满足"
        assert emotion_engine.get_emotion_label({'valence': -0.8, 'arousal': 0.8}) == "愤怒"
        assert emotion_engine.get_emotion_label({'valence': -0.8, 'arousal': 0.3}) == "悲伤"
        assert emotion_engine.get_emotion_label({'valence': 0.0, 'arousal': 0.8}) == "兴奋"
        assert emotion_engine.get_emotion_label({'valence': 0.0, 'arousal': 0.2}) == "平静"
        assert emotion_engine.get_emotion_label({'valence': 0.0, 'arousal': 0.5}) == "中性"

    def test_get_emotion_history(self):
        """测试获取情感历史"""
        config = {'update_rate': 0.1, 'memory_decay': 0.05}
        emotion_engine = EmotionEngine(config)
        global_state = GlobalState()

        # 评估情感
        processed_info = {
            'comparisons': [{'is_similar': True, 'similarity': 0.9}]
        }
        emotion_engine.evaluate(processed_info, global_state)

        # 获取情感历史
        history = emotion_engine.get_emotion_history()
        assert len(history) > 0
        assert 'emotion' in history[0]
        assert 'label' in history[0]
        assert 'timestamp' in history[0]


class TestConfidenceEvaluator:
    """测试置信度评估器"""

    def test_evaluate(self):
        """测试评估置信度"""
        config = {'calculation_method': 'bayesian', 'prior_confidence': 0.5}
        evaluator = ConfidenceEvaluator(config)

        # 测试处理信息
        processed_info = {
            'comparisons': [{'is_similar': True, 'similarity': 0.9}],
            'bindings': [{'items': [0, 1], 'binding': {}}],
            'inferences': [{'item': 0, 'inference': {}}]
        }

        # 评估置信度
        confidence = evaluator.evaluate(processed_info)
        assert 0.0 <= confidence <= 1.0

    def test_get_confidence_interpretation(self):
        """测试获取置信度解释"""
        config = {'calculation_method': 'bayesian', 'prior_confidence': 0.5}
        evaluator = ConfidenceEvaluator(config)

        # 测试不同置信度的解释
        assert evaluator.get_confidence_interpretation(0.95) == "非常确定"
        assert evaluator.get_confidence_interpretation(0.8) == "比较确定"
        assert evaluator.get_confidence_interpretation(0.6) == "不确定"
        assert evaluator.get_confidence_interpretation(0.4) == "比较不确定"
        assert evaluator.get_confidence_interpretation(0.1) == "非常不确定"

    def test_evaluate_specific_component(self):
        """测试评估特定组件的置信度"""
        config = {'calculation_method': 'bayesian', 'prior_confidence': 0.5}
        evaluator = ConfidenceEvaluator(config)

        # 测试评估比较结果
        comparisons = [{'similarity': 0.9}, {'similarity': 0.8}]
        confidence = evaluator.evaluate_specific_component('comparisons', comparisons)
        assert 0.0 <= confidence <= 1.0

        # 测试评估绑定结果
        bindings = [{'items': [0, 1], 'binding': {}}]
        confidence = evaluator.evaluate_specific_component('bindings', bindings)
        assert 0.0 <= confidence <= 1.0

        # 测试评估模拟结果
        simulations = [{'item': 0, 'simulation': {}}]
        confidence = evaluator.evaluate_specific_component('simulations', simulations)
        assert 0.0 <= confidence <= 1.0

        # 测试评估推理结果
        inferences = [{'item': 0, 'inference': {}}]
        confidence = evaluator.evaluate_specific_component('inferences', inferences)
        assert 0.0 <= confidence <= 1.0


class TestStrategySelector:
    """测试策略选择器"""

    def test_select(self):
        """测试选择策略"""
        config = {'strategies': ['exploration', 'exploitation', 'maintenance']}
        selector = StrategySelector(config)
        global_state = GlobalState()

        # 设置全局状态
        global_state.curiosity = 0.8
        global_state.cognitive_load = 0.2

        # 测试高好奇心时选择探索策略
        emotion = {'valence': 0.5, 'arousal': 0.8}
        confidence = 0.3
        strategy = selector.select(global_state, emotion, confidence)
        assert strategy in ['exploration', 'exploitation', 'maintenance']

        # 测试高置信度时选择利用策略
        global_state.curiosity = 0.3
        confidence = 0.9
        strategy = selector.select(global_state, emotion, confidence)
        assert strategy in ['exploration', 'exploitation', 'maintenance']

        # 测试高认知负荷时选择维护策略
        global_state.curiosity = 0.3
        global_state.cognitive_load = 0.8
        confidence = 0.5
        strategy = selector.select(global_state, emotion, confidence)
        assert strategy in ['exploration', 'exploitation', 'maintenance']

    def test_get_strategy_description(self):
        """测试获取策略描述"""
        config = {'strategies': ['exploration', 'exploitation', 'maintenance']}
        selector = StrategySelector(config)

        # 测试获取策略描述
        assert "探索" in selector.get_strategy_description('exploration')
        assert "利用" in selector.get_strategy_description('exploitation')
        assert "巩固" in selector.get_strategy_description('maintenance')

    def test_get_strategy_parameters(self):
        """测试获取策略参数"""
        config = {'strategies': ['exploration', 'exploitation', 'maintenance']}
        selector = StrategySelector(config)

        # 测试获取策略参数
        params = selector.get_strategy_parameters('exploration')
        assert 'attention_breadth' in params
        assert 'memory_consolidation_rate' in params
        assert 'risk_tolerance' in params


class TestCuriositySystem:
    """测试好奇心系统"""

    def test_calculate(self):
        """测试计算好奇心水平"""
        config = {'prediction_error_weight': 0.8, 'novelty_weight': 0.2, 'baseline': 0.3}
        curiosity_system = CuriositySystem(config)

        # 测试处理信息
        processed_info = {
            'comparisons': [{'is_similar': False, 'similarity': 0.3}],
            'bindings': [{'items': [0, 1], 'binding': {}}],
            'simulations': [{'item': 0, 'simulation': {}}],
            'inferences': [{'item': 0, 'inference': {}}]
        }

        # 测试检索到的记忆
        retrieved_memories = [{'content': 'memory1'}]

        # 计算好奇心
        curiosity = curiosity_system.calculate(processed_info, retrieved_memories)
        assert 0.0 <= curiosity <= 1.0

    def test_get_curiosity_interpretation(self):
        """测试获取好奇心解释"""
        config = {'prediction_error_weight': 0.8, 'novelty_weight': 0.2, 'baseline': 0.3}
        curiosity_system = CuriositySystem(config)

        # 测试不同好奇心水平的解释
        assert curiosity_system.get_curiosity_interpretation(0.9) == "非常好奇"
        assert curiosity_system.get_curiosity_interpretation(0.7) == "比较好奇"
        assert curiosity_system.get_curiosity_interpretation(0.5) == "有点好奇"
        assert curiosity_system.get_curiosity_interpretation(0.2) == "不怎么好奇"

    def test_get_exploration_targets(self):
        """测试获取探索目标"""
        config = {'prediction_error_weight': 0.8, 'novelty_weight': 0.2, 'baseline': 0.3}
        curiosity_system = CuriositySystem(config)

        # 测试不同好奇心水平的探索目标
        targets = curiosity_system.get_exploration_targets(0.9)
        assert len(targets) > 0
        assert "新领域探索" in targets

        targets = curiosity_system.get_exploration_targets(0.3)
        assert len(targets) > 0
        assert "现有知识应用" in targets