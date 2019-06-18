<template>
    <nav>
        <div class="nav-wrapper teal">
                <router-link to="/" class="brand-logo">KDS</router-link>
                <ul class="right">
                    <li v-if="isLoggedIn"><span class="white-text" style="padding-right:5px">Welcome, {{currentUser}}</span></li>
                    <li v-if="isLoggedIn"><button class="btn black" v-on:click="logout">Logout</button></li>
                </ul>
            </div>
    </nav>
</template>


<script>
import firebase from 'firebase'

export default {
    name: 'Navbar',
    data: function(){
        return{
            kitchen: '',
            isLoggedIn : false,
            currentUser : false
        }
    },
    methods: {
        logout: function(){
            firebase.auth().signOut()
            this.$router.go('/login')
        }
    },
    created(){
        if(firebase.auth().currentUser){
            this.isLoggedIn = true
            this.currentUser = firebase.auth().currentUser.email
        }
    }
}
Vue.component('basic-select', {
  template:`
<select>
  <slot></slot>
</select>
`
});
</script>