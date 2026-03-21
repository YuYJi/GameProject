import { useState, useCallback, useRef, useEffect } from 'react';
import ReactFlow, { 
  Background, 
  Controls, 
  MiniMap, 
  useNodesState, 
  useEdgesState,
  addEdge 
} from 'reactflow';
import 'reactflow/dist/style.css';
import './App.css';
import { Layout, Button, Space, Input, Select, message } from 'antd';
import { 
  FileOutlined, 
  SaveOutlined, 
  UndoOutlined, 
  RedoOutlined, 
  ZoomInOutlined, 
  PlusOutlined, 
  MinusOutlined 
} from '@ant-design/icons';

const { Header, Sider, Content } = Layout;
const { Option } = Select;

// 自定义节点类型
const CharacterNode = ({ data, isSelected }) => {
  return (
    <div className={`custom-node character-node ${isSelected ? 'selected' : ''}`}>
      <div className="node-header">
        <div className="avatar">👤</div>
        <div className="node-title">{data.name || '人物'}</div>
      </div>
      <div className="node-content">
        <div className="node-desc">{data.description || '人物描述'}</div>
      </div>
    </div>
  );
};

const LocationNode = ({ data, isSelected }) => {
  return (
    <div className={`custom-node location-node ${isSelected ? 'selected' : ''}`}>
      <div className="node-header">
        <div className="avatar">🏠</div>
        <div className="node-title">{data.name || '地点'}</div>
      </div>
      <div className="node-content">
        <div className="node-desc">{data.description || '地点描述'}</div>
      </div>
    </div>
  );
};

const EventNode = ({ data, isSelected }) => {
  return (
    <div className={`custom-node event-node ${isSelected ? 'selected' : ''}`}>
      <div className="node-header">
        <div className="avatar">⚡</div>
        <div className="node-title">{data.name || '事件'}</div>
      </div>
      <div className="node-content">
        <div className="node-desc">{data.description || '事件描述'}</div>
      </div>
    </div>
  );
};

const TimelineNode = ({ data, isSelected }) => {
  return (
    <div className={`custom-node timeline-node ${isSelected ? 'selected' : ''}`}>
      <div className="node-header">
        <div className="avatar">📅</div>
        <div className="node-title">{data.name || '时间线'}</div>
      </div>
      <div className="node-content">
        <div className="timeline-line">
          {/* 时间点将作为独立节点实现 */}
        </div>
      </div>
    </div>
  );
};

// 时间点节点类型
const TimelinePointNode = ({ data, isSelected }) => {
  return (
    <div className={`custom-node timeline-point-node ${isSelected ? 'selected' : ''}`}>
      <div className="point-dot"></div>
      <div className="point-label">{data.label || '时间点'}</div>
    </div>
  );
};

// 注册自定义节点
const nodeTypes = {
  character: CharacterNode,
  location: LocationNode,
  event: EventNode,
  timeline: TimelineNode,
  timelinePoint: TimelinePointNode
};

// 自定义连接线类型
const edgeTypes = {
  default: 'default',
  dashed: 'default',
  bidirectional: 'default',
  'no-arrow': 'default'
};

