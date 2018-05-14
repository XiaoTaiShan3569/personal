import axios from 'axios'
import store from '@/store'
import {loginURL, redirectURL, baseURL} from '@/conf/env'

axios.defaults.baseURL = baseURL;
axios.defaults.headers.common['Cache-Control'] = 'no-cache';
axios.defaults.headers.common['Pragma'] = 'no-cache';
axios.defaults.headers.post['Content-Type'] = 'application/json';
axios.defaults.headers.get['Content-Type'] = 'application/json';

axios.interceptors.request.use(
  config => {
    // console.log(`axios.interceptors.request.use: `, config);
    config.validateStatus = function (status) {
      return Number(status) === 200;
    };
    if (store.getters.user_id) {
      config.headers.Authorization = `Bearer ${store.getters.user_id}`;
    }
    return config;
  },
  err => {
    console.error('request.err: ', err);
    return Promise.reject(err);
  }
);

axios.interceptors.response.use(
  res => {
    if (Number(res.status) === 200 && res.data) {
      if (res.data.result === 'success') {
        return Promise.resolve(res.data.data);
      } else if (res.data.result === 'error') {
        console.error('response.err: ', res.data.message);
        return Promise.reject(res.data);
      } else {
        return Promise.reject(res.data);
      }
    } else if (Number(res.status) === 401) {
      console.error('未登陆', res);
      store.commit('LOGOUT');
      location.replace(loginURL + encodeURIComponent(location.origin));
      return Promise.reject(res);
    } else {
      console.error('response: ', res);
      return Promise.reject(res);
    }
  },
  err => {
    console.log('response.err: ', JSON.stringify(err));
    if (err.response.data) {
      return Promise.reject(err.response.data);
    }
    return Promise.reject(err.response);
  }
);

export {axios as default}
