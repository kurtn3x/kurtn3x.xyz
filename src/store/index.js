import { createStore, storeKey } from 'vuex'

export default createStore({
  state: {
    access: '',
    refresh: false,
  },
  getters: {
  },
  mutations: {
    initializeStore(state){
      if ( localStorage.getItem('access')){
        state.access = localStorage.getItem('access')
        // state.isAuthenticated = true
      } else {
        state.access = ''
        // state.isAuthenticated = false
      }
    },
    setAccess(state, access){
      state.access = access
      // state.isAuthenticated = true
    },
    removeToken(state){
      state.token = ''
      state.isAuthenticated = false
    }
  },
  actions: {
  },
  modules: {
  }
})
