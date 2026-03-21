<script setup>
import { ref, onMounted, onUnmounted } from 'vue';
import * as fabric from 'fabric';

const emit = defineEmits(['select-component']);
const canvasElement = ref(null);
let canvas = null;
let isDrawingLine = false;
let lineStart = null;
let tempLine = null;
let connectionPoints = [];

const initCanvas = () => {
  canvas = new fabric.Canvas(canvasElement.value, {
    width: window.innerWidth - 450, // 减去左右面板宽度
    height: window.innerHeight - 60, // 减去顶部工具栏高度
    backgroundColor: '#ffffff',
    selection: true,
    selectionColor: 'rgba(0, 122, 255, 0.2)',
    selectionBorderColor: '#007aff',
    selectionLineWidth: 2,
    perPixelTargetFind: true,
    targetFindTolerance: 10,
    allowTouchScrolling: true
  });

  // 添加网格背景
  canvas.setBackgroundColor({
    source: createGridPattern(),
    repeat: 'repeat'
  }, canvas.renderAll.bind(canvas));

  // 缩放功能
  canvas.on('mouse:wheel', (opt) => {
    const delta = opt.e.deltaY;
    let zoom = canvas.getZoom();
    zoom *= 0.999 ** delta;
    if (zoom > 5) zoom = 5;
    if (zoom < 0.1) zoom = 0.1;
    canvas.zoomToPoint({ x: opt.e.offsetX, y: opt.e.offsetY }, zoom);
    opt.e.preventDefault();
  });

  // 画布平移 - 空格键 + 鼠标拖动
  let isPanning = false;
  let lastPanPoint = { x: 0, y: 0 };

  // 监听空格键
  document.addEventListener('keydown', (e) => {
    if (e.code === 'Space') {
      isPanning = true;
      document.body.style.cursor = 'grab';
    }
  });

  document.addEventListener('keyup', (e) => {
    if (e.code === 'Space') {
      isPanning = false;
      document.body.style.cursor = 'default';
    }
  });

  // 鼠标拖动平移
  canvas.on('mouse:down', (opt) => {
    if (isPanning && opt.e.button === 0) {
      lastPanPoint = { x: opt.e.clientX, y: opt.e.clientY };
      document.body.style.cursor = 'grabbing';
    }
  });

  canvas.on('mouse:move', (opt) => {
    if (isPanning && opt.e.button === 0) {
      const deltaX = opt.e.clientX - lastPanPoint.x;
      const deltaY = opt.e.clientY - lastPanPoint.y;
      canvas.relativePan(new fabric.Point(deltaX, deltaY));
      lastPanPoint = { x: opt.e.clientX, y: opt.e.clientY };
    }
  });

  canvas.on('mouse:up', () => {
    if (isPanning) {
      document.body.style.cursor = 'grab';
    }
  });

  // 阻止右键菜单
  canvasElement.value.addEventListener('contextmenu', (e) => {
    e.preventDefault();
  });

  // 关系线绘制 - 点击连接点开始绘制
  canvas.on('mouse:down', (opt) => {
    // 只处理左键
    if (opt.e.button === 0) {
      // 检查是否点击了连接点
      const pointer = canvas.getPointer(opt.e);
      const target = canvas.findObjectAt(pointer.x, pointer.y);
      
      if (target && target.data && target.data.type === 'connectionPoint') {
        // 开始绘制关系线
        isDrawingLine = true;
        lineStart = target.data.parent;
        tempLine = new fabric.Line(
          [pointer.x, pointer.y, pointer.x, pointer.y],
          {
            stroke: '#007aff',
            strokeWidth: 2,
            strokeDashArray: [5, 5]
          }
        );
        canvas.add(tempLine);
        opt.e.preventDefault();
        opt.e.stopPropagation();
      }
    }
  });

  // 鼠标移动时更新临时线条
  canvas.on('mouse:move', (opt) => {
    if (isDrawingLine && tempLine) {
      const pointer = canvas.getPointer(opt.e);
      tempLine.set({
        x2: pointer.x,
        y2: pointer.y
      });
      canvas.renderAll();
    }
  });

  // 鼠标释放时完成线条绘制
  canvas.on('mouse:up', (opt) => {
    if (isDrawingLine) {
      isDrawingLine = false;
      const pointer = canvas.getPointer(opt.e);
      const target = canvas.findObjectAt(pointer.x, pointer.y);
      
      if (target && target !== lineStart && target.data) {
        // 创建实际的关系线
        const line = new fabric.Line(
          [lineStart.left + lineStart.width / 2, lineStart.top + lineStart.height / 2, 
           target.left + target.width / 2, target.top + target.height / 2],
          {
            stroke: '#007aff',
            strokeWidth: 2,
            data: { type: 'connection', label: '关系' }
          }
        );
        canvas.add(line);
        canvas.sendToBack(line);
      }
      
      // 移除临时线条
      if (tempLine) {
        canvas.remove(tempLine);
        tempLine = null;
      }
    }
  });

  // 清除连接点
  function clearConnectionPoints() {
    connectionPoints.forEach(point => {
      if (canvas.contains(point)) {
        canvas.remove(point);
      }
    });
    connectionPoints = [];
  }
  
  // 添加连接点
  function addConnectionPoints(object) {
    if (!object) return;
    
    // 启用默认边框
    object.hasBorders = true;
    
    // 移除默认控制手柄
    object.controls = {};
    object.hasControls = false;
    
    const size = 8;
    const points = [
      { x: -object.width / 2, y: -object.height / 2 },
      { x: object.width / 2, y: -object.height / 2 },
      { x: -object.width / 2, y: object.height / 2 },
      { x: object.width / 2, y: object.height / 2 },
      { x: -object.width / 2, y: 0 },
      { x: object.width / 2, y: 0 },
      { x: 0, y: -object.height / 2 },
      { x: 0, y: object.height / 2 }
    ];
    
    points.forEach((point, index) => {
      const circle = new fabric.Circle({
        radius: size,
        fill: '#007aff',
        left: object.left + point.x,
        top: object.top + point.y,
        selectable: false,
        evented: true,
        data: { type: 'connectionPoint', parent: object }
      });
      
      // 添加鼠标事件
      circle.on('mouseover', function() {
        canvasElement.value.style.cursor = 'crosshair';
        this.set('fill', '#ff3b30');
        canvas.renderAll();
      });
      
      circle.on('mouseout', function() {
        canvasElement.value.style.cursor = 'default';
        this.set('fill', '#007aff');
        canvas.renderAll();
      });
      
      canvas.add(circle);
      connectionPoints.push(circle);
    });
  }
  
  // 监听对象选中事件
  canvas.on('selection:created', (e) => {
    clearConnectionPoints();
    addConnectionPoints(e.target);
    emit('select-component', e.target);
  });
  
  canvas.on('selection:updated', (e) => {
    clearConnectionPoints();
    if (e.target) {
      addConnectionPoints(e.target);
      emit('select-component', e.target);
    }
  });
  
  canvas.on('selection:cleared', () => {
    clearConnectionPoints();
    emit('select-component', null);
  });
  
  // 监听对象移动事件，更新连接点位置
  canvas.on('object:moving', (e) => {
    const object = e.target;
    if (object) {
      connectionPoints.forEach((point, index) => {
        if (point.data && point.data.parent === object) {
          const points = [
            { x: -object.width / 2, y: -object.height / 2 },
            { x: object.width / 2, y: -object.height / 2 },
            { x: -object.width / 2, y: object.height / 2 },
            { x: object.width / 2, y: object.height / 2 },
            { x: -object.width / 2, y: 0 },
            { x: object.width / 2, y: 0 },
            { x: 0, y: -object.height / 2 },
            { x: 0, y: object.height / 2 }
          ];
          point.set({
            left: object.left + points[index].x,
            top: object.top + points[index].y
          });
        }
      });
      canvas.renderAll();
    }
  });
  
  // 为新添加的对象设置默认属性
  canvas.on('object:added', (e) => {
    const object = e.target;
    if (object && object.data) {
      // 移除默认控制手柄
      object.controls = {};
      object.hasControls = false;
      object.hasBorders = true;
      object.lockRotation = true;
    }
  });
};

