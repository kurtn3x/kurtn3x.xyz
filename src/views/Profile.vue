
<template>
  <div class="col-md-12" v-if="currentUser">
    <div v-if="!this.edit_active">
      <div class="card card-container">
        <img
          id="profile-img"
          src="//ssl.gstatic.com/accounts/ui/avatar_2x.png"
          class="profile-img-card"
        />
          <span :src="username"> Username: {{username}} </span>
          <span :src="id"> User ID: {{id}} </span>
          <span :src="first_name"> First Name: {{first_name}} </span>
          <span :src="last_name"> Last Name: {{last_name}} </span>
          <span :src="phone"> Phone: {{phone}} </span>
          <span :src="user"> User: {{user}} </span>
          <a  @click="edit_mode" class="myButton">Edit</a>
      </div>
    </div>

    <div v-if="this.edit_active">
        <div class="card card-container">
          <img
            id="profile-img"
            src="//ssl.gstatic.com/accounts/ui/avatar_2x.png"
            class="profile-img-card"
        />

        <Form @submit="handleProfile" :validation-schema="schema">
        <div v-if="!successful">
          <span :src="username"> Username: {{username}} </span> <br>
          <span :src="id"> User ID: {{id}} </span> <br>
          <span :src="user"> User: {{user}} </span> <br> <br>

          <div class="form-group">
          <span :src="first_name"> First Name: {{first_name}} </span>
            <Field id="firstname" name="firstname" type="text" class="form-control" placeholder="Your First Name"/>
            <ErrorMessage name="firstname" class="error-feedback" />
          </div>
          <div class="form-group">
            <span :src="last_name"> Last Name: {{last_name}} </span>
            <Field id="lastname" name="lastname" type="text" class="form-control" placeholder="Your Last Name" />
            <ErrorMessage name="lastname" class="error-feedback" />
          </div>
          <div class="form-group">
          <span :src="phone"> Phone: {{phone}} </span>
            <Field id="phone" name="phone" type="text" class="form-control" placeholder="Your Phonenumber" />
            <ErrorMessage name="phone" class="error-feedback" />
          </div>


          <div
            v-if="message"
            class="alert"
            :class="successful ? 'alert-success' : 'alert-danger'"
          >
            {{ message }}
          </div>
            <div class="form-group">
            <button class="btn btn-primary btn-block" :disabled="loading">
              <span
                v-show="loading"
                class="spinner-border spinner-border-sm"
              ></span>
              Change Settings
            </button>
            </div>
          </div>

          </Form>
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
  name: 'Profile',
    components: {
      Form,
      Field,
      ErrorMessage,
  },
  
  computed: {
    currentUser() {
      return this.$store.state.isAuthenticated; 
    },
  },

      data() {
      const schema = yup.object().shape({
        firstname: yup
          .string()
          .min(3, "Must be at least 3 characters!")
          .max(20, "Must be maximum 20 characters!"),
        lastname: yup
          .string()
          .max(50, "Must be maximum 50 characters!"),
        phone: yup
          .string()
          .min(6, "Must be at least 6 characters!")
          .max(40, "Must be maximum 40 characters!"),

      });
      
      return {
        username: '',
        id: '',
        first_name: '',
        last_name: '',
        phone: '',
        user: '',
        edit_active: false,
        successful: false,
        loading: false,
        message: "",
        schema,
      }
    },

  mounted(){
    this.getMe()
  },

  methods: {
    updateNotify() {
      this.$notify({
      title: "Sent updates.",
      type: "success"
      });
    },

    handleProfile(user){
      const formData = {
        first_name: user.firstname,
        last_name: user.lastname,
        phone: user.phone,
      }

      let config = {
         withCredentials: true,
        headers: {
            "X-CSRFToken": VueCookies.get('csrftoken'),
        }
      }

      axios
        .put('/profile/update', formData, config)
        .then(response => {
            if (response.status != 200){
            this.message =
            ( response.data.message) 
              this.successful = false;
              this.loading = false;
            } else {
              this.updateNotify()
              this.edit_active = false;
              this.successful = true;
              this.loading = false;
              this.$router.go("/");
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
    },

    edit_mode(){
      if (this.edit_active == false){
        this.edit_active = true
      } else {
        this.edit_active= false
      }
    },

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
          this.username = response.data.username
          this.id = response.data.profile.id
          this.first_name = response.data.profile.first_name
          this.last_name = response.data.profile.last_name
          this.phone = response.data.profile.phone
          this.user = response.data.profile.user
        } else {
          this.username = ""
          this.id = ""
          this.first_name = ""
          this.last_name = ""
          this.phone = ""
          this.user = ""        }
      })
      .catch(error => {
        this.username = ""
        this.id = ""
        this.first_name = ""
        this.last_name = ""
        this.phone = ""
        this.user = ""
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

.myButton {
	background:linear-gradient(to bottom, #44c767 5%, #5cbf2a 100%);
	background-color:#44c767;
	border-radius:28px;
	border:1px solid #18ab29;
	display:inline-block;
	cursor:pointer;
	color:#ffffff;
	font-family:Arial;
	font-size:17px;
	padding:16px 31px;
	text-decoration:none;
	text-shadow:0px 1px 0px #2f6627;
}
.myButton:hover {
	background:linear-gradient(to bottom, #5cbf2a 5%, #44c767 100%);
	background-color:#5cbf2a;
}
.myButton:active {
	position:relative;
	top:1px;
}

</style>