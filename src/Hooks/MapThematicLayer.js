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
      if (!source) return;
      const featuresWithIds = newData.features.map((orig, idx) => {
        const rawId = orig.id ?? orig.properties?.id ?? idx;
        let id;

        if (typeof rawId === 'string') {
          if (/^\d+$/.test(rawId)) {
            // 纯数字长ID：取模压缩
            const bigInt = BigInt(rawId);
            id = Number(bigInt % BigInt(2147483647)); // 最大安全整数范围内
          } else {
            // 非纯数字字符串：使用哈希
            let hash = 0;
            for (let i = 0; i < Math.min(rawId.length, 50); i++) {
              hash = ((hash << 5) - hash) + rawId.charCodeAt(i);
              hash |= 0;
            }
            id = Math.abs(hash);
          }
        } else {
          id = parseInt(rawId, 10);
          if (Number.isNaN(id)) id = idx;
        }

        const properties = {
          ...(orig.properties || {}),
          layerType: 'thematicLayer'
        };

        return {
          ...orig,
          id,
          properties
        };
      });
      console.log("featuresWithId", featuresWithIds[0]);

      source.setData({
        type: 'FeatureCollection',
        features: featuresWithIds
      });
    } else {
      console.error('无法更新专题图层数据: 未获取到新数据');
    }
  }

  return {
    loadThematicLayer,
    updateThematicLayerData
  }
}
