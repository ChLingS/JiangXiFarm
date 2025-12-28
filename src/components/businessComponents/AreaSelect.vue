<template>
  <div class="contraction-list-panel" :class="{ 'collapsed': isCollapsed }">
    <div class="panel-header">
      <div class="header-title">
        保单列表
      </div>
      <div class="collapse-icon">
        <i :class="['iconfont', isCollapsed ? 'icon-zhankai' : 'icon-shouqi']" @click="isCollapsed = !isCollapsed;"></i>
      </div>
    </div>
    <transition name="slide-up">
      <div class="panel-content" v-show="!isCollapsed">
        <!-- 地区选择 -->
        <div class="area-select">
          <el-cascader v-model="shi_xian" :options="shi_xian_options" @change="handleChange" placeholder="请选择市县" />
          <el-cascader v-model="zhen_cun" :options="zhen_cun_options" @change="handleChange" placeholder="请选择镇村" />
        </div>

        <!-- 过滤条件 -->
        <div class="filter-section">
          <div class="filter-row">
            <div class="filter-item">
              <el-date-picker v-model="selectedMonth" type="month" placeholder="选择月份" format="YYYY年MM月"
                value-format="YYYY-MM" class="custom-date-picker" />
            </div>
            <div class="filter-item">
              <el-select v-model="selectType" placeholder="作物类型" clearable popper-class="custom-select">
                <el-option v-for="item in cropType" :key="item.value" :label="item.label" :value="item.value" />
              </el-select>
            </div>
          </div>

          <div class="filter-row">
            <div class="filter-item">
              <el-select v-model="selectField" placeholder="搜索字段" clearable popper-class="custom-select">
                <el-option v-for="item in filterField" :key="item.value" :label="item.label" :value="item.value" />
              </el-select>
            </div>
            <div class="filter-item">
              <el-input v-model="searchText" placeholder="请输入搜索内容" class="custom-input">
                <template #prefix>
                  <i class="iconfont icon-sousuo"></i>
                </template>
              </el-input>
            </div>
          </div>

          <!-- 操作按钮 -->
          <div class="operation-buttons">
            <el-button type="primary" class="custom-button">查询</el-button>
            <el-button type="default" class="custom-button reset-btn">重置</el-button>
          </div>
        </div>
      </div>
    </transition>
  </div>
</template>

<script setup>
import { ref } from 'vue';

const isCollapsed = ref(false);
let shi_xian = ref([]);
let zhen_cun = ref([]);
const selectedMonth = ref('');
const selectType = ref('');
const selectField = ref('');
const searchText = ref('');

const shi_xian_options = ref([
  {
    value: '南昌市',
    label: '南昌市',
    children: [
      { value: '东湖区', label: '东湖区' },
      { value: '西湖区', label: '西湖区' },
    ],
  },
  {
    value: '九江市',
    label: '九江市',
    children: [
      { value: '濂溪区', label: '濂溪区' },
      { value: '浔阳区', label: '浔阳区' },
    ],
  },
]);

const zhen_cun_options = ref([
  {
    value: '东湖区',
    label: '东湖区',
    children: [
      { value: '小蓝镇', label: '小蓝镇' },
      { value: '彭桥镇', label: '彭桥镇' },
    ],
  },
  {
    value: '西湖区',
    label: '西湖区',
    children: [
      { value: '文教镇', label: '文教镇' },
      { value: '莲塘镇', label: '莲塘镇' },
    ],
  },
]);

const cropType = ref([
  { value: 'rice', label: '水稻' },
  { value: 'corn', label: '玉米' },
  { value: 'wheat', label: '小麦' },
  { value: 'cotton', label: '棉花' },
]);

const filterField = ref([
  { value: 'contractNumber', label: '保单号' },
  { value: 'farmerName', label: '农户姓名' },
  { value: 'idNumber', label: '身份证号' },
]);

const handleChange = () => {
  // 处理变化
};
</script>

