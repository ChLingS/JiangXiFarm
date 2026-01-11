export const useLeftBottom = () => {
  const data = [
    { type: "南昌市", value: 500 },
    { type: "景德镇市", value: 300 },
    { type: "萍乡市", value: 250 },
    { type: "九江市", value: 450 },
    { type: "新余市", value: 200 },
    { type: "鹰潭市", value: 220 },
    { type: "赣州市", value: 600 },
    { type: "吉安市", value: 550 },
    { type: "宜春市", value: 400 },
    { type: "抚州市", value: 380 },
    { type: "上饶市", value: 420 },
  ];
  const config = {
    angleField: 'value',
    colorField: 'type',
    radius: 0.8,
    innerRadius: 0.6,
    height: 320,
    // 标签配置 - 显示名称和百分比
    label: {
      type: 'outer',
      content: '{name}\n{percentage}',
      style: {
        fill: '#ffffff',
        fontSize: 12,
        fontWeight: 'bold',
        textShadow: '0 2px 4px rgba(0,0,0,0.8)',
      },
      connectorStyle: {
        stroke: '#fff',
        lineWidth: 1,
        opacity: 0.6
      }
    },
    // 图例配置 - 放在底部，更清晰
    legend: {
      position: 'bottom',
      itemSpacing: 10,
      itemMarginBottom: 6,
      itemName: {
        style: {
          fill: '#fff',
          fontSize: 12,
          fontWeight: 500
        }
      },
      marker: {
        symbol: 'circle',
        style: {
          r: 6
        }
      }
    },
    // 交互效果
    interactions: [
      { type: 'element-active' },
      { type: 'pie-statistic-active' }
    ],
    // 统计信息 - 显示总计
    statistic: {
      title: {
        style: {
          whiteSpace: 'pre-wrap',
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          fill: '#ffffff', // 白色
          fontSize: 20,
          fontWeight: 700,
          // 确保颜色不被覆盖
          color: '#ffffff',
          opacity: 1
        },
        content: '总计'
      },
      content: {
        style: {
          whiteSpace: 'pre-wrap',
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          fill: '#ffffff', // 白色
          fontSize: 28,
          fontWeight: 700,
          // 确保颜色不被覆盖
          color: '#ffffff',
          opacity: 1
        },
        content: data.reduce((sum, item) => sum + item.value, 0).toLocaleString()
      }
    },
    // 颜色配置 - 使用渐变色，更美观
    color: [
      '#00b7ff', '#00d4ff', '#00e5ff', '#4dd0e1',
      '#26c6da', '#00acc1', '#0097a7', '#00838f',
      '#006064', '#00bfa5', '#1de9b6'
    ]
  };
  return {
    bus_data: data,
    bus_config: config
  }
}
