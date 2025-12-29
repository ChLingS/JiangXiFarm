<template>
  <div ref="chartContainer" class="responsive-pie-chart">
    <PieChart
      v-if="chartReady"
      :key="chartKey"  
      :data="data"
      :angleField="angleField"
      :colorField="colorField"
      :radius="currentRadius"
      :innerRadius="innerRadius"
      :width="chartSize.width"
      :height="chartSize.height"
      :label="currentLabel"
      :legend="currentLegend"
      :color="color"
      :interactions="interactions"
      :statistic="statisticConfig"
    />
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, computed, nextTick, watch, defineExpose } from 'vue';
import { PieChart } from "@opd/g2plot-vue";

const props = defineProps({
  data: {
    type: Array,
    required: true,
    default: () => []
  },
  angleField: {
    type: String,
    default: 'value'
  },
  colorField: {
    type: String,
    default: 'type'
  },
  radius: {
    type: Number,
    default: 0.8
  },
  innerRadius: {
    type: Number,
    default: 0.4
  },
  // 响应式配置
  responsiveConfig: {
    type: Object,
    default: () => ({
      // 基础尺寸（针对1920x1080设计）
      baseWidth: 270,
      baseHeight: 240,
      // 最小尺寸
      minWidth: 180,
      minHeight: 160,
      // 最大尺寸
      maxWidth: 450,
      maxHeight: 400,
      // 基于视口的缩放比例
      viewportBase: 1920,
      useViewportScaling: true,
      // 字体缩放配置
      fontScaling: {
        baseSize: 16, // 基准字体大小
        minSize: 12,  // 最小字体大小
        maxSize: 20,  // 最大字体大小
        useAdaptiveFont: true, // 是否启用字体自适应
      },
      // 标签配置
      labelScale: 1, // 标签字体缩放比例
      legendScale: 0.9, // 图例字体缩放比例
      // 统计信息配置
      showStatistic: true, // 是否显示统计信息
      statisticFontScale: 1.2, // 统计信息字体缩放比例
    })
  },
  // 原始配置（用于合并）
  label: {
    type: [Object, Boolean],
    default: () => ({})
  },
  legend: {
    type: [Object, Boolean],
    default: () => ({})
  },
  color: {
    type: Array,
    default: () => ['#4F9DFF', '#FF6B6B']
  },
  interactions: {
    type: Array,
    default: () => [
      { type: 'element-active' },
      { type: 'pie-statistic-active' }
    ]
  }
});

const chartContainer = ref(null);
const chartSize = ref({ width: 270, height: 240 });
const chartReady = ref(false);
const chartKey = ref(0);
let resizeObserver = null;
let resizeTimeout = null;

// 计算缩放比例
const calculateScaleFactor = () => {
  const { responsiveConfig } = props;
  const { viewportBase, useViewportScaling } = responsiveConfig;
  
  if (!useViewportScaling) return 1;
  
  const viewportWidth = window.innerWidth;
  let scaleFactor = viewportWidth / viewportBase;
  
  // 限制缩放范围
  const minScale = 0.7;
  const maxScale = 1.3;
  scaleFactor = Math.min(Math.max(scaleFactor, minScale), maxScale);
  
  return scaleFactor;
};

// 计算自适应字体大小
const calculateFontSize = (baseFontSize, scaleType = 'label') => {
  const { responsiveConfig } = props;
  const { fontScaling, labelScale, legendScale, statisticFontScale } = responsiveConfig;
  
  if (!fontScaling.useAdaptiveFont) {
    return baseFontSize;
  }
  
  const scaleFactor = calculateScaleFactor();
  let scaledSize = baseFontSize * scaleFactor;
  
  // 根据不同类型应用额外的缩放因子
  if (scaleType === 'legend') {
    scaledSize *= legendScale;
  } else if (scaleType === 'statistic') {
    scaledSize *= statisticFontScale;
  } else if (scaleType === 'label') {
    scaledSize *= labelScale;
  }
  
  // 限制字体大小范围
  const { minSize, maxSize } = fontScaling;
  scaledSize = Math.min(Math.max(scaledSize, minSize), maxSize);
  
  return Math.round(scaledSize);
};

// 计算自适应间距
const calculateSpacing = (baseSpacing) => {
  const scaleFactor = calculateScaleFactor();
  return Math.round(baseSpacing * scaleFactor);
};

// 计算当前半径（根据屏幕大小微调）
const currentRadius = computed(() => {
  const scaleFactor = calculateScaleFactor();
  // 在小屏幕上稍微减小半径，大屏幕上增加半径
  if (scaleFactor < 0.9) {
    return props.radius * 0.95;
  } else if (scaleFactor > 1.1) {
    return props.radius;
  }
  return props.radius;
});

// 计算当前标签配置
const currentLabel = computed(() => {
  const defaultLabel = {
    type: 'outer',
    content: ({ name, percentage }) => {
      return `${name} ${(percentage * 100).toFixed(1)}%`;
    },
    style: (data, color, point) => {
      const fontSize = calculateFontSize(16, 'label');
      return {
        fill: '#ffffff',
        fontSize,
        fontWeight: 'bold',
        textShadow: '0 2px 4px rgba(0,0,0,0.8)',
        // 根据字体大小调整偏移量
        offset: fontSize * 0.5,
        lineHeight: fontSize * 1.2,
      };
    },
    // 自适应标签布局
    layout: [
      { type: 'limit-in-plot', cfg: { action: 'ellipsis' } },
      { type: 'scroll', cfg: { style: { fill: 'transparent' } } }
    ]
  };
  
  if (props.label === false) {
    return false;
  }
  
  return { ...defaultLabel, ...props.label };
});

