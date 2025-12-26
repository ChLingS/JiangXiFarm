<template>
    <div class="contraction-list-panel" :class="{ 'collapsed': isCollapsed }">
        <div class="panel-header" @click="isCollapsed = !isCollapsed;">
            <div class="header-title">
                保单列表
            </div>
            <div class="collapse-icon">
                <i :class="['iconfont', isCollapsed ? 'icon-zhankai' : 'icon-shouqi']"></i>
            </div>
        </div>

        <transition name="slide-fade">
            <div class="panel-content" v-show="!isCollapsed">
                <div class="filter-section">
                    <div class="date-selection">
                        <el-date-picker v-model="selectedMonth" type="month" placeholder="选择月份" format="YYYY年MM月"
                            value-format="YYYY-MM" />
                    </div>
                    <div class="search-input">
                        <el-input v-model="searchText" placeholder="请输入" clearable>
                            <template #prefix>
                                <i class="iconfont icon-sousuo"></i>
                            </template>
                        </el-input>
                    </div>
                </div>

                <div class="table-container">
                    <div class="table-header">
                        <div class="header-cell insured">被保险人</div>
                        <div class="header-cell type">险种</div>
                        <div class="header-cell premium">总保费/元</div>
                        <div class="header-cell claim">总赔款/元</div>
                    </div>

                    <div class="table-body">
                        <div v-for="item in filteredPolicyList" :key="item.id" class="table-row"
                            :class="{ 'active': activeId === item.id }" @click="handleItemClick(item)">
                            <div class="cell insured">{{ item.insuredName }}</div>
                            <div class="cell type">{{ item.insuranceType }}</div>
                            <div class="cell premium">{{ formatCurrency(item.totalPremium) }}</div>
                            <div class="cell claim" :class="{ 'no-claim': item.totalClaim === 0 }">
                                {{ formatCurrency(item.totalClaim) }}
                            </div>

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
import { ref, computed, onMounted, onUnmounted, defineEmits } from 'vue';

const emit = defineEmits("sendContraction")

// 状态管理
const isCollapsed = ref(false);
const selectedMonth = ref('');
const searchText = ref('');
const currentPage = ref(1);
const activeId = ref(null);
const pageSize = 10;
const totalItems = 3290; // 根据图片显示有329页，每页10条，总共约3290条
const totalPages = 329; // 图片显示总共有329页

// 保单列表数据
const policyList = ref([
    { id: 1, insuredName: '张*明', insuranceType: '玉米', totalPremium: 945, totalClaim: 0 },
    { id: 2, insuredName: '何*', insuranceType: '玉米', totalPremium: 13500, totalClaim: 0 },
    { id: 3, insuredName: '德江县...', insuranceType: '玉米', totalPremium: 9765, totalClaim: 0 },
    { id: 4, insuredName: '德江县...', insuranceType: '玉米', totalPremium: 12195, totalClaim: 0 },
    { id: 5, insuredName: '吴*春', insuranceType: '玉米', totalPremium: 4635, totalClaim: 0 },
    { id: 6, insuredName: '杨*正', insuranceType: '水稻', totalPremium: 1736.86, totalClaim: 0 },
    { id: 7, insuredName: '王*收', insuranceType: '玉米', totalPremium: 57180.69, totalClaim: 0 },
    { id: 8, insuredName: '付*', insuranceType: '水稻', totalPremium: 6720, totalClaim: 0 },
    { id: 9, insuredName: '何*领', insuranceType: '玉米', totalPremium: 43923.6, totalClaim: 0 },
    { id: 10, insuredName: '韦*云', insuranceType: '水稻', totalPremium: 5342.4, totalClaim: 0 },
    { id: 11, insuredName: '何*泽', insuranceType: '玉米', totalPremium: 18987.3, totalClaim: 0 },
    { id: 12, insuredName: '李*华', insuranceType: '水稻', totalPremium: 3250, totalClaim: 0 },
    { id: 13, insuredName: '王*明', insuranceType: '玉米', totalPremium: 7890, totalClaim: 0 },
    { id: 14, insuredName: '刘*伟', insuranceType: '玉米', totalPremium: 4520, totalClaim: 0 },
    { id: 15, insuredName: '陈*强', insuranceType: '水稻', totalPremium: 6800, totalClaim: 0 }
]);

