/* 出行人口hook */

import { ref, onUnmounted } from 'vue'
export const useLeftTop = () => {
  const data = ref([
    { type: '南昌市', value: 50000 },
    { type: '景德镇市', value: 30000 },
    { type: '萍乡市', value: 25000 },
    { type: '九江市', value: 45000 },
    { type: '新余市', value: 20000 },
    { type: '鹰潭市', value: 22000 },
    { type: '赣州市', value: 60000 },
    { type: '吉安市', value: 55000 },
    { type: '宜春市', value: 40000 },
    { type: '抚州市', value: 38000 },
    { type: '上饶市', value: 42000 },
  ]);

  const intervalId = setInterval(() => {
    // data.value.forEach(item => {
    //       item.value = item.value * Math.random()
    // })
    let res = data.value.map((d) => ({ ...d, value: d.value + 2 }))
    data.value = res;
  }, 1200);

  // 清理定时器 - onUnmounted 可以在 hook 中使用，只要 hook 在组件的 setup 中调用
  onUnmounted(() => {
    if (intervalId) {
      clearInterval(intervalId);
    }
  });
  // 科技风格配色
  const techHigh = '#00d4ff';    // 高值 - 青色
  const techMedium = '#00b7ff';  // 中值 - 蓝色
  const techLow = '#00a0e9';      // 低值 - 深蓝色

  const config = {
    // 横向柱状图：交换 xField 和 yField
    xField: 'value', // 数值在横轴
    yField: 'type',  // 分类在纵轴
    seriesField: 'value',
    label: {
  
      // 横向柱状图的标签位置在柱子右侧（上方）
      position: 'right', // 'top', 'bottom', 'middle', 'left', 'right'
      // 显示数值内容
      content: (item) => {
        return item.value.toLocaleString();
      },
      // 配置样式
      style: {
        fill: '#FFFFFF',
        opacity: 0.95,
        fontSize: 12,
        fontWeight: 'bold',
        textShadow: '0 0 8px rgba(0, 183, 255, 0.8)',
      },
    },
    color: ({ value }) => {
      if (value > 50000) {
        return techHigh;
      } else if (value > 35000) {
        return techMedium;
      } else {
        return techLow;
      }
    },
    legend: false,
    height: 270,
    // 去除参考线和网格线
    yAxis: {
      grid: null, // 去除网格线
      line: null, // 去除轴线
    },
    xAxis: {
      grid: null, // 去除网格线
      line: null, // 去除轴线
      // 去除参考线（80000那条线）
      tickLine: null,
    },
    // 去除所有标注和参考线
    annotations: [],
    // 去除辅助线
    guideLine: [],
  };
  return {
    config,
    data
  }
}
