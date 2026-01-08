import { inject, ref, computed } from 'vue'

import apiRegistry from '@/api/apiRegistry'

import * as turf from '@turf/turf'

/**
 * 管理地图边界图层的Hook
 * @param {import('@/models/AreaQueryManager').default} areaMgr - 行政区管理器实例
 * @param {string} apiName - 用于获取边界数据的API名称
 * @param {Object} layerParams - 传递给API的其他参数
 */
export default (areaMgr, apiName, layerParams) => {
  const { map } = inject('$scene_map')

  // block
  let isLoading = false

  let currentClickListener = ref(null);
  const SOURCE_ID = layerParams.sourceId;
  const FILL_LAYER_ID = layerParams.fillLayerId;
  const OUTLINE_LAYER_ID = layerParams.outlineLayerId ;
  const TEXT_LAYER_ID = layerParams.textLayerId ;


  const fetchBoundaryDataByName = async (name) => {
    try {
      const response = await apiRegistry.execute(apiName, name, areaMgr.getLength() - 1)
      if (response.success) {
        return response.data
      } else {
        console.error('获取边界数据失败:', response.error)
        return null
      }
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

    if (!map.getLayer(TEXT_LAYER_ID)) {
      map.addLayer({
        id: TEXT_LAYER_ID,
        type: 'symbol',
        source: SOURCE_ID,
        layout: {
          'text-field': ['get', 'name'],
          'text-size': 14,
          'text-font': ['Open Sans Regular', 'Arial Unicode MS Regular'],
          'text-offset': [0, 0],
          'text-anchor': 'center',
          'text-allow-overlap': false,
          'text-ignore-placement': false
        },
        paint: {
          'text-color': '#ffa600',
          'text-halo-color': '#FFFFFF',
          'text-halo-width': 1
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
      const level = areaMgr.getLength();
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
        if (areaMgr.getLength() > 4) {
          console.log('已达到最大层级');
        }
        // 行政区变化
        else {
          console.log('点击行政区:', features[0]);
          const nextAreaName = features[0].properties.name;
          await areaMgr.push(nextAreaName);
          let nextAreaData = await fetchBoundaryDataByName(nextAreaName);
          updateLayerData(nextAreaData);
        }
      }
      // 点击到图层外侧
      else {
        if (areaMgr.getLength() == 1) {
          console.log("已经为省级图层");
        } else {
          console.log("触发上升事件，重绘边界");
          await areaMgr.popLast();
          const lastAreaName = areaMgr.toNames().at(-1);
          let lastAreaData = await fetchBoundaryDataByName(lastAreaName);
          updateLayerData(lastAreaData);
        }
      }
    };
    map.on('click', clickHandler);
    currentClickListener.value = clickHandler;
  };

  const layerInitialize = async () => {
    const areaName = areaMgr.toNames()[areaMgr.getLength() - 1];
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
