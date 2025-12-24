import { inject, ref, computed } from 'vue'

import { JiangXiBoundsApi } from '@/api/api'
import * as turf from '@turf/turf'

export default (adNamesRef) => {
  const { map } = inject('$scene_map')

  // block
  let isLoading = false

  let currentClickListener = ref(null);
  const SOURCE_ID = 'polygon-data-source';
  const FILL_LAYER_ID = 'polygon-fill-layer';
  const OUTLINE_LAYER_ID = 'polygon-outline-layer';


  const fetchBoundaryDataByName = async (name) => {
    try {
      const response = await JiangXiBoundsApi.getAreaByName(name, adNamesRef.value.length - 1)
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
    };

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
    };

    if (!map.getLayer(OUTLINE_LAYER_ID)) {
      map.addLayer({
        id: OUTLINE_LAYER_ID,
        type: 'line',
        source: SOURCE_ID,
        paint: {
          'line-color': '#fff68d',
          'line-width': 4,
          'line-opacity': 1
        }
      });
    };
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
      const level = adNamesRef.value.length;
      const zoom = Math.min(7 + level, 12);
      map.flyTo({
        center: areaData.features[0].properties.center,
        zoom: zoom,
        duration: 1000
      });
    }
    return areaData;
  };

  const removeClickListener = () => {
    if (currentClickListener.value) {
      map.off('click', currentClickListener.value)
      currentClickListener.value = null
    }
  }

  const clickController = {
    // 方法
    enable: () => {
      if (!currentClickListener.value) {
        setupClickEvents();
      }
    },
    disable: () => {
      if (currentClickListener.value) {
        removeClickListener();
      }
    },
    toggle: () => {
      if (currentClickListener.value) {
        removeClickListener();
      } else {
        setupClickEvents();
      }
    },
    // 状态
    isEnabled: computed(() => !!currentClickListener.value),
    // 监听器引用
    listener: currentClickListener,
  };


  const setupClickEvents = () => {
    if (currentClickListener.value) {
      map.off('click', currentClickListener.value);
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
        if (adNamesRef.value.length > 4) {
          console.log('已达到最大层级');
        }
        // 行政区变化
        else {
          console.log('点击行政区:', features[0].properties);
          const nextAreaName = features[0].properties.name;
          adNamesRef.value.push(nextAreaName);
          let nextAreaData = await fetchBoundaryDataByName(nextAreaName);
          updateLayerData(nextAreaData);
        }
      }
      // 点击到图层外侧
      else {
        if (adNamesRef.value.length == 1) {
          console.log("已经为省级图层");
        } else {
          adNamesRef.value.pop();
          const lastAreaName = adNamesRef.value.at(-1);
          let lastAreaData = await fetchBoundaryDataByName(lastAreaName);
          updateLayerData(lastAreaData);
        }
      }
    };
    map.on('click', clickHandler);
    currentClickListener.value = clickHandler;
  };

  const layerInitialize = async () => {
    const areaName = adNamesRef.value[adNamesRef.value.length - 1];
    const areaData = await fetchBoundaryDataByName(areaName);
    if (!areaData) return;

    initializeLayers();
    updateLayerData(areaData);

    // setupClickEvents();

    // 添加地图加载完成后的调试
    map.once('idle', () => {
      console.log('地图加载完成，图层列表:', map.getStyle().layers);
    });
  };

  return {
    layerInitialize,
    clickController,
  };
};
