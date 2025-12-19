<template>
  <div></div>
</template>

<script setup>
import { inject, onMounted } from 'vue';
import { Zoom, Fullscreen, MapTheme } from '@antv/l7'


onMounted(() => {
  const { scene } = inject("$scene_map");


  const zoom = new Zoom({
    zoomInTitle: '放大',
    zoomOutTitle: '缩小',
    position: 'bottomright'
  });
  scene.addControl(zoom);


  // scene.addControl(scale);
  const fullscreen = new Fullscreen({
    btnText: '全屏',
    exitBtnText: '退出全屏',
  });
  scene.addControl(fullscreen)


  const mapTheme = new MapTheme({
    // 这里是 options 数组，每个元素是 IControlOptionItem 类型
    options: [
      {
        text: '卫星地图',  // 显示文本
        value: 'mapbox://styles/mapbox/satellite-v9',  // Mapbox样式URL
        img: 'https://mdn.alipayobjects.com/huamei_k6sfo0/afts/img/A*fG9HQpyNuv0AAAAAAAAAAAAADjWqAQ/original'  // 图标URL
      },
      {
        text: '标准地图',
        value: 'mapbox://styles/mapbox/streets-v11',
        img: 'https://mdn.alipayobjects.com/huamei_qa8qxu/afts/img/A*qdFDSbvIalgAAAAAAAAAAAAADmJ7AQ/original'
      },
      {
        text: '暗色地图',
        value: 'mapbox://styles/mapbox/dark-v10',
        img: 'https://mdn.alipayobjects.com/huamei_qa8qxu/afts/img/A*HMbRTI3XnpIAAAAAAAAAAAAADmJ7AQ/original'
      }
    ]
  });

  scene.addControl(mapTheme);
})
</script>
<style>
.l7-control-zoom {
  margin-bottom: 40px !important;
}

.l7-control-logo {
  margin-bottom: 20px !important;
}
</style>
