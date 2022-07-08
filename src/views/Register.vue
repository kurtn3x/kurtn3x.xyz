<template>
    <div class="signup">
        <h1>Sign up</h1>
        <form @submit.prevent="SubmitForm">
            <input type="email" name ="username" v-model="username">
            <input type ="password" name="password" v-model="password">
            <button type="Submit"> Sign Up </button>
        </form>
    </div>
</template>

<script>
import axios from 'axios'
export default {
    name: 'Signup',
    data() {
        return {
            username: '',
            password: ''
        }
    },
    methods:{
        SubmitForm(e){
        const formData = {
            username: this.username,
            password: this.password
        }

        axios
            .post('/auth/users/', formData)
            .then(response => {
                this.$router.push("/login")
            })
            .catch(error => {
                console.log(error)
            })

        }

    }
}
</script>