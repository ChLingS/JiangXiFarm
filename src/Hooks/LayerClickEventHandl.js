import { inject } from "vue";
import layerConfig from '@/config/layerConfig.json';

/**
 * 管理地图图层点击事件的Hook
 * @param {import('@/models/AreaQueryManager').default} areaMgr - 行政区管理器实例
 * @param {Function} baseLayerUpDate - 用于更新底图边界数据的函数
 */

export default (areaMgr, baseLayerUpDate) => {
  const { map } = inject('$scene_map');

  // 防止并发点击导致的竞争条件
  let isProcessing = false;

  // 高亮feature标记
  let highlightFeatureId = null
  let highlightSouceId = null

  // 地块信息记录
  let thematicLayerProps = null;

  // 地图点击监听
  let mapClickListener = null;

  const clearHighlight = () => {
    if (highlightFeatureId != null && highlightSouceId) {
      try {
        map.setFeatureState({ source: highlightSouceId, id: highlightFeatureId }, { highlighted: false });

      } catch (err) {
        console.warn('clearHighlight setFeatureState failed', err);
      }
      highlightFeatureId = null;
      highlightSouceId = null;
    }
  };

  const setHighlight = (feature, sourceId) => {
    const fid = feature.id ?? feature.properties?.id;
    if (!fid) {
      console.warn('无法为要素设置高亮：找不到 id', feature);
      return;
    }
    // 清除之前的高亮
    clearHighlight();
    try {
      map.setFeatureState({ source: sourceId, id: fid }, { highlighted: true });
      highlightFeatureId = fid;
      highlightSouceId = sourceId;
    } catch (err) {
      console.warn('setHighlight setFeatureState failed', err);
    }
  };

  const layers = Array.isArray(layerConfig) ? layerConfig : (layerConfig.layers || []);
  const layerConfigById = layers.reduce((acc, layer) => {
    acc[layer.id] = {
      sourceId: layer.layerParams ? layer.layerParams.sourceId : undefined,
      fillLayerId: layer.layerParams ? layer.layerParams.fillLayerId : undefined,
      outlineLayerId: layer.layerParams ? layer.layerParams.outlineLayerId : undefined,
      textLayerId: layer.layerParams ? layer.layerParams.textLayerId : undefined,
      zIndex: layer.zIndex,
      clickable: layer.clickable,
      layerType: layer.id
    };
    return acc;
  }, {});

  const analyzeLayerClick = (features) => {
    if (features.length > 0) {
      // 获取所有匹配的图层配置
      const matches = features.flatMap(rawFeat => {
        const layerId = rawFeat.layer?.source ?? rawFeat.source ?? rawFeat.layer?.id;
        const normalizedFeature = {
          ...rawFeat,
          id: rawFeat.properties?.id
        };
        console.log("点击的图层ID:", layerId, "feature id:", normalizedFeature.id);

        return Object.entries(layerConfigById)
          .filter(([, cfg]) => cfg.sourceid === layerId)
          .map(([configId, cfg]) => ({
            configId,
            ...cfg,
            feature: normalizedFeature
          }));
      });

      if (!matches.length) {
        console.log("点击的图层未能与配置中的图层匹配");
        return null;
      }

      // 按 zIndex 降序排序
      matches.sort((a, b) => (b.zIndex || 0) - (a.zIndex || 0));

      // 返回匹配的要素
      const { feature, configId } = matches[0];
      feature.layerConfig = configId;  // 添加配置ID
      console.log("匹配的图层配置ID:", configId, "对应的要素:", feature);
      return feature;
    } else {
      return null;
    }
  };

  /**
   * 初始化地图点击事件监听
   * @param {Function} onThematicLayerClick - 专题图层点击时的回调函数
   * @returns {Function} 清理函数，用于移除事件监听
   */
  const initMapClickListener = (onThematicLayerClick = null) => {
    // 清理已有的事件监听
    if (mapClickListener) {
      map.off('click', mapClickListener);
    }

    mapClickListener = async (e) => {
      if (isProcessing) {
        console.log('正在处理上一次点击，已忽略新的点击');
        return;
      }

      isProcessing = true;
      thematicLayerProps = null; // 重置之前的结果

      try {
        const features = map.queryRenderedFeatures(e.point);

        if (!features || features.length === 0) {
          // 点击空白处，触发边界上升事件
          if (areaMgr.getLength() > 1) {
            await areaMgr.popLast();
            await baseLayerUpDate(areaMgr.toNames());
          }
          return;
        }

        const feature = features[0];
        const layerType = feature.properties?.layerType;

        // 处理基础行政区划图层
        if (layerType === 'baseLayer') {
          if (areaMgr.getLength() > 4) {
            console.log('已达到最大层级');
            return;
          }

          const nextAreaName = feature.properties.name;
          const nameCollection = [...areaMgr.toNames(), nextAreaName];

          try {
            const ok = await baseLayerUpDate(nameCollection);
            if (ok) {
              await areaMgr.pushName(nextAreaName);
            }
          } catch (err) {
            console.error('处理行政区点击时出错:', err);
          }
          return;
        }

        // 处理专题图层
        if (layerType === 'thematicLayer') {
          try {
            const props = feature.properties || {};
            const sourceId = layerConfigById[feature.layerConfig]?.sourceId ??
              feature.layer?.source ??
              feature.source;

            if (!sourceId) {
              console.warn('未能找到对应图层的 sourceId', feature.layerConfig);
              return;
            }

            // 构建返回的属性对象
            thematicLayerProps = {
              ...props,
              sourceId,
              outlineId: props.outlineLayerId ?? layerConfigById[feature.layerConfig]?.outlineLayerId,
              geometry: feature.geometry,
              id: feature.id,
              layerId: feature.layer?.id,
              layerConfig: feature.layerConfig
            };

            console.log('专题图层点击属性:', thematicLayerProps);

            // 设置高亮样式
            setHighlight(feature, sourceId);

            // 如果有回调函数，则调用
            if (onThematicLayerClick && typeof onThematicLayerClick === 'function') {
              onThematicLayerClick(thematicLayerProps);
            }

          } catch (err) {
            console.error('专题图层高亮处理出错:', err);
          }
          return;
        }

        // 默认情况：触发边界上升事件
        if (areaMgr.getLength() > 1) {
          await areaMgr.popLast();
          await baseLayerUpDate(areaMgr.toNames());
        }

      } finally {
        isProcessing = false;
      }
    };

    // 绑定事件监听
    map.on('click', mapClickListener);

    // 返回清理函数
    return () => {
      if (mapClickListener) {
        map.off('click', mapClickListener);
        mapClickListener = null;
      }
    };
  };

  /**
   * 获取最后点击的专题图层属性
   * @returns {Object|null} 专题图层属性
   */
  const getLastThematicLayerProps = () => {
    return thematicLayerProps;
  };

  /**
   * 清理地图点击监听
   */
  const cleanupMapClickListener = () => {
    if (mapClickListener) {
      map.off('click', mapClickListener);
      mapClickListener = null;
    }
    thematicLayerProps = null;
    isProcessing = false;
  };

  return{
    initMapClickListener,
    getLastThematicLayerProps,
    cleanupMapClickListener
  }
}
