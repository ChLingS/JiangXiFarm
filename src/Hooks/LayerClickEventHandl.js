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

  const layers = Array.isArray(layerConfig) ? layerConfig : (layerConfig.layers || []);
  const layerConfigById = layers.reduce((acc, layer) => {
    acc[layer.id] = {
      sourceid: layer.layerParams ? layer.layerParams.sourceId : undefined,
      zIndex: layer.zIndex,
      clickable: layer.clickable,
      layerType: layer.id
    };
    return acc;
  }, {});

  const analyzeLayerClick = (features) => {
    if (features.length > 0) {
      // 获取所有匹配的图层配置
      const matches = features.flatMap(feature => {
        const layerId = feature.source;  // 例如: "polygon-fill-layer"

        console.log("点击的图层ID:", layerId);

        return Object.entries(layerConfigById)
          .filter(([, cfg]) => {
            console.log("正在匹配图层ID:", layerId, "与配置ID:", cfg);
            // 匹配三种可能的图层ID
            return cfg.sourceid === layerId
          })
          .map(([configId, cfg]) => ({
            configId,
            ...cfg,
            feature
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

  const handleLayerClick = () => {
    // 没有点击到图层，触发boundary上升事件
    map.on('click', async (e) => {
      if (isProcessing) {
        console.log('正在处理上一次点击，已忽略新的点击');
        return;
      }
      isProcessing = true;
      try {
        const features = map.queryRenderedFeatures(e.point);
        console.log("点击事件中的features", features);
        const feature = analyzeLayerClick(features);
        switch (feature?.layerConfig) {
          case 'baseLayer':
            //说明触发的是行政区划底图事件
            console.log("点击到行政区划底图要素:", feature);
            //判断是否为最底层行政区划
            if (areaMgr.getLength() > 4) {
              console.log('已达到最大层级');
            } else {
              // 行政区变化
              console.log('点击行政区:', feature);
              const nextAreaName = feature.properties.name;
              let pushed = false;
              try {
                await areaMgr.push(nextAreaName);
                pushed = true;
                // 确保支持 baseLayerUpDate 返回 Promise 或同步值
                const ok = await baseLayerUpDate(nextAreaName); // 之前未 await，可能是逻辑错误
                if (!ok && pushed) {
                  await areaMgr.popLast();
                  pushed = false;
                }
              } catch (err) {
                console.error('处理行政区点击时出错:', err);
                if (pushed) {
                  try { await areaMgr.popLast(); } catch (e) { console.error('回退 pop 失败:', e); }
                }
              }
            }
            break;
          case 'thematicLayer':
            //说明触发的是专题图层事件
            console.log("点击到专题图层要素:", feature);
            break;
          case undefined:
            // 触发行政区划边界上升事件
            console.log("触发上升事件，重绘边界");
            if (areaMgr.getLength() > 1) {
              await areaMgr.popLast();
              await baseLayerUpDate(areaMgr.getCurrent().name);
            }
            break;
        }
      } finally {
        isProcessing = false;
      }
    });
  };
  return {
    handleLayerClick,
  }
}
