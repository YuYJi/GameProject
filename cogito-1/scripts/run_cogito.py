"""启动 Cogito-1 主循环"""

import argparse
import yaml
import time
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


def main():
    """主函数"""
    # 解析命令行参数
    parser = argparse.ArgumentParser(description='Run Cogito-1 main loop')
    parser.add_argument('--config', type=str, default='config/default.yaml', 
                      help='Path to config file')
    parser.add_argument('--input', type=str, default=None, 
                      help='Path to input file')
    args = parser.parse_args()

    # 加载配置
    config = load_config(args.config)
    print(f"Loaded config from {args.config}")

    # 创建认知循环
    cognition_loop = CognitionLoop(config)
    print("Created CognitionLoop instance")

    # 定义输入流
    def input_stream():
        if args.input:
            # 从文件读取输入
            with open(args.input, 'r', encoding='utf-8') as f:
                for line in f:
                    line = line.strip()
                    if line:
                        yield {'text': line}
                        time.sleep(1)
        else:
            # 交互式输入
            print("Enter text input (type 'exit' to quit):")
            while True:
                user_input = input("> ")
                if user_input.lower() == 'exit':
                    break
                yield {'text': user_input}

    # 运行认知循环
    print("Starting Cogito-1 main loop...")
    for output in cognition_loop.run(input_stream()):
        print("\nCogito-1 Output:")
        print(f"Emotion: {output['emotion']}")
        print(f"Confidence: {output['confidence']:.2f}")
        print(f"Strategy: {output['strategy']}")
        print(f"Processed Info: {output['processed_info']}")
        print("\n" + "-" * 50 + "\n")

    print("Cogito-1 main loop stopped")


if __name__ == "__main__":
    main()