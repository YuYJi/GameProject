<script setup>
import { ref } from 'vue';

const emit = defineEmits(['add-component']);

const components = [
  { id: 'timeline', name: '时间线', icon: '📅' },
  { id: 'event', name: '事件', icon: '📋' },
  { id: 'character', name: '人物', icon: '👤' },
  { id: 'location', name: '地点', icon: '📍' }
];

const handleComponentClick = (componentType) => {
  emit('add-component', componentType);
};

// 长按拖动功能
let dragStartTimer = null;
let isDragging = false;
let draggedComponent = null;

const handleMouseDown = (e, componentType) => {
  // 清除之前的定时器
  if (dragStartTimer) {
    clearTimeout(dragStartTimer);
    dragStartTimer = null;
  }
  
  // 开始长按计时
  dragStartTimer = setTimeout(() => {
    isDragging = true;
    draggedComponent = componentType;
    e.target.style.opacity = '0.5';
    document.body.style.cursor = 'grabbing';
  }, 300); // 300ms 长按阈值
};

const handleMouseMove = (e) => {
  if (isDragging) {
    // 可以在这里添加拖拽视觉效果
  }
};

const handleMouseUp = (e) => {
  // 清除长按定时器
  if (dragStartTimer) {
    clearTimeout(dragStartTimer);
    dragStartTimer = null;
  }
  
  if (isDragging) {
    // 检查是否拖拽到画布区域
    const canvasContainer = document.querySelector('.canvas-container');
    const rect = canvasContainer.getBoundingClientRect();
    
    if (e.clientX >= rect.left && e.clientX <= rect.right && 
        e.clientY >= rect.top && e.clientY <= rect.bottom) {
      // 计算相对于画布的位置
      const canvasLeft = e.clientX - rect.left;
      const canvasTop = e.clientY - rect.top;
      // 拖拽到画布区域，添加组件
      emit('add-component', draggedComponent, { x: canvasLeft, y: canvasTop });
    }
    
    // 重置状态
    isDragging = false;
    draggedComponent = null;
    document.body.style.cursor = 'default';
    const componentItems = document.querySelectorAll('.component-item');
    componentItems.forEach(item => {
      item.style.opacity = '1';
    });
  }
};

// 鼠标离开组件时取消操作
const handleMouseLeave = () => {
  if (dragStartTimer) {
    clearTimeout(dragStartTimer);
    dragStartTimer = null;
  }
};

// 全局鼠标事件监听
const setupGlobalEvents = () => {
  document.addEventListener('mousemove', handleMouseMove);
  document.addEventListener('mouseup', handleMouseUp);
};

setupGlobalEvents();
</script>

<template>
  <div class="component-library">
    <h3>组件库</h3>
    <div class="component-list">
      <div 
        v-for="component in components" 
        :key="component.id"
        class="component-item"
        @click="handleComponentClick(component.id)"
        @mousedown="handleMouseDown($event, component.id)"
        @mouseleave="handleMouseLeave"
      >
        <div class="component-icon">{{ component.icon }}</div>
        <div class="component-name">{{ component.name }}</div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.component-library {
  height: 100%;
}

h3 {
  font-size: 16px;
  font-weight: 600;
  margin-bottom: 20px;
  color: #333;
}

h4 {
  font-size: 14px;
  font-weight: 600;
  margin: 20px 0 10px;
  color: #555;
}

.component-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.component-item {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px;
  background-color: #f5f5f5;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.2s ease;
}

.component-item:hover {
  background-color: #e0e0e0;
  transform: translateY(-1px);
}

.component-icon {
  font-size: 20px;
  width: 30px;
  text-align: center;
}

.component-name {
  font-size: 14px;
  color: #333;
}

.library-section {
  margin-top: 30px;
}
</style>