/* 出行人口hook */
import { ref } from 'vue'
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

  setInterval(() => {
    // data.value.forEach(item => {
    //       item.value = item.value * Math.random()
    // })
    let res = data.value.map((d) => ({ ...d, value: d.value + 2 }))
    data.value = res;
  }, 1200);
  const green = '#00B96B';
  const yellow = '#fd7e14';
  const red = '#dc3545';
  const config = {

    xField: 'type',
    yField: 'value',
    seriesField: 'value',
    label: {
      // 可手动配置 label 数据标签位置
      position: 'top', // 'top', 'bottom', 'middle',
      // 配置样式
      style: {
        fill: '#FFFFFF',
        opacity: 0.6,
      },
    },
    color: ({ value }) => {
      if (value > 40000) {
        return red;
      } else if (value > 20000 && value < 40000) {
        return yellow;
      } else {
        return green;
      }
    },
    legend: false,
    height: 270,
  };
  return {
    config,
    data
  }
}
