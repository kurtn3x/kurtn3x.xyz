<template>
  <div id="app">
    <b-nav tabs align="center" class="navbar sticky-top navbar-expand navbar-dark bg-dark" id="mynavbar">

      <!-- Links on the left side -->
        <div class="navbar-nav mx-5">
            <router-link id="test123" to="/home" class="nav-link" >
              Home
            </router-link>
        </div>

      
      <!--  / links on right side -->
      
      <!--  Links on the right side  -->
        <!-- If user is NOT logged in  -->
          <div v-if="!currentUser" class="navbar-nav ms-auto  mx-5">
              <router-link to="/register" class="nav-link">
                Sign Up
              </router-link>

              <router-link to="/login" class="nav-link">
                Login
              </router-link>
          </div>
          
        <!--  If  user is logged in -->
          <div v-if="currentUser" class="navbar-nav ms-auto mx-5 ">
            <b-dropdown id="profilebtn" text="My Profile" variant="secondary" >
            <b-dropdown-item>My Profile</b-dropdown-item>
            <b-dropdown-item>Settings</b-dropdown-item>
            <b-dropdown-item @click="logout">Logout</b-dropdown-item>
            </b-dropdown>
          </div>

      <!-- / links on right side -->

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

#profilebtn {
	background-color:transparent;
	border:none;
	display:block;
	cursor:pointer;
	color: rgba(255, 255, 255, 0.55);
	text-decoration:none;
  padding-right: 0.5rem;
  border-top-left-radius: 0.25rem;
  border-top-right-radius: 0.25rem;
  padding-left: 0.5rem;
  border: 1px solid transparent;
  border-color: transparent;
  font-size:20px;

}
#profilebtn:hover, #profilebtn:active {
  background: none;
  border: 1px solid transparent;
  color: rgba(255, 255, 255, 0.75);
  border-color: #e9ecef #e9ecef #dee2e6;
  isolation: isolate;
}

#mynavbar{
  font-size:20px;
}



/*
#test123{
  background-color:rgb(58, 57, 57);
  height:50px;
}

#test123:active{
  outline-color:#2bff00;

  background-color:rgb(251, 0, 0);
}

test123:focus{
    outline-color:#2bff00;
    background-color:rgb(0, 30, 255);

}

#router-link{
  color: rgb(255, 4, 4);
  font-size: 20px;
}
*/
</style>
