<template>
    <div class="login">
        <h1>HELLO</h1>
      <div v-if="currentUser">  
        <span :src="user_data">{{user_data}} </span>
      </div> 
    </div>
</template>


<script>
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
            axios
                .get("/auth/users/me/")
                .then(response => {
                    this.user_data = response.data.username
                })
                .catch(error => {
                    console.log(error)
                })
        }
    }
}
</script>
