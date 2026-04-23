<template>
  <div class="dashboard-container">
    <!-- 左侧侧边栏目录 -->
    <div class="sidebar" :class="{ 'sidebar-collapsed': isCollapsed }">
      <div class="sidebar-toggle" @click="isCollapsed = !isCollapsed">
        <svg v-if="!isCollapsed" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M9 18l-6-6 6-6"></path>
        </svg>
        <svg v-else viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M15 18l6-6-6-6"></path>
        </svg>
      </div>
      <div class="sidebar-content" v-show="!isCollapsed">
        <div class="sidebar-title">驾驶舱目录</div>
        <ul class="sidebar-menu">
          <li
            v-for="item in menuItems"
            :key="item.id"
            :class="{ 'active': item.visible }"
            @click="togglePanel(item.id)"
          >
            <span class="menu-icon">{{ item.icon }}</span>
            <span class="menu-text">{{ item.name }}</span>
            <span class="menu-toggle">{{ item.visible ? '✓' : '' }}</span>
          </li>
        </ul>
      </div>
    </div>

    <!-- 图表内容区域 -->
    <div class="charts-wrapper">
    <div class="g2-left">
        <div
          v-show="panelVisibility.columnChart"
          class="g2-chart g2-chart-left g2-chart-bar"
        >
          <div class="border-decor"></div>
        <div class="people-sum">江西各市耕地面积（单位平方千米）</div>
          <el-card class="bar-chart-card" shadow="never">
            <BarChart v-bind="barConfig" :data="data" />
          </el-card>
      </div>
        <div
          v-show="panelVisibility.roseChart"
          class="g2-chart g2-chart-left g2-chart-rose"
        >
          <div class="border-decor"></div>
        <div class="people-sum">目前各市更新数据占比</div>
          <el-card class="pie-chart-card" shadow="never">
            <PieChart v-bind="bus_config" :data="bus_data" />
          </el-card>
      </div>
    </div>
    <div class="g2-right">
        <div
          v-show="panelVisibility.fieldData"
          class="g2-chart"
          style="height:32%"
        >
          <div class="border-decor"></div>
        <div class="people-sum">田块数据</div>
          <el-card class="field-data-card" shadow="never">
            <el-space direction="vertical" :size="16" style="width: 100%;">
              <div class="statistic-item">
                <div class="statistic-title">总田块数</div>
                <div class="statistic-value">12,580 <span class="statistic-suffix">块</span></div>
        </div>
              <div class="statistic-item">
                <div class="statistic-title">总面积</div>
                <div class="statistic-value">45,230 <span class="statistic-suffix">km²</span></div>
      </div>

            </el-space>
          </el-card>
        </div>
        <div
          v-show="panelVisibility.onlineStaff"
          class="g2-chart"
          style="height:40%"
        >
          <div class="border-decor"></div>
        <div class="people-sum">在线人员</div>
          <el-card class="staff-card" shadow="never">
            <el-space :size="16" wrap>
              <el-card class="staff-item-card" shadow="never">
                <el-space>
                  <el-avatar :size="48" src="../assets/icons/开发人员.png" />
                  <div>
                    <div class="staff-title">开发人员</div>
                    <div class="staff-value">4 <span class="staff-suffix">人</span></div>
          </div>
                </el-space>
              </el-card>
              <el-card class="staff-item-card" shadow="never">
                <el-space>
                  <el-avatar :size="48" src="../assets/icons/工程勘测.png" />
                  <div>
                    <div class="staff-title">外业人员</div>
                    <div class="staff-value">12 <span class="staff-suffix">人</span></div>
          </div>
                </el-space>
              </el-card>
              <el-card class="staff-item-card" shadow="never">
                <el-space>
                  <el-avatar :size="48" src="../assets/icons/校对.png" />
                  <div>
                    <div class="staff-title">校对人员</div>
                    <div class="staff-value">20 <span class="staff-suffix">人</span></div>
          </div>
                </el-space>
              </el-card>
            </el-space>
          </el-card>
        </div>
        <div
          v-show="panelVisibility.progress"
          class="g2-chart"
          style="height:30%"
        >
          <div class="border-decor"></div>
        <div class="people-sum">当前进展</div>
          <el-card class="progress-card" shadow="never">
            <el-timeline>
              <el-timeline-item color="#00d4ff">
                <div class="progress-item">
                  <div class="progress-label">已经完成地市</div>
                  <div class="progress-value">5 <span class="progress-suffix">个</span></div>
          </div>
              </el-timeline-item>
              <el-timeline-item color="#00b7ff">
                <div class="progress-item">
                  <div class="progress-label">正在进行中</div>
                  <el-tag type="info" size="large">南昌县</el-tag>
          </div>
              </el-timeline-item>
            </el-timeline>
          </el-card>
        </div>
      </div>
    </div>
  </div>
</template>
<script setup>
import { ref, reactive, onMounted, onUnmounted, computed, nextTick, onActivated, watch } from 'vue';
import { PieChart, BarChart } from "@opd/g2plot-vue";
// 使用 Element Plus 组件
// Element Plus 已全局注册，无需单独导入

/* 出行人口 */
import { useLeftTop } from '@/Hooks/useLeftTop';
import { useLeftBottom } from '@/Hooks/useLeftBottom'
const { data, config } = useLeftTop();
const { bus_config, bus_data } = useLeftBottom();

// 横向柱状图配置（科技风格）
const barConfig = computed(() => {
  // config 是普通对象，不是 ref，所以不需要 .value
  const baseConfig = config || {};
  return {
    ...baseConfig,
    // 科技风格配色
    color: ({ value }) => {
      if (value > 50000) {
        return '#00d4ff'; // 高值 - 青色
      } else if (value > 35000) {
        return '#00b7ff'; // 中高值 - 蓝色
      } else {
        return '#00a0e9'; // 低值 - 深蓝色
      }
    },
    // 增强标签样式
    label: {
      ...(baseConfig.label || {}),
      style: {
        fill: '#FFFFFF',
        opacity: 0.95,
        fontSize: 12,
        fontWeight: 'bold',
        textShadow: '0 0 8px rgba(0, 183, 255, 0.8)',
      },
    },
  };
});


