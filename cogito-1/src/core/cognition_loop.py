"""核心认知循环实现"""

import time
from typing import Dict, Any, Optional

from ..perception import Encoder, SaliencyDetector, AttentionController, FocusGenerator
from ..working_memory import Buffer, Operator, Rehearsal, LTMInterface
from ..long_term_memory import SemanticMemory, EpisodicMemory, ProceduralMemory, MemoryConsolidation
from ..metacognition import EmotionEngine, ConfidenceEvaluator, StrategySelector, CuriositySystem
from .global_state import GlobalState
from ..utils.persistence import MemoryPersistence


class CognitionLoop:
    """核心认知循环类"""

    def __init__(self, config: Dict[str, Any]):
        """初始化认知循环

        Args:
            config: 系统配置
        """
        # 初始化全局状态
        self.global_state = GlobalState()

        # 初始化感知系统
        self.encoder = Encoder(config.get('perception', {}))
        self.saliency_detector = SaliencyDetector(config.get('perception', {}))
        self.attention_controller = AttentionController(config.get('perception', {}))
        self.focus_generator = FocusGenerator(config.get('perception', {}))

        # 初始化工作记忆
        self.buffer = Buffer(config.get('working_memory', {}))
        self.operator = Operator(config.get('working_memory', {}))
        self.rehearsal = Rehearsal(config.get('working_memory', {}))

        # 初始化长时记忆
        self.semantic_memory = SemanticMemory(config.get('long_term_memory', {}))
        self.episodic_memory = EpisodicMemory(config.get('long_term_memory', {}))
        self.procedural_memory = ProceduralMemory(config.get('long_term_memory', {}))
        self.memory_consolidation = MemoryConsolidation(config.get('long_term_memory', {}))

        # 初始化长时记忆接口
        self.ltm_interface = LTMInterface(
            self.semantic_memory,
            self.episodic_memory,
            self.procedural_memory,
            config.get('working_memory', {})
        )

        # 初始化元认知系统
        self.emotion_engine = EmotionEngine(config.get('metacognition', {}))
        self.confidence_evaluator = ConfidenceEvaluator(config.get('metacognition', {}))
        self.strategy_selector = StrategySelector(config.get('metacognition', {}))
        self.curiosity_system = CuriositySystem(config.get('metacognition', {}))

        # 系统配置
        self.max_cycle_time = config.get('system', {}).get('max_cycle_time', 0.1)
        self.sleep_trigger_interval = config.get('system', {}).get('sleep_trigger_interval', 18000)

        # 状态变量
        self.last_cycle_time = time.time()
        self.last_sleep_time = time.time()
        
        # 初始化持久化系统
        self._init_persistence(config)

    def _init_persistence(self, config: Dict[str, Any]):
        """初始化持久化系统

        Args:
            config: 配置参数
        """
        persistence_config = config.get('long_term_memory', {}).get('persistence', {})
        
        if persistence_config.get('auto_save', False) or persistence_config.get('load_on_start', False):
            self.persistence = MemoryPersistence(persistence_config)
            
            # 设置持久化管理器
            self.semantic_memory.set_persistence(self.persistence)
            self.episodic_memory.set_persistence(self.persistence)
            self.procedural_memory.set_persistence(self.persistence)
            
            # 启动时加载记忆
            if persistence_config.get('load_on_start', False):
                self.load_memories()
            
            # 启动自动保存
            if persistence_config.get('auto_save', False):
                self.persistence.start_auto_save(
                    self.semantic_memory,
                    self.episodic_memory,
                    self.procedural_memory
                )
        else:
            self.persistence = None

    def load_memories(self):
        """加载所有记忆"""
        print("Loading memories from disk...")
        results = {
            'semantic': self.semantic_memory.load(),
            'episodic': self.episodic_memory.load(),
            'procedural': self.procedural_memory.load()
        }
        print(f"Memory loading results: {results}")
        return results

    def save_memories(self):
        """保存所有记忆"""
        if self.persistence:
            print("Saving memories to disk...")
            return self.persistence.save_all(
                self.semantic_memory.graph,
                self.episodic_memory.events,
                self.procedural_memory.skills
            )
        return None

    def shutdown(self):
        """关闭系统，保存记忆"""
        print("Shutting down Cogito-1...")
        
        # 停止自动保存
        if self.persistence:
            self.persistence.stop_auto_save()
            
            # 最后保存一次
            self.save_memories()
        
        print("Cogito-1 shutdown complete.")

    def process_input(self, input_data: Dict[str, Any]) -> Optional[Dict[str, Any]]:
        """处理输入数据

        Args:
            input_data: 多模态输入数据

        Returns:
            系统输出（如果有）
        """
        start_time = time.time()

        # 1. 感知处理
        encoded_input = self.encoder.encode(input_data)
        saliency_map = self.saliency_detector.detect(encoded_input)
        attention_weights = self.attention_controller.control(saliency_map, self.global_state)
        focus = self.focus_generator.generate(encoded_input, attention_weights)

        # 2. 工作记忆处理
        self.buffer.add(focus)
        self.rehearsal.rehearse(self.buffer)

        # 3. 与长时记忆交互
        retrieved_memories = self.ltm_interface.retrieve(focus, self.buffer)
        if retrieved_memories:
            self.buffer.add_all(retrieved_memories)

        # 4. 信息操作
        processed_info = self.operator.process(self.buffer)

        # 5. 元认知评估
        emotion = self.emotion_engine.evaluate(processed_info, self.global_state)
        confidence = self.confidence_evaluator.evaluate(processed_info)
        strategy = self.strategy_selector.select(self.global_state, emotion, confidence)
        curiosity = self.curiosity_system.calculate(processed_info, retrieved_memories)

        # 6. 更新全局状态
        self.global_state.update(emotion, confidence, strategy, curiosity)

        # 7. 记忆巩固检查
        current_time = time.time()
        if current_time - self.last_sleep_time > self.sleep_trigger_interval:
            self.trigger_sleep()
            self.last_sleep_time = current_time

        # 8. 生成输出
        output = self.generate_output(processed_info, self.global_state)

        # 9. 记忆存储
        self.ltm_interface.store(processed_info, emotion, current_time)

        # 控制循环时间
        elapsed_time = time.time() - start_time
        if elapsed_time < self.max_cycle_time:
            time.sleep(self.max_cycle_time - elapsed_time)

        self.last_cycle_time = time.time()
        return output

    def trigger_sleep(self):
        """触发睡眠过程，进行记忆巩固"""
        print("Triggering sleep for memory consolidation...")
        self.memory_consolidation.consolidate(
            self.semantic_memory,
            self.episodic_memory,
            self.procedural_memory
        )

    def generate_output(self, processed_info: Dict[str, Any], global_state: GlobalState) -> Optional[Dict[str, Any]]:
        """生成系统输出

        Args:
            processed_info: 处理后的信息
            global_state: 全局状态

        Returns:
            系统输出
        """
        # 这里可以根据具体任务生成不同类型的输出
        # 例如，对于对话系统，生成回复；对于控制系统，生成动作指令等
        return {
            "processed_info": processed_info,
            "emotion": global_state.emotion,
            "confidence": global_state.confidence,
            "strategy": global_state.strategy
        }

    def run(self, input_stream):
        """运行认知循环

        Args:
            input_stream: 输入流生成器
        """
        for input_data in input_stream:
            output = self.process_input(input_data)
            if output:
                yield output