<template>
  <LineChart v-bind="config" :data="chartData" />
</template>

<script setup>
import { ref, watch, toRefs, onMounted } from 'vue';
import { LineChart } from '@opd/g2plot-vue'

const props = defineProps({
  zsData: {
    type: [String, Array],
    default: () => null
  }
});

const { zsData } = toRefs(props);
const chartData = ref([]);
const config = ref({
  height: 250,
  autoFit: true,
  xField: 'time',
  yField: 'value',
  smooth: true,
  meta: {
    value: {
      max: 5,
    }
  }
});

// 格式化数据函数
const formatData = (data) => {
  try {
    if (!data) return [];
    
    // 如果是字符串，尝试解析JSON
    let parsedData = data;
    if (typeof data === 'string') {
      parsedData = JSON.parse(data);
    }
    
    // 确保数据是数组
    if (!Array.isArray(parsedData)) {
      console.error('解析失败：数据必须是数组格式');
      return [];
    }
    
    // 处理并排序数据
    return parsedData
      .map(item => {
        // 确保每个项都有必要字段
        const time = item.time || item.date || '';
        let value = Number(item.value) || 3;
        
        // 将value限制在1-5之间的整数
        value = Math.min(5, Math.max(1, Math.round(value)));
        
        return {
          ...item,
          time,
          value,
        };
      })
      .filter(item => item.time) // 过滤掉没有时间的项
      .sort((a, b) => {
        // 按时间从早到晚排序
        return new Date(a.time) - new Date(b.time);
      });
    
  } catch (error) {
    console.error('格式化数据失败:', error);
    return [];
  }
};

// 监听 props.zsData 的变化
watch(
  () => zsData.value,
  (newData) => {
    chartData.value = formatData(newData);
  },
  { 
    deep: true, // 深度监听
    immediate: true // 立即执行一次
  }
);

// 初始化图表数据
onMounted(() => {
  if (zsData.value) {
    chartData.value = formatData(zsData.value);
  }
});
</script>

<style scoped>
</style>