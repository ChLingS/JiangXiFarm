<template>
  <div class="contraction-list-panel" :class="{ 'collapsed': isCollapsed }">
    <div class="panel-header">
      <div class="header-title">
        搜索筛选
      </div>
      <div class="collapse-icon">
        <i :class="['iconfont', isCollapsed ? 'icon-zhankai' : 'icon-shouqi']" @click="isCollapsed = !isCollapsed;"></i>
      </div>
    </div>
    <transition name="slide-up">
      <div class="panel-content" v-show="!isCollapsed">
        <!-- 地区选择 -->
        <div class="area-select">
          <el-cascader v-model="shi_xian" :options="shi_xian_options" :loading="loadingShiXian" @change="handleChange" placeholder="请选择市县" />
          <el-cascader v-model="zhen_cun" :options="zhen_cun_options" :loading="loadingZhenCun" :disabled="loadingZhenCun || zhen_cun_options.length===0" @change="handleChange" placeholder="请选择镇村" />
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
                <el-option v-for="item in zw" :key="item.value" :label="item.label" :value="item.value" />
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
              <el-input v-model="searchText" :disabled="!selectField" placeholder="请输入搜索内容" class="custom-input">
                <template #prefix>
                  <i class="iconfont icon-sousuo"></i>
                </template>
              </el-input>
            </div>
          </div>

          <!-- 操作按钮 -->
          <div class="operation-buttons">
            <el-button type="primary" class="custom-button" @click="doSearch">查询</el-button>
            <el-button type="default" class="custom-button reset-btn" @click="doReset">重置</el-button>
          </div>
        </div>
      </div>
    </transition>
  </div>
</template>

<script setup>
import { ref, onMounted, watch } from 'vue';
import { JiangXiApi } from '../../api/api.js';

const emit = defineEmits(['update:filters', 'search', 'reset']);

const isCollapsed = ref(false);
let shi_xian = ref([]); // cascader value: [shi, xian]
let zhen_cun = ref([]); // cascader value: [zhen, cun]
const selectedMonth = ref('');
const selectType = ref('');
const selectField = ref('');
const searchText = ref('');

const shi_xian_options = ref([]);
const zhen_cun_options = ref([]);
const loadingShiXian = ref(false);
const loadingZhenCun = ref(false);

// build shi/xian options from API format: { data: [ { shi: '宜春市', xian: ['丰城市'] } ] }
const buildShiXianOptions = (data = []) => {
  return data.map(item => {
    const shi = item.shi;
    const xians = Array.isArray(item.xian) ? item.xian : [];
    return {
      value: shi,
      label: shi,
      children: xians.map(x => ({ value: x, label: x }))
    };
  });
};

// build zhen/cun options from API format: { data: [ { zhen: '小港镇', cun: ['青周村委会'] } ], shi, xian }
const buildZhenCunOptions = (data = []) => {
  return data.map(item => {
    const zhen = item.zhen;
    const cuns = Array.isArray(item.cun) ? item.cun : [];
    return {
      value: zhen,
      label: zhen,
      children: cuns.map(c => ({ value: c, label: c }))
    };
  });
};

const loadShiXianOptions = async () => {
  loadingShiXian.value = true;
  try {
    const res = await JiangXiApi.getShiXianDivison();
    const list = res?.data || [];
    shi_xian_options.value = buildShiXianOptions(list);
  } catch (err) {
    console.error('getShiXianDivison error', err);
    shi_xian_options.value = [];
  } finally {
    loadingShiXian.value = false;
  }
};

