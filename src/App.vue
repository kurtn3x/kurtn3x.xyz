<template>
  <div id="app">
    <notifications position= "top center" />
    <b-nav align="start" class="navbar sticky-top navbar-expand navbar-dark bg-dark" id="mynavbar">
      <div id="menuDemo">
        <!--start CssMenu-->
        <div class="menu-icon-wrapper">
          <div ref="icon" class="menu-icon" @click="toggleCssMenu(this)">
            <div class="three-line">
              <span></span>
              <span></span>
              <span></span>
            </div>
          </div>
        </div>
      </div>
      <div id="cssmenu">
        <ul>
            <li> <router-link id="home_button" to="/home" class="nav-link" > Home </router-link></li>

            <!-- WEB-SPECIFIC  -->
                <li id="rightregister" v-if="!this.mobileView && !this.currentUser">
                  <router-link to="/register" class="nav-link">
                    <font-awesome-icon icon="fa-solid fa-user-plus" />
                  </router-link>
                </li>

                <li id="rightlogin" v-if="!this.mobileView && !this.currentUser">
                  <router-link id="login_button" to="/login" class="nav-link">
                    <font-awesome-icon icon="fa-solid fa-right-to-bracket" />
                  </router-link>
                </li>
            <!-- /WEB -->

        	  <!-- MOBILE-SPECIFIC  -->
            <li v-if="this.mobileView && !this.currentUser">
              <router-link to="/register" class="nav-link">Register </router-link>
            </li>

            <li  v-if="this.mobileView && !this.currentUser">
              <router-link id="login_button" to="/login" class="nav-link"> Login</router-link>
            </li>
          
        </ul>
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
    mobileView() {
      return this.mobile_view_bool;
    }
  },
  data() { 
    return {
      mobile_view_bool: false,
    }
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
    toggleCssMenu(icon) {
        var icon = this.$refs.icon;
        var cssmenu = document.getElementById('cssmenu');
        if (icon.className.indexOf('active') == -1) {
            this.mobile_view_bool = true;
            icon.className = 'menu-icon active';
            cssmenu.style.display = "block";
            setTimeout(function(){cssmenu.className = 'active';},0);            
        }
        else {
            icon.className = 'menu-icon';
			cssmenu.className = '';
			setTimeout(function(){cssmenu.style.display = "none";},411); 
        }
    },
    logoutNotify() {
      this.$notify({
        title: "Logged out.",
        type: "error"
      });
    },

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
          this.$router.go('/')
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

#cssmenu
{
    width:100%;
    display:block;
    text-align:left;
    font-family: Avenir, Helvetica, Arial, sans-serif;
    line-height:1.2;
}
#cssmenu ul
{
    width:100%;
    display:block;
    font-size:0;
    text-align:left;
    color:#FFFFFF;
    background-color: transparent;
    border: transparent;
    margin:0; 
    padding:0;
    list-style:none;
    position:relative;
    left: 0%;
    z-index:99;
    border-radius: 3px;
} 

#rightlogin{
  left: 93%;
}
#rightregister{
  left: 85%
}

#cssmenu li
{
    display:inline-block;
    position:sticky;    
    font-size:0; 
    margin:0;
    padding:0;
}

/*Top level items
---------------------------------------*/

#cssmenu >ul>li>span, #cssmenu >ul>li>a 
{   
    font-size:22px;
    color:inherit;
    text-decoration:none;
    padding:14px 20px; 
    font-weight:500;
    text-transform:uppercase;
    letter-spacing:2px;   
    display:inline-flex;   
    position:relative;
    transition:all 0.3s;
}
#cssmenu li:hover > span, #cssmenu li:hover > a
{  
    color:#333333;
    background-color:#F3F3F3;
}

/*######## styles for mobile mode */

.menu-icon {
    display: none;
}

