import { inject, ref } from 'vue'

import { JiangXiBoundsApi } from '@/api/api'
import * as turf from '@turf/turf'



export default (adNamesRef) => {
  const { map } = inject('$scene_map')

  const SOURCE_CONTRACTED_ID = 'poloygon-contracted-data-source'
  const FILL_CONTRACTED_LAYER_ID = 'polygon-contracted-fill-layer'
  const OUTLINE_CONTRACTED_LAYER_ID = 'polygon-contracted-outline-layer';

  let currentPopup = null;
  let currentHighlightedFeatureId = null;
  let currentClickListener = null;  // 用于田块的点击事件

  const fetchContractedLand = async () => {
    const loadContractedLandName = adNamesRef.value.at(-1);
    try {
      const contractedLandData = await JiangXiBoundsApi.getAreaByName(loadContractedLandName)
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
          'fill-color': '#DBDBDB',
          'fill-opacity': 0
        }
      });
    };

    if (!map.getLayer(OUTLINE_CONTRACTED_LAYER_ID)) {
      map.addLayer({
        id: OUTLINE_CONTRACTED_LAYER_ID,
        type: 'line',
        source: SOURCE_CONTRACTED_ID,
        paint: {
          'line-color': '#fbff00',
          'line-width': 4,
          'line-opacity': 1
        }
      });
    };
  }
  const updateLayerData = async (areaData) => {
    const source = map.getSource(SOURCE_CONTRACTED_ID);
    if (source) {
      source.setData({
        type: 'FeatureCollection',
        features: areaData.features
      });
    }
  };

  function clearHighlight() {
    if (currentHighlightedFeatureId !== null) {
      map.setFeatureState({
        source: SOURCE_CONTRACTED_ID,
        id: currentHighlightedFeatureId
      },
        { highlighted: false })
    }
    currentHighlightedFeatureId = null;
  }

  function highlightFeature(feature) {
    console.log('准备高亮要素:', feature);
    clearHighlight();
    const featureId = feature.id || feature.properties?.id;
    if (!featureId) {
      console.warn('要素没有ID，无法高亮', feature);
      return;
    }

    console.log('高亮要素ID:', featureId);

    if (currentHighlightedFeatureId === featureId) {
      console.log('要素已高亮，跳过');
      return;
    }
    map.setFeatureState({
      source: SOURCE_CONTRACTED_ID,
      id: featureId
    },
      { highlighted: true })
    // 记录高亮ID
    currentHighlightedFeatureId = featureId
  };

  const setupClickEvents = () => {
    if (currentClickListener) {
      map.off('click', currentClickListener);
    }

    const clickHandler = async (e) => {
      const point = e.point;
      console.log('点击坐标:', point);

      // 行政区事件
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
        const featureId = clickedFeature.id || clickedFeature.properties?.id;

        const isSameFeature = currentHighlightedFeatureId === featureId;

        if (!isSameFeature) {
          clearHighlight();
        }
        highlightFeature(clickedFeature)

      }

    };
    map.on('click', clickHandler);
    currentClickListener = clickHandler;
  };

}
