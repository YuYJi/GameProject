"""睡眠模拟调度器"""

from typing import Dict, Any, Optional
import time
import threading
import queue


def schedule_sleep(consolidation_function, interval: int = 18000):
    """调度睡眠过程

    Args:
        consolidation_function: 记忆巩固函数
        interval: 调度间隔（秒）
    """
    def sleep_scheduler():
        while True:
            time.sleep(interval)
            print("Scheduled sleep triggered")
            try:
                consolidation_function()
            except Exception as e:
                print(f"Error during sleep consolidation: {e}")

    # 创建并启动调度线程
    scheduler_thread = threading.Thread(target=sleep_scheduler, daemon=True)
    scheduler_thread.start()
    print(f"Sleep scheduler started with interval {interval} seconds")


class SleepScheduler:
    """睡眠调度器类"""

    def __init__(self, config: Dict[str, Any]):
        """初始化睡眠调度器

        Args:
            config: 配置参数
        """
        self.config = config
        self.interval = config.get('sleep_trigger_interval', 18000)
        self.queue = queue.Queue()
        self.running = False
        self.thread = None

    def start(self, consolidation_function):
        """启动调度器

        Args:
            consolidation_function: 记忆巩固函数
        """
        if self.running:
            return

        self.running = True
        self.thread = threading.Thread(
            target=self._scheduler_loop,
            args=(consolidation_function,),
            daemon=True
        )
        self.thread.start()
        print(f"Sleep scheduler started with interval {self.interval} seconds")

    def stop(self):
        """停止调度器"""
        self.running = False
        if self.thread:
            self.thread.join(timeout=5.0)
        print("Sleep scheduler stopped")

    def trigger_sleep(self):
        """手动触发睡眠"""
        self.queue.put(True)
        print("Manual sleep triggered")

    def _scheduler_loop(self, consolidation_function):
        """调度器循环

        Args:
            consolidation_function: 记忆巩固函数
        """
        last_sleep_time = time.time()

        while self.running:
            # 检查是否需要触发睡眠
            current_time = time.time()
            if current_time - last_sleep_time >= self.interval:
                self._perform_sleep(consolidation_function)
                last_sleep_time = current_time

            # 检查手动触发
            try:
                if not self.queue.empty():
                    self.queue.get()
                    self._perform_sleep(consolidation_function)
                    last_sleep_time = time.time()
            except queue.Empty:
                pass

            # 短暂睡眠，避免忙等
            time.sleep(1)

    def _perform_sleep(self, consolidation_function):
        """执行睡眠过程

        Args:
            consolidation_function: 记忆巩固函数
        """
        print("Starting sleep process...")
        try:
            consolidation_function()
            print("Sleep process completed")
        except Exception as e:
            print(f"Error during sleep process: {e}")


class SleepSimulator:
    """睡眠模拟器类"""

    def __init__(self, config: Dict[str, Any]):
        """初始化睡眠模拟器

        Args:
            config: 配置参数
        """
        self.config = config
        self.sleep_duration = config.get('sleep_duration', 3600)
        self.sleep_cycles = config.get('sleep_cycles', 5)

    def simulate_sleep(self, consolidation_function):
        """模拟睡眠过程

        Args:
            consolidation_function: 记忆巩固函数
        """
        print(f"Starting sleep simulation for {self.sleep_duration} seconds...")

        # 模拟睡眠周期
        cycle_duration = self.sleep_duration / self.sleep_cycles

        for i in range(self.sleep_cycles):
            print(f"Sleep cycle {i+1}/{self.sleep_cycles}")
            
            # 执行记忆巩固
            consolidation_function()
            
            # 模拟睡眠周期间隔
            time.sleep(cycle_duration)

        print("Sleep simulation completed")

    def get_sleep_stats(self) -> Dict[str, Any]:
        """获取睡眠统计信息

        Returns:
            睡眠统计信息
        """
        return {
            'sleep_duration': self.sleep_duration,
            'sleep_cycles': self.sleep_cycles,
            'cycle_duration': self.sleep_duration / self.sleep_cycles
        }


def create_sleep_schedule(config: Dict[str, Any]) -> Dict[str, Any]:
    """创建睡眠调度

    Args:
        config: 配置参数

    Returns:
        睡眠调度信息
    """
    # 基于配置创建睡眠调度
    sleep_interval = config.get('sleep_trigger_interval', 18000)
    sleep_duration = config.get('sleep_duration', 3600)
    sleep_cycles = config.get('sleep_cycles', 5)

    return {
        'interval': sleep_interval,
        'duration': sleep_duration,
        'cycles': sleep_cycles,
        'next_sleep_time': time.time() + sleep_interval
    }


def update_sleep_schedule(schedule: Dict[str, Any]) -> Dict[str, Any]:
    """更新睡眠调度

    Args:
        schedule: 睡眠调度信息

    Returns:
        更新后的睡眠调度
    """
    # 更新下次睡眠时间
    schedule['next_sleep_time'] = time.time() + schedule['interval']
    return schedule


def check_sleep_schedule(schedule: Dict[str, Any]) -> bool:
    """检查是否需要执行睡眠

    Args:
        schedule: 睡眠调度信息

    Returns:
        是否需要执行睡眠
    """
    return time.time() >= schedule['next_sleep_time']