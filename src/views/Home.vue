<template>
    <div class="login">
        <h1>HELLO</h1>
      <div>  
        <span :src="user_data">{{user_data}} </span>
      </div> 
    </div>
</template>


<script>
import VueCookies from 'vue-cookies'
import axios from 'axios'
export default {
    name: 'Home',
      computed: {
    currentUser() {
      return this.$store.state.isLogged;
    },
  },
    data(){
        return {
            user_data: ''
        }
    },
    mounted(){
        this.getMe()
    },
    methods: {
        getMe(e){
          let config = {
            withCredentials: true ,
            headers: {
              "X-CSRFToken": VueCookies.get('csrftoken'),
            }
          }
            axios
            .get("/profile/user", config)
            .then(response => {
              console.log(response)
            })
            .catch(error => {
                console.log(error)
            })
        }
    }
}
</script>
