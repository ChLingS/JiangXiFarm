import { inject } from "vue";
import layerConfig from '@/config/layerConfig.json';
import { el } from "element-plus/es/locale";

/**
 * 管理地图图层点击事件的Hook
 * @param {import('@/models/AreaQueryManager').default} areaMgr - 行政区管理器实例
 */

export default ( areaMgr ) => {
    const { map } = inject('$scene_map');


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

    const analyzeLayerClick = () => {
        return (e) => {
            const features = map.queryRenderedFeatures(e.point);
            if (features.length > 0) {
                // 获取所有匹配的图层配置
                const matches = features.flatMap(feature => {
                    const layerId = feature.layer?.id;
                    return Object.entries(layerConfigById)
                        .filter(([, cfg]) => cfg?.sourceid === layerId)
                        .map(([configId, cfg]) => ({ configId, ...cfg, feature }));
                });
                if (!matches.length) {
                    console.log("点击的图层未能与配置中的图层匹配");
                    return null;
                }
                // 按 zIndex 降序排序（最高在最前）
                matches.sort((a, b) => (b.zIndex || 0) - (a.zIndex || 0));

                // 直接返回 zIndex 最高的 feature
                const { feature, configId } = matches[0];
                feature.layerType = configId.layerType;
                return feature;
            } else {
                // 未点击到要素
                return null;
            }
        };
    }

    const handleLayerClick = () => {
        const featureAnalyzer = analyzeLayerClick();
        // 没有点击到图层，触发boundary上升事件
        map.on('click', async (e) => {
            const feature = featureAnalyzer(e);
            if (feature) {
                // 处理点击到的要素
                // 分析feature属性
                if (feature.layerType === 'baseLayer') {
                    //说明触发的是行政区划底图事件
                    console.log("点击到行政区划底图要素:", feature);
                    //判断是否为最底层行政区划
                    if (areaMgr.getLength() > 4) {
                        console.log('已达到最大层级');
                    } else {
                        // 行政区变化   
                        console.log('点击行政区:', feature);
                        const nextAreaName = feature.properties.name;
                        // ------------------------修改并引入MapBoundaryManager，主要是将点击事件从图层渲染中抽离出来-------------------------------------
                        await areaMgr.push(nextAreaName);
                    }

                }
                else if (feature.layerType === 'thematicLayer') {
                    //说明触发的是专题图层事件
                    console.log("点击到专题图层要素:", feature);
                }
            } else {
                // 触发行政区划边界上升事件
                console.log("触发上升事件，重绘边界");
            }
        });
    };
    return {
        handleLayerClick,
    }
}