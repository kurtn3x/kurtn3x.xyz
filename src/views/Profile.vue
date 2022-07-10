<template>
  <div class="container">
    <p> LOL </p>
  </div>
</template>

<script>
export default {
  name: 'Profile',
  computed: {
    currentUser() {
      return this.$store.state.auth.user;
    }
  },
  mounted() {
    if (!this.$state.isAuthenticated) {
      this.$router.push('/login');
    }
  }
};
</script>