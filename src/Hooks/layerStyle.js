import { PolygonLayer } from '@antv/l7'

const provinceLayer = (boundLayerData) => {
    const boundaryLayer = new PolygonLayer({
        autoFit: false,
        event: true,
    }).source({
        type: 'FeatureCollection',
        features: boundLayerData.features,
    })
    .color('rgba(255, 255, 255, 0)')  // 中间完全透明
    .shape('fill')
    .style({ 
        opacity: 1,  // 设置为1，不透明度由color控制
        stroke: '#CCCCCC',  // 灰色边缘
        strokeWidth: 1,
    })
    
    return boundaryLayer;
}

    