// 侧边栏折叠状态 - 默认展开
const isCollapsed = ref(false);

// 板块显示状态 - 默认全部隐藏
const panelVisibility = reactive({
  columnChart: false,
  roseChart: false,
  fieldData: false,
  onlineStaff: false,
  progress: false
});

// 菜单项配置 - 默认全部未选中
const menuItems = ref([
  {
    id: 'columnChart',
    name: '耕地面积',
    icon: '📊',
    visible: false
  },
  {
    id: 'roseChart',
    name: '数据占比',
    icon: '📈',
    visible: false
  },
  {
    id: 'fieldData',
    name: '田块数据',
    icon: '🌾',
    visible: false
  },
  {
    id: 'onlineStaff',
    name: '在线人员',
    icon: '👥',
    visible: false
  },
  {
    id: 'progress',
    name: '当前进展',
    icon: '📋',
    visible: false
  }
]);

// 切换板块显示
const togglePanel = (panelId) => {
  panelVisibility[panelId] = !panelVisibility[panelId];
  const menuItem = menuItems.value.find(item => item.id === panelId);
  if (menuItem) {
    menuItem.visible = panelVisibility[panelId];
  }
};

// 确保侧边栏展开的函数
const ensureSidebarVisible = () => {
  isCollapsed.value = false;
  nextTick(() => {
    if (isCollapsed.value) {
      isCollapsed.value = false;
    }
  });
};

// 组件挂载时自动展开侧边栏
// 修复饼图中心统计文字颜色 - 使用更强制的方法
// 存储 observer 和 interval 以便清理
let pieChartObserver = null;
let pieChartIntervalId = null;

const fixPieChartStatisticColor = () => {
  nextTick(() => {
    // 查找饼图容器
    const pieChartContainer = document.querySelector('.g2-chart-rose .g2-plot');
    if (!pieChartContainer) {
      console.log('饼图容器未找到');
      return;
    }

    // 查找 SVG 元素
    const svg = pieChartContainer.querySelector('svg');
    if (!svg) {
      console.log('SVG 元素未找到');
      return;
    }

    // 如果已经存在 observer 和 interval，先清理
    if (pieChartObserver) {
      pieChartObserver.disconnect();
      pieChartObserver = null;
    }
    if (pieChartIntervalId) {
      clearInterval(pieChartIntervalId);
      pieChartIntervalId = null;
    }

    // 获取 SVG 的中心点（用于判断文本是否在中心区域）
    const svgRect = svg.getBoundingClientRect();
    const centerX = svgRect.width / 2;
    const centerY = svgRect.height / 2;

    // 查找所有 text 元素
    const allTexts = svg.querySelectorAll('text');
    console.log(`找到 ${allTexts.length} 个 text 元素`);

    allTexts.forEach((text) => {
      // 获取文本位置
      const textX = parseFloat(text.getAttribute('x')) || 0;
      const textY = parseFloat(text.getAttribute('y')) || 0;

      // 检查文本是否在中心区域（statistic 文本通常在中心）
      const isInCenter = Math.abs(textX - centerX) < centerX * 0.3 &&
                         Math.abs(textY - centerY) < centerY * 0.3;

      // 或者检查父元素是否包含 statistic 相关类名
      let parent = text.parentElement;
      let hasStatisticClass = false;
      while (parent && parent !== svg) {
        const className = parent.getAttribute('class') || '';
        if (className.includes('statistic') ||
            className.includes('Statistic') ||
            className.includes('STATISTIC')) {
          hasStatisticClass = true;
          break;
        }
        parent = parent.parentElement;
      }

      // 如果文本在中心区域或父元素有 statistic 类名，强制设置为白色
      if (isInCenter || hasStatisticClass) {
        // 强制设置 fill 属性（多种方式确保生效）
        text.setAttribute('fill', '#ffffff');
        text.setAttributeNS(null, 'fill', '#ffffff');
        text.style.setProperty('fill', '#ffffff', 'important');
        text.style.fill = '#ffffff';
        text.style.opacity = '1';
        text.style.fontWeight = '700';

        // 移除可能存在的 currentColor
        if (text.getAttribute('fill') === 'currentColor') {
          text.removeAttribute('fill');
          text.setAttribute('fill', '#ffffff');
        }

        // 检查文本内容，如果是数字或"总计"，确保是白色
        const textContent = text.textContent?.trim();
        if (textContent && (textContent === '总计' || /^\d+[,\d]*$/.test(textContent.replace(/,/g, '')))) {
          text.setAttribute('fill', '#ffffff');
          text.style.setProperty('fill', '#ffffff', 'important');
          console.log(`已修复文本颜色: ${textContent}`);
        }
      }
    });

    // 使用 MutationObserver 持续监听并修复
    pieChartObserver = new MutationObserver(() => {
      fixTextColors(svg);
    });

    pieChartObserver.observe(svg, {
      childList: true,
      subtree: true,
      attributes: true,
      attributeFilter: ['fill', 'style', 'x', 'y']
    });

    // 使用 setInterval 持续检查和修复（每 500ms 检查一次）
    pieChartIntervalId = setInterval(() => {
      fixTextColors(svg);
    }, 500);
  });
};

