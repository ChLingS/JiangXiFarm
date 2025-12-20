import { inject, ref } from 'vue'
import mapboxgl from 'mapbox-gl'
import { JiangXiBoundsApi } from '@/api/api'
import * as turf from '@turf/turf'

export default () => {
  const { map } = inject('$scene_map')
  const AD_NAMES = ref(['江西省'])

  let currentClickListener = null;
  const SOURCE_ID = 'polygon-data-source';
  const FILL_LAYER_ID = 'polygon-fill-layer';
  const OUTLINE_LAYER_ID = 'polygon-outline-layer';
  const LABEL_LAYER_ID = 'polygon-LABEL-layer'

  const SOURCE_FIELD_ID = 'polygon-field-data-source';
  const FILL_FIELD_LAYER_ID = 'polygon-field-fill-layer';
  const OUTLINE_FIELD_LAYER_ID = 'polygon-field-outline-layer';

  let currentPopup = null; // 跟踪当前popup
  let currentHighlightedFeatureId = null; // 当前高亮要素ID

  const fetchBoundaryDataByName = async (name) => {
    try {
      const response = await JiangXiBoundsApi.getAreaByName(name, AD_NAMES.value.length - 1)
      return response
    } catch (error) {
      console.error('获取边界数据失败:', error)
      return null
    }
  };

  const fetchFieldDataByName = async (name) => {
    try {
      const response = await JiangXiBoundsApi.getFieldByName(name)
      return response
    } catch (error) {
      console.error('获取田块数据失败:', error)
      return null
    }
  };

  // 清除高亮
  function clearHighlight() {
    if (currentHighlightedFeatureId !== null) {
      try {
        console.log('清除高亮，要素ID:', currentHighlightedFeatureId);

        // 检查数据源是否已加载
        const source = map.getSource(SOURCE_FIELD_ID);
        if (!source) {
          console.warn('田块数据源不存在');
          return;
        }

        // 检查要素是否存在于数据源中
        const sourceData = source.serialize();
        if (sourceData && sourceData.data && sourceData.data.features) {
          const featureExists = sourceData.data.features.some(feature => {
            const id = feature.id || feature.properties?.id;
            return id === currentHighlightedFeatureId;
          });

          if (featureExists) {
            // 移除之前要素的高亮状态
            map.setFeatureState(
              {
                source: SOURCE_FIELD_ID,
                id: currentHighlightedFeatureId
              },
              { highlighted: false }
            );
            console.log('成功清除要素高亮状态');
          } else {
            console.warn('要素不存在于数据源中:', currentHighlightedFeatureId);
          }
        }
      } catch (error) {
        console.warn('清除高亮状态失败:', error);
      }
      currentHighlightedFeatureId = null;
    }
  }

  // 高亮指定要素
  function highlightFeature(feature) {
    console.log('准备高亮要素:', feature);

    // 获取要素的唯一ID
    const featureId = feature.id || feature.properties?.id;
    if (!featureId) {
      console.warn('要素没有ID，无法高亮', feature);
      return;
    }

    console.log('高亮要素ID:', featureId);

    // 如果已经高亮的是同一个要素，不重复设置
    if (currentHighlightedFeatureId === featureId) {
      console.log('要素已高亮，跳过');
      return;
    }

    // 清除之前的高亮
    clearHighlight();

    try {
      // 检查数据源是否存在
      const source = map.getSource(SOURCE_FIELD_ID);
      if (!source) {
        console.warn('田块数据源不存在');
        return;
      }

      // 设置当前要素为高亮状态
      map.setFeatureState(
        {
          source: SOURCE_FIELD_ID,
          id: featureId
        },
        { highlighted: true }
      );

      console.log('成功设置要素高亮状态');

      // 保存当前高亮要素的ID
      currentHighlightedFeatureId = featureId;

      // 强制触发重绘
      setTimeout(() => {
        map.triggerRepaint();
      }, 0);

    } catch (error) {
      console.error('设置高亮状态失败:', error);
    }
  }


  // 创建行政区边界图层
  const initializeLayers = () => {
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
        paint: {
          'fill-color': '#DBDBDB',
          'fill-opacity': 0
        }
      });
    }

    if (!map.getLayer(OUTLINE_LAYER_ID)) {
      map.addLayer({
        id: OUTLINE_LAYER_ID,
        type: 'line',
        source: SOURCE_ID,
        paint: {
          'line-color': '#cccccc',
          'line-width': 4,
          'line-opacity': 1
        }
      });
    }

    if (!map.getLayer(LABEL_LAYER_ID)) {
      // 确保标注图层在正确的位置，通常应该放在最上面
      const beforeLayerId = undefined; // 设置为undefined，表示添加到最顶层
      // 或者指定一个具体的图层ID，让标注图层在其之上

      map.addLayer({
        id: LABEL_LAYER_ID,
        type: 'symbol',
        source: SOURCE_ID,
        layout: {
          'text-field': ['get', 'name'],
          'text-size': [
            'interpolate',
            ['linear'],
            ['zoom'],
            5, 8,   // 缩放级别5时，字体大小8
            10, 12, // 缩放级别10时，字体大小12
            15, 16  // 缩放级别15时，字体大小16
          ],
          'text-font': ['Noto Sans Regular', 'Arial Unicode MS Regular'],
          'text-anchor': 'center',
          'text-offset': [0, 0],
          'text-allow-overlap': false,
          'text-ignore-placement': false,
          'symbol-placement': 'point',
          'symbol-z-order': 'source',
          'text-optional': true, // 如果与其他标注冲突，可以选择不显示
          'text-justify': 'center',
          'text-padding': 2
        },
        paint: {
          'text-color': '#333333',
          'text-halo-color': '#ffffff',
          'text-halo-width': 1.5,
          'text-halo-blur': 0.5,
          'text-opacity': 0.9
        }
      }, beforeLayerId); // 指定添加到哪个图层之前
    }

    // 创建田块图层
    if (!map.getSource(SOURCE_FIELD_ID)) {
      map.addSource(SOURCE_FIELD_ID, {
        type: 'geojson',
        data: {
          type: 'FeatureCollection',
          features: []
        }
      });
    }

    if (!map.getLayer(FILL_FIELD_LAYER_ID)) {
      map.addLayer({
        id: FILL_FIELD_LAYER_ID,
        type: 'fill',
        source: SOURCE_FIELD_ID,
        paint: {
          'fill-color': [
            'case',
            ['boolean', ['feature-state', 'highlighted'], false],
            '#ff6b6b',  // 高亮颜色
            '#7cfc00'   // 正常颜色
          ],
          'fill-opacity': [
            'case',
            ['boolean', ['feature-state', 'highlighted'], false],
            0.6,  // 高亮透明度
            0.3   // 正常透明度
          ],
          'fill-outline-color': '#feaa03'
        }
      });
    }

    if (!map.getLayer(OUTLINE_FIELD_LAYER_ID)) {
      map.addLayer({
        id: OUTLINE_FIELD_LAYER_ID,
        type: 'line',
        source: SOURCE_FIELD_ID,
        paint: {
          'line-color': [
            'case',
            ['boolean', ['feature-state', 'highlighted'], false],
            '#ff0000',  // 高亮颜色
            '#228b22'   // 正常颜色
          ],
          'line-width': [
            'case',
            ['boolean', ['feature-state', 'highlighted'], false],
            3,  // 高亮线宽
            2   // 正常线宽
          ],
          'line-opacity': 1
        }
      });
    }
  };

  const updateFieldLayerData = async (areaData) => {
    console.log('更新田块数据，清除高亮状态');

    // 清除高亮状态
    clearHighlight();

    // 关闭之前的popup
    if (currentPopup) {
      currentPopup.remove();
      currentPopup = null;
    }

    const source = map.getSource(SOURCE_FIELD_ID);
    if (source) {
      // 确保每个要素都有id
      const featuresWithId = areaData.features.map((feature, index) => {
        return {
          ...feature,
          id: feature.id || feature.properties?.id || `field_${index}_${Date.now()}`
        };
      });

      source.setData({
        type: 'FeatureCollection',
        features: featuresWithId
      });
    }
  };

  const updateLayerData = async (areaData) => {
    const source = map.getSource(SOURCE_ID);
    if (source) {
      source.setData({
        type: 'FeatureCollection',
        features: areaData.features
      });
    }
    // 调整视图
    const bounds = turf.bbox(areaData);
    if (bounds) {
      map.fitBounds([[bounds[0], bounds[1]], [bounds[2], bounds[3]]], {
        padding: 20
      });
    } else if (areaData.features[0]?.properties?.center) {
      const level = AD_NAMES.value.length;
      const zoom = Math.min(7 + level, 12);
      map.flyTo({
        center: areaData.features[0].properties.center,
        zoom: zoom,
        duration: 1000
      });
    }
    return areaData;
  };

  const setupClickEvents = () => {
    if (currentClickListener) {
      map.off('click', currentClickListener);
    }

    const clickHandler = async (e) => {
      const point = e.point;
      console.log('点击坐标:', point);

      // 检查是否点击到田块层
      const fieldFeatures = map.queryRenderedFeatures(point, {
        layers: [FILL_FIELD_LAYER_ID, OUTLINE_FIELD_LAYER_ID]
      });

      console.log('找到的田块要素:', fieldFeatures);

      if (fieldFeatures.length > 0) {
        const clickedFeature = fieldFeatures[0];
        const featureId = clickedFeature.id || clickedFeature.properties?.id;

        // 检查是否点击的是同一个要素
        const isSameFeature = currentHighlightedFeatureId === featureId;

        // 如果点击的是不同的要素，先清除之前的高亮
        if (!isSameFeature) {
          clearHighlight();
        }

        // 高亮点击的要素
        highlightFeature(clickedFeature);

        // 关闭之前的popup
        if (currentPopup) {
          currentPopup.remove();
          currentPopup = null;
        }

        // 创建信息弹窗
        const fieldInfo = clickedFeature.properties;
        const area = turf.area(clickedFeature);
        const areaInMu = (area / 666.67).toFixed(2);

        const popup = new mapboxgl.Popup({
          closeOnClick: false,
          closeButton: true
        })
          .setLngLat(e.lngLat)
          .setHTML(`
          <div style="padding: 10px; font-family: Arial, sans-serif; min-width: 200px;">
            <h4 style="margin: 0 0 8px 0; color: #333; border-bottom: 1px solid #eee; padding-bottom: 4px;">
              田块信息
            </h4>
            <p style="margin: 4px 0; display: flex; justify-content: space-between;">
              <span style="font-weight: bold; color: #666;">名称:</span>
              <span style="color: #333;">${fieldInfo.name || '未知'}</span>
            </p>
            <p style="margin: 4px 0; display: flex; justify-content: space-between;">
              <span style="font-weight: bold; color: #666;">面积:</span>
              <span style="color: #333;">${areaInMu} 亩</span>
            </p>
            <div style="margin-top: 8px; padding-top: 8px; border-top: 1px solid #eee; text-align: center;">
              <small style="color: #999;">点击地图其他位置取消高亮</small>
            </div>
          </div>
        `)
          .addTo(map);

        // 修改popup关闭事件处理
        popup.on('close', () => {
          // 延迟清除高亮，避免与点击事件冲突
          setTimeout(() => {
            clearHighlight();
          }, 100);
        });

        currentPopup = popup;

        // 返回，不执行后面的行政区点击逻辑
        return;
      }

      // 如果没有点击到田块，清除高亮
      clearHighlight();

      // 关闭popup
      if (currentPopup) {
        currentPopup.remove();
        currentPopup = null;
      }

      // 行政区事件
      let features = [];
      try {
        features = map.queryRenderedFeatures(point, {
          layers: [FILL_LAYER_ID, OUTLINE_LAYER_ID]
        });
      } catch (err) {
        console.warn('在查询地图要素时出错:', err);
        return;
      }

      // 点击到的是要素图层
      if (features.length > 0) {
        if (AD_NAMES.value.length > 4) {
          console.log('已达到最大层级');
        }
        // 到达村级
        else if (AD_NAMES.value.length == 4) {
          console.log('点击村级:', features[0].properties);
          const nextAreaName = features[0].properties.cun;
          AD_NAMES.value.push(nextAreaName);

          // 更新行政区
          let nextAreaData = await fetchBoundaryDataByName(nextAreaName);
          updateLayerData(nextAreaData);

          // 更新田块
          let fieldData = await fetchFieldDataByName(nextAreaName);
          updateFieldLayerData(fieldData);
        }
        // 行政区变化
        else {
          console.log('点击行政区:', features[0].properties);
          const nextAreaName = features[0].properties.name;
          AD_NAMES.value.push(nextAreaName);
          let nextAreaData = await fetchBoundaryDataByName(nextAreaName);
          updateLayerData(nextAreaData);

          // 如果进入村级，加载田块数据
          if (AD_NAMES.value.length === 4) {
            let fieldData = await fetchFieldDataByName(nextAreaName);
            updateFieldLayerData(fieldData);
          } else {
            // 清除田块数据
            updateFieldLayerData({ type: 'FeatureCollection', features: [] });
          }
        }
      }
      // 点击到图层外侧
      else {
        if (AD_NAMES.value.length == 1) {
          console.log("已经为省级图层");
        } else {
          AD_NAMES.value.pop();
          const lastAreaName = AD_NAMES.value.at(-1);
          let lastAreaData = await fetchBoundaryDataByName(lastAreaName);
          updateLayerData(lastAreaData);

          // 如果回到非村级，清除田块数据
          if (AD_NAMES.value.length < 4) {
            updateFieldLayerData({ type: 'FeatureCollection', features: [] });
          } else {
            // 如果还在村级，重新加载田块数据
            let fieldData = await fetchFieldDataByName(lastAreaName);
            updateFieldLayerData(fieldData);
          }
        }
      }
    };

    map.on('click', clickHandler);
    currentClickListener = clickHandler;
  };

  const layerInitialize = async () => {
    const areaName = AD_NAMES.value[AD_NAMES.value.length - 1];
    const areaData = await fetchBoundaryDataByName(areaName);
    if (!areaData) return;

    initializeLayers();
    updateLayerData(areaData);
    setupClickEvents();

    // 添加地图加载完成后的调试
    map.once('idle', () => {
      console.log('地图加载完成，图层列表:', map.getStyle().layers);
    });

    // 监听数据源加载完成
    map.on('sourcedata', (e) => {
      if (e.sourceId === SOURCE_FIELD_ID && e.isSourceLoaded) {
        console.log('田块数据源已加载');
      }
    });

    // 监听图层加载完成
    map.on('render', () => {
      if (map.isStyleLoaded()) {
        const fillLayer = map.getLayer(FILL_FIELD_LAYER_ID);
        const outlineLayer = map.getLayer(OUTLINE_FIELD_LAYER_ID);
        if (fillLayer && outlineLayer) {
          console.log('田块图层已加载并可用');
        }
      }
    });


  };

  return {
    layerInitialize,
  };
};
