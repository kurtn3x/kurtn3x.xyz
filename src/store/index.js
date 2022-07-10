import { createStore, storeKey } from 'vuex'

export default createStore({
  state: {
    access: '',
    refresh: '',
    isLogged : false,
  },
  getters: {
  },
  mutations: {
    initializeStore(state){
      if ( localStorage.getItem('access')){
        state.access = localStorage.getItem('access')
        state.refresh = localStorage.getItem('refresh')
        state.isLogged = true
        // state.isAuthenticated = true
      } else {
        state.access = ''
        state.refresh = ''
        state.isLogged = false
        // state.isAuthenticated = false
      }
    },
    setAccess(state, access){
      state.access = access
      // state.isAuthenticated = true
    },
    setRefresh(state,refresh){
      state.refresh= refresh
    },
    setIsLogged(state, logged){
      state.isLogged = logged
    }
  },
  actions: {
  },
  modules: {
  }
})
