import Vue from "vue";
import App from "./App.vue";
import router from "./router";
import "./plugins/element.js";

// 导入全局样式表
import "./assets/css/global.css";
// 导入字体样式
import "./assets/fonts/iconfont.css";

// 引入地图插件
import VueAMap from "vue-amap";
Vue.use(VueAMap);
VueAMap.initAMapApiLoader({
  key: 'd700ed8f81aa62669b118978cefd82b7',
  plugin: ['AMap.Scale', 'AMap.OverView', 'AMap.ToolBar', 'AMap.MapType', 'AMap.PlaceSearch', 'AMap.Geolocation', 'AMap.Geocoder'],
  v: '1.4.4',
  uiVersion: '1.0'});

import axios from "axios";
// 配置请求根路径
Vue.prototype.$changeHttp = function(type) {
  if(type === 'zsxt') {
    axios.defaults.baseURL = 'http://192.168.8.166:8765/api/';
  } else {
    axios.defaults.baseURL = 'http://47.105.215.208:8005/';
  }
}
// 配置拦截器
axios.interceptors.request.use(config => {
  config.headers.token = window.sessionStorage.getItem('token');
  // 在最后必须 return config
  return config
});
axios.interceptors.response.use(config => {
  return config
});

Vue.prototype.$http = axios;

Vue.config.productionTip = false;

new Vue({
  router,
  render: h => h(App)
}).$mount("#app");
