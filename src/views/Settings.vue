
<template>
  <div class="col-md-12" v-if="currentUser">
  
    <div class="card card-container">
      <img
        id="profile-img"
        src="//ssl.gstatic.com/accounts/ui/avatar_2x.png"
        class="profile-img-card"
      />
      <Form @submit="handleRegister" :validation-schema="schema">
        <div v-if="!successful">
          <div class="form-group">
            <label for="username">Username</label>
            <Field name="username" type="text" class="form-control" />
            <ErrorMessage name="username" class="error-feedback" />
          </div>
          <div class="form-group">
            <label for="email">Email</label>
            <Field name="email" type="email" class="form-control" />
            <ErrorMessage name="email" class="error-feedback" />
          </div>
          <div class="form-group">
            <label for="password">Password</label>
            <Field name="password" type="password" class="form-control" />
            <ErrorMessage name="password" class="error-feedback" />
          </div>
          <div class="form-group">
            <label for="password2">Confirm Password</label>
            <Field name="password2" type="password" class="form-control" />
            <ErrorMessage name="password2" class="error-feedback" />
          </div>
          <div class="form-group">
            <button class="btn btn-primary btn-block" :disabled="loading">
              <span
                v-show="loading"
                class="spinner-border spinner-border-sm"
              ></span>
              Sign Up
            </button>
          </div>
        </div>
      </Form>

      <div
        v-if="message"
        class="alert"
        :class="successful ? 'alert-success' : 'alert-danger'"
      >
        {{ message }}
      </div>
    </div>
  </div>

<div class="col-md-12" v-if="!currentUser">
    <p> You are not logged in</p>
</div>

</template>


<script>
import VueCookies from 'vue-cookies'
import axios from 'axios'
import { Form, Field, ErrorMessage } from "vee-validate";
import * as yup from "yup";
export default {
    name: 'Settings',
    components: {
        Form,
        Field,
        ErrorMessage,
    },
    beforeCreate(){
                axios
                .get("/auth/csrf_cookie", { withCredentials: true })
    },
    data() {
      const schema = yup.object().shape({
        username: yup
          .string()
          .required("Username is required!")
          .min(3, "Must be at least 3 characters!")
          .max(20, "Must be maximum 20 characters!"),
        email: yup
          .string()
          .required("Email is required!")
          .email("Email is invalid!")
          .max(50, "Must be maximum 50 characters!"),
        password: yup
          .string()
          .required("Password is required!")
          .min(6, "Must be at least 6 characters!")
          .max(40, "Must be maximum 40 characters!"),
        password2:  yup
          .string()    
          .oneOf([yup.ref('password')], 'Your passwords do not match.')

      });
      
      return {
        username: '',
        password: '',
        password2:'',
        email: '',
        successful: false,
        loading: false,
        message: "",
        schema,
      }
    },
    computed: {
        currentUser() {
        return this.$store.state.isAuthenticated;
        },
    },
    methods:{

        handleRegister(user){
        const formData = {
            username: user.username,
            password: user.password,
            re_password: user.password2,
            email: user.email
        }
        let config = {
            withCredentials: true,
            headers: {
              "X-CSRFToken": VueCookies.get('csrftoken'),
            }
        }

        axios
            .post('/auth/register', formData, config)
            .then(response => {
                if (response.status != 200){
                this.message =
                ( response.data.message) 
                  this.successful = false;
                  this.loading = false;
                } else {
                  this.$router.push("/login")
                  this.successful = true;
                  this.loading = false;
                }
            })
            .catch(error => {
              this.message =
              (error.response &&
              error.response.data &&
              error.response.data.message) ||
              error.message ||
              error.toString();             this.message =
              (error.response &&
              error.response.data &&
              error.response.data.message) ||
              error.message ||
              error.toString();
              this.successful = false;
              this.loading = false;
            })

        }

    }
}
</script>



<style scoped>
label {
  display: block;
  margin-top: 10px;
}

.card-container.card {
  max-width: 350px !important;
  padding: 40px 40px;
}

.card {
  background-color: #f7f7f7;
  padding: 20px 25px 30px;
  margin: 0 auto 25px;
  margin-top: 50px;
  -moz-border-radius: 2px;
  -webkit-border-radius: 2px;
  border-radius: 2px;
  -moz-box-shadow: 0px 2px 2px rgba(0, 0, 0, 0.3);
  -webkit-box-shadow: 0px 2px 2px rgba(0, 0, 0, 0.3);
  box-shadow: 0px 2px 2px rgba(0, 0, 0, 0.3);
}

.profile-img-card {
  width: 96px;
  height: 96px;
  margin: 0 auto 10px;
  display: block;
  -moz-border-radius: 50%;
  -webkit-border-radius: 50%;
  border-radius: 50%;
}

.error-feedback {
  color: red;
}
</style>