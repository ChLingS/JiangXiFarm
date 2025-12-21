import { inject, ref } from 'vue'

import { JiangXiBoundsApi } from '@/api/api'
import * as turf from '@turf/turf'

export default () => {
  const { map } = inject('$scene_map')
  const AD_NAMES = ref(['江西省'])

  let currentClickListener = null;
  const SOURCE_ID = 'polygon-data-source';
  const FILL_LAYER_ID = 'polygon-fill-layer';
  const OUTLINE_LAYER_ID = 'polygon-outline-layer';


  const fetchBoundaryDataByName = async (name) => {
    try {
      const response = await JiangXiBoundsApi.getAreaByName(name, AD_NAMES.value.length - 1)
      return response
    } catch (error) {
      console.error('获取边界数据失败:', error)
      return null
    }
  };

  // 创建行政区边界图层
  const initializeLayers = () => {
    if (!map.getSource(SOURCE_ID)) {
      map.addSource(SOURCE_ID, {
        type: 'geojson',
        data: {
          type: 'FeatureCollection',
          features: []
        }
      });
    }

    if (!map.getLayer(FILL_LAYER_ID)) {
      map.addLayer({
        id: FILL_LAYER_ID,
        type: 'fill',
        source: SOURCE_ID,
        paint: {
          'fill-color': '#DBDBDB',
          'fill-opacity': 0
        }
      });
    }

    if (!map.getLayer(OUTLINE_LAYER_ID)) {
      map.addLayer({
        id: OUTLINE_LAYER_ID,
        type: 'line',
        source: SOURCE_ID,
        paint: {
          'line-color': '#fbff00',
          'line-width': 4,
          'line-opacity': 1
        }
      });
    }

  }
  const updateLayerData = async (areaData) => {
    const source = map.getSource(SOURCE_ID);
    if (source) {
      source.setData({
        type: 'FeatureCollection',
        features: areaData.features
      });
    }
    // 调整视图
    const bounds = turf.bbox(areaData);
    if (bounds) {
      map.fitBounds([[bounds[0], bounds[1]], [bounds[2], bounds[3]]], {
        padding: 20
      });
    } else if (areaData.features[0]?.properties?.center) {
      const level = AD_NAMES.value.length;
      const zoom = Math.min(7 + level, 12);
      map.flyTo({
        center: areaData.features[0].properties.center,
        zoom: zoom,
        duration: 1000
      });
    }
    return areaData;
  };

  const setupClickEvents = () => {
    if (currentClickListener) {
      map.off('click', currentClickListener);
    }

    const clickHandler = async (e) => {
      const point = e.point;
      console.log('点击坐标:', point);

      // 行政区事件
      let features = [];
      try {
        features = map.queryRenderedFeatures(point, {
          layers: [FILL_LAYER_ID, OUTLINE_LAYER_ID]
        });
      } catch (err) {
        console.warn('在查询地图要素时出错:', err);
        return;
      }

      // 点击到的是要素图层
      if (features.length > 0) {
        if (AD_NAMES.value.length > 4) {
          console.log('已达到最大层级');
        }
        // 行政区变化
        else {
          console.log('点击行政区:', features[0].properties);
          const nextAreaName = features[0].properties.name;
          AD_NAMES.value.push(nextAreaName);
          let nextAreaData = await fetchBoundaryDataByName(nextAreaName);
          updateLayerData(nextAreaData);
        }
      }
      // 点击到图层外侧
      else {
        if (AD_NAMES.value.length == 1) {
          console.log("已经为省级图层");
        } else {
          AD_NAMES.value.pop();
          const lastAreaName = AD_NAMES.value.at(-1);
          let lastAreaData = await fetchBoundaryDataByName(lastAreaName);
          updateLayerData(lastAreaData);
        }
      }
    };
    map.on('click', clickHandler);
    currentClickListener = clickHandler;
  };

  const layerInitialize = async () => {
    const areaName = AD_NAMES.value[AD_NAMES.value.length - 1];
    const areaData = await fetchBoundaryDataByName(areaName);
    if (!areaData) return;

    initializeLayers();
    updateLayerData(areaData);
    setupClickEvents();

    // 添加地图加载完成后的调试
    map.once('idle', () => {
      console.log('地图加载完成，图层列表:', map.getStyle().layers);
    });
  };

  return {
    layerInitialize,
    AD_NAMES
  };
};