<style scoped>
.contraction-list-panel {
  position: absolute;
  width: 450px;
  height: auto;
  max-height: 45vh;
  z-index: 3;
  bottom: 15%;
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

/* 收起状态样式 */
.contraction-list-panel.collapsed {
  max-height: 60px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
  border-bottom: 1px solid rgba(64, 156, 255, 0.2);
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

.contraction-list-panel.collapsed .panel-header {
  border-bottom: 1px solid transparent;
  background: rgba(10, 18, 35, 1);
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

/* 从下往上的动画 */
.slide-up-enter-active,
.slide-up-leave-active {
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
  overflow: hidden;
}

.slide-up-enter-from,
.slide-up-leave-to {
  opacity: 0;
  transform: translateY(20px);
  max-height: 0;
  margin: 0;
  padding: 0;
}

.slide-up-enter-to,
.slide-up-leave-from {
  opacity: 1;
  transform: translateY(0);
  max-height: 1000px;
}

.panel-content {
  display: flex;
  flex-direction: column;
  flex: 1;
  height: 100%;
  padding: 20px;
  overflow: hidden;
  gap: 20px;
}

/* 地区选择 */
.area-select {
  display: flex;
  gap: 10px;
  flex-shrink: 0;
}

/* 过滤条件区域 */
.filter-section {
  display: flex;
  flex-direction: column;
  gap: 16px;
  flex-shrink: 0;
}

.filter-row {
  display: flex;
  gap: 10px;
  align-items: center;
}

.filter-item {
  flex: 1;
  min-width: 0;
  /* 防止内容溢出 */
}

/* 操作按钮 */
.operation-buttons {
  display: flex;
  gap: 10px;
  margin-top: 8px;
}


/* 统一组件样式 */
:deep(.el-cascader),
:deep(.custom-date-picker),
:deep(.custom-input) {
  width: 100%;
  background: rgba(30, 40, 60, 0.8) !important;
  border: 1px solid rgba(64, 156, 255, 0.2) !important;
  border-radius: 6px !important;
  transition: all 0.3s ease;
}

/* 输入框内部样式 */
:deep(.el-input__wrapper) {
  background: transparent !important;
  box-shadow: none !important;
  border: none !important;
}

/* 输入框文字颜色 */
:deep(.el-input__inner),
:deep(.el-cascader__inner) {
  color: #e0e0e0 !important;
  font-size: 14px;
}

/* 输入框占位符颜色 */
:deep(.el-input__inner::placeholder),
:deep(.el-cascader__inner::placeholder) {
  color: rgba(224, 224, 224, 0.6) !important;
}

/* 图标颜色 */
:deep(.el-input__prefix .iconfont),
:deep(.el-cascader .el-icon) {
  color: rgba(224, 224, 224, 0.6) !important;
}

/* 日期选择器下拉框样式 */
:deep(.el-date-picker) {
  background: rgba(18, 25, 45, 0.95) !important;
  border: 1px solid rgba(64, 156, 255, 0.3) !important;
  color: #e0e0e0 !important;
  backdrop-filter: blur(10px);
}

/* 按钮样式 */
.custom-button {
  flex: 1;
  height: 36px;
  font-weight: 500;
  transition: all 0.3s ease;
}

.custom-button:deep(.el-button) {
  width: 100%;
}

/* 重置按钮特殊样式 */
.reset-btn:deep(.el-button) {
  background: rgba(255, 255, 255, 0.1) !important;
  border-color: rgba(255, 255, 255, 0.2) !important;
  color: #e0e0e0 !important;
}

.reset-btn:deep(.el-button:hover) {
  background: rgba(255, 255, 255, 0.15) !important;
  border-color: rgba(255, 255, 255, 0.3) !important;
}

/* 鼠标悬停效果 */
:deep(.el-cascader:hover),
:deep(.custom-date-picker:hover),
:deep(.custom-select:hover),
:deep(.custom-input:hover) {
  border-color: rgba(255, 255, 255, 1) !important;
}

/* 获取焦点效果 */
:deep(.el-cascader.is-focus .el-input__wrapper),
:deep(.custom-date-picker.is-focus .el-input__wrapper),
:deep(.custom-select.is-focus .el-input__wrapper),
:deep(.custom-input.is-focus .el-input__wrapper) {
  border-color: rgba(64, 156, 255, 0.6) !important;
  box-shadow: 0 0 0 1px rgba(64, 156, 255, 0.2) !important;
}
</style>