// 修复文本颜色的辅助函数
const fixTextColors = (svg) => {
  if (!svg) return;

  const allTexts = svg.querySelectorAll('text');
  allTexts.forEach((text) => {
    const textContent = text.textContent?.trim();

    // 如果是"总计"或数字，强制设置为白色
    if (textContent && (textContent === '总计' || /^\d+[,\d]*$/.test(textContent.replace(/,/g, '')))) {
      const currentFill = text.getAttribute('fill') || text.style.fill || window.getComputedStyle(text).fill;

      // 检查是否是灰色或非白色
      const isGray = currentFill && (
        currentFill.includes('gray') ||
        currentFill.includes('grey') ||
        currentFill.includes('#666') ||
        currentFill.includes('#999') ||
        currentFill.includes('#ccc') ||
        currentFill.includes('rgb(102') ||
        currentFill.includes('rgb(153') ||
        currentFill.includes('rgb(204') ||
        currentFill === 'currentColor'
      );

      if (isGray || (currentFill !== '#ffffff' && currentFill !== 'rgb(255, 255, 255)' && currentFill !== '#fff')) {
        // 强制设置所有可能的属性
        text.setAttribute('fill', '#ffffff');
        text.setAttributeNS(null, 'fill', '#ffffff');
        text.style.setProperty('fill', '#ffffff', 'important');
        text.style.fill = '#ffffff';
        text.style.opacity = '1';
        text.style.fontWeight = '700';

        // 移除可能存在的 currentColor
        if (text.getAttribute('fill') === 'currentColor') {
          text.removeAttribute('fill');
          text.setAttribute('fill', '#ffffff');
        }
      }
    }
  });
};

onMounted(() => {
  ensureSidebarVisible();
  // 多次尝试修复，确保图表完全渲染后再修复
  setTimeout(() => fixPieChartStatisticColor(), 300);
  setTimeout(() => fixPieChartStatisticColor(), 800);
  setTimeout(() => fixPieChartStatisticColor(), 1500);
  setTimeout(() => fixPieChartStatisticColor(), 2500);
  // 监听窗口大小变化
  window.addEventListener('resize', fixPieChartStatisticColor);
});

// 组件激活时（keep-alive）确保侧边栏显示
onActivated(() => {
  ensureSidebarVisible();
  // 重新应用颜色修复
  setTimeout(() => {
    fixPieChartStatisticColor();
  }, 500);
});

// 监听饼图显示状态，当显示时修复颜色
watch(() => panelVisibility.roseChart, (isVisible) => {
  if (isVisible) {
    // 多次尝试修复
    setTimeout(() => fixPieChartStatisticColor(), 100);
    setTimeout(() => fixPieChartStatisticColor(), 500);
    setTimeout(() => fixPieChartStatisticColor(), 1000);
    setTimeout(() => fixPieChartStatisticColor(), 2000);
  }
});

// 组件卸载时清理 observer 和 interval
onUnmounted(() => {
  if (pieChartObserver) {
    pieChartObserver.disconnect();
    pieChartObserver = null;
  }
  if (pieChartIntervalId) {
    clearInterval(pieChartIntervalId);
    pieChartIntervalId = null;
  }
  // 兼容旧代码的清理逻辑
  if (window.pieChartIntervals) {
    window.pieChartIntervals.forEach(id => clearInterval(id));
    window.pieChartIntervals = [];
  }
  // 清理窗口大小监听
  window.removeEventListener('resize', fixPieChartStatisticColor);
});

</script>
<style>
.dashboard-container {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100vh;
  overflow: visible;
  z-index: 999;
  pointer-events: none;
}

.dashboard-container > * {
  pointer-events: auto;
}

/* 左侧侧边栏 */
.sidebar {
  position: fixed;
  left: 0;
  top: 90px;
  width: 220px;
  height: calc(100vh - 110px);
  max-height: calc(100vh - 110px);
  z-index: 100;
  background: linear-gradient(135deg,
    rgba(10, 25, 47, 0.95) 0%,
    rgba(15, 35, 60, 0.92) 50%,
    rgba(10, 30, 50, 0.95) 100%);
  border: 2px solid rgba(64, 156, 255, 0.4);
  border-left: none;
  border-radius: 0 12px 12px 0;
  box-shadow:
    0 8px 32px rgba(0, 0, 0, 0.6),
    0 0 20px rgba(0, 183, 255, 0.15);
  backdrop-filter: blur(8px);
  transition: all 0.3s ease;
  overflow: hidden;
}

.sidebar-collapsed {
  width: 50px;
}

.sidebar-toggle {
  position: absolute;
  top: 10px;
  right: 10px;
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  color: #00b7ff;
  background: rgba(0, 183, 255, 0.1);
  border: 1px solid rgba(64, 156, 255, 0.3);
  border-radius: 6px;
  transition: all 0.3s ease;
  z-index: 10;
}

.sidebar-toggle:hover {
  background: rgba(0, 183, 255, 0.2);
  border-color: rgba(64, 156, 255, 0.5);
  box-shadow: 0 0 10px rgba(0, 183, 255, 0.3);
}

.sidebar-toggle svg {
  width: 18px;
  height: 18px;
}

.sidebar-content {
  padding: 20px 15px;
  padding-top: 50px;
  height: 100%;
  overflow-y: auto;
}

/* 侧边栏滚动条样式 */
.sidebar-content::-webkit-scrollbar {
  width: 6px;
}

.sidebar-content::-webkit-scrollbar-track {
  background: rgba(10, 25, 47, 0.5);
  border-radius: 3px;
}

