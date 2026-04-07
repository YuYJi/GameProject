from setuptools import setup, find_packages

with open('requirements.txt', 'r') as f:
    requirements = f.read().splitlines()

setup(
    name='cogito-1',
    version='1.0.0',
    description='仿人类大脑 AI 系统',
    author='Cogito-1 Team',
    author_email='contact@cogito-1.com',
    packages=find_packages('src'),
    package_dir={'': 'src'},
    install_requires=requirements,
    scripts=[
        'scripts/run_cogito.py',
        'scripts/train_encoder.py',
        'scripts/simulate_sleep.py',
        'scripts/export_memory_graph.py',
        'scripts/benchmark.py'
    ],
    classifiers=[
        'Programming Language :: Python :: 3',
        'License :: OSI Approved :: MIT License',
        'Operating System :: OS Independent',
    ],
    python_requires='>=3.8',
)