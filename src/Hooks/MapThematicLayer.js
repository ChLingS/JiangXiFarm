import { inject, provide } from "vue";
import apiRegistry from '@/api/apiRegistry'
import { useLayerStore } from '@/plugins/layerVisibilityManager'

// 创建一个独立的函数用于提供 ThematicLayer 服务
export const useThematicLayerProvider = () => {
  const { map } = inject('$scene_map', {});

  const layerStore = useLayerStore()

  if (!map) {
    console.warn('地图实例未找到，确保已在父组件中注入 $scene_map');
  }


  // 增加高亮标记
  let highlightedFeatures = [];

  const clearHighlight = async () => {
    try {
      await Promise.all(
        highlightedFeatures.map(({ sourceId, id }) =>
          map.setFeatureState({ source: sourceId, id }, { highlighted: false })
        )
      );
    } catch (err) {
      console.error("clearHighlight failed", err);
    } finally {
      highlightedFeatures = [];
    }
  };

  /**
   * 通用高亮控制函数
   * @param {string|number} identifier - 要素标识符（ID或BDH值）
   * @param {string} sourceId - 数据源ID
   * @param {"id"|"bdh"} searchType - 查询类型，默认按ID查询
   */
  const setHighlight = async (identifier, sourceId, searchType = "id") => {
    // 参数校验
    if (typeof sourceId !== "string") {
      console.error("Invalid sourceId:", sourceId);
      return;
    }

    // 清除之前的高亮状态
    await clearHighlight();

    try {
      let featureIds = [];

      // 根据搜索类型处理
      switch (searchType) {
        case "id": {
          // 直接使用传入的ID（强制转为字符串）
          const idValue = String(identifier);
          if (!idValue) throw new Error("Empty ID value");

          // 设置单个要素高亮
          map.setFeatureState({ source: sourceId, id: idValue }, { highlighted: true });
          featureIds.push({ sourceId, id: idValue });
          break;
        }

        case "bdh": {
          // 查询BDH对应的要素ID
          console.log('query bdh, sourceId=', sourceId, 'map.getSource=', map.getSource(sourceId));
          // 注意：querySourceFeatures 只能查询已加载到地图上的数据
          const features = await map.querySourceFeatures(sourceId, {
            filter: ["==", "bdh", identifier]
          });
          console.log("查询到的要素", features);

          if (features.length === 0) {
            console.warn(`No features found for bdh=${identifier}`);
            return;
          }

          // 批量设置高亮
          features.forEach(el => {
            map.setFeatureState({ source: sourceId, id: el.id }, { highlighted: true });
            featureIds.push({ sourceId, id: el.id });
          });
          break;
        }

        default:
          throw new Error(`Unsupported searchType: ${searchType}`);
      }

      // 更新高亮状态记录
      highlightedFeatures = featureIds;

    } catch (err) {
      console.error("setHighlight failed", err);
    }
  };

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
    if (!map) {
      console.error('地图实例未找到，无法加载专题图层');
      return;
    }

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
  /**
   * @abstract 压缩
   * @param {String} str 传入
   * @returns String
   */
  function stableHash(str) {
  // 使用 FNV-1a 哈希算法，产生更好的分布
  let hash = 2166136261; // FNV偏移基础值

  for (let i = 0; i < str.length; i++) {
    hash ^= str.charCodeAt(i);
    hash += (hash << 1) + (hash << 4) + (hash << 7) + (hash << 8) + (hash << 24);
  }

  // 确保结果为53位安全整数
  const safeHash = Math.abs(hash % (2**53 - 1));

  // 处理可能的负号（虽然Math.abs应该处理了）
  return safeHash >>> 0;
}


  /**
   * 更新专题图层数据
   * 支持两种数据来源：
   * 1. 通过API名称和字段名获取数据
   * 2. 直接传入GeoJSON数据
   */
  const updateThematicLayerData = async (apiNameOrGeoJson, fieldName, layerParams) => {
    if (!map) {
      console.error('地图实例未找到，无法更新专题图层数据');
      return;
    }

    const SOURCE_ID = layerParams.sourceId;
    let newData;

    // 判断第一个参数的类型
    if (typeof apiNameOrGeoJson === 'string') {
      // 情况1：通过API获取数据
      newData = await thematicData(apiNameOrGeoJson, fieldName);
    } else if (apiNameOrGeoJson && apiNameOrGeoJson.type === 'FeatureCollection') {
      // 情况2：直接传入GeoJSON数据
      newData = apiNameOrGeoJson;
    } else {
      console.error('参数错误：第一个参数必须是API名称字符串或有效的GeoJSON对象');
      return;
    }
    if (newData) {
      const source = map.getSource(SOURCE_ID);
      if (!source) {
        console.error(`未找到数据源: ${SOURCE_ID}`);
        return;
      }
      // console.log('newData', newData);

      if ( newData.code === 1 || newData.features.length === 0) {
        source.setData({
          type: 'FeatureCollection',
          features: []
        });
      } else {
        console.log("newData", newData);
        // 当newData获取到数据后，更新数据源
        const featuresWithIds = newData.features.map((orig, index) => {
          let id;

          if (orig.properties && orig.properties.bdh) {
            // 直接使用哈希值，假设 bdh 是唯一的
            id = stableHash(orig.properties.bdh);
          } else {
            // 生成基于时间戳、索引和随机数的复合ID
            const time = Date.now() % 1000000; // 时间戳后6位
            const idx = index % 10000; // 索引后4位
            const random = Math.floor(Math.random() * 10000); // 随机4位

            id = time * 100000000 + idx * 10000 + random;

            // 确保为正数
            id = Math.abs(id % (2**53 - 1));
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

        // console.log('featuresWithIds', featuresWithIds);

        source.setData({
          type: 'FeatureCollection',
          features: featuresWithIds
        });

        // const { sourceId, ...otherParams } = layerParams;
        // const layerIds = Object.values(otherParams)
        // for (let el of layerIds) {
        //   map.setLayoutProperty(el, 'visibility', 'visible');
        // }

        // map.setLayoutProperty(SOURCE_ID, 'visibility', 'visible');

      }
      layerStore.showAll()
      return true;
    } else {
      console.error('无法更新专题图层数据: 未获取到有效数据');
    }
  };

  // 创建服务对象
  const thematicLayerService = {
    loadThematicLayer,
    updateThematicLayerData,
    setHighlight
  };

  // 使用 provide 导出服务
  provide('thematicLayerService', thematicLayerService);

  // 同时返回服务对象，方便在组件中使用
  return thematicLayerService;
};

// 创建一个独立的 hook 用于在其他组件中获取服务
export const useThematicLayer = () => {
  const thematicLayerService = inject('thematicLayerService', null);

  if (!thematicLayerService) {
    console.warn('thematicLayerService 未找到，请确保在父组件中调用了 useThematicLayerProvider');
  }

  return thematicLayerService || {
    loadThematicLayer: () => console.warn('thematicLayerService 未初始化'),
    updateThematicLayerData: () => Promise.resolve(console.warn('thematicLayerService 未初始化')),
    setHighlight: () => console.warn('thematicLayerService 未初始化')
  };
};
