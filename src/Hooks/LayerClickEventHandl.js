import { inject } from "vue";

/**
 * 管理地图图层点击事件的Hook
 * @param {import('@/plugins/AreaQueryManager').default} areaMgr - 行政区管理器实例
 * @param {Function} baseLayerUpDate - 用于更新底图边界数据的函数
 */

export default (areaMgr, layerConfig, baseLayerUpDate, thematicLayerUpDate,
  setHighlight) => {
  const { map } = inject('$scene_map');

  // 防止并发点击导致的竞争条件
  let isProcessing = false;

  // 地块信息记录
  let thematicLayerProps = null;

  // 地图点击监听
  let mapClickListener = null;

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
            console.log("上升")
            layerConfig.layers.filter(layer => layer.id === 'thematicLayer').forEach(layer => {
              const { sourceId, ...otherParams } = layer.layerParams;
              const layerIds = Object.values(otherParams)
              for (let el of layerIds) {
                console.log("隐藏", el)
                map.setLayoutProperty(el, 'visibility', 'none');
              }
            });
            await areaMgr.popLast();
            await baseLayerUpDate(areaMgr.toNames());
          }
          return;
        }

        const feature = features[0];
        const layerType = feature.properties?.layerType;

        // 处理基础行政区划图层
        if (layerType === 'baseLayer') {
          if (areaMgr.getLength() > 5) {
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
          // 将加载专题数据移动到点击事件里
          if (areaMgr.getLength() == 5) {
            layerConfig.layers.filter(layer => layer.id === 'thematicLayer').forEach(layer => {
              const layerApiName = layer.apiName
              const layerParams = layer.layerParams || {};
              thematicLayerUpDate(layerApiName, areaMgr.toNames(), layerParams)
              console.log("加载", layerApiName);
              // 提取除了sourceId之外的layerParams属性值
              const { sourceId, ...otherParams } = layer.layerParams;
              const layerIds = Object.values(otherParams)
              for (let el of layerIds) {
                map.setLayoutProperty(el, 'visibility', 'visible');
              }
            });
          }
          return;

        }

        // 处理专题图层
        if (layerType === 'thematicLayer') {
          try {
            const props = feature.properties || {};
            const sourceId = feature.source

            if (!sourceId) {
              console.warn('未能找到对应图层的 sourceId', feature.layerConfig);
              return;
            }

            // 构建返回的属性对象
            thematicLayerProps = {
              ...props,
              sourceId,
              // outlineId: props.outlineLayerId ?? layerConfigById[feature.layerConfig]?.outlineLayerId,
              geometry: feature.geometry,
              id: feature.id,
              layerId: feature.layer?.id,
              layerConfig: feature.layerConfig
            };

            console.log('专题图层点击属性:', thematicLayerProps);

            // 设置高亮样式
            setHighlight(feature.id, sourceId)
          //   const searchFeatures = await map.querySourceFeatures(sourceId, {
          //   filter: ["==", "bdh", props.bdh]
          // });
          // console.log('找到的值', searchFeatures);
          

            // 如果有回调函数，则调用
            if (onThematicLayerClick && typeof onThematicLayerClick === 'function') {
              onThematicLayerClick(thematicLayerProps);
            }

          } catch (err) {
            console.error('专题图层高亮处理出错:', err);
          }
          return;
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

  return {
    initMapClickListener,
    getLastThematicLayerProps,
    cleanupMapClickListener
  }
}