// 创建网格图案
function createGridPattern() {
  const canvas = document.createElement('canvas');
  canvas.width = 20;
  canvas.height = 20;
  const ctx = canvas.getContext('2d');
  ctx.strokeStyle = '#e0e0e0';
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(0, 20);
  ctx.lineTo(20, 20);
  ctx.moveTo(20, 0);
  ctx.lineTo(20, 20);
  ctx.stroke();
  return canvas;
}

const addComponent = (componentType, position = null) => {
  let element;
  const left = position ? position.x : 100;
  const top = position ? position.y : 100;

  switch (componentType) {
    case 'timeline':
      const canvasWidth = canvas.width;
      const canvasCenterY = canvas.height / 2;
      element = new fabric.Line(
        [50, canvasCenterY, canvasWidth - 50, canvasCenterY],
        {
          stroke: '#2196f3',
          strokeWidth: 8,
          strokeLineCap: 'round',
          data: { type: 'timeline', label: '时间线', duration: '' },
          selectable: true,
          evented: true,
          lockScalingX: true,
          lockScalingY: true,
          lockRotation: true
        }
      );
      break;
    case 'event':
      element = new fabric.Rect({
        left,
        top,
        width: 200,
        height: 100,
        fill: '#e8f5e8',
        stroke: '#4caf50',
        strokeWidth: 2,
        rx: 8,
        ry: 8,
        data: { type: 'event', title: '事件', description: '', importance: '' },
        selectable: true,
        evented: true,
        lockScalingX: true,
        lockScalingY: true,
        lockRotation: true
      });
      break;
    case 'character':
      element = new fabric.Group([
        new fabric.Circle({
          radius: 30,
          fill: '#ffcdd2',
          stroke: '#f44336',
          strokeWidth: 2
        }),
        new fabric.Text('人物', {
          top: 70,
          textAlign: 'center'
        })
      ], {
        left,
        top,
        data: { type: 'character', name: '人物', identity: '', personality: '', motivation: '' },
        selectable: true,
        evented: true,
        lockScalingX: true,
        lockScalingY: true,
        lockRotation: true
      });
      break;
    case 'location':
      element = new fabric.Rect({
        left,
        top,
        width: 180,
        height: 80,
        fill: '#fff3e0',
        stroke: '#ff9800',
        strokeWidth: 2,
        rx: 5,
        ry: 5,
        data: { type: 'location', name: '地点', relatedEvents: [], relatedCharacters: [] },
        selectable: true,
        evented: true,
        lockScalingX: true,
        lockScalingY: true,
        lockRotation: true
      });
      break;
    default:
      return;
  }

  canvas.add(element);
  canvas.setActiveObject(element);
  emit('select-component', element);
};