// 过滤后的保单列表
const filteredPolicyList = computed(() => {
    return policyList.value;
});

// 计算可见页码
const visiblePages = computed(() => {
    const pages = [];

    // 如果总页数少于等于7页，显示所有页码
    if (totalPages <= 7) {
        for (let i = 1; i <= totalPages; i++) {
            pages.push(i);
        }
    } else {
        // 当前页在开头部分
        if (currentPage.value <= 4) {
            for (let i = 1; i <= 5; i++) {
                pages.push(i);
            }
            pages.push('...');
            pages.push(totalPages);
        }
        // 当前页在末尾部分
        else if (currentPage.value >= totalPages - 3) {
            pages.push(1);
            pages.push('...');
            for (let i = totalPages - 4; i <= totalPages; i++) {
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
            pages.push(totalPages);
        }
    }

    return pages;
});

// 方法
const handleItemClick = (item) => {
    activeId.value = item.id;
    emit("sendContraction", item)
    console.log('选中保单:', item);
};

const handlePageClick = (page) => {
    if (page === '...' || page === currentPage.value) return;
    currentPage.value = page;
    // 这里应该触发数据重新加载
    console.log('切换到第', page, '页');
};

const formatCurrency = (value) => {
    if (value === 0) return '0';
    return new Intl.NumberFormat('zh-CN', {
        minimumFractionDigits: 0,
        maximumFractionDigits: 2
    }).format(value);
};
</script>

<style scoped>
.contraction-list-panel {
    position: absolute;
    width: 450px;
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

.filter-section {
    display: flex;
    gap: 12px;
    flex-shrink: 0;
}

.date-selection,
.search-input {
    flex: 1;
}

:deep(.el-date-editor) {
    width: 100%;
    background: rgba(30, 40, 60, 0.8);
    border: 1px solid rgba(64, 156, 255, 0.2);
    border-radius: 6px;
}

:deep(.el-date-editor .el-input__wrapper) {
    background: transparent;
    box-shadow: none;
    border: none;
}

:deep(.el-date-editor .el-input__inner) {
    color: #e0e0e0;
}

:deep(.el-input) {
    background: rgba(30, 40, 60, 0.8);
    border-radius: 6px;
    border: 1px solid rgba(64, 156, 255, 0.2);
}

:deep(.el-input__wrapper) {
    background: transparent;
    box-shadow: none;
}

:deep(.el-input__inner) {
    color: #e0e0e0;
}

:deep(.el-input .iconfont) {
    color: rgba(224, 224, 224, 0.6);
    margin-right: 8px;
}

/* 表格区域 - 调整列宽避免横向滚动条 */
.table-container {
    display: flex;
    flex-direction: column;
    flex: 1;
    background: rgba(10, 18, 35, 0.5);
    border-radius: 8px;
    overflow: hidden;
    border: 1px solid rgba(64, 156, 255, 0.1);
    min-height: 0;
    /* 禁止横向滚动条 */
    overflow-x: hidden;
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
    /* 确保所有列在一行内，不换行 */
    white-space: nowrap;
}

.table-body {
    flex: 1;
    overflow-y: auto;
    min-height: 0;
    max-height: calc(100% - 44px);
    /* 禁止横向滚动条 */
    overflow-x: hidden;
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
    /* 确保所有列在一行内，不换行 */
    white-space: nowrap;
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
    /* 调整列宽，确保不出现横向滚动条 */
    box-sizing: border-box;
}

/* 根据图片中的实际显示比例调整列宽 */
.insured {
    flex: 1.5;
    /* 被保险人列相对较宽 */
    min-width: 100px;
    max-width: 120px;
}

.type {
    flex: 0.8;
    /* 险种列较窄 */
    min-width: 60px;
    max-width: 80px;
}

.premium,
.claim {
    flex: 1;
    /* 保费和赔款列宽度相同 */
    min-width: 100px;
    max-width: 120px;
    text-align: right;
    font-family: 'SF Mono', Monaco, 'Cascadia Mono', 'Segoe UI Mono', monospace;
    font-size: 12px;
    /* 减小字体大小，确保数字完整显示 */
}

.cell.premium {
    color: #f0b90b;
    font-weight: 500;
}

.cell.claim.no-claim {
    color: #8a9bb8;
}

.cell.claim:not(.no-claim) {
    color: #0ecb81;
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
</style>