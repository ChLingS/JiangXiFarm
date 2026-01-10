import { inject } from "vue";
import apiRegistry from '@/api/apiRegistry'

export default () => {
  const { map } = inject('$scene_map');

  const thematicData = async (apiName, areaName) => {
    try {
      console.log('请求专题图数据', apiName);
      const response = await apiRegistry.execute(apiName, areaName)
      if (response.success) {
        return response.data
      } else {
        console.error('获取专题图数据失败:', response.error)
        return null
      }
    } catch (error) {
      console.error('获取专题图数据失败:', error)
      return null
    }
  };

  const loadThematicLayer = (layerParams, layerStyle) => {
    const SOURCE_ID = layerParams.sourceId;
    const FILL_LAYER_ID = layerParams.fillLayerId;
    const OUTLINE_LAYER_ID = layerParams.outlineLayerId;

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
        paint: layerStyle.fillLayerStyle
      })
    }
    if (!map.getLayer(OUTLINE_LAYER_ID)) {
      map.addLayer({
        id: OUTLINE_LAYER_ID,
        type: 'line',
        source: SOURCE_ID,
        paint: layerStyle.outlineLayerStyle
      })
    }
  };

  const updateThematicLayerData = async (apiName, fieldName, layerParams) => {
    const SOURCE_ID = layerParams.sourceId;

    const newData = await thematicData(apiName, fieldName);
    if (newData) {
      const source = map.getSource(SOURCE_ID);
      if (source) {
        source.setData(newData);
      }
    } else {
      console.error('无法更新专题图层数据: 未获取到新数据');
    }
  }

  return {
    loadThematicLayer,
    updateThematicLayerData
  }
}
