import { inject } from 'vue'

import { JiangXiBoundsApi } from '@/api/api'
import * as turf from '@turf/turf'



export default () => {
  const { map } = inject('$scene_map')


  const SOURCE_CONTRACTED_ID = 'poloygon-contracted-data-source'
  const FILL_CONTRACTED_LAYER_ID = 'polygon-contracted-fill-layer'
  const OUTLINE_CONTRACTED_LAYER_ID = 'polygon-contracted-outline-layer';

  // 添加回调函数引用
  let onFeatureClickCallback = null

  // 设置回调函数的方法
  const setOnFeatureClick = (callback) => {
    onFeatureClickCallback = callback
  }

  let currentHighlightedFeatureId = null;
  let currentClickListener = null;  // 用于田块的点击事件

  const fetchContractedLand = async (contractedLandName) => {
    try {
      const contractedLandData = await JiangXiBoundsApi.getFieldByName(contractedLandName)
      return contractedLandData
    } catch (error) {
      console.error('获取边界数据失败:', error)
      return null
    }
  };

  const loadContractedLand = () => {
    if (!map.getSource(SOURCE_CONTRACTED_ID)) {
      map.addSource(SOURCE_CONTRACTED_ID, {
        type: 'geojson',
        data: {
          type: 'FeatureCollection',
          features: []
        }
      });
    };

    if (!map.getLayer(FILL_CONTRACTED_LAYER_ID)) {
      map.addLayer({
        id: FILL_CONTRACTED_LAYER_ID,
        type: 'fill',
        source: SOURCE_CONTRACTED_ID,
        paint: {
          'fill-color': '#7cfc00',  // 固定颜色，不再使用高亮
          'fill-opacity': 0.2,
        }
      });
    }

    if (!map.getLayer(OUTLINE_CONTRACTED_LAYER_ID)) {
      map.addLayer({
        id: OUTLINE_CONTRACTED_LAYER_ID,
        type: 'line',
        source: SOURCE_CONTRACTED_ID,
        paint: {
          'line-color': [
            'case',
            ['boolean', ['feature-state', 'highlighted'], false],
            '#ff0000',  // 高亮时轮廓线颜色 - 红色
            '#fce700'   // 正常时轮廓线颜色 - 黄色
          ],
          'line-width': [
            'case',
            ['boolean', ['feature-state', 'highlighted'], false],
            3,  // 高亮时轮廓线宽度
            1   // 正常时轮廓线宽度
          ],
          'line-opacity': 1
        }
      });
    }
  }



  const updateLayerData = async (areaData) => {
    const source = map.getSource(SOURCE_CONTRACTED_ID);
    if (source) {
      const featuresWithIds = areaData.features.map(feature => ({
        ...feature,
        id: feature.id || feature.properties?.id || `field_${index}_${Date.now()}`
      }));
      source.setData({
        type: 'FeatureCollection',
        features: featuresWithIds
      });
      // 设置点击事件
      setupClickEvents();
    }
  };

  function clearHighlight() {
    if (currentHighlightedFeatureId !== null) {

      map.setFeatureState({
        source: SOURCE_CONTRACTED_ID,
        id: currentHighlightedFeatureId
      }, { highlighted: false });

      currentHighlightedFeatureId = null;
    }
  }

  function highlightFeature(feature) {
    const featureId = feature.id;
    if (!featureId) {
      return;
    }
    if (currentHighlightedFeatureId === featureId) {
      return;
    }

    // 清除之前的高亮
    clearHighlight();

    // 设置新的高亮
    map.setFeatureState({
      source: SOURCE_CONTRACTED_ID,
      id: featureId
    }, { highlighted: true });
    // 记录高亮ID
    currentHighlightedFeatureId = featureId;
  };

  const setupClickEvents = () => {
    if (currentClickListener) {
      map.off('click', currentClickListener);
    }

    const clickHandler = async (e) => {
      const point = e.point;
      console.log('点击坐标:', point);

      let contractedLandFeatures = [];
      try {
        contractedLandFeatures = map.queryRenderedFeatures(point, {
          layers: [FILL_CONTRACTED_LAYER_ID, OUTLINE_CONTRACTED_LAYER_ID]
        });
      } catch (err) {
        console.warn('在查询地图要素时出错:', err);
        return;
      }
      if (contractedLandFeatures.length > 0) {
        const clickedFeature = contractedLandFeatures[0]
        const featureId = clickedFeature.id;

        const isSameFeature = currentHighlightedFeatureId === featureId;

        if (!isSameFeature) {
          clearHighlight();
        }

        // 触发回调函数
        if (onFeatureClickCallback && clickedFeature.properties) {
          onFeatureClickCallback(clickedFeature.properties)
        }

        highlightFeature(clickedFeature)

      }

    };
    map.on('click', clickHandler);
    currentClickListener = clickHandler;
  };

  const contractedLandLayerInitialize = async (adNamesRef) => {
    const areaData = await fetchContractedLand(adNamesRef.at(-1))
    loadContractedLand();
    updateLayerData(areaData)

  }

  return {
    contractedLandLayerInitialize,
    setOnFeatureClick
  }
}
