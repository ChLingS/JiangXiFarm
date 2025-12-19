/*
* @Description: API 接口统一出口
* @Author: ChLingS
* @Date: 2025-12-14 11:43:00
* @LastEditors: ChLingS
* @LastEditTime: 2025-12-14 11:43:00

*/

import request from './request'

export const JiangXiBoundsApi = {
  getBounds: (id) => {
    return request({
      url: `/${id}_full.json`,
      method: 'GET',
    })
  },
  getVillageBounds: (id) => {
    return request({
      url: `/${id}.json`,
      method: 'GET',
    })
  }
};
