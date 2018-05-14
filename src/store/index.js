import Vue from 'vue';
import Vuex from 'vuex';
import createLogger from 'vuex/dist/logger'
import createPersistedState from 'vuex-persistedstate'
import types from './mutations_types'
import * as actions from './actions';
import {isEmpty, map} from 'lodash'

Vue.use(Vuex);

const state = {
};
const getters = {
};

const mutations = {
};

export default new Vuex.Store({
  strict: process.env.NODE_ENV !== 'production',
  // actions,
  mutations,
  state,
  getters,
  plugins: [createLogger(),
    createPersistedState({storage: window.sessionStorage})]
});