const loadZhenCunOptions = async (shi, xian) => {
  loadingZhenCun.value = true;
  try {
    const res = await JiangXiApi.getZhenCunDivison(shi, xian);
    // API 可能返回 { data: [...] , shi, xian } 或者 data 本身就是数组
    let list = [];
    if (!res) {
      list = [];
    } else if (Array.isArray(res)) {
      list = res;
    } else if (Array.isArray(res.data)) {
      list = res.data;
    } else if (res.data && typeof res.data === 'object') {
      // 有时后端会把单个对象放在 data 字段里
      list = [res.data];
    }

    // 规范化每项：若后端返回的是 { zhen: 'xx', cun: [...] }
    zhen_cun_options.value = buildZhenCunOptions(list || []);
  } catch (err) {
    console.error('getZhenCunDivison error', err);
    zhen_cun_options.value = [];
  } finally {
    loadingZhenCun.value = false;
  }
};

onMounted(() => {
  loadShiXianOptions();
});

// when shi_xian changes, reset zhen/cun and load new zhen options if city+county selected
watch(shi_xian, (newVal) => {
  // Only load zhen/cun when both shi and xian are selected (two-level selection)
  if (Array.isArray(newVal) && newVal.length === 2 && newVal[0] && newVal[1]) {
    // reset previous selection and options then load new ones
    zhen_cun.value = [];
    zhen_cun_options.value = [];
    loadZhenCunOptions(newVal[0], newVal[1]);
    emitFilters();
    return;
  }

  // If selection is cleared, also clear dependent values/options
  if (!newVal || (Array.isArray(newVal) && newVal.length === 0)) {
    zhen_cun.value = [];
    zhen_cun_options.value = [];
    emitFilters();
  }
}, { deep: true });

// emit current filters to parent
const emitFilters = () => {
  const [shi, xian] = Array.isArray(shi_xian.value) ? shi_xian.value : [];
  const [zhen, cun] = Array.isArray(zhen_cun.value) ? zhen_cun.value : [];
  const payload = {
    shi: shi || '',
    xian: xian || '',
    zhen: zhen || '',
    cun: cun || '',
    month: selectedMonth.value || '',
    zw: selectType.value || '',
    searchField: selectField.value || '',
    searchText: searchText.value || ''
  };
  emit('update:filters', payload);
};

// watch other filter inputs and emit updates
watch([selectedMonth, selectType, selectField, searchText, zhen_cun], () => {
  emitFilters();
});

// 当搜索字段被清空时，自动清除搜索文本并触发筛选更新
watch(selectField, (val) => {
  if (!val) {
    searchText.value = '';
    emitFilters();
  }
});

const zw = ref([
  { value: '水稻', label: '水稻' },
  { value: '玉米', label: '玉米' },
  { value: '小麦', label: '小麦' },
  { value: '棉花', label: '棉花' },
]);

const filterField = ref([
  { value: 'bdh', label: '保单号' },
  { value: 'xm', label: '农户姓名' },
  { value: 'sfz', label: '身份证号' },
]);

const handleChange = () => {
  emitFilters();
};

const doSearch = () => {
  emit('search', {
    filters: getCurrentFilters()
  });
};

const doReset = () => {
  shi_xian.value = [];
  zhen_cun.value = [];
  zhen_cun_options.value = [];
  selectedMonth.value = '';
  selectType.value = '';
  selectField.value = '';
  searchText.value = '';
  emit('reset');
  emitFilters();
};

const getCurrentFilters = () => {
  const [shi, xian] = Array.isArray(shi_xian.value) ? shi_xian.value : [];
  const [zhen, cun] = Array.isArray(zhen_cun.value) ? zhen_cun.value : [];
  return {
    shi: shi || '',
    xian: xian || '',
    zhen: zhen || '',
    cun: cun || '',
    month: selectedMonth.value || '',
    zw: selectType.value || '',
    searchField: selectField.value || '',
    searchText: searchText.value || ''
  };
};

defineExpose({
  reset: doReset,
  getCurrentFilters
});
</script>

<style scoped>
.contraction-list-panel {
  position: absolute;
  width: 450px;
  height: auto;
  max-height: 45vh;
  z-index: 3;
  bottom: 6vh;
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
