<!--
 * @Author: ChLingS
 * @Date: 2025-12-21 15:45:15
 * @LastEditors: your name
 * @LastEditTime: 2025-12-24 10:44:56
 * @Description: 请填写简介
-->
<template>
  <Footer>
    <template v-slot:toggle>
      <div class="btn-groups">
        <div class="item">
          <!-- 将面板移到按钮容器内部，添加relative定位 -->
          <div class="layer-panel-container" v-if="showLayerPanel">
            <div class="panel">
              <div v-for="el in layerSelect" :key="el.id" class="panel-item">
                <el-checkbox v-model="el.checked" @change="onLayerChange(el)">{{ el.label }}</el-checkbox>
              </div>
            </div>
          </div>
          <div class="btn-container">
            <button class="toggle-btn" @click="showLayerPanel = !showLayerPanel">
              <i class="iconfont icon-tubiaozhizuomoban"></i>
            </button>
            <p>边界显示</p>
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
            <i class="iconfont icon-supervision-full"></i>
          </button>
          <p>承保业务</p>
        </div>
      </div>
    </template>
  </Footer>
</template>

<script setup>
import { ref, defineEmits, watch, computed } from 'vue'
import Footer from '@/components/Footer.vue';


const emit = defineEmits(["layerSelectStatus", "changedInterface"]);

// 图层显隐
let showLayerPanel = ref(false)
const layerSelect = ref([
  { id: 'polygon-contracted-fill-layer_polygon-contracted-outline-layer', label: '保全低空', checked: true },
  { id: 'polygon-field-fill-layer_polygon-field-outline-layer', label: '勾勒地块', checked: true },
  // { id: 'other-plots', label: '其他地块', checked: false }
])
function onLayerChange(layer) {
  emit('layerSelectStatus', layer)
}

function changedInterface( interfaceId ){
  emit('changedInterface', interfaceId)
}
 
</script>

<style scoped>
.btn-groups {
  display: flex;
  color: #fff;
  position: absolute;
  left: 50%;
  font-size: 8px !important;
  bottom: -4px;
  transform: translateX(-50%) rotate(180deg);
}

.btn-groups .item {
  margin-left: 20px;
  text-align: center;
  position: relative;
  /* 为.item添加相对定位 */
}

.btn-container {
  position: relative;
  display: inline-block;
}

.btn-groups button {
  margin-bottom: 4px;
  font-size: 8px;
  width: 40px;
  height: 40px;
  border: none;
  border-radius: 50%;
  outline: none;
  color: #fff;
  background: #53697670;
  box-shadow: 0 0 5px 3px #333;
  background: linear-gradient(to bottom, rgba(0, 128, 255, 0.377), rgba(0, 128, 255, 0.281));
}

.btn-groups button:hover {
  cursor: pointer;
  background: linear-gradient(to bottom, rgba(0, 128, 255, 0.6), rgba(0, 128, 255, 0.281));
}

/* 面板容器样式 */
.layer-panel-container {
  position: absolute;
  bottom: 100%;
  /* 将面板定位在按钮上方 */
  left: 50%;
  transform: translateX(-50%) translateY(-10px);
  /* 水平居中，并稍微向上偏移 */
  z-index: 1000;
  min-width: 120px;
}

/* 面板主体样式 */
.panel {
  background-color: rgba(51, 51, 51, 0.9);
  border-radius: 8px;
  padding: 12px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
  border: 1px solid rgba(255, 255, 255, 0.1);
  margin-bottom: 8px;
}

/* 面板项样式 */
.panel-item {
  padding: 6px 8px;
  color: #fff;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
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
  border-width: 8px;
  border-style: solid;
  border-color: rgba(51, 51, 51, 0.9) transparent transparent transparent;
}

/* 修复el-checkbox的样式（如果需要） */
:deep(.el-checkbox__label) {
  color: #fff;
  font-size: 12px;
}

:deep(.el-checkbox) {
  display: flex;
  align-items: center;
}
</style>