function App() {
  // 状态管理
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const [zoom, setZoom] = useState(1);
  const [selectedElement, setSelectedElement] = useState(null);
  const [history, setHistory] = useState([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const reactFlowWrapper = useRef(null);
  const reactFlowInstance = useRef(null);

  // 自动保存到localStorage
  useEffect(() => {
    if (nodes.length > 0 || edges.length > 0) {
      const state = { nodes, edges };
      localStorage.setItem('storyboard_autosave', JSON.stringify(state));
    }
  }, [nodes, edges]);

  // 加载自动保存的数据
  useEffect(() => {
    const savedState = localStorage.getItem('storyboard_autosave');
    if (savedState) {
      const { nodes: savedNodes, edges: savedEdges } = JSON.parse(savedState);
      setNodes(savedNodes);
      setEdges(savedEdges);
      message.info('已恢复上次编辑的内容');
    }
  }, []);

  // 记录历史
  const recordHistory = useCallback(() => {
    const newHistory = history.slice(0, historyIndex + 1);
    newHistory.push({ nodes, edges });
    setHistory(newHistory);
    setHistoryIndex(newHistory.length - 1);
  }, [nodes, edges, history, historyIndex]);

  // 撤销
  const handleUndo = () => {
    if (historyIndex > 0) {
      const previousState = history[historyIndex - 1];
      setNodes(previousState.nodes);
      setEdges(previousState.edges);
      setHistoryIndex(historyIndex - 1);
    }
  };

  // 重做
  const handleRedo = () => {
    if (historyIndex < history.length - 1) {
      const nextState = history[historyIndex + 1];
      setNodes(nextState.nodes);
      setEdges(nextState.edges);
      setHistoryIndex(historyIndex + 1);
    }
  };

  // 处理连线
  const onConnect = useCallback((params) => {
    const newEdge = {
      ...params,
      data: {
        label: '',
        type: 'default'
      }
    };
    setEdges((eds) => addEdge(newEdge, eds));
    recordHistory();
  }, [recordHistory]);

  // 处理节点变化
  const handleNodesChange = useCallback((changes) => {
    onNodesChange(changes);
    recordHistory();
  }, [onNodesChange, recordHistory]);

  // 处理边变化
  const handleEdgesChange = useCallback((changes) => {
    onEdgesChange(changes);
    recordHistory();
  }, [onEdgesChange, recordHistory]);

  // 处理元素选择
  const onSelectionChange = useCallback(({ nodes, edges }) => {
    if (nodes.length > 0) {
      setSelectedElement({ type: 'node', data: nodes[0] });
    } else if (edges.length > 0) {
      setSelectedElement({ type: 'edge', data: edges[0] });
    } else {
      setSelectedElement(null);
    }
  }, []);

  // 缩放控制
  const handleZoomIn = () => {
    if (reactFlowInstance.current) {
      reactFlowInstance.current.zoomIn();
    }
  };

  const handleZoomOut = () => {
    if (reactFlowInstance.current) {
      reactFlowInstance.current.zoomOut();
    }
  };

  const handleFitView = () => {
    if (reactFlowInstance.current) {
      reactFlowInstance.current.fitView();
    }
  };

  // 新建画布
  const handleNew = () => {
    if (window.confirm('确定要清空画布吗？')) {
      setNodes([]);
      setEdges([]);
      setHistory([]);
      setHistoryIndex(-1);
      localStorage.removeItem('storyboard_autosave');
    }
  };

  // 清空画布
  const handleClear = () => {
    if (window.confirm('确定要清空画布吗？')) {
      setNodes([]);
      setEdges([]);
      setHistory([]);
      setHistoryIndex(-1);
      localStorage.removeItem('storyboard_autosave');
      message.success('画布已清空');
    }
  };

  // 保存到本地
  const handleSave = () => {
    const data = { nodes, edges };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'storyboard.json';
    a.click();
    URL.revokeObjectURL(url);
    message.success('文件已保存');
  };

  // 从本地打开
  const handleOpen = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    input.onchange = (e) => {
      const file = e.target.files[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = (event) => {
          try {
            const data = JSON.parse(event.target.result);
            setNodes(data.nodes || []);
            setEdges(data.edges || []);
            recordHistory();
            message.success('文件已加载');
          } catch (error) {
            message.error('文件格式错误');
          }
        };
        reader.readAsText(file);
      }
    };
    input.click();
  };

  // 加载示例大纲
  const loadExample = () => {
    // 生成带有连接点的节点
    const createNode = (id, type, position, data) => ({
      id,
      type,
      position,
      data,
      sourcePosition: 'right',
      targetPosition: 'left',
      handles: [
        {
          id: `${id}-top-source`,
          type: 'source',
          position: 'top',
          style: { background: '#1890ff' }
        },
        {
          id: `${id}-right-source`,
          type: 'source',
          position: 'right',
          style: { background: '#1890ff' }
        },
        {
          id: `${id}-bottom-source`,
          type: 'source',
          position: 'bottom',
          style: { background: '#1890ff' }
        },
        {
          id: `${id}-left-source`,
          type: 'source',
          position: 'left',
          style: { background: '#1890ff' }
        },
        {
          id: `${id}-top-target`,
          type: 'target',
          position: 'top',
          style: { background: '#1890ff' }
        },
        {
          id: `${id}-right-target`,
          type: 'target',
          position: 'right',
          style: { background: '#1890ff' }
        },
        {
          id: `${id}-bottom-target`,
          type: 'target',
          position: 'bottom',
          style: { background: '#1890ff' }
        },
        {
          id: `${id}-left-target`,
          type: 'target',
          position: 'left',
          style: { background: '#1890ff' }
        }
      ]
    });
    
    // 生成时间点节点
    const createTimelinePoint = (id, position, data) => ({
      id,
      type: 'timelinePoint',
      position,
      data,
      sourcePosition: 'top',
      targetPosition: 'bottom',
      handles: [
        {
          id: `${id}-top-source`,
          type: 'source',
          position: 'top',
          style: { background: '#1890ff' }
        },
        {
          id: `${id}-bottom-source`,
          type: 'source',
          position: 'bottom',
          style: { background: '#1890ff' }
        },
        {
          id: `${id}-top-target`,
          type: 'target',
          position: 'top',
          style: { background: '#1890ff' }
        },
        {
          id: `${id}-bottom-target`,
          type: 'target',
          position: 'bottom',
          style: { background: '#1890ff' }
        }
      ]
    });
    
    const exampleData = {
      nodes: [
        createNode('char1', 'character', { x: 100, y: 100 }, {
          name: '张三',
          gender: '男',
          organization: '护卫队',
          status: '存活',
          description: '主角，勇敢善良'
        }),
        createNode('char2', 'character', { x: 300, y: 100 }, {
          name: '李四',
          gender: '女',
          organization: '组织B',
          status: '存活',
          description: '女主角'
        }),
        createNode('loc1', 'location', { x: 100, y: 300 }, {
          name: '京城',
          description: '故事发生的主要地点'
        }),
        createNode('loc2', 'location', { x: 300, y: 300 }, {
          name: '密室',
          description: '秘密场所'
        }),
        createNode('event1', 'event', { x: 100, y: 500 }, {
          name: '相遇',
          description: '张三和李四初次相遇'
        }),
        createNode('event2', 'event', { x: 300, y: 500 }, {
          name: '对决',
          description: '最终对决'
        }),
        createNode('timeline1', 'timeline', { x: 200, y: 700 }, {
          name: '主线时间线',
          description: ''
        }),
        // 时间点作为独立节点
        createTimelinePoint('point1', { x: 240, y: 700 }, {
          label: '第一章',
          time: '2024-01',
          description: ''
        }),
        createTimelinePoint('point2', { x: 320, y: 700 }, {
          label: '第二章',
          time: '2024-06',
          description: ''
        })
      ],
      edges: [
        {
          id: 'edge1',
          source: 'char1',
          target: 'char2',
          data: {
            label: '爱慕',
            type: 'default'
          }
        },
        {
          id: 'edge2',
          source: 'char2',
          target: 'loc1',
          data: {
            label: '位于',
            type: 'default'
          }
        },
        {
          id: 'edge3',
          source: 'event1',
          target: 'timeline1',
          data: {
            label: '发生在',
            type: 'default'
          }
        }
      ]
    };
    setNodes(exampleData.nodes);
    setEdges(exampleData.edges);
    recordHistory();
    message.success('已加载示例大纲');
  };

  return (
    <Layout style={{ height: '100vh' }}>
      {/* 顶部工具栏 */}
      <Header style={{ background: '#fff', borderBottom: '1px solid #e8e8e8', padding: '0 24px' }}>
        <Space size="middle">
          <Button onClick={handleNew} icon={<FileOutlined />}>新建</Button>
          <Button onClick={loadExample}>加载示例</Button>
          <Button onClick={handleOpen} icon={<FileOutlined />}>打开</Button>
          <Button onClick={handleSave} icon={<SaveOutlined />}>保存到本地</Button>
          <Button onClick={handleClear} danger>清空画布</Button>
          <Button onClick={handleUndo} icon={<UndoOutlined />} disabled={historyIndex <= 0}>撤销</Button>
          <Button onClick={handleRedo} icon={<RedoOutlined />} disabled={historyIndex >= history.length - 1}>重做</Button>
          <div style={{ marginLeft: '20px' }}>
            <Space size="small">
              <Button onClick={handleZoomIn} icon={<PlusOutlined />} />
              <span>{Math.round(zoom * 100)}%</span>
              <Button onClick={handleZoomOut} icon={<MinusOutlined />} />
              <Button onClick={handleFitView} icon={<ZoomInOutlined />}>适应画布</Button>
            </Space>
          </div>
        </Space>
      </Header>
      
      <Layout>
        {/* 左侧组件库 */}
        <Sider width={200} style={{ background: '#f0f0f0', borderRight: '1px solid #e8e8e8' }}>
          <div style={{ padding: '16px' }}>
            <h3 style={{ marginBottom: '16px' }}>组件库</h3>
            <div className="component-list">
              <div 
                className="component-item"
                draggable
                onDragStart={(e) => {
                  e.dataTransfer.setData('application/reactflow', JSON.stringify({ type: 'character' }));
                  e.dataTransfer.effectAllowed = 'move';
                }}
              >
                <div className="component-icon">👤</div>
                <div className="component-label">人物</div>
              </div>
              <div 
                className="component-item"
                draggable
                onDragStart={(e) => {
                  e.dataTransfer.setData('application/reactflow', JSON.stringify({ type: 'location' }));
                  e.dataTransfer.effectAllowed = 'move';
                }}
              >
                <div className="component-icon">🏠</div>
                <div className="component-label">地点</div>
              </div>
              <div 
                className="component-item"
                draggable
                onDragStart={(e) => {
                  e.dataTransfer.setData('application/reactflow', JSON.stringify({ type: 'event' }));
                  e.dataTransfer.effectAllowed = 'move';
                }}
              >
                <div className="component-icon">⚡</div>
                <div className="component-label">事件</div>
              </div>
              <div 
                className="component-item"
                draggable
                onDragStart={(e) => {
                  e.dataTransfer.setData('application/reactflow', JSON.stringify({ type: 'timeline' }));
                  e.dataTransfer.effectAllowed = 'move';
                }}
              >
                <div className="component-icon">📅</div>
                <div className="component-label">时间线</div>
              </div>
            </div>
          </div>
        </Sider>
        
        {/* 中心画布 */}
        <Content style={{ position: 'relative' }}>
          <div ref={reactFlowWrapper} style={{ width: '100%', height: '100%' }}>
            <ReactFlow
              ref={reactFlowInstance}
              nodes={nodes}
              edges={edges}
              onNodesChange={handleNodesChange}
              onEdgesChange={handleEdgesChange}
              onConnect={onConnect}
              onSelectionChange={onSelectionChange}
              nodeTypes={nodeTypes}
              edgeTypes={edgeTypes}
              onDrop={(event) => {
                event.preventDefault();
                const reactFlowBounds = reactFlowWrapper.current.getBoundingClientRect();
                const type = JSON.parse(event.dataTransfer.getData('application/reactflow')).type;
                const position = {
                  x: event.clientX - reactFlowBounds.left,
                  y: event.clientY - reactFlowBounds.top
                };
                const nodeId = `${type}-${Date.now()}`;
                const newNode = {
                  id: nodeId,
                  type,
                  position,
                  data: {
                    name: type === 'character' ? '人物' : 
                          type === 'location' ? '地点' : 
                          type === 'event' ? '事件' : '时间线',
                    description: ''
                  },
                  // 添加上下左右四个连接点
                  sourcePosition: 'right',
                  targetPosition: 'left',
                  handles: [
                    {
                      id: `${nodeId}-top-source`,
                      type: 'source',
                      position: 'top',
                      style: { background: '#1890ff' }
                    },
                    {
                      id: `${nodeId}-right-source`,
                      type: 'source',
                      position: 'right',
                      style: { background: '#1890ff' }
                    },
                    {
                      id: `${nodeId}-bottom-source`,
                      type: 'source',
                      position: 'bottom',
                      style: { background: '#1890ff' }
                    },
                    {
                      id: `${nodeId}-left-source`,
                      type: 'source',
                      position: 'left',
                      style: { background: '#1890ff' }
                    },
                    {
                      id: `${nodeId}-top-target`,
                      type: 'target',
                      position: 'top',
                      style: { background: '#1890ff' }
                    },
                    {
                      id: `${nodeId}-right-target`,
                      type: 'target',
                      position: 'right',
                      style: { background: '#1890ff' }
                    },
                    {
                      id: `${nodeId}-bottom-target`,
                      type: 'target',
                      position: 'bottom',
                      style: { background: '#1890ff' }
                    },
                    {
                      id: `${nodeId}-left-target`,
                      type: 'target',
                      position: 'left',
                      style: { background: '#1890ff' }
                    }
                  ]
                };
                if (type === 'timeline') {
                  newNode.data.points = [];
                }
                setNodes((nds) => [...nds, newNode]);
                recordHistory();
              }}
              onDragOver={(event) => {
                event.preventDefault();
                event.dataTransfer.dropEffect = 'move';
              }}
            >
              <Background color="#f0f0f0" gap={20} />
              <Controls />
              <MiniMap />
              {/* 连接线标签配置 */}
              <div style={{ display: 'none' }}>
                {edges.map(edge => (
                  <div key={edge.id} data-edge-id={edge.id} data-label={edge.data?.label || ''} />
                ))}
              </div>
            </ReactFlow>
          </div>
        </Content>
        
        {/* 右侧属性面板 */}
        <Sider width={300} style={{ background: '#f0f0f0', borderLeft: '1px solid #e8e8e8' }}>
          <div style={{ padding: '16px' }}>
            <h3 style={{ marginBottom: '16px' }}>属性编辑</h3>
            {selectedElement ? (
              selectedElement.type === 'node' ? (
                <div className="property-panel">
                  <Input 
                    placeholder="名称" 
                    value={selectedElement.data.data.name} 
                    onChange={(e) => {
                      const newNodes = nodes.map(node => 
                        node.id === selectedElement.data.id 
                          ? { ...node, data: { ...node.data, name: e.target.value } }
                          : node
                      );
                      setNodes(newNodes);
                    }}
                    style={{ marginBottom: '12px' }}
                  />
                  <Input.TextArea 
                    placeholder="描述" 
                    value={selectedElement.data.data.description} 
                    onChange={(e) => {
                      const newNodes = nodes.map(node => 
                        node.id === selectedElement.data.id 
                          ? { ...node, data: { ...node.data, description: e.target.value } }
                          : node
                      );
                      setNodes(newNodes);
                    }}
                    rows={4}
                    style={{ marginBottom: '12px' }}
                  />
                  {selectedElement.data.type === 'character' && (
                    <>
                      <Select 
                        placeholder="性别" 
                        value={selectedElement.data.data.gender} 
                        onChange={(value) => {
                          const newNodes = nodes.map(node => 
                            node.id === selectedElement.data.id 
                              ? { ...node, data: { ...node.data, gender: value } }
                              : node
                          );
                          setNodes(newNodes);
                        }}
                        style={{ marginBottom: '12px', width: '100%' }}
                      >
                        <Option value="男">男</Option>
                        <Option value="女">女</Option>
                        <Option value="其他">其他</Option>
                        <Option value="未知">未知</Option>
                      </Select>
                      <Input 
                        placeholder="所属组织" 
                        value={selectedElement.data.data.organization} 
                        onChange={(e) => {
                          const newNodes = nodes.map(node => 
                            node.id === selectedElement.data.id 
                              ? { ...node, data: { ...node.data, organization: e.target.value } }
                              : node
                          );
                          setNodes(newNodes);
                        }}
                        style={{ marginBottom: '12px' }}
                      />
                      <Input 
                        placeholder="状态" 
                        value={selectedElement.data.data.status} 
                        onChange={(e) => {
                          const newNodes = nodes.map(node => 
                            node.id === selectedElement.data.id 
                              ? { ...node, data: { ...node.data, status: e.target.value } }
                              : node
                          );
                          setNodes(newNodes);
                        }}
                        style={{ marginBottom: '12px' }}
                      />
                    </>
                  )}
                  {selectedElement.data.type === 'timelinePoint' && (
                    <>
                      <Input 
                        placeholder="时间点标签" 
                        value={selectedElement.data.data.label} 
                        onChange={(e) => {
                          const newNodes = nodes.map(node => 
                            node.id === selectedElement.data.id 
                              ? { ...node, data: { ...node.data, label: e.target.value } }
                              : node
                          );
                          setNodes(newNodes);
                        }}
                        style={{ marginBottom: '12px' }}
                      />
                      <Input 
                        placeholder="具体时间" 
                        value={selectedElement.data.data.time} 
                        onChange={(e) => {
                          const newNodes = nodes.map(node => 
                            node.id === selectedElement.data.id 
                              ? { ...node, data: { ...node.data, time: e.target.value } }
                              : node
                          );
                          setNodes(newNodes);
                        }}
                        style={{ marginBottom: '12px' }}
                      />
                      <Input.TextArea 
                        placeholder="描述" 
                        value={selectedElement.data.data.description} 
                        onChange={(e) => {
                          const newNodes = nodes.map(node => 
                            node.id === selectedElement.data.id 
                              ? { ...node, data: { ...node.data, description: e.target.value } }
                              : node
                          );
                          setNodes(newNodes);
                        }}
                        rows={3}
                        style={{ marginBottom: '12px' }}
                      />
                    </>
                  )}
                </div>
              ) : (
                <div className="property-panel">
                  <Input 
                    placeholder="关系标签" 
                    value={selectedElement.data.data.label} 
                    onChange={(e) => {
                      const newEdges = edges.map(edge => 
                        edge.id === selectedElement.data.id 
                          ? { ...edge, data: { ...edge.data, label: e.target.value } }
                          : edge
                      );
                      setEdges(newEdges);
                    }}
                    style={{ marginBottom: '12px' }}
                  />
                  <Select 
                    placeholder="连线类型" 
                    value={selectedElement.data.data.type} 
                    onChange={(value) => {
                      const newEdges = edges.map(edge => 
                        edge.id === selectedElement.data.id 
                          ? { ...edge, data: { ...edge.data, type: value } }
                          : edge
                      );
                      setEdges(newEdges);
                    }}
                    style={{ marginBottom: '12px', width: '100%' }}
                  >
                    <Option value="default">直线箭头</Option>
                    <Option value="dashed">虚线箭头</Option>
                    <Option value="bidirectional">双向箭头</Option>
                    <Option value="no-arrow">无箭头直线</Option>
                  </Select>
                </div>
              )
            ) : (
              <div style={{ textAlign: 'center', color: '#999', marginTop: '40px' }}>
                请选择一个元素进行编辑
              </div>
            )}
          </div>
        </Sider>
      </Layout>
    </Layout>
  );
}

export default App
