<template>
  <div id="app">
    <nav class="navbar navbar-expand navbar-dark bg-dark">
      <div class="navbar-nav mr-auto">
        <li class="nav-item">
          <router-link to="/home" class="nav-link">
            <font-awesome-icon icon="home" /> Home
          </router-link>
        </li>
        <div class="navbar-nav mr-auto">
        <li class="nav-item">
            <router-link to="/tutorials" class="nav-link">Tutorials</router-link>
          </li>
          <li class="nav-item">
            <router-link to="/add" class="nav-link">Add</router-link>
        </li>
        </div>
        <li v-if="showAdminBoard" class="nav-item">
          <router-link to="/admin" class="nav-link">Admin Board</router-link>
        </li>
        <li v-if="showModeratorBoard" class="nav-item">
          <router-link to="/mod" class="nav-link">Moderator Board</router-link>
        </li>
      </div>

      <div v-if="!currentUser" class="navbar-nav ml-auto">
        <li class="nav-item">
          <router-link to="/register" class="nav-link">
            <font-awesome-icon icon="user-plus" /> Sign Up
          </router-link>
        </li>
        <li class="nav-item">
          <router-link to="/login" class="nav-link">
            <font-awesome-icon icon="sign-in-alt" /> Login
          </router-link>
        </li>
      </div>

      <div v-if="currentUser" class="navbar-nav ml-auto">
        <li class="nav-item">
          <button class="nav-link" @click="logout">
            <font-awesome-icon icon="sign-out-alt" /> LogOut
          </button>
        </li>
      </div>
    </nav>

    <div class="container">
      <router-view />
    </div>
  </div>
</template>

<script>
import axios from 'axios'
export default {
  name: 'App',
  computed: {
    currentUser() {
      return this.$store.state.isLogged;
    },
  },
  beforeCreate(){
    this.$store.commit('initializeStore')
    const access = this.$store.state.access

    if (access) {
      axios.defaults.headers.common['Authorization'] = 'JWT ' + access
    } else {
      axios.defaults.headers.common['Authorization'] = ''
    }
  },
  mounted(){
    setInterval(()=> {
      this.getAccess()
    }, 50000)

  },
  methods: {
    getAccess(e){
      if (this.$store.state.isLogged){
        const accessData = {
          refresh: this.$store.state.refresh
        }
        axios
          .post("/auth/jwt/refresh", accessData)
          .then(response => {
            const access = response.data.access
            localStorage.setItem("access", access)
            this.$store.commit("setAccess", access)
            this.$store.commit("setIsLogged", true)

          })
          .catch(error =>{
            console.log(error)
          })
      }
    },
    logout(){
            this.$store.commit('setAccess', '')
            this.$store.commit('setRefresh', '')
            this.$store.commit('setIsLogged', false)
            axios.defaults.headers.common['Authorization'] = ''
            localStorage.setItem("access", '')
            localStorage.setItem("refresh", '')
            localStorage.setItem("isLogged", false)
    }
  }
}
// }
</script>



<style lang="scss">
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
}

nav {
  padding: 30px;

  a {
    font-weight: bold;
    color: #2c3e50;

    &.router-link-exact-active {
      color: #42b983;
    }
  }
}
</style>
