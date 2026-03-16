<template>
  <div class="contraction-list-panel" :class="{ 'collapsed': isCollapsed }">
    <div class="panel-header">
      <div class="header-title">
        保单列表
      </div>
      <div class="icons">
        <div class="icon-update">
          <i class="iconfont icon-shuaxin" @click="fetchOriginalData" title="刷新数据"></i>
        </div>
        <div class="collapse-icon">
          <i :class="['iconfont', isCollapsed ? 'icon-zhankai' : 'icon-shouqi']"
            @click="isCollapsed = !isCollapsed;"></i>
        </div>
      </div>

    </div>

    <transition name="slide-fade">
      <div class="panel-content" v-show="!isCollapsed">
        <div class="table-container">
          <div class="table-header">
            <div class="header-cell insured">被保险人</div>
            <div class="header-cell type">险种</div>
            <div class="header-cell area">面积/亩</div>
            <div class="header-cell village">村</div>
          </div>

          <div class="table-body">
            <div v-for="item in filteredPolicyList" :key="item.id" class="table-row"
              :class="{ 'active': activeId === item.id }" @click="handleItemClick(item)">
              <div class="cell insured">{{ item.insuredName }}</div>
              <div class="cell type">{{ item.insuranceType }}</div>
              <div class="cell area">{{ formatArea(item.area) }}</div>
              <div class="cell village">{{ item.village }}</div>
            </div>
          </div>
        </div>

        <div class="pagination-container">
          <div class="total-info">共{{ totalItems }}条记录</div>
          <div class="pagination">
            <div v-for="page in visiblePages" :key="page" class="page-item" :class="{
              'active': page === currentPage,
              'ellipsis': page === '...',
              'first': page === 1,
              'last': page === totalPages
            }" @click="handlePageClick(page)">
              {{ page }}
            </div>
          </div>
        </div>
      </div>
    </transition>
  </div>
</template>

<script setup>
import { ref, computed, defineEmits, inject, watch, onMounted } from 'vue';
import apiRegistry from '@/api/apiRegistry'

const emit = defineEmits(["sendContraction"])

// 从父组件接收查询载荷（响应式对象）
const props = defineProps({
  searchPayload: { type: Object, default: () => ({}) }
})

// 状态管理
const isCollapsed = ref(false);
const currentPage = ref(1);
const activeId = ref(null);
const totalItems = ref(0);
const totalPages = ref(0);
const isLoading = ref(false);

// 保单列表数据
const policyList = ref([]);

// 当前行政区
const areaMgr = inject('areaManager')
// 刷新数据
async function fetchOriginalData() {
  const response = await apiRegistry.execute('getContractedListByAreaManager', areaMgr)
  if (response && response.success) {
    // 获取分页信息
    const pagination = response.data.pagination;
    totalItems.value = pagination.total;
    totalPages.value = pagination.total_pages;

    // 处理数据列表 - 根据实际接口字段调整
    const dataList = response.data.data.map(el => ({
      id: el.gid || el.id,
      insuredName: el.xm, // 被保险人姓名
      insuranceType: el.zw, // 作物类型
      area: el.total_area, // 面积
      village: el.cun, // 村
      // 保留原始数据，便于后续使用
      originalData: el
    }));
    policyList.value = dataList;
  }

}

// 数据获取逻辑
const fetchPolicyData = async () => {
  if (isLoading.value) return;

  isLoading.value = true;
  try {
    // 构建符合后端 `getContractedListByAreaManager` 的额外参数
    const payload = (props && props.searchPayload) ? props.searchPayload : {};
    // 有些父组件会把查询条件放到 payload.filters 中，优先使用 filters
    const source = payload && payload.filters ? payload.filters : payload;
    const additionalParams = {
      page: currentPage.value,
      page_size: 15
    };

    // 支持作物类型和保单号等直接字段
    if (source.zw) additionalParams.zw = source.zw;
    if (source.bdh) additionalParams.bdh = source.bdh;

    // 将 searchField/searchText 转换为后端期望的字段名（xm 或 sfz）
    if (source.searchField && source.searchText) {
      const field = String(source.searchField).trim();
      const text = source.searchText;
      if (field === 'xm') additionalParams.xm = text;
      else if (field === 'sfz') additionalParams.sfz = text;
      else {
        additionalParams[field] = text;
      }
    }

    // 如果父组件传入了区域字段（或 filters 中包含），允许覆盖（通常 areaMgr 优先）
    ['sheng', 'shi', 'xian', 'zhen', 'cun'].forEach(key => {
      if (source[key]) additionalParams[key] = source[key];
    });

    console.log('additionalParams', additionalParams, 'source', source);

    const response = await apiRegistry.execute('getContractedListByAreaManager', areaMgr, additionalParams)

    if (response && response.success) {
      // 获取分页信息
      const pagination = response.data.pagination;
      totalItems.value = pagination.total;
      totalPages.value = pagination.total_pages;

      // 处理数据列表 - 根据实际接口字段调整
      const dataList = response.data.data.map(el => ({
        id: el.gid || el.id,
        insuredName: el.xm, // 被保险人姓名
        insuranceType: el.zw, // 作物类型
        area: el.total_area, // 面积
        village: el.cun, // 村
        // 保留原始数据，便于后续使用
        originalData: el
      }));

      policyList.value = dataList;
    }
  } catch (error) {
    console.error('查询失败:', error);
    // 可以添加错误提示
  } finally {
    isLoading.value = false;
  }
}

// 监听区域变化和页码变化
watch(
  [() => areaMgr?.slots?.value, currentPage, () => props && props.searchPayload],
  async () => {
    await fetchPolicyData();
  },
  { deep: true, immediate: true }
)

// 当父组件传入的查询条件变化时，重置到第一页
watch(
  () => (props && props.searchPayload) || {},
  (newVal, oldVal) => {
    if (JSON.stringify(newVal) !== JSON.stringify(oldVal)) {
      currentPage.value = 1;
    }
  },
  { deep: true }
)

// 组件挂载时获取数据
onMounted(() => {
  fetchPolicyData();
})

// 过滤后的保单列表
const filteredPolicyList = computed(() => {
  // console.log('policyList', policyList.value);
  for (const [index, item] of policyList.value.entries()) {
    item.id = `${item.id}-${index}`;
  }
  return policyList.value;
});

// 计算可见页码
const visiblePages = computed(() => {
  const pages = [];
  const total = totalPages.value;

  if (total <= 0) return pages;

  // 如果总页数少于等于7页，显示所有页码
  if (total <= 7) {
    for (let i = 1; i <= total; i++) {
      pages.push(i);
    }
  } else {
    // 当前页在开头部分
    if (currentPage.value <= 4) {
      for (let i = 1; i <= 5; i++) {
        pages.push(i);
      }
      pages.push('...');
      pages.push(total);
    }
    // 当前页在末尾部分
    else if (currentPage.value >= total - 3) {
      pages.push(1);
      pages.push('...');
      for (let i = total - 4; i <= total; i++) {
        pages.push(i);
      }
    }
    // 当前页在中间
    else {
      pages.push(1);
      pages.push('...');
      pages.push(currentPage.value - 1);
      pages.push(currentPage.value);
      pages.push(currentPage.value + 1);
      pages.push('...');
      pages.push(total);
    }
  }

  return pages;
});

// 方法
const handleItemClick = (item) => {
  activeId.value = item.id;
  emit("sendContraction", item);
  // console.log('选中保单:', item);
};

const handlePageClick = (page) => {
  if (page === '...' || page === currentPage.value) return;
  currentPage.value = page;
};

// 格式化面积
const formatArea = (value) => {
  if (!value) return '0';
  const num = parseFloat(value);
  return isNaN(num) ? '0' : num.toFixed(2);
};

// 格式化金额（保留，可能后续会用到）
const formatCurrency = (value) => {
  if (value === 0 || !value) return '0';
  return new Intl.NumberFormat('zh-CN', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2
  }).format(value);
};
</script>