.sidebar-content::-webkit-scrollbar-thumb {
  background: linear-gradient(135deg, #00b7ff, #00d4ff);
  border-radius: 3px;
  transition: background 0.3s ease;
}

.sidebar-content::-webkit-scrollbar-thumb:hover {
  background: linear-gradient(135deg, #00d4ff, #00b7ff);
}

.sidebar-title {
  color: #00b7ff;
  font-size: 18px;
  font-weight: 600;
  text-align: center;
  margin-bottom: 20px;
  padding-bottom: 15px;
  border-bottom: 1px solid rgba(64, 156, 255, 0.3);
  text-shadow: 0 0 10px rgba(0, 183, 255, 0.5);
}

.sidebar-menu {
  list-style: none;
  padding: 0;
  margin: 0;
}

.sidebar-menu li {
  display: flex;
  align-items: center;
  padding: 12px 15px;
  margin-bottom: 8px;
  color: #e0e0e0;
  cursor: pointer;
  border-radius: 8px;
  border: 1px solid transparent;
  transition: all 0.3s ease;
  background: rgba(0, 0, 0, 0.2);
}

.sidebar-menu li:hover {
  background: rgba(0, 183, 255, 0.15);
  border-color: rgba(64, 156, 255, 0.3);
  transform: translateX(5px);
}

.sidebar-menu li.active {
  background: rgba(0, 183, 255, 0.2);
  border-color: rgba(64, 156, 255, 0.5);
  box-shadow: 0 0 15px rgba(0, 183, 255, 0.3);
}

.menu-icon {
  font-size: 20px;
  margin-right: 12px;
  width: 24px;
  text-align: center;
}

.menu-text {
  flex: 1;
  font-size: 14px;
  font-weight: 500;
}

.menu-toggle {
  width: 20px;
  height: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #00d4ff;
  font-weight: bold;
  font-size: 16px;
}

/* 图表容器包装 */
.charts-wrapper {
  transition: all 0.3s ease;
}

.g2-left,
.g2-right {
  position: absolute;
  z-index: 3;
  width: 25vw;
  top: 3vh;
  height: calc(100vh - 80px);
  max-height: calc(100vh - 80px);
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
  gap: px;
  /* 允许标题显示在容器外，但内容区域需要控制 */
  overflow: visible !important;
  padding-top: 50px;
  box-sizing: border-box;
}

.g2-right {
  right: 60px;
}

.g2-left {
  left: 240px;
  transition: left 0.3s ease;
}

.g2-right {
  right: 60px;
}

/* 当侧边栏展开时 */
.sidebar:not(.sidebar-collapsed) ~ .charts-wrapper .g2-left {
  left: 240px;
}

/* 当侧边栏折叠时 */
.sidebar.sidebar-collapsed ~ .charts-wrapper .g2-left {
  left: 70px;
}

.g2-chart {
  border-radius: 12px;
  padding: 12px;
  padding-top: 45px;
  padding-bottom: 12px;
  width: 100%;
  /* 降低透明度，提高对比度 - 使用更不透明的深色背景 */
  background: linear-gradient(135deg,
    rgba(10, 25, 47, 0.95) 0%,
    rgba(15, 35, 60, 0.92) 50%,
    rgba(10, 30, 50, 0.95) 100%);
  position: relative;
  /* 添加边框和阴影增强对比 */
  border: 2px solid rgba(64, 156, 255, 0.4);
  box-shadow:
    0 8px 32px rgba(0, 0, 0, 0.6),
    0 0 0 1px rgba(0, 183, 255, 0.2) inset,
    0 0 20px rgba(0, 183, 255, 0.15);
  backdrop-filter: blur(8px);
  /* 允许标题显示在容器上方 */
  overflow: visible;
  /* 确保内容不被裁剪 */
  box-sizing: border-box;
  /* 允许图表容器根据内容自适应 */
  display: flex;
  flex-direction: column;
  /* 默认最小高度 */
  min-height: 200px;
}

/* 当容器只包含柱状图时，让基础容器也自适应高度 */
.g2-chart.g2-chart-bar {
  min-height: auto !important;
  height: auto !important;
  /* 确保容器高度完全由内容决定 */
  align-items: flex-start;
}

/* 强制让包含柱状图的左侧容器自适应高度 */
.g2-left:has(.g2-chart-bar) {
  height: auto !important;
  min-height: auto !important;
  max-height: none !important;
}

.g2-left:has(.g2-chart-bar) .g2-chart-left,
.g2-chart-left:has(.g2-chart-bar) {
  height: auto !important;
  min-height: auto !important;
  max-height: none !important;
}

/* 添加背景装饰层（网格线条） */
.g2-chart::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background:
    repeating-linear-gradient(90deg,
      transparent,
      transparent 40px,
      rgba(64, 156, 255, 0.05) 40px,
      rgba(64, 156, 255, 0.05) 41px),
    repeating-linear-gradient(0deg,
      transparent,
      transparent 40px,
      rgba(0, 183, 255, 0.05) 40px,
      rgba(0, 183, 255, 0.05) 41px);
  pointer-events: none;
  z-index: 0;
}

/* 保留原有的边框图片装饰 - 右上角 */
.g2-chart::after {
  content: '';
  position: absolute;
  bottom: -5px;
  right: -2px;
  width: 111px;
  height: 35px;
  background-image: url("../assets/images/border.png");
  background-size: contain;
  background-repeat: no-repeat;
  z-index: 2;
  opacity: 0.9;
  pointer-events: none;
}

/* 左上角边框装饰 - 使用内部元素 */
.g2-chart {
  position: relative;
}

.g2-chart .border-decor {
  position: absolute;
  top: -5px;
  left: -2px;
  width: 111px;
  height: 35px;
  background-image: url("../assets/images/border.png");
  background-size: contain;
  background-repeat: no-repeat;
  transform: rotate(180deg);
  z-index: 2;
  opacity: 0.9;
  pointer-events: none;
}

.g2-chart-left {
  height: 400px;
  margin-bottom: 10px;
  flex-shrink: 0;
  /* 当只显示柱状图时，让容器高度自适应 */
}

/* 玫瑰图特殊样式 - 增加上边距避免标题重叠 */
.g2-chart-rose {
  padding-top: 30px;
  margin-top: -10px;
}

.g2-chart-rose .people-sum {
  top: 10px;
}

/* 横向柱状图展示样式 */
.g2-chart-bar {
  display: flex;
  flex-direction: column;
  padding: 10px;
  padding-top: 40px;
  padding-bottom: 10px;
  flex: 0 0 auto;
  position: relative;
  overflow: visible !important;
  min-height: auto;
  max-height: none;
  width: 100%;
  box-sizing: border-box;
  /* 让容器高度自动适应柱状图内容 */
  height: auto;
}

.bar-chart-card {
  margin-top: 5px;
  background: transparent !important;
  border: none !important;
  box-shadow: none !important;
}

.bar-chart-card :deep(.el-card__body) {
  padding: 8px !important;
}

/* 柱状图容器样式 */
.g2-chart-bar :deep(.g2-plot) {
  width: 100% !important;
  height: 270px !important;
  min-height: 270px;
  max-height: 270px;
  flex-shrink: 0;
}

.g2-chart-bar :deep(canvas),
.g2-chart-bar :deep(svg) {
  width: 100% !important;
  height: auto !important;
}

/* 横向柱状图样式优化 */
.g2-chart-bar :deep(.g2-plot-canvas) {
  background: transparent;
}

/* 饼图卡片样式 */
.pie-chart-card {
  background: transparent !important;
  border: none !important;
  box-shadow: none !important;
}

.pie-chart-card :deep(.el-card__body) {
  padding: 10px !important;
}

/* 在线人员卡片样式 */
.staff-card {
  background: transparent !important;
  border: none !important;
  box-shadow: none !important;
}

.staff-card :deep(.el-card__body) {
  padding: 10px !important;
}

.staff-item-card {
  background: linear-gradient(135deg,
    rgba(15, 35, 60, 0.8) 0%,
    rgba(10, 25, 47, 0.8) 100%) !important;
  border: 2px solid rgba(64, 156, 255, 0.4) !important;
  backdrop-filter: blur(5px);
  transition: all 0.3s ease;
  min-width: 180px;
}

.staff-item-card:hover {
  border-color: rgba(64, 156, 255, 0.8) !important;
  box-shadow: 0 0 20px rgba(0, 183, 255, 0.4);
  transform: translateY(-2px);
}

.staff-item-card :deep(.el-card__body) {
  padding: 12px !important;
}

.staff-title {
  font-size: 14px;
  color: rgba(255, 255, 255, 0.8);
  margin-bottom: 4px;
  font-weight: 500;
}

.staff-value {
  font-size: 20px;
  font-weight: 700;
  color: #00d4ff;
  text-shadow: 0 0 10px rgba(0, 212, 255, 0.5);
}

.staff-suffix {
  font-size: 14px;
  color: rgba(255, 255, 255, 0.7);
  margin-left: 4px;
}

/* 进展卡片样式 */
.progress-card {
  background: transparent !important;
  border: none !important;
  box-shadow: none !important;
}

.progress-card :deep(.el-card__body) {
  padding: 10px !important;
}

.progress-item {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.progress-label {
  font-size: 14px;
  color: rgba(255, 255, 255, 0.7);
  font-weight: 500;
}

.progress-value {
  font-size: 18px;
  font-weight: 700;
  color: #00d4ff;
  text-shadow: 0 0 10px rgba(0, 212, 255, 0.5);
}

.progress-suffix {
  font-size: 14px;
  color: rgba(255, 255, 255, 0.7);
  margin-left: 4px;
}

/* 田块数据卡片样式 */
.field-data-card {
  background: transparent !important;
  border: none !important;
  box-shadow: none !important;
}

.field-data-card :deep(.el-card__body) {
  padding: 15px !important;
}

.statistic-item {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.statistic-title {
  font-size: 14px;
  color: rgba(255, 255, 255, 0.7);
  font-weight: 500;
}

.statistic-value {
  font-size: 24px;
  font-weight: 700;
  color: #00d4ff;
  text-shadow: 0 0 10px rgba(0, 212, 255, 0.5);
}

.statistic-suffix {
  font-size: 16px;
  color: rgba(255, 255, 255, 0.7);
  margin-left: 4px;
}

/* 树状图展示样式（保留备用） */
.g2-chart-cards {
  display: flex;
  flex-direction: column;
  padding: 15px;
  padding-top: 60px;
  flex: 1;
  position: relative;
  overflow: visible;
  min-height: 0;
  max-height: 100%;
  width: 100%;
  box-sizing: border-box;
}

/* 确保标题显示 */
.g2-chart-cards .people-sum {
  position: absolute;
  top: -50px;
  left: 50%;
  transform: translateX(-50%);
  z-index: 500 !important;
  width: auto;
  max-width: calc(100% - 40px);
  min-width: 250px;
  padding: 8px 20px;
  box-sizing: border-box;
  overflow: visible !important;
  white-space: nowrap;
  text-overflow: ellipsis;
  /* 确保标题可见 */
  opacity: 1 !important;
  visibility: visible !important;
  display: block !important;
  /* 添加背景确保可见性 */
  background: rgba(10, 25, 47, 0.9);
  border: 1px solid rgba(64, 156, 255, 0.5);
  border-radius: 8px;
  backdrop-filter: blur(5px);
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.5);
}

/* 耕地面积图标题 - 移除容器，直接显示在柱状图上 */
/* 当前标题位置：top: 10px（记录于用户修改） */
.g2-chart-bar .people-sum {
  position: absolute;
  top: 10px;
  left: 50%;
  transform: translateX(-50%);
  z-index: 100 !important;
  width: auto;
  max-width: calc(100% - 40px);
  min-width: 200px;
  padding: 0;
  box-sizing: border-box;
  overflow: visible !important;
  white-space: nowrap;
  text-overflow: ellipsis;
  /* 确保标题可见 */
  opacity: 1 !important;
  visibility: visible !important;
  display: block !important;
  /* 移除背景容器样式，只保留文字样式 */
  background: none !important;
  border: none !important;
  border-radius: 0 !important;
  backdrop-filter: none !important;
  box-shadow: none !important;
  /* 保留文字样式 */
  color: #fff !important;
  font-weight: 600;
  font-size: 16px;
  text-shadow:
    0 0 10px rgba(0, 183, 255, 0.8),
    0 0 20px rgba(0, 183, 255, 0.5),
    0 2px 4px rgba(0, 0, 0, 1),
    0 2px 8px rgba(0, 0, 0, 0.8);
  letter-spacing: 1px;
  pointer-events: none;
}

/* 树状图容器 */
.treemap-container {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
  gap: 6px;
  width: 100%;
  min-height: 300px;
  height: auto;
  max-height: calc(100vh - 250px);
  align-content: start;
  position: relative;
  z-index: 1;
  overflow-y: auto;
  overflow-x: hidden;
  padding: 4px;
  box-sizing: border-box;
  /* 确保不溢出 */
  contain: layout;
  /* 确保网格项目不超出容器 */
  grid-auto-rows: min-content;
}

/* 树状图项目 */
.treemap-item {
  position: relative;
  border-radius: 8px;
  padding: 10px;
  min-height: 100px;
  height: 110px;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  cursor: pointer;
  transition: all 0.3s ease;
  border: 2px solid transparent;
  overflow: hidden;
  box-sizing: border-box;
  /* 使用grid-column-span来根据数值调整大小，但限制最大跨度 */
  grid-column: span var(--grid-span, 1);
  max-width: 100%;
  word-wrap: break-word;
}

.treemap-item:hover {
  transform: scale(1.02);
  z-index: 10;
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.5);
}

.treemap-high {
  background: linear-gradient(135deg,
    rgba(220, 53, 69, 0.3) 0%,
    rgba(255, 107, 107, 0.25) 100%);
  border-color: rgba(220, 53, 69, 0.5);
}

.treemap-high:hover {
  background: linear-gradient(135deg,
    rgba(220, 53, 69, 0.4) 0%,
    rgba(255, 107, 107, 0.35) 100%);
  border-color: rgba(220, 53, 69, 0.7);
  box-shadow: 0 0 20px rgba(220, 53, 69, 0.4);
}

.treemap-medium {
  background: linear-gradient(135deg,
    rgba(253, 126, 20, 0.3) 0%,
    rgba(255, 169, 77, 0.25) 100%);
  border-color: rgba(253, 126, 20, 0.5);
}

.treemap-medium:hover {
  background: linear-gradient(135deg,
    rgba(253, 126, 20, 0.4) 0%,
    rgba(255, 169, 77, 0.35) 100%);
  border-color: rgba(253, 126, 20, 0.7);
  box-shadow: 0 0 20px rgba(253, 126, 20, 0.4);
}

.treemap-low {
  background: linear-gradient(135deg,
    rgba(0, 185, 107, 0.3) 0%,
    rgba(74, 222, 128, 0.25) 100%);
  border-color: rgba(0, 185, 107, 0.5);
}

.treemap-low:hover {
  background: linear-gradient(135deg,
    rgba(0, 185, 107, 0.4) 0%,
    rgba(74, 222, 128, 0.35) 100%);
  border-color: rgba(0, 185, 107, 0.7);
  box-shadow: 0 0 20px rgba(0, 185, 107, 0.4);
}

.treemap-content {
  position: relative;
  z-index: 2;
  height: 100%;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
}

.treemap-header {
  display: flex;
  align-items: center;
  gap: 6px;
  margin-bottom: 8px;
}

.treemap-rank {
  background: rgba(0, 0, 0, 0.4);
  color: #fff;
  font-size: 10px;
  font-weight: 700;
  padding: 2px 6px;
  border-radius: 10px;
  min-width: 24px;
  text-align: center;
  border: 1px solid rgba(255, 255, 255, 0.2);
}

.treemap-name {
  font-size: 13px;
  font-weight: 600;
  color: #fff;
  text-shadow: 0 1px 3px rgba(0, 0, 0, 0.8);
  flex: 1;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.treemap-value {
  font-size: 18px;
  font-weight: 700;
  color: #fff;
  text-shadow:
    0 0 10px rgba(255, 255, 255, 0.5),
    0 2px 4px rgba(0, 0, 0, 0.8);
  margin-bottom: 4px;
  font-family: 'Courier New', monospace;
  line-height: 1.2;
  word-break: break-all;
  overflow: hidden;
}

.treemap-unit {
  font-size: 11px;
  font-weight: 500;
  opacity: 0.8;
  margin-left: 4px;
}

.treemap-percentage {
  font-size: 11px;
  color: rgba(255, 255, 255, 0.9);
  font-weight: 600;
  background: rgba(0, 0, 0, 0.3);
  padding: 2px 8px;
  border-radius: 10px;
  display: inline-block;
  align-self: flex-start;
}

.treemap-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background:
    repeating-linear-gradient(45deg,
      transparent,
      transparent 10px,
      rgba(255, 255, 255, 0.03) 10px,
      rgba(255, 255, 255, 0.03) 11px);
  pointer-events: none;
  z-index: 1;
}

.city-cards-container {
  display: flex;
  flex-direction: column;
  gap: 12px;
  padding: 10px 0;
  position: relative;
  z-index: 1;
}

.city-card {
  background: linear-gradient(135deg,
    rgba(10, 25, 47, 0.8) 0%,
    rgba(15, 35, 60, 0.7) 100%);
  border: 1px solid rgba(64, 156, 255, 0.3);
  border-radius: 10px;
  padding: 14px 16px;
  transition: all 0.3s ease;
  position: relative;
  overflow: hidden;
}

.city-card::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  width: 4px;
  height: 100%;
  background: linear-gradient(180deg, #00b7ff, #00d4ff);
  opacity: 0;
  transition: opacity 0.3s ease;
}

.city-card:hover {
  background: linear-gradient(135deg,
    rgba(10, 25, 47, 0.95) 0%,
    rgba(15, 35, 60, 0.9) 100%);
  border-color: rgba(64, 156, 255, 0.6);
  transform: translateX(5px);
  box-shadow: 0 4px 15px rgba(0, 183, 255, 0.3);
}

.city-card:hover::before {
  opacity: 1;
}

.city-card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}

