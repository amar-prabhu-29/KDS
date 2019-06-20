<template>
    <div>
        <div class="navbar-fixed">
            <nav>
                <div class="nav-wrapper teal">
                    <a href="#!" class="brand-logo"></a>
                    <div class="brand-logo center">
                    <ul>
                        <li v-if="activeTab!='InProgress'"><a v-on:click="changeTab('InProgress')">Active</a></li>
                        <li class="active" v-if="activeTab=='InProgress'"><a v-on:click="changeTab('InProgress')">Active</a></li>
                        <li v-if="activeTab!='Completed'"><a v-on:click="changeTab('Completed')">Completed</a></li>
                        <li class="active" v-if="activeTab=='Completed'"><a v-on:click="changeTab('Completed')">Completed</a></li>
                    </ul>
                    </div>
                    <ul class="right">
                    <li>
                            <select class="black-text" style="display:block;background-color: white;" v-model="kitchenSelect" v-on:change="filterKitchen()">
                                <option value="All" selected>All</option>
                                <option v-for="k in kitchens" :value="k" v-bind:key="k">{{k}}</option>
                            </select>
                    </li>
                    <li>
                        <select class="black-text" style="display:block;background-color: white;" v-model="cardsNo">
                            <option value="col l4">6</option><option value="col l3">8</option>
                        </select>
                    </li>
                    </ul>
                </div>
            </nav>
        </div>
        <Cards v-if="!loading" v-bind:orders="orders" v-bind:cardsNo="cardsNo" v-bind:location="location" v-bind:activeTab="activeTab"></Cards>
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
                currentUser : false,
                cardsNo : 'col l3',
                kitchenSelect : 'All',
                activeTab : 'InProgress',
                lengthOrders : 0
            }
        },
    methods:{
        changeTab : function(tab){
            this.activeTab = tab
        },
        getKitchenData : function(){
            let firestore = firebaseApp.firestore()
            firestore.collection('location').doc(this.location).get()
                .then(
                    documentSnapshot => {
                         documentSnapshot.data().kitchen.forEach(k => {
                             this.kitchens.push(k)
                        })
                    }
                )
        },
        filterKitchen : function(){
            if(this.kitchenSelect == 'All'){
                this.getAllOrdersData()
            }
            else{
                this.getAllOrdersData()
                this.orders.forEach(order => {
                    order.orders.forEach(item => {
                        if(!(this.kitchenSelect === item.kitchen)){
                            let index = order.orders.indexOf(item)
                            console.log(index)
                            let a = order.orders.pop(index)
                            console.log(a)
                        }
                    })
                })
            }
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
                                    let orderedItems = []
                                    let completedItems = []
                                    table.child('cart').child('items').forEach(item => {
                                        if(item.val().status.toLowerCase() === "ordered"){
                                            var itemDetails = {
                                                'customization': item.val().customizationlist,
                                                'name': item.val().name,
                                                'qty': item.val().quantity,
                                                'key': item.val().item_id,
                                                'time': item.val().ordered_time,
                                                'kitchen': item.val().kitchen,
                                                'order_no': item.key,
                                                'bgColor' : 'background-color: white'
                                            }
                                            orderedItems.unshift(itemDetails)
                                        }
                                        else if(item.val().status.toLowerCase() === "served"){
                                            var itemDetails = {
                                                'customization': item.val().customizationlist,
                                                'name': item.val().name,
                                                'qty': item.val().quantity,
                                                'key': item.val().item_id,
                                                'time': item.val().ordered_time,
                                                'kitchen': item.val().kitchen,
                                                'order_no': item.key,
                                                'bgColor' : 'background-color: green'
                                            }
                                            completedItems.push(itemDetails)
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
                                                        'OrderKey' : table.val().OrderID,
                                                        'orders':orderedItems,
                                                        'completed' : completedItems,
                                                        'special' : table.val().cart.special_instruction,
                                                        'kdsStatus' : table.val().KdsStatus})
                                        orderIDS.push(table.val().OrderID)
                                    }
                                }
                            }
                        })
                    })
                })
                if(this.lengthOrders < this.orders.length){
                    console.log("Play Sound")
                    this.lengthOrders = this.orders.length
                }             
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