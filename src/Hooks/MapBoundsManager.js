import { inject, ref } from 'vue'
import { JiangXiBoundsApi } from '@/api/api'

export default () => {
  const { map } = inject('$scene_map')
  const AD_CODES = ref([360000])

  let currentClickListener = null;
  const SOURCE_ID = 'polygon-data-source';
  const FILL_LAYER_ID = 'polygon-fill-layer';
  const OUTLINE_LAYER_ID = 'polygon-outline-layer';

  const fetchBoundaryData = async (adcode) => {
    try {
      const response = await JiangXiBoundsApi.getBounds(adcode)
      return response
    } catch (error) {
      console.error('获取边界数据失败:', error)
      return null
    }
  }

  // 计算图层的地理边界
  const calculateBounds = (features) => {
    if (!features || features.length === 0) return null;

    let minLng = 180;
    let maxLng = -180;
    let minLat = 90;
    let maxLat = -90;

    // 遍历所有要素的所有坐标点
    features.forEach(feature => {
      if (!feature.geometry || !feature.geometry.coordinates) return;

      const processCoordinates = (coords) => {
        if (Array.isArray(coords[0]) && Array.isArray(coords[0][0])) {
          // 多边形或多边形数组
          coords.forEach(polygon => {
            polygon.forEach(coord => {
              const [lng, lat] = coord;
              minLng = Math.min(minLng, lng);
              maxLng = Math.max(maxLng, lng);
              minLat = Math.min(minLat, lat);
              maxLat = Math.max(maxLat, lat);
            });
          });
        } else if (Array.isArray(coords[0])) {
          // 简单多边形
          coords.forEach(coord => {
            const [lng, lat] = coord;
            minLng = Math.min(minLng, lng);
            maxLng = Math.max(maxLng, lng);
            minLat = Math.min(minLat, lat);
            maxLat = Math.max(maxLat, lat);
          });
        }
      };

      if (feature.geometry.type === 'Polygon') {
        processCoordinates(feature.geometry.coordinates);
      } else if (feature.geometry.type === 'MultiPolygon') {
        feature.geometry.coordinates.forEach(multiPolygon => {
          processCoordinates(multiPolygon);
        });
      }
    });

    // 返回有效的边界
    if (minLng > maxLng || minLat > maxLat) {
      return null;
    }

    return [[minLng, minLat], [maxLng, maxLat]];
  }


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
          'line-color': '#feaa03',
          'line-width': 1,
          'line-opacity': 1
        }
      });
    }
  }

  const updateLayerData = async (adcode) => {
    const data = await fetchBoundaryData(adcode)
    if (!data) return;

    const source = map.getSource(SOURCE_ID);
    if (source) {
      source.setData({
        type: 'FeatureCollection',
        features: data.features
      });
    }

    // 根据图层大小调整视图
    if (data.features && data.features.length > 0) {
      const bounds = calculateBounds(data.features);

      if (bounds) {
        // 方法1: 使用 fitBounds 自动计算合适的缩放级别
        map.fitBounds(bounds, {
          padding: 50, // 内边距，让图层不紧贴地图边缘
          duration: 1000, // 动画持续时间
          maxZoom: 15, // 最大缩放级别限制
          essential: true // 确保动画是必需的
        });
      } else if (data.features[0]?.properties?.center) {
        // 方法2: 如果无法计算边界，使用中心点和动态计算的缩放级别
        const level = AD_CODES.value.length;
        const zoom = Math.min(7 + level, 12); // 根据层级调整缩放
        map.flyTo({
          center: data.features[0].properties.center,
          zoom: zoom,
          duration: 1000
        });
      }
    }

    return data;
  }

  const nextADlevel = async (currentAdcode) => {
    await updateLayerData(currentAdcode);
  }

  const setupClickEvents = () => {
    if (!map) return;

    if (currentClickListener) {
      map.off('click', currentClickListener);
    }

    const clickHandler = (e) => {
      const point = e.point;
      let features = [];

      try {
        features = map.queryRenderedFeatures(point, {
          layers: [FILL_LAYER_ID, OUTLINE_LAYER_ID]
        });
      } catch (err) {
        console.warn('在查询地图要素时出错:', err);
        return;
      }

      if (features.length > 0) {
        console.log('A函数: 点击图层', features[0].properties);
        const level_AD = AD_CODES.value.length - 1;
        if (level_AD >= 4) {
          console.log('已到达最大行政区划层级');
        } else {
          const nextAdcode = features[0].properties.adcode;
          AD_CODES.value.push(nextAdcode);
          console.log('AD_CODES:', AD_CODES.value);
          nextADlevel(nextAdcode);
        }
      } else {
        console.log('B函数: 点击空白', e.lngLat);
        if (AD_CODES.value.length > 1) {
          AD_CODES.value.pop();
          const previousAdcode = AD_CODES.value.at(-1);
          console.log('AD_CODES:', AD_CODES.value);
          nextADlevel(previousAdcode);
        }
      }
    };

    map.on('click', clickHandler);
    currentClickListener = clickHandler;
  }

  const cleanup = () => {
    if (currentClickListener) {
      map.off('click', currentClickListener);
      currentClickListener = null;
    }
  }

  const layerInit = async () => {
    const lastAdcode = AD_CODES.value.at(-1);
    const data = await fetchBoundaryData(lastAdcode)
    if (!data) return;

    initializeLayers();
    await updateLayerData(lastAdcode);
    setupClickEvents();
  }

  return {
    layerInit,
    cleanup
  }
}