// 计算当前图例配置
const currentLegend = computed(() => {
  const fontSize = calculateFontSize(14, 'legend');
  const itemSpacing = calculateSpacing(16);
  const markerSize = calculateFontSize(8, 'legend');
  
  const defaultLegend = {
    position: 'bottom',
    flipPage: false,
    itemName: {
      style: {
        fill: '#e0e0e0',
        fontSize,
        lineHeight: fontSize * 1.2,
      },
      formatter: (text) => {
        // 如果文本太长，在大屏幕上显示更多字符
        const maxLength = window.innerWidth > 1600 ? 6 : 4;
        return text.length > maxLength ? `${text.substring(0, maxLength)}...` : text;
      }
    },
    marker: {
      symbol: 'circle',
      style: {
        r: markerSize,
      },
    },
    itemSpacing: itemSpacing,
    itemWidth: calculateSpacing(80),
    maxRow: 1, // 最多显示一行
  };
  
  if (props.legend === false) {
    return false;
  }
  
  return { ...defaultLegend, ...props.legend };
});

// 统计信息配置
const statisticConfig = computed(() => {
  if (!props.responsiveConfig.showStatistic) {
    return false;
  }
  
  const titleFontSize = calculateFontSize(20, 'statistic');
  const contentFontSize = calculateFontSize(16, 'statistic');
  
  return {
    title: {
      style: {
        fontSize: titleFontSize,
        lineHeight: titleFontSize * 1.2,
        fill: '#e0e0e0',
      },
    },
    content: {
      style: {
        fontSize: contentFontSize,
        lineHeight: contentFontSize * 1.2,
        fill: '#b0b0b0',
      },
    },
  };
});

// 更新图表尺寸
const updateChartSize = () => {
  if (!chartContainer.value) return;
  
  const { responsiveConfig } = props;
  const { 
    baseWidth, 
    baseHeight, 
    minWidth, 
    minHeight, 
    maxWidth, 
    maxHeight,
    useViewportScaling
  } = responsiveConfig;
  
  let width, height;
  
  if (useViewportScaling) {
    const scaleFactor = calculateScaleFactor();
    
    width = Math.round(baseWidth * scaleFactor);
    height = Math.round(baseHeight * scaleFactor);
    
    // 确保在最小和最大限制内
    width = Math.max(minWidth, Math.min(width, maxWidth));
    height = Math.max(minHeight, Math.min(height, maxHeight));
  } else {
    width = baseWidth;
    height = baseHeight;
  }
  
  chartSize.value = { width, height };
};

// 防抖更新函数
const debouncedUpdate = () => {
  if (resizeTimeout) {
    clearTimeout(resizeTimeout);
  }
  resizeTimeout = setTimeout(() => {
    updateChartSize();
    // 强制重新渲染图表
    chartKey.value++;
  }, 150);
};

// 初始化图表
const initChart = async () => {
  await nextTick();
  updateChartSize();
  chartReady.value = true;
};

// 监听屏幕大小变化
onMounted(() => {
  initChart();
  
  // 使用 ResizeObserver 监听容器大小变化
  if (chartContainer.value && 'ResizeObserver' in window) {
    resizeObserver = new ResizeObserver(debouncedUpdate);
    resizeObserver.observe(chartContainer.value);
  }
  
  // 监听窗口大小变化
  window.addEventListener('resize', debouncedUpdate);
  
  // 监听设备像素比变化
  window.addEventListener('devicePixelRatio', debouncedUpdate);
});

// 监听数据变化重新计算尺寸
watch(() => props.data, () => {
  if (chartReady.value) {
    updateChartSize();
  }
}, { deep: true });

// 监听配置变化
watch(() => props.responsiveConfig, () => {
  debouncedUpdate();
}, { deep: true });

onUnmounted(() => {
  if (resizeObserver && chartContainer.value) {
    resizeObserver.unobserve(chartContainer.value);
  }
  if (resizeTimeout) {
    clearTimeout(resizeTimeout);
  }
  window.removeEventListener('resize', debouncedUpdate);
  window.removeEventListener('devicePixelRatio', debouncedUpdate);
});

// 暴露刷新方法
const refreshChart = () => {
  chartKey.value++;
};

defineExpose({
  refreshChart
});
</script>

<style scoped>
.responsive-pie-chart {
  width: 100%;
  height: 100%;
  min-width: 180px;
  min-height: 160px;
  display: flex;
  justify-content: center;
  align-items: center;
  position: relative;
  contain: layout style; /* 性能优化 */
}

/* 响应式媒体查询 */
@media screen and (max-width: 1920px) {
  .responsive-pie-chart {
    transform: scale(0.95);
    transform-origin: center;
  }
}

@media screen and (max-width: 1600px) {
  .responsive-pie-chart {
    transform: scale(0.9);
  }
}

@media screen and (max-width: 1366px) {
  .responsive-pie-chart {
    transform: scale(0.85);
  }
}

@media screen and (max-width: 1024px) {
  .responsive-pie-chart {
    transform: scale(0.8);
  }
}

@media screen and (max-width: 768px) {
  .responsive-pie-chart {
    transform: scale(1);
    min-width: 150px;
    min-height: 150px;
  }
}
</style>