/**
 * @Author: ChLingS
 * @Date: 2023-11-20 15:16:35
 * @Description: fetch 风格的请求实例，支持 baseURL / timeout / 请求/响应拦截器
 */

import axios from 'axios';

// 创建axios实例
const instance = axios.create({
  baseURL: 'https://geo.datav.aliyun.com/areas_v3/bound',
  timeout: 15000000,
});

// 配置响应拦截器
instance.interceptors.response.use(
  (res) => {
    if (res.status === 200) {
      return res.data;
    } else {
      console.error('请求失败');
      return Promise.reject('请求失败');
    }
  },
  (err) => {
    return Promise.reject(err);
  }
);
// 导出实例
export default instance;
