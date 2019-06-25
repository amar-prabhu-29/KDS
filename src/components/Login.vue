<template>
    <div>
        <nav>
            <div class="nav-wrapper" style="background-color: #2A2A2A">
                <router-link to="/login" class="brand-logo">KDS</router-link>
            </div>
        </nav>
        <br>
        <div class="row">
            <div class="col l3"></div>
            <div class="col l6 m12 s12">
                <div class="card-panel hoverable" style="margin:auto">
                    <h3 style="color: #009688;font-weight: 300;text-align: center">Login</h3>
                    <form action="" method="post">
                        <div class="input-field">
                            <i class="material-icons prefix">account_circle</i>
                            <input id="username" type="email" v-model="email">
                            <label for="username">Username</label>
                            <span class="helper-text red-text">{{errorMessage}}</span>
                        </div>
                        <div class="input-field">
                            <i class="material-icons prefix">lock</i>
                            <input id="password" type="password" v-model="password">
                            <label for="username">Password</label>
                        </div>
                        <button class="btn waves-effect waves-light" v-on:click="login">Login
                            <i class="material-icons right">send</i>
                        </button>          
                    </form>
                </div>
            </div>
            <div class="col l3"></div>
        </div>
    </div>
</template>

<script>
import firebase from 'firebase'
import firebaseApp from './firebaseInit'
let db = firebaseApp.firestore()
export default {
    name: 'Login',
    data: function(){
        return{
            email : '',
            password: '',
            errorMessage: '',
            userUID : ''
        }
    },
    methods : {
        login: function(e){
            e.preventDefault()
            firebase.auth().signInWithEmailAndPassword(this.email, this.password).then(
                user => {
                    this.userUID = firebase.auth().currentUser.uid
                    db.collection('user').doc(this.userUID).get()
                    .then(
                        documentSnapshot => {
                            if (documentSnapshot.data().role.toLowerCase() === "chef"){
                                this.$router.go('/dashboard')
                            }
                            else {
                                firebase.auth().signOut()
                                this.errorMessage = 'You Role Is Not Compitable To Be Logged In Here'
                            }
                        }
                    )
                },
                err => {
                    this.errorMessage = err.message,
                    this.email = '',
                    this.password = ''
                }
            )
        }
    }
}

</script>