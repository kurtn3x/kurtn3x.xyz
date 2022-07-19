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
      return this.$store.state.isAuthenticated; 
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
        if (response.status == 200){
          this.user_data = response.data.username
        } else {
          this.user_data = ''
        }
      })
      .catch(error => {
        this.user_data = ''
      })
    }
  }
}
</script>
