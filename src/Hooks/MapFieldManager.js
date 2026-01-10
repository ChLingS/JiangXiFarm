import { inject } from 'vue'
import { JiangXiApi } from '@/api/api'

export default () => {  // 接收 AD_NAMES 作为参数
  const { map } = inject('$scene_map')

  const SOURCE_FIELD_ID = 'polygon-field-data-source';
  const FILL_FIELD_LAYER_ID = 'polygon-field-fill-layer';
  const OUTLINE_FIELD_LAYER_ID = 'polygon-field-outline-layer';

  const fetchField = async (fieldName) => {
    try {
      const fieldData = await JiangXiApi.getFieldByName(fieldName)
      return fieldData
    } catch (error) {
      console.error("获取边界失败", error);
      return null
    }
  };
  const loadField = () => {
    if (!map.getSource(SOURCE_FIELD_ID)) {
      map.addSource(SOURCE_FIELD_ID, {
        type: 'geojson',
        data: {
          type: 'FeatureCollection',
          features: []
        }
      });
    };

    if (!map.getLayer(FILL_FIELD_LAYER_ID)) {
      map.addLayer({
        id: FILL_FIELD_LAYER_ID,
        type: 'fill',
        source: SOURCE_FIELD_ID,
        paint: {
          'fill-color': '#ffffe0',
          'fill-opacity': 0.2,
        }
      });
    }

    if (!map.getLayer(OUTLINE_FIELD_LAYER_ID)) {
      map.addLayer({
        id: OUTLINE_FIELD_LAYER_ID,
        type: 'line',
        source: SOURCE_FIELD_ID,
        paint: {
          'line-color': "#ffe88c",
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
    const source = map.getSource(SOURCE_FIELD_ID);
    if (source) {
      source.setData({
        type: 'FeatureCollection',
        features: areaData.features,
      });
    }
  };

  const fieldLayerInitialize = async (adNamesRef) => {
    const areaData = await fetchField(adNamesRef.at(-1))
    loadField()
    updateLayerData(areaData)
  }
  return {
    fieldLayerInitialize
  }
};