.city-info {
  display: flex;
  align-items: center;
  gap: 8px;
}

.rank-number {
  background: linear-gradient(135deg, #00b7ff, #00d4ff);
  color: #fff;
  width: 24px;
  height: 24px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 11px;
  font-weight: 700;
  box-shadow: 0 0 10px rgba(0, 183, 255, 0.5);
  flex-shrink: 0;
}

.city-name {
  font-size: 15px;
  font-weight: 600;
  color: #e0e0e0;
  text-shadow: 0 1px 3px rgba(0, 0, 0, 0.5);
}

.city-value {
  font-size: 18px;
  font-weight: 700;
  color: #00d4ff;
  text-shadow:
    0 0 10px rgba(0, 212, 255, 0.6),
    0 1px 2px rgba(0, 0, 0, 0.8);
  font-family: 'Courier New', monospace;
}

.city-card-progress {
  height: 12px;
  background: rgba(0, 0, 0, 0.4);
  border-radius: 6px;
  overflow: visible;
  margin-bottom: 10px;
  position: relative;
  border: 1px solid rgba(64, 156, 255, 0.2);
}

.progress-bar {
  height: 100%;
  border-radius: 6px;
  position: relative;
  transition: width 0.6s ease;
  min-width: 2px;
}

.city-card.card-high .progress-bar {
  background: linear-gradient(90deg, #dc3545, #ff6b6b);
  box-shadow: 0 0 10px rgba(220, 53, 69, 0.5);
}

.city-card.card-medium .progress-bar {
  background: linear-gradient(90deg, #fd7e14, #ffa94d);
  box-shadow: 0 0 10px rgba(253, 126, 20, 0.5);
}

.city-card.card-low .progress-bar {
  background: linear-gradient(90deg, #00B96B, #4ade80);
  box-shadow: 0 0 10px rgba(0, 185, 107, 0.5);
}

.progress-glow {
  position: absolute;
  top: 0;
  right: 0;
  width: 20px;
  height: 100%;
  background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.3));
  animation: shimmer 2s infinite;
}

.progress-value-marker {
  position: absolute;
  right: -35px;
  top: 50%;
  transform: translateY(-50%);
  font-size: 10px;
  font-weight: 600;
  color: #fff;
  white-space: nowrap;
  text-shadow: 0 1px 3px rgba(0, 0, 0, 0.8);
  background: rgba(0, 0, 0, 0.5);
  padding: 2px 6px;
  border-radius: 4px;
}

.comparison-lines {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  pointer-events: none;
}

.comparison-line {
  position: absolute;
  top: 0;
  bottom: 0;
  width: 1px;
  background: rgba(255, 255, 255, 0.15);
  opacity: 0.3;
}

@keyframes shimmer {
  0%, 100% { opacity: 0; }
  50% { opacity: 1; }
}

.city-card-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 11px;
  margin-top: 4px;
}

.progress-text {
  color: #b0c4de;
  font-weight: 500;
}

.value-diff {
  color: #ffa94d;
  font-weight: 600;
  font-size: 10px;
  background: rgba(255, 169, 77, 0.1);
  padding: 2px 6px;
  border-radius: 4px;
  border: 1px solid rgba(255, 169, 77, 0.3);
}

/* 卡片容器滚动条样式 */
.g2-chart-cards::-webkit-scrollbar {
  width: 6px;
}

.g2-chart-cards::-webkit-scrollbar-track {
  background: rgba(10, 25, 47, 0.5);
  border-radius: 3px;
}

.g2-chart-cards::-webkit-scrollbar-thumb {
  background: linear-gradient(135deg, #00b7ff, #00d4ff);
  border-radius: 3px;
}

.g2-chart-cards::-webkit-scrollbar-thumb:hover {
  background: linear-gradient(135deg, #00d4ff, #00b7ff);
}

/* 确保图表内容在装饰层之上 */
.g2-chart > *:not(.border-decor):not(.people-sum) {
  position: relative;
  z-index: 1;
}

/* 确保图表组件可见 */
.g2-chart :deep(.g2-plot) {
  position: relative;
  z-index: 1;
  width: 100% !important;
  height: 100% !important;
  flex: 1;
  min-height: 250px;
}

/* 左侧图表容器特殊处理 */
.g2-chart-left :deep(.g2-plot) {
  min-height: 240px;
  max-height: 100%;
  overflow: visible;
}

/* 玫瑰图图表容器特殊处理 */
.g2-chart-rose :deep(.g2-plot) {
  min-height: 320px;
}

/* 确保玫瑰图的图例可见 */
.g2-chart-left :deep(.g2-plot-legend),
.g2-chart-rose :deep(.g2-plot-legend) {
  max-height: 260px;
  overflow-y: auto;
  overflow-x: visible;
}

/* 玫瑰图图例滚动条样式 */
.g2-chart-left :deep(.g2-plot-legend)::-webkit-scrollbar,
.g2-chart-rose :deep(.g2-plot-legend)::-webkit-scrollbar {
  width: 4px;
}

.g2-chart-left :deep(.g2-plot-legend)::-webkit-scrollbar-thumb,
.g2-chart-rose :deep(.g2-plot-legend)::-webkit-scrollbar-thumb {
  background: rgba(0, 183, 255, 0.5);
  border-radius: 2px;
}

/* 确保图表容器完整显示 */
.g2-chart :deep(canvas),
.g2-chart :deep(svg) {
  max-width: 100%;
  max-height: 100%;
}

.hospital {
  display: flex;
  justify-content: space-evenly;
  color: #fff !important;
  align-items: flex-start;
  text-align: center;
  position: relative;
  z-index: 2;
}

.hospital .item {
  text-align: center;
  display: flex;
  flex-direction: column;
  align-items: center;
  height: 80px;
  padding: 8px;
  border-radius: 8px;
  transition: all 0.3s ease;
  /* 增强数据项对比度 */
  background: rgba(0, 0, 0, 0.2);
  border: 1px solid rgba(64, 156, 255, 0.2);
}

.hospital .item:hover {
  background: rgba(0, 183, 255, 0.15);
  border-color: rgba(64, 156, 255, 0.4);
  box-shadow: 0 0 15px rgba(0, 183, 255, 0.3);
  transform: translateY(-2px);
}

.hospital .item h4 {
  color: #e0e0e0 !important;
  font-weight: 600;
  text-shadow: 0 1px 3px rgba(0, 0, 0, 0.8);
  margin-bottom: 8px;
  margin-top: 0;
}

.hospital .item span {
  color: #00d4ff !important;
  font-weight: 700;
  text-shadow:
    0 0 10px rgba(0, 212, 255, 0.8),
    0 1px 2px rgba(0, 0, 0, 0.8);
}

.people-sum {
  top: 10px;
  left: 50%;
  transform: translateX(-50%);
  line-height: 40px;
  color: #fff !important;
  width: auto;
  min-width: 200px;
  max-width: calc(100% - 40px);
  height: auto;
  text-align: center;
  position: absolute;
  z-index: 300 !important;
  /* 增强标题文字对比度 */
  font-weight: 600;
  font-size: 16px;
  text-shadow:
    0 0 10px rgba(0, 183, 255, 0.8),
    0 0 20px rgba(0, 183, 255, 0.5),
    0 2px 4px rgba(0, 0, 0, 1),
    0 2px 8px rgba(0, 0, 0, 0.8);
  letter-spacing: 1px;
  pointer-events: none;
  /* 确保文字可见 */
  opacity: 1 !important;
  visibility: visible !important;
  /* 使用 flex 居中文字 */
  display: flex !important;
  align-items: center;
  justify-content: center;
  white-space: nowrap;
  word-break: keep-all;
  overflow: visible;
  padding: 0 15px;
}

/* 使用伪元素显示背景图片，确保文字在上层 */
.people-sum::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  width: 100%;
  height: 100%;
  background: url(../assets/images/chart-item.png) no-repeat;
  background-size: contain;
  background-position: center;
  z-index: -1;
  opacity: 0.9;
  pointer-events: none;
}

/* 确保文字内容显示在最上层 */
.people-sum > * {
  position: relative;
  z-index: 1;
}

.field-info {
  color: #fff !important;
  padding: 10px;
  text-align: left;
  position: relative;
  z-index: 2;
}

.field-info p {
  margin: 5px 0;
  color: #fff !important;
}

/* 确保所有文字内容可见 */
.g2-chart {
  color: #fff;
}

.g2-chart * {
  color: inherit;
}

/* 排除 SVG 元素，避免影响 G2Plot 的文本颜色 */
.g2-chart * svg,
.g2-chart * svg * {
  color: unset;
}

/* 增强饼图中心统计文字的可见性 - 直接针对 SVG 元素 */
/* 注意：G2Plot 的 statistic 文本在 SVG 内部，需要使用 fill 属性 */
.g2-chart-rose :deep(.g2-plot-statistic),
.g2-chart-rose :deep(.g2-plot-statistic-title),
.g2-chart-rose :deep(.g2-plot-statistic-content) {
  fill: #ffffff !important;
  color: #ffffff !important;
  opacity: 1 !important;
  font-weight: 700 !important;
}

/* 直接针对 SVG text 元素 - 这是关键！使用更广泛的选择器 */
.g2-chart-rose :deep(.g2-plot-statistic-title text),
.g2-chart-rose :deep(.g2-plot-statistic-content text),
.g2-chart-rose :deep(.g2-plot-statistic-title > text),
.g2-chart-rose :deep(.g2-plot-statistic-content > text),
.g2-chart-rose :deep(.g2-plot svg text[class*="statistic"]),
.g2-chart-rose :deep(.g2-plot svg g[class*="statistic"] text),
.g2-chart-rose :deep(.g2-plot svg g text),
.g2-chart-rose :deep(.g2-plot svg text) {
  fill: #ffffff !important;
  opacity: 1 !important;
  font-weight: 700 !important;
  /* 确保不使用 currentColor */
  color: unset !important;
}

/* 针对 G2Plot 内部可能的类名变体 */
.g2-chart-rose :deep([class*="statistic"] text),
.g2-chart-rose :deep([class*="Statistic"] text),
.g2-chart-rose :deep([class*="STATISTIC"] text) {
  fill: #ffffff !important;
  opacity: 1 !important;
  font-weight: 700 !important;
  color: unset !important;
}

/* 最强制的方法：直接针对饼图容器内的所有 text 元素（除了 label） */
.g2-chart-rose :deep(.g2-plot svg text:not([class*="label"]):not([class*="Label"])) {
  fill: #ffffff !important;
  opacity: 1 !important;
  font-weight: 700 !important;
}

/* 使用属性选择器强制设置 */
.g2-chart-rose :deep(.g2-plot svg text[fill="currentColor"]),
.g2-chart-rose :deep(.g2-plot svg text[fill="#666"]),
.g2-chart-rose :deep(.g2-plot svg text[fill="#999"]),
.g2-chart-rose :deep(.g2-plot svg text[fill="gray"]),
.g2-chart-rose :deep(.g2-plot svg text[fill="grey"]) {
  fill: #ffffff !important;
}
</style>
