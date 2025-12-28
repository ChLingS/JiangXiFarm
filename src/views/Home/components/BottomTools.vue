<template>
  <Footer>
    <template v-slot:toggle>
      <div class="btn-groups">
        <div class="item">
          <div class="layer-panel-container" v-if="showLayerPanel">
            <div class="panel">
              <div v-for="el in layerSelect" :key="el.id" class="panel-item">
                <el-checkbox v-model="el.checked" @change="onLayerChange(el)">{{ el.label }}</el-checkbox>
              </div>
            </div>
          </div>
          <div class="btn-container">
            <button class="toggle-btn" @click="showLayerPanel = !showLayerPanel">
              <i class="iconfont icon-tuceng"></i>
            </button>
            <p>图层选择</p>
          </div>
        </div>

        <div class="item">
          <button class="toggle-btn" @click="changedInterface(1)">
            <i class="iconfont icon-supervision-full"></i>
          </button>
          <p>驾驶舱</p>
        </div>

        <div class="item">
          <button class="toggle-btn" @click="changedInterface(2)">
            <i class="iconfont icon-yekuoyewu"></i>
          </button>
          <p>承保业务</p>
        </div>
      </div>
    </template>
  </Footer>
</template>

<script setup>
import { ref, defineEmits } from 'vue'
import Footer from '@/components/Footer.vue';

const emit = defineEmits(["layerSelectStatus", "changedInterface"]);

let showLayerPanel = ref(false)
const layerSelect = ref([
  { id: 'polygon-contracted-fill-layer_polygon-contracted-outline-layer', label: '耘智保地块', checked: true },
  { id: 'polygon-field-fill-layer_polygon-field-outline-layer', label: '勾勒地块', checked: true },
])

function onLayerChange(layer) {
  emit('layerSelectStatus', layer)
}

function changedInterface(interfaceId) {
  emit('changedInterface', interfaceId)
}
</script>

<style scoped>
/* 设置根元素字体大小，作为em的基础 */
:root {
  font-size: 16px;
}

.btn-groups {
  display: flex;
  color: #fff;
  position: absolute;
  left: 50%;
  /* bottom: -0.5em; */
  transform: translateX(-50%) rotate(180deg);
  gap: 3em;
  padding-bottom: 3em;
  /* 使用em控制间距 */
}

.btn-groups .item {
  text-align: center;
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.btn-container {
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.btn-groups button {
  margin-bottom: 0.5em;
  width: 3em;

  height: 3em;

  border: none;
  border-radius: 50%;
  outline: none;
  color: #fff;
  font-size: 1.5em;

  display: flex;
  align-items: center;
  justify-content: center;
  background: #53697670;
  box-shadow: 0 0 0.4em 0.25em #333;
  background: linear-gradient(to bottom, rgba(0, 128, 255, 0.377), rgba(0, 128, 255, 0.281));
  transition: all 0.3s ease;
}

.btn-groups button:hover {
  cursor: pointer;
  background: linear-gradient(to bottom, rgba(0, 128, 255, 0.6), rgba(0, 128, 255, 0.281));
  transform: scale(1.05);
}

/* 面板容器样式 */
.layer-panel-container {
  position: absolute;
  bottom: 100%;
  left: 50%;
  transform: translateX(-50%) translateY(-0.625em);
  z-index: 1000;
  min-width: 9em;
  /* 调整面板宽度 */
}

/* 面板主体样式 */
.panel {
  background-color: rgba(51, 51, 51, 0.9);
  border-radius: 0.5em;
  padding: 0.75em;
  box-shadow: 0 0.25em 0.75em rgba(0, 0, 0, 0.3);
  border: 1px solid rgba(255, 255, 255, 0.1);
  margin-bottom: 0.5em;
}

/* 面板项样式 */
.panel-item {
  padding: 0.5em 0.6em;
  /* 增加内边距 */
  color: #fff;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  font-size: 1em;
  /* 增大面板文字大小 */
}

.panel-item:last-child {
  border-bottom: none;
}

/* 面板下方的三角形箭头 */
.panel::after {
  content: '';
  position: absolute;
  top: 100%;
  left: 50%;
  transform: translateX(-50%);
  border-width: 0.6em;
  /* 增大箭头 */
  border-style: solid;
  border-color: rgba(51, 51, 51, 0.9) transparent transparent transparent;
}

.item p {
  font-size: 1.1em;
  /* 增大下方文字大小 */
  margin: 0;
  line-height: 1.2;
  text-align: center;
  white-space: nowrap;
  font-weight: 500;
  /* 增加一点字重 */
}

/* 修复el-checkbox的样式 */
:deep(.el-checkbox__label) {
  color: #fff;
  font-size: 1em;
  /* 增大复选框文字 */
}

:deep(.el-checkbox) {
  display: flex;
  align-items: center;
}

/* 确保图标在按钮内居中并适当放大 */
.toggle-btn .iconfont {
  display: block;
  font-size: 1.8em;
  /* 增大图标大小 */
  line-height: 1;
}

/* 响应式调整 */
@media (max-width: 768px) {
  .btn-groups {
    gap: 1.2em;
  }

  .btn-groups button {
    width: 3.8em;
    height: 3.8em;
    font-size: 1.5em;
  }

  .item p {
    font-size: 0.9em;
  }

  .toggle-btn .iconfont {
    font-size: 1.5em;
  }
}

@media (max-width: 480px) {
  .btn-groups {
    gap: 1em;
  }

  .btn-groups button {
    width: 3.2em;
    height: 3.2em;
    font-size: 1.2em;
  }

  .item p {
    font-size: 0.8em;
  }

  .toggle-btn .iconfont {
    font-size: 1.2em;
  }
}
</style>