<style scoped>
.contraction-list-panel {
  position: absolute;
  width: 430px;
  height: auto;
  max-height: 75vh;
  z-index: 3;
  top: 15%;
  right: 20px;
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

.icons {
  display: flex;
  direction: row;
  gap: 12px;
}

.icon-update {
  color: #409cff;
  font-size: 18px;
  transition: transform 0.3s ease, color 0.3s ease;
  padding: 4px;
  border-radius: 4px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.icon-update:hover {
  background: rgba(64, 156, 255, 0.1);
  transform: scale(1.1);
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

.panel-content {
  display: flex;
  flex-direction: column;
  flex: 1;
  height: 100%;
  padding: 20px;
  overflow: hidden;
  gap: 20px;
}

/* 表格区域 */
.table-container {
  display: flex;
  flex-direction: column;
  flex: 1;
  background: rgba(10, 18, 35, 0.5);
  border-radius: 8px;
  overflow: hidden;
  border: 1px solid rgba(64, 156, 255, 0.1);
  min-height: 0;
  overflow-x: auto;
}

.table-header {
  display: flex;
  background: rgba(20, 30, 50, 0.8);
  padding: 12px 16px;
  border-bottom: 1px solid rgba(64, 156, 255, 0.1);
  font-size: 13px;
  color: #8a9bb8;
  font-weight: 500;
  flex-shrink: 0;
  white-space: nowrap;
  min-width: 100%;
}

.table-body {
  flex: 1;
  overflow-y: auto;
  min-height: 0;
  max-height: calc(100% - 44px);
  min-width: 100%;
}

.table-row {
  display: flex;
  padding: 12px 16px;
  border-bottom: 1px solid rgba(64, 156, 255, 0.05);
  cursor: pointer;
  transition: all 0.2s ease;
  font-size: 13px;
  align-items: center;
  min-height: 44px;
  white-space: nowrap;
  min-width: 100%;
}

.table-row:hover {
  background: rgba(64, 156, 255, 0.05);
}

.table-row.active {
  background: rgba(64, 156, 255, 0.1);
  border-left: 3px solid #409cff;
}

.header-cell,
.cell {
  padding: 0 8px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  box-sizing: border-box;
}

/* 调整列宽比例 */
.insured {
  flex: 1.5;
  min-width: 100px;
  max-width: 120px;
}

.type {
  flex: 1;
  min-width: 80px;
  max-width: 80px;
}

.area {
  flex: 1;
  min-width: 80px;
  max-width: 80px;
  /* text-align: right; */
  font-family: 'SF Mono', Monaco, 'Cascadia Mono', 'Segoe UI Mono', monospace;
  color: #f0b90b;
  font-weight: 500;
}

.village {
  flex: 1.2;
  min-width: 100px;
  max-width: 120px;
  color: #8a9bb8;
}

/* 分页容器 */
.pagination-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
  padding-top: 15px;
  border-top: 1px solid rgba(64, 156, 255, 0.1);
  flex-shrink: 0;
  margin-top: auto;
}

.total-info {
  font-size: 12px;
  color: #8a9bb8;
  align-self: flex-start;
  margin-left: 8px;
}

.pagination {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 6px;
  width: 100%;
  overflow: hidden;
}

.page-item {
  min-width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 4px;
  background: rgba(30, 40, 60, 0.6);
  cursor: pointer;
  font-size: 12px;
  transition: all 0.2s ease;
  border: 1px solid transparent;
  padding: 0 8px;
  white-space: nowrap;
}

.page-item:hover:not(.ellipsis) {
  background: rgba(64, 156, 255, 0.1);
  border-color: rgba(64, 156, 255, 0.3);
}

.page-item.active {
  background: rgba(64, 156, 255, 0.2);
  color: #409cff;
  border-color: #409cff;
  font-weight: 500;
}

.page-item.ellipsis {
  background: transparent;
  cursor: default;
  min-width: 20px;
  color: #8a9bb8;
  letter-spacing: 1px;
}

.page-item.first,
.page-item.last {
  min-width: 40px;
}

/* 滚动条样式 */
.table-body::-webkit-scrollbar {
  width: 6px;
}

.table-body::-webkit-scrollbar-track {
  background: rgba(10, 18, 35, 0.3);
  border-radius: 3px;
}

.table-body::-webkit-scrollbar-thumb {
  background: rgba(64, 156, 255, 0.3);
  border-radius: 3px;
}

.table-body::-webkit-scrollbar-thumb:hover {
  background: rgba(64, 156, 255, 0.5);
}

/* 横向滚动条 */
.table-container::-webkit-scrollbar {
  height: 6px;
}

.table-container::-webkit-scrollbar-track {
  background: rgba(10, 18, 35, 0.3);
  border-radius: 3px;
}

.table-container::-webkit-scrollbar-thumb {
  background: rgba(64, 156, 255, 0.3);
  border-radius: 3px;
}

.table-container::-webkit-scrollbar-thumb:hover {
  background: rgba(64, 156, 255, 0.5);
}
</style>
