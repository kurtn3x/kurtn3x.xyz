import { createStore, storeKey } from 'vuex'

export default createStore({
  state: {
    access: '',
    refresh: '',
  },
  getters: {
  },
  mutations: {
    initializeStore(state){
      if ( localStorage.getItem('access')){
        state.access = localStorage.getItem('access')
        state.refresh = localStorage.getItem('refresh')
        // state.isAuthenticated = true
      } else {
        state.access = ''
        state.refresh = ''
        // state.isAuthenticated = false
      }
    },
    setAccess(state, access){
      state.access = access
      // state.isAuthenticated = true
    },
    setRefresh(state,refresh){
      state.refresh= refresh
    }
  },
  actions: {
  },
  modules: {
  }
})
