<!-- Timeline.vue -->
<template>
    <div v-for="(item, index) in reScaleTimeline" :key="index">
      <div>{{ item }}</div>
    </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue';

// mock 数据
const timelineData = [
  { timestamp: 1736843400000, label: '2025-01' },  // 2025年1月
  { timestamp: 1739167200000, label: '2025-02' },  // 2025年2月
  { timestamp: 1741865400000, label: '2025-03' },  // 2025年3月
  { timestamp: 1743849900000, label: '2025-04' },  // 2025年4月
  { timestamp: 1747980000000, label: '2025-05' },  // 2025年5月
  { timestamp: 1749369600000, label: '2025-06' },  // 2025年6月
  { timestamp: 1753534500000, label: '2025-07' },  // 2025年7月
  { timestamp: 1755002400000, label: '2025-08' },  // 2025年8月
  { timestamp: 1756871100000, label: '2025-09' },  // 2025年9月
  { timestamp: 1759911000000, label: '2025-10' },  // 2025年10月
  { timestamp: 1762504200000, label: '2025-11' },  // 2025年11月
  { timestamp: 1766908800000, label: '2025-12' },  // 2025年12月
  { timestamp: 1770523200000, label: '2026-01' },  // 2026年1月
  { timestamp: 1774098000000, label: '2026-02' },  // 2026年2月
  { timestamp: 1778563200000, label: '2026-03' },  // 2026年3月
  { timestamp: 1780398000000, label: '2026-04' }   // 2026年4月
];

// 时间缩放配置
const scaleConfig = {
  year : 365 * 24 * 3600 * 1000,
  month: 30 * 24 * 3600 * 1000,
  day  : 24 * 3600 * 1000,
  hour : 3600 * 1000,
  minute: 60 * 1000,
  second: 1000
}

// 获取端点时间
const getEndpoint = (data) => {
  if (!data || data.length === 0) {
    const now = Date.now();
    return {
      min: now - 24 * 60 * 60 * 1000, // 默认一天前
      max: now
    };
  }
  const timestamps = data.map(item => item.timestamp);
  return {
    min: Math.min(...timestamps),
    max: Math.max(...timestamps)
  };
};

// 计算调整后的时间轴刻度
const reScaleTimeline = computed(() => {
  const endpoint = getEndpoint(timelineData.value);
  console.log('时间轴范围:', endpoint);
  const scaleTimeline = [];
  for ( let t = endpoint.min; t <= endpoint.max; t += scaleConfig.month) {
    console.log('刻度:', transTimestampToDate(t));
    scaleTimeline.push(transTimestampToDate(t));
  }
  console.log('调整后的时间轴刻度:', scaleTimeline);
  return scaleTimeline;
});



function transTimestampToDate(timestamp) {
  const date = new Date(timestamp);
  return `${date.getFullYear()}-${(date.getMonth() + 1)
    .toString()
    .padStart(2, '0')}-${date.getDate().toString().padStart(2, '0')} ${date
    .getHours()
    .toString()
    .padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}:${date
    .getSeconds()
    .toString()
    .padStart(2, '0')}`;
}



</script>

<style scoped>

</style>
