<script setup>
import { ref } from 'vue';
import Canvas from './components/Canvas.vue';
import ComponentLibrary from './components/ComponentLibrary.vue';
import EditManager from './components/EditManager.vue';

const selectedComponent = ref(null);
const canvasRef = ref(null);

const handleComponentSelect = (component) => {
  selectedComponent.value = component;
};

const handleComponentAdd = (componentType, position = null) => {
  if (canvasRef.value) {
    canvasRef.value.addComponent(componentType, position);
  }
};
</script>

<template>
  <div class="app-container">
    <!-- 顶部工具栏 -->
    <header class="app-header">
      <h1>小说故事大纲可视化创作工具</h1>
      <div class="toolbar">
        <button class="toolbar-btn">保存</button>
        <button class="toolbar-btn">导出</button>
        <button class="toolbar-btn">版本回溯</button>
      </div>
    </header>
    
    <div class="app-content">
      <!-- 左侧组件库 -->
      <aside class="component-library">
        <ComponentLibrary @add-component="handleComponentAdd" />
      </aside>
      
      <!-- 中央画布 -->
      <main class="canvas-container">
        <Canvas ref="canvasRef" @select-component="handleComponentSelect" />
      </main>
      
      <!-- 右侧编辑面板 -->
      <aside class="edit-panel">
        <EditManager :selected-component="selectedComponent" />
      </aside>
    </div>
  </div>
</template>

<style>
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  font-family: Arial, sans-serif;
  background-color: #f5f5f5;
}

.app-container {
  width: 100vw;
  height: 100vh;
  display: flex;
  flex-direction: column;
}

.app-header {
  height: 60px;
  background-color: #333;
  color: white;
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0 20px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.app-header h1 {
  font-size: 18px;
  font-weight: 600;
}

.toolbar {
  display: flex;
  gap: 10px;
}

.toolbar-btn {
  padding: 6px 12px;
  background-color: #4CAF50;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;
}

.toolbar-btn:hover {
  background-color: #45a049;
}

.app-content {
  flex: 1;
  display: flex;
  overflow: hidden;
}

.component-library {
  width: 200px;
  background-color: white;
  border-right: 1px solid #ddd;
  padding: 15px;
  overflow-y: auto;
}

.canvas-container {
  flex: 1;
  position: relative;
  background-color: #f9f9f9;
  overflow: hidden;
}

.edit-panel {
  width: 250px;
  background-color: white;
  border-left: 1px solid #ddd;
  padding: 15px;
  overflow-y: auto;
}
</style>
