<template>
  <div id="app">
    <b-nav tabs align="center" class="navbar sticky-top navbar-expand navbar-dark bg-dark">

      <!-- Links on the left side -->
        <div class="navbar-nav me-2">
          <li class="nav-item">
            <router-link to="/home" class="nav-link">
              Home
            </router-link>
          </li>
        </div>
      
      <!--  Links on the right side  -->
        <!-- If user is NOT logged in  -->
          <div v-if="!currentUser" class="navbar-nav ms-auto ">
            <li class="nav-item">
              <router-link to="/register" class="nav-link">
                Sign Up
              </router-link>
            </li>

            <li class="nav-item">
              <router-link to="/login" class="nav-link">
                Login
              </router-link>
            </li>
          </div>
          
        <!--  If  user is logged in -->
          <div v-if="currentUser" class="navbar-nav ms-auto">
            <b-dropdown id="dropdown-1" text="My Profile" class="m-md-2">
            <b-dropdown-item @click="logout">Logout</b-dropdown-item>
            <b-dropdown-item>Second Action</b-dropdown-item>
            <b-dropdown-item>Third Action</b-dropdown-item>
            </b-dropdown>
          </div>

    </b-nav>


    <!--  All other elements -->
    <div class="container">
      <router-view />
    </div>


  </div>
</template>

<script>
import VueCookies from 'vue-cookies'
import axios from 'axios'
export default {
  name: 'App',
  computed: {
    currentUser() {
      return this.$store.state.isAuthenticated;
    },
  },

  beforeCreate(){
    this.$store.commit('initializeStore')
    let config = {
      withCredentials: true ,
      headers: {
        "X-CSRFToken": VueCookies.get('csrftoken'),
      }
    }

    axios
    .get("/auth/authenticated", config)
    .then(response => {
      if (response.status == 200){
        console.log("authenticated")
        this.$store.commit("setAccess", true)
      } else {
        this.$store.commit("setAccess", false)
      }
    })
    .catch(error => {
      this.$store.commit("setAccess", false)
    })
  },

  methods: {

    logout(){
      let config = {
        withCredentials: true,
        headers: {
          "X-CSRFToken": VueCookies.get('csrftoken'),
        }
      }

      axios
      .post('/auth/logout', "", config)
      .then(response => {
        if (response.status == 200){
          this.$store.commit("setAccess", false)
        }
      })
      .catch(error => {
      })
 
    },

  }
}
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
  padding: 10px;

  a {
    font-weight: bold;
    color: #1681ec;

    &.router-link-exact-active {
      color: #11f0dd;
    }
  }
}
</style>
