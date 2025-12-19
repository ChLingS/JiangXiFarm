import { inject, ref, onUnmounted } from 'vue'
import { PolygonLayer } from '@antv/l7'
import { JiangXiBoundsApi } from '@/api/api'

export default () => {
    const { map, scene } = inject('$scene_map')
    const boundaryLayer = ref(null)

    // 行政区划代码
    const AD_CODES = ['360000']

    const createMapboxLayers = (data, map) => {
        // 确保数据源ID唯一，避免重复添加
        const sourceId = 'polygon-data-source';
        const fillLayerId = 'polygon-fill-layer';
        const outlineLayerId = 'polygon-outline-layer';

        // 先清理可能存在的旧图层和数据源，避免重复添加错误
        if (map.getLayer(fillLayerId)) map.removeLayer(fillLayerId);
        if (map.getLayer(outlineLayerId)) map.removeLayer(outlineLayerId);
        if (map.getSource(sourceId)) map.removeSource(sourceId);

        // 1. 添加数据源 (GeoJSON 格式)
        map.addSource(sourceId, {
            type: 'geojson',
            data: {
                type: 'FeatureCollection',
                features: data.features // 直接使用传入的 features 数组
            }
        });

        // 2. 创建填充图层（对应原代码中的 layer）
        map.addLayer({
            id: fillLayerId,
            type: 'fill', // 填充图层类型[7,10](@ref)
            source: sourceId,
            paint: {
                'fill-color': '#DBDBDB', // 对应 rgba(219, 219, 219, ...)
                'fill-opacity': 0 // 完全透明，实现中空效果[1,7](@ref)
            }
            // 注意：Mapbox 的 fill 图层默认不直接提供 click 事件属性，需通过 map.on 绑定
        });

        // 3. 创建边框图层（对应原代码中的 createOutLine）
        map.addLayer({
            id: outlineLayerId,
            type: 'line', // 线图层类型[10](@ref)
            source: sourceId,
            paint: {
                'line-color': '#feaa03ff', // 边框颜色
                'line-width': 1, // 边框粗细[9](@ref)
                'line-opacity': 1 // 不透明度
            }
        });

        // 返回图层ID，方便后续操作（如添加事件）
        return {
            fillLayer: fillLayerId,
            outlineLayer: outlineLayerId,
            source: sourceId
        };
    };

    // 获取边界数据
    const fetchBoundaryData = async (adcode) => {
        try {
            const response = await JiangXiBoundsApi.getBounds(adcode)
            return response
        } catch (error) {
            console.error('获取边界数据失败:', error)
            return null
        }
    }



    // 设置点击事件
    const setupClickEvents = (layer) => {
        // Use Mapbox's queryRenderedFeatures at the clicked point.
        if (!map) return

        map.on('click', (e) => {
            const point = e.point // pixel coordinates
            // query features from the map's fill/line layers we add below
            const layerIds = [layer.getLayerIds()]
            let features = []
            try {
                features = map.queryRenderedFeatures(point, { layers: layerIds }) || []
            } catch (err) {
                console.warn('queryRenderedFeatures failed:', err)
            }

            if (features.length > 0) {
                // A函数：点击到图层（取第一个 feature）
                console.log('A函数: 点击图层', features[0].properties)
            } else {
                // B函数：空白点击
                console.log('B函数: 点击空白', e.lngLat)
            }
        })
    }
    // 初始化
    const layerInit = async () => {
        const lastAdcode = AD_CODES.at(-1)
        const data = await fetchBoundaryData(lastAdcode)

        const { fillLayer, outlineLayer, source } = createMapboxLayers(data, map)

        
        // boundaryLayer.value = layer
    }


    return {
        layerInit
    }
}