@media only screen and (max-width: 800px) {


    .menu-icon {display:inline-block;}

    #cssmenu  {
        width:100%;
        max-width:400px;
        display:none;
        background-color:#333333;
        border:1px solid rgba(0,0,0,0.2);
        box-sizing:border-box;
        z-index:999999990;
    }

    /*--begin mark1--*/

    #cssmenu  {
        position:fixed;top:0;bottom:0;left:0;right:0;height:100%!important;
        left:-130%;
        right:auto; box-shadow:-4px 0 18px rgba(0,0,0,0.3);
        transition:all 411ms cubic-bezier(.7, 0,1,.4);
    }

    #cssmenu.active {
        left:0;
        transition:all 411ms cubic-bezier(.16,.76,.45,1);
    }

    #mcmenu {z-index:1000000004;}
-fixed-bg {background:#000;z-index:1000000000;}
-fixed-bg.showing {display:block;opacity:0;}-fixed-bg.active {opacity:0.4;}
.menu-icon.active {position:fixed;top:12px;left:12px;z-index:1000000006;}

    /*--end mark1--*/

    #cssmenu ul  {
        background-color:transparent;
        transition:all 411ms ease;
        box-sizing:border-box;
        border:none;
        border-radius: 0;
    }

    #cssmenu .mobileHide {
        display:none;
    }

    #cssmenu li {
        text-align:center;
        display:block;
        position:static;
    }

    #cssmenu >ul>li>span, #cssmenu >ul>li>a 
    {       
        font-size:22px;
    }
    /* #cssmenu li:hover span, #cssmenu li:hover a {
     
        color:#FFFFFF;
        background-color:#333333;
    }*/
}
/*----------- menu-icon ----------------*/
.menu-icon-wrapper {
    padding:0px;
    text-align:left;
}
.menu-icon {
    padding:6px;
    cursor: pointer;
    outline: none;
    background-color:#333333;
    border:1px solid transparent;
    border-radius:3px;
    transition: all 0.25s ease-out;
    user-select:none;
    box-sizing:content-box;
    font-size:0;
    position:relative;
}

.menu-icon.active{
    background-color:#333333;
}
.three-line{
  width: 28px;
  height: 18px;
  position: relative;
  display: inline-block;
  font-size: 0;
}
.three-line span{
  background-color:#FFFFFF;
  position: absolute;
  border-radius: 2px;
  transition: transform .5s ease-in-out;
  width:100%;
  height: 2px;
  left: 0;
  transform: rotate(0);
}
.three-line span:nth-child(1){
  top:0;
}
.three-line span:nth-child(2){
  top:8px;
  visibility:visible;
}
.three-line span:nth-child(3){
  bottom:0;
}
.menu-icon.active .three-line span:nth-child(1){
  transform: rotate(225deg);
  top: 8px;
}
.menu-icon.active .three-line span:nth-child(2){
  transform: rotate(180deg);
  visibility:hidden;
}
.menu-icon.active .three-line span:nth-child(3){
  transform: rotate(315deg);
  top: 8px;
}
/*End of styles for mobile mode ########*/

@keyframes topItemAnimation {
  from {opacity: 0; transform:translate3d(0, -60px, 0);}
  to {opacity: 1; transform:translate3d(0, 0, 0);}
}
#cssmenu li a {animation:none;}
#cssmenu.active li a { animation: topItemAnimation 0.5s cubic-bezier(.16,.84,.44,1) 0.08333333333333333s backwards;}
#cssmenu.active li:nth-of-type(1) a { animation: topItemAnimation 0.5s cubic-bezier(.16,.84,.44,1) 0.5s backwards;}
#cssmenu.active li:nth-of-type(2) a { animation: topItemAnimation 0.5s cubic-bezier(.16,.84,.44,1) 0.4166666666666667s backwards;}
#cssmenu.active li:nth-of-type(3) a { animation: topItemAnimation 0.5s cubic-bezier(.16,.84,.44,1) 0.3333333333333333s backwards;}
#cssmenu.active li:nth-of-type(4) a { animation: topItemAnimation 0.5s cubic-bezier(.16,.84,.44,1) 0.25s backwards;}
#cssmenu.active li:nth-of-type(5) a { animation: topItemAnimation 0.5s cubic-bezier(.16,.84,.44,1) 0.16666666666666666s backwards;}@media screen and (-ms-high-contrast: active), (-ms-high-contrast: none) { #cssmenu.active li a{animation:none!important;}}



</style>
