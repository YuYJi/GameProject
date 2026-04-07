"""与现有大模型对比"""

import argparse
import yaml
import time
import numpy as np
from src.core import CognitionLoop


def load_config(config_path):
    """加载配置文件

    Args:
        config_path: 配置文件路径

    Returns:
        配置字典
    """
    with open(config_path, 'r', encoding='utf-8') as f:
        return yaml.safe_load(f)


def generate_benchmark_questions():
    """生成基准测试问题

    Returns:
        基准测试问题列表
    """
    return [
        "What is the capital of France?",
        "Who wrote 'Romeo and Juliet'?",
        "What is 2 + 2?",
        "What is the chemical symbol for water?",
        "What year did World War II end?",
        "Who invented the telephone?",
        "What is the largest planet in our solar system?",
        "What is the boiling point of water?",
        "What is the capital of Japan?",
        "What is the chemical symbol for gold?"
    ]


def benchmark_cogito(config, questions):
    """基准测试 Cogito-1

    Args:
        config: 配置字典
        questions: 测试问题列表

    Returns:
        测试结果
    """
    print("Initializing Cogito-1...")
    cognition_loop = CognitionLoop(config)

    results = []
    total_time = 0

    print("Running benchmark on Cogito-1...")
    for i, question in enumerate(questions):
        print(f"Question {i+1}: {question}")
        start_time = time.time()
        output = cognition_loop.process_input({'text': question})
        end_time = time.time()
        response_time = end_time - start_time
        total_time += response_time

        results.append({
            'question': question,
            'response_time': response_time,
            'emotion': output['emotion'],
            'confidence': output['confidence'],
            'strategy': output['strategy']
        })

        print(f"Response time: {response_time:.4f} seconds")
        print(f"Confidence: {output['confidence']:.2f}")
        print(f"Strategy: {output['strategy']}")
        print()

    avg_time = total_time / len(questions)
    print(f"Average response time: {avg_time:.4f} seconds")

    return results, avg_time


def benchmark_baseline(questions):
    """基准测试基线模型

    Args:
        questions: 测试问题列表

    Returns:
        测试结果
    """
    print("Running benchmark on baseline model...")
    print("Note: This is a simulated baseline for demonstration purposes")

    results = []
    total_time = 0

    for i, question in enumerate(questions):
        print(f"Question {i+1}: {question}")
        # 模拟基线模型的响应时间
        response_time = np.random.normal(0.5, 0.1)
        total_time += response_time

        results.append({
            'question': question,
            'response_time': response_time
        })

        print(f"Response time: {response_time:.4f} seconds")
        print()

    avg_time = total_time / len(questions)
    print(f"Average response time: {avg_time:.4f} seconds")

    return results, avg_time

def compare_results(cogito_results, baseline_results):
    """比较结果

    Args:
        cogito_results: Cogito-1 测试结果
        baseline_results: 基线模型测试结果
    """
    print("\nComparison Results:")
    print("-" * 60)

    # 计算平均响应时间
    cogito_times = [r['response_time'] for r in cogito_results]
    baseline_times = [r['response_time'] for r in baseline_results]

    avg_cogito_time = np.mean(cogito_times)
    avg_baseline_time = np.mean(baseline_times)

    print(f"Cogito-1 average response time: {avg_cogito_time:.4f} seconds")
    print(f"Baseline average response time: {avg_baseline_time:.4f} seconds")

    # 计算响应时间差异
    time_diff = avg_baseline_time - avg_cogito_time
    time_diff_percent = (time_diff / avg_baseline_time) * 100

    print(f"Time difference: {time_diff:.4f} seconds ({time_diff_percent:.2f}%)")

    # 计算 Cogito-1 的平均置信度
    avg_confidence = np.mean([r['confidence'] for r in cogito_results])
    print(f"Cogito-1 average confidence: {avg_confidence:.2f}")

    print("-" * 60)


def main():
    """主函数"""
    # 解析命令行参数
    parser = argparse.ArgumentParser(description='Benchmark Cogito-1 against baseline models')
    parser.add_argument('--config', type=str, default='config/default.yaml', 
                      help='Path to config file')
    args = parser.parse_args()

    # 加载配置
    config = load_config(args.config)
    print(f"Loaded config from {args.config}")

    # 生成基准测试问题
    questions = generate_benchmark_questions()
    print(f"Generated {len(questions)} benchmark questions")

    # 测试 Cogito-1
    cogito_results, cogito_avg_time = benchmark_cogito(config, questions)

    # 测试基线模型
    baseline_results, baseline_avg_time = benchmark_baseline(questions)

    # 比较结果
    compare_results(cogito_results, baseline_results)


if __name__ == "__main__":
    main()