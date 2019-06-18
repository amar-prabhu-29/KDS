<template>
    <div>
        <nav>
            <div class="nav-wrapper teal">
                <router-link to="/" class="brand-logo">KDS</router-link>
                <ul class="right">
                    <li><span class="white-text" style="padding-right:5px">Welcome, {{currentUser}}</span></li>
                    <li><button class="btn black" v-on:click="logout">Logout</button></li>
                </ul>
            </div>
        </nav>
        <Cards v-if="!loading" v-bind:orders="orders"></Cards>
    </div>

</template>

<script>
import firebase from 'firebase'
import firebaseApp from './firebaseInit'
import Cards from './Cards'

export default {
    name: 'dashboard',
    data: 
        function() {
            return{
                orders : [],
                location: '',
                kitchens : [],
                loading : true,
                currentUser : false
            }
        },
    methods:{
        getKitchenData : function(){
            let firestore = firebaseApp.firestore()
            firestore.collection('location').doc(this.location).get()
                .then(
                    documentSnapshot => {
                         documentSnapshot.data().kitchen.forEach(k => {
                             console.log(k)
                             this.kitchens.push(k)
                             console.log(this.kitchens)
                        })
                    }
                )
        },
        getAllOrdersData : function(){
            let database = firebaseApp.database().ref('Location/'+this.location+'/')
            database.on('value', snapshot => {
                this.orders = []
                let orderIDS = []
                snapshot.forEach(diners => {
                    diners.forEach(tables => {
                        tables.forEach(table => {
                            if(table.val().Seated){
                                if(table.val().Status.toLowerCase() === "inprogress"){
                                    var orderedItems = []
                                    table.val().cart.items.forEach(item => {
                                        if(item.status.toLowerCase() === "ordered"){
                                            var itemDetails = {
                                                'customization': item.customizationlist,
                                                'name':item.name,
                                                'qty':item.quantity,
                                                'key':item.item_id,
                                                'time':item.ordered_time
                                            }
                                            orderedItems.push(itemDetails)
                                        }
                                    })
                                    if(!orderIDS.includes(table.val().OrderID)){
                                        let tableID = ""
                                        if(table.hasChild('MergedList')){
                                            table.val().MergedList.forEach(tableNo => {
                                                tableID = tableID + "," + tableNo
                                            })
                                        }
                                        else{
                                            tableID = "," + table.key
                                        }
                                        tableID = tableID.substring(1);
                                        this.orders.push({'diner':diners.key,
                                                        'table':tableID,
                                                        'guests':table.val().NoOfGuests,
                                                        'steward':table.val().StewardName,
                                                        'OrderID':table.val().OrderID,
                                                        'orders':orderedItems})
                                        orderIDS.push(table.val().OrderID)
                                    }
                                }
                            }
                        })
                    })
                })   
            },
            err => {
                console.log(err.message)
                
            })
            this.loading = false
        },
        logout: function(){
            firebase.auth().signOut()
            this.$router.go('/login')
        }
    },
    components : {
        Cards
    },
    created() {
        //Getting user Location and Kitchen Data
        let firestore = firebaseApp.firestore()
        this.currentUser = firebase.auth().currentUser.email
        let UID = firebase.auth().currentUser.uid;
        firestore.collection('user').doc(UID).get()
            .then(
                documentSnapshot => {
                    this.location = documentSnapshot.data().location_id
                    this.getKitchenData()
                    this.getAllOrdersData()
                }
            )
    }
}
</script>