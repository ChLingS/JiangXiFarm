<template>
  <div class="contraction-status-panel" :class="{ 'collapsed': isCollapsed }">
    <div class="panel-header">
      <div class="header-title">
        保单详情
      </div>
      <div class="collapse-icon">
        <i :class="['iconfont', isCollapsed ? 'icon-zhankai' : 'icon-shouqi']" @click="isCollapsed = !isCollapsed"></i>
      </div>
    </div>

    <transition name="slide-fade">
      <div class="panel-body" v-show="!isCollapsed">
        <div class="crop-type">
          <el-button type="primary" plain>水稻</el-button>
          <el-button type="primary" plain>玉米</el-button>
          <el-button type="primary" plain>小麦</el-button>
          <el-button type="primary" plain>棉花</el-button>
        </div>
        <div class="number-container">
          <el-text size="large" type="success">大户：{{ pieData[0].value }}</el-text>
          <el-text size="large" type="primary">散户：{{ pieData[1].value }}</el-text>
        </div>
        <div class="chart-container">
          <PieChart :data="pieData" :angleField="'value'" :colorField="'type'" :radius="0.8" :innerRadius="0.4"
            :width="pieWidth" :height="pieHeight" :label="{
              type: 'outer',
              content: '{name} {percentage}',
              style: {
                fill: '#ffffff',
                fontSize: 12,
                fontWeight: 'bold',
                textShadow: '0 2px 4px rgba(0,0,0,0.8)',
              }
            }" :legend="{
        position: 'bottom',
        itemName: {
          style: {
            fill: '#e0e0e0',
            fontSize: 8,
          }
        }
      }" :color="['#4F9DFF', '#FF6B6B']"
      :statistic="{
        title:{
          style:{
            // fill: '#e0e0e0',
            fontSize: 12,
          },
        },
        content:{
          style:{
            // fill: '#e0e0e0',
            fontSize: 16,
            fontWeight: 'bold',
          },
        }
      }" />
        </div>
      </div>
    </transition>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue';
import { PieChart } from "@opd/g2plot-vue";

let pieWidth = ref(230);
let pieHeight = ref(170);
onMounted(() => {
  const updateDimensions = () => {
    const screenWidth = window.innerWidth;
    if (screenWidth < 768) {
      pieWidth.value = 180;
      pieHeight.value = 140;
    } else {
      pieWidth.value = 300; 
      pieHeight.value = 270;
    }
  };  
  updateDimensions();
  window.addEventListener('resize', updateDimensions);
});

const isCollapsed = ref(false);
const pieData = reactive([
  { type: '大户', value: 75 },
  { type: '散户', value: 25 }
]);

</script>

<style scoped>
.contraction-status-panel {
  position: absolute;
  width: 450px;
  height: auto;
  max-height: 45vh;
  z-index: 3;
  top: 10vh;
  left: 20px;
  display: flex;
  flex-direction: column;
  background: rgba(18, 25, 45, 0.95);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(64, 156, 255, 0.3);
  border-radius: 12px;
  box-shadow:
    0 10px 30px rgba(0, 0, 0, 0.3),
    0 0 0 1px rgba(64, 156, 255, 0.1),
    0 0 20px rgba(64, 156, 255, 0.1);
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
  color: #e0e0e0;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  overflow: hidden;
}

.contraction-status-panel.collapsed {
  height: 60px;
}

.panel-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 20px;
  background: rgba(10, 18, 35, 0.9);
  border-bottom: 1px solid rgba(64, 156, 255, 0.2);
  cursor: pointer;
  user-select: none;
  transition: background-color 0.3s ease, border-bottom-color 0.3s ease;
  flex-shrink: 0;
}

.contraction-status-panel.collapsed .panel-header {
  border-bottom: 1px solid transparent;
  border-radius: 12px;
}

.panel-header:hover {
  background: rgba(20, 30, 50, 0.9);
}

.header-title {
  font-weight: 600;
  font-size: 16px;
  color: #fff;
  letter-spacing: 1px;
}

.collapse-icon {
  cursor: pointer;
  color: #409cff;
  font-size: 18px;
  transition: transform 0.3s ease, color 0.3s ease;
  padding: 4px;
  border-radius: 4px;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 24px;
  height: 24px;
}

.collapse-icon:hover {
  background: rgba(64, 156, 255, 0.1);
  transform: scale(1.1);
}

/* 收起/展开动画 */
.slide-fade-enter-active,
.slide-fade-leave-active {
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
  overflow: hidden;
}

.slide-fade-enter-from,
.slide-fade-leave-to {
  opacity: 0;
  transform: translateY(-10px);
  max-height: 0;
  margin: 0;
  padding: 0;
}

.slide-fade-enter-to,
.slide-fade-leave-from {
  opacity: 1;
  transform: translateY(0);
  max-height: 1000px;
}

.panel-body {
  padding: 20px;
  display: flex;
  flex-direction: column;
  gap: 20px;
  overflow: hidden;
}

.crop-type {
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
}

.crop-type .el-button {
  flex: 1;
  min-width: 80px;
  background: rgba(30, 40, 60, 0.8);
  border: 1px solid rgba(64, 156, 255, 0.2);
  color: #e0e0e0;
  transition: all 0.3s ease;
}

.crop-type .el-button:hover {
  background: rgba(40, 50, 70, 0.9);
  border-color: rgba(64, 156, 255, 0.5);
  transform: translateY(-2px);
}

.number-container {
  display: flex;
  justify-content: space-around;
  font-size: 16px;
  font-weight: 500;
  color: #ffffff;
}

.chart-container {
  width: 100%;
  height: 30vh;
  display: flex;
  justify-content: center;
  align-items: center;
  overflow: hidden;
}
</style>
