/*
 * @Description:
 * @Author: your name
 * @version:
 * @Date: 2023-11-17 09:33:10
 * @LastEditors: your name
 * @LastEditTime: 2023-11-17 10:12:13
 */
import {
  DrawEvent,
  DrawPolygon,
  DrawRect,
  DrawCircle,
  DrawLine,
} from "@antv/l7-draw";

class ToolManager {
  constructor(scene, option = {}) {
    this.scene = scene;
    this.toolsCate = option.toolsCate
      ? option.toolsCate
      : ["drawPolygonTool", "drawRectTool", "drawCircleTool"];
    this.tools = {};
    this.initTool();
  }

  // 初始化工具
  initTool() {
    this.toolsCate.forEach((tool) => {
      switch (tool) {
        case "drawPolygonTool":
          this.tools[tool] = new DrawPolygon(this.scene, {
            //展示面积
            areaOptions: {},
          });
          break;
        case "drawRectTool":
          this.tools[tool] = new DrawRect(this.scene, {
            //展示面积
            areaOptions: {},
          });
          break;
        case "drawCircleTool":
          this.tools[tool] = new DrawCircle(this.scene, {
            //展示面积
            areaOptions: {},
          });
          break;
        case "line":
          this.tools[tool] = new DrawLine(this.scene, {
            distanceOptions: {
              showTotalDistance: false,
              showDashDistance: true,
              format: (meters) => {
                if (meters >= 1000) {
                  return +(meters / 1000).toFixed(2) + "km";
                } else {
                  return +meters.toFixed(2) + "m";
                }
              },
            },
          });
          break;
        default:
          break;
      }
    });
  }

  // 清除所有绘制工具
  stopDrawing(needDestroy = false) {
    for (let key in this.tools) {
      const tool = this.tools[key];
      tool.clear();
      tool.disable();
      tool.removeActiveFeature();
      needDestroy && tool.destroy();
    }
  }

  activeTool(toolType, callback) {
    const targetTool = this.tools[toolType];
    if (targetTool) {
      targetTool.enable();
      targetTool.on(DrawEvent.Change, (allFeatures) => {
        callback && callback(allFeatures);
      });
    }
  }
}

export default ToolManager;