const updateCanvasSize = () => {
  if (canvas) {
    canvas.setWidth(window.innerWidth - 450);
    canvas.setHeight(window.innerHeight - 60);
    canvas.renderAll();
  }
};

onMounted(() => {
  initCanvas();
  window.addEventListener('resize', updateCanvasSize);
});

onUnmounted(() => {
  window.removeEventListener('resize', updateCanvasSize);
  if (canvas) {
    canvas.dispose();
  }
});

defineExpose({
  addComponent
});
</script>

<template>
  <div class="canvas-wrapper">
    <canvas ref="canvasElement"></canvas>
    <div class="canvas-controls">
      <button class="control-btn" @click="canvas?.centerObjectH()">水平居中</button>
      <button class="control-btn" @click="canvas?.centerObjectV()">垂直居中</button>
      <button class="control-btn" @click="canvas?.setZoom(1); canvas?.centerObject(canvas.getActiveObject())">重置视角</button>
    </div>
  </div>
</template>

<style scoped>
.canvas-wrapper {
  width: 100%;
  height: 100%;
  position: relative;
}

canvas {
  display: block;
  background-color: #ffffff;
}

.canvas-controls {
  position: absolute;
  bottom: 20px;
  left: 50%;
  transform: translateX(-50%);
  display: flex;
  gap: 10px;
  background-color: white;
  padding: 10px;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.control-btn {
  padding: 6px 12px;
  background-color: #f0f0f0;
  border: 1px solid #ddd;
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;
}

.control-btn:hover {
  background-color: #e0e0e0;
}
</style>