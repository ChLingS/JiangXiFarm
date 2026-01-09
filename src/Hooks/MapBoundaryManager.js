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
  const SOURCE_ID = layerParams.sourceId;
  const FILL_LAYER_ID = layerParams.fillLayerId;
  const OUTLINE_LAYER_ID = layerParams.outlineLayerId;
  const TEXT_LAYER_ID = layerParams.textLayerId;


  const fetchBoundaryDataByName = async (name) => {
    try {
      console.log('请求边界数据，名称:', name);
      console.log('传递给API的参数:', areaMgr.getLength())
      const response = await apiRegistry.execute(apiName, name, areaMgr.getLength())
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

  /**
   * 
   * @param {string} areaName 
   * @returns 
   */
  const updateLayerData = async (areaName) => {
    try {
      const areaData = await fetchBoundaryDataByName(areaName);
      console.log('获取到的边界数据:', areaData);
      if (!areaData) {
        console.error('未获取到边界数据');
        return false;
      }
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
      return true;
    } catch (e) {
      console.error('更新图层数据失败:', e);
      return false;
    }
  };


  const layerInitialize = async () => {
    const areaName = areaMgr.toNames()[areaMgr.getLength() - 1];
    initializeLayers();
    updateLayerData(areaName);
    // 添加地图加载完成后的调试
    map.once('idle', () => {
      console.log('地图加载完成，图层列表:', map.getStyle().layers);
    });
  };

  return {
    layerInitialize,
    updateLayerData
  };
};
