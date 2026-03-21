<script setup>
import { ref, watch } from 'vue';

const props = defineProps({
  selectedComponent: {
    type: Object,
    default: null
  }
});

const componentData = ref({});

watch(() => props.selectedComponent, (newComponent) => {
  if (newComponent && newComponent.data) {
    componentData.value = { ...newComponent.data };
  } else {
    componentData.value = {};
  }
}, { immediate: true });

const updateComponentData = (key, value) => {
  componentData.value[key] = value;
  if (props.selectedComponent) {
    props.selectedComponent.data[key] = value;
    props.selectedComponent.canvas.renderAll();
  }
};
</script>

<template>
  <div class="edit-manager">
    <h3>编辑面板</h3>
    
    <div v-if="selectedComponent" class="component-editor">
      <div class="editor-section">
        <h4>{{ 
          selectedComponent.data?.type === 'timeline' ? '时间线' :
          selectedComponent.data?.type === 'event' ? '事件' :
          selectedComponent.data?.type === 'character' ? '人物' :
          selectedComponent.data?.type === 'location' ? '地点' : '组件'
        }}</h4>
        
        <!-- 时间线编辑 -->
        <div v-if="selectedComponent.data?.type === 'timeline'" class="edit-form">
          <div class="form-item">
            <label>标签</label>
            <input 
              type="text" 
              :value="componentData.label" 
              @input="updateComponentData('label', $event.target.value)"
            />
          </div>
          <div class="form-item">
            <label>时长</label>
            <input 
              type="text" 
              :value="componentData.duration" 
              @input="updateComponentData('duration', $event.target.value)"
            />
          </div>
        </div>
        
        <!-- 事件编辑 -->
        <div v-else-if="selectedComponent.data?.type === 'event'" class="edit-form">
          <div class="form-item">
            <label>标题</label>
            <input 
              type="text" 
              :value="componentData.title" 
              @input="updateComponentData('title', $event.target.value)"
            />
          </div>
          <div class="form-item">
            <label>描述</label>
            <textarea 
              :value="componentData.description" 
              @input="updateComponentData('description', $event.target.value)"
              rows="3"
            ></textarea>
          </div>
          <div class="form-item">
            <label>重要度</label>
            <select 
              :value="componentData.importance" 
              @change="updateComponentData('importance', $event.target.value)"
            >
              <option value="">请选择</option>
              <option value="高">高</option>
              <option value="中">中</option>
              <option value="低">低</option>
            </select>
          </div>
        </div>
        
        <!-- 人物编辑 -->
        <div v-else-if="selectedComponent.data?.type === 'character'" class="edit-form">
          <div class="form-item">
            <label>姓名</label>
            <input 
              type="text" 
              :value="componentData.name" 
              @input="updateComponentData('name', $event.target.value)"
            />
          </div>
          <div class="form-item">
            <label>身份</label>
            <input 
              type="text" 
              :value="componentData.identity" 
              @input="updateComponentData('identity', $event.target.value)"
            />
          </div>
          <div class="form-item">
            <label>性格</label>
            <input 
              type="text" 
              :value="componentData.personality" 
              @input="updateComponentData('personality', $event.target.value)"
            />
          </div>
          <div class="form-item">
            <label>核心动机</label>
            <input 
              type="text" 
              :value="componentData.motivation" 
              @input="updateComponentData('motivation', $event.target.value)"
            />
          </div>
        </div>
        
        <!-- 地点编辑 -->
        <div v-else-if="selectedComponent.data?.type === 'location'" class="edit-form">
          <div class="form-item">
            <label>名称</label>
            <input 
              type="text" 
              :value="componentData.name" 
              @input="updateComponentData('name', $event.target.value)"
            />
          </div>
          <div class="form-item">
            <label>关联事件</label>
            <input 
              type="text" 
              :value="componentData.relatedEvents?.join(', ') || ''" 
              @input="updateComponentData('relatedEvents', $event.target.value.split(',').map(item => item.trim()))"
              placeholder="事件1, 事件2"
            />
          </div>
          <div class="form-item">
            <label>关联人物</label>
            <input 
              type="text" 
              :value="componentData.relatedCharacters?.join(', ') || ''" 
              @input="updateComponentData('relatedCharacters', $event.target.value.split(',').map(item => item.trim()))"
              placeholder="人物1, 人物2"
            />
          </div>
        </div>
        
        <!-- 样式编辑 -->
        <div class="editor-section">
          <h4>样式</h4>
          <div class="edit-form">
            <div class="form-item">
              <label>填充颜色</label>
              <input 
                type="color" 
                :value="selectedComponent.fill" 
                @input="selectedComponent.set('fill', $event.target.value); selectedComponent.canvas.renderAll()"
              />
            </div>
            <div class="form-item">
              <label>边框颜色</label>
              <input 
                type="color" 
                :value="selectedComponent.stroke" 
                @input="selectedComponent.set('stroke', $event.target.value); selectedComponent.canvas.renderAll()"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
    
    <div v-else class="no-selection">
      <p>请选择一个组件进行编辑</p>
    </div>
  </div>
</template>

<style scoped>
.edit-manager {
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

.no-selection {
  text-align: center;
  color: #999;
  margin-top: 50px;
}

.component-editor {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.editor-section {
  border: 1px solid #eee;
  border-radius: 6px;
  padding: 15px;
  background-color: #f9f9f9;
}

.edit-form {
  display: flex;
  flex-direction: column;
  gap: 10px;
  margin-top: 10px;
}

.form-item {
  display: flex;
  flex-direction: column;
  gap: 5px;
}

.form-item label {
  font-size: 12px;
  color: #666;
  font-weight: 500;
}

.form-item input,
.form-item textarea,
.form-item select {
  padding: 8px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 14px;
  background-color: white;
}

.form-item input[type="color"] {
  padding: 2px;
  height: 36px;
}

.form-item textarea {
  resize: vertical;
  min-height: 60px;
}
</style>