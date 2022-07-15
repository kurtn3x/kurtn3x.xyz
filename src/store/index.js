import { createStore, storeKey } from 'vuex'

export default createStore({
  state: {
    isAuthenticated : false,
  },
  getters: {
  },
  mutations: {
    initializeStore(state){
      state.isAuthenticated = false
    },
    setAccess(state, access){
      state.isAuthenticated = access
    },

  },
  actions: {
  },
  modules: {
  }
})
