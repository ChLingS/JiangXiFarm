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
    appendPadding: 10,
    xField: "type",
    yField: "value",
    seriesField: "type",
    radius: 0.9,
    label: {
      offset: -15
    },
    interactions: [{ type: "element-active" }],
    height: 270
  };
  return {
    bus_data: data,
    bus_config: config
  }
}
