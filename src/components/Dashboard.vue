<template>
    <div>
        <div class="navbar-fixed">
            <nav>
                <div class="nav-wrapper" style="background-color: #2A2A2A">
                    <ul class="left">
                        <li v-if="notify"><a class="waves-effect waves-light btn grey darken-4" v-on:click="toggleNotification()"><i class="material-icons">volume_up</i></a></li>
                        <li v-if="!notify"><a class="waves-effect waves-light btn grey darken-4" v-on:click="toggleNotification()"><i class="material-icons">volume_off</i></a></li>
                        <li>
                            <div style="unset: all" class="multiselect">
                                <div class="selectBox" v-on:click="showCheckboxes()">
                                    <select class="browser-default" style="background:transparent; color: white;margin-top:10px;">
                                        <option>{{kitchenSelect | beautifyKitchens}}</option>
                                    </select>
                                    <div class="overSelect"></div>
                                </div>
                                <div id="checkboxes" style="background-color: white; line-height: 25px !important;font-size:22px;color:black !important">
                                    <label><input type="checkbox" value="All" v-model="kitchenSelect" checked><span style="margin-left:3px">All</span></label>
                                    <span v-if="!kitchenSelect.includes('All')">
                                        <label v-for="kitchen in kitchens" v-bind:key="kitchen"><input type="checkbox" :value="kitchen" v-model="kitchenSelect"/><span style="margin-left:3px">{{kitchen}}</span></label>
                                    </span>
                                </div>
                            </div>
                        </li>
                    </ul>
                    <div class="brand-logo center">
                    <ul>
                        <li v-if="activeTab!='InProgress'"><a v-on:click="changeTab('InProgress')">Active<span class="new badge blue" data-badge-caption="" style="border-radius: 5px 20px 5px;">{{activeCount}}</span></a></li>
                        <li class="active" v-if="activeTab=='InProgress'"><a v-on:click="changeTab('InProgress')">Active<span class="new badge blue" data-badge-caption="" style="border-radius: 5px 20px 5px;">{{activeCount}}</span></a></li>
                        <li v-if="activeTab!='Completed'"><a v-on:click="changeTab('Completed')">Completed<span class="new badge blue" data-badge-caption="" style="border-radius: 5px 20px 5px;">{{completedCount}}</span></a></li>
                        <li class="active" v-if="activeTab=='Completed'"><a v-on:click="changeTab('Completed')">Completed<span class="new badge blue" data-badge-caption="" style="border-radius: 5px 20px 5px;">{{completedCount}}</span></a></li>
                    </ul>
                    </div>
                    <ul class="right">  
                        <li>
                            <select class="browser-default white-text transparent" v-model="cardsNo" style="margin-top:10px;">
                                <option disabled selected>Cards Per Page</option>
                                <option class="black-text" value="col l4">6 Cards</option>
                                <option class="black-text" value="col l3">8 Cards</option>
                                <option class="black-text" value="col l2 reducedFont">12 Cards</option>
                            </select>
                        </li>
                        <li>
                            <a class="waves-effect waves-light btn grey darken-4" v-on:click="logout()">
                                <i class="material-icons">close</i>
                            </a>
                        </li>
                    </ul>
                </div>
            </nav>
        </div>
        <Cards v-if="!loading" v-bind:orders="orders" v-bind:cardsNo="cardsNo" v-bind:location="location" v-bind:activeTab="activeTab" v-bind:selectedKitchens="kitchenSelect"></Cards>
    </div>

</template>

<script>
import firebase from 'firebase'
import firebaseApp from './firebaseInit'
import Cards from './Cards'
import Multiselect from 'vue-multiselect'

export default {
    components: { Multiselect },
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
                kitchenSelect : ['All'],
                activeTab : 'InProgress',
                notify : false,
                itemsCount : 0,
                activeCount : 0,
                completedCount : 0,
                expanded : false
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
        toggleNotification: function(){
            this.notify = !this.notify
        },
        getAllOrdersData : function(){
            let database = firebaseApp.database().ref('Location/'+this.location+'/')
            database.on('value', snapshot => {
                this.orders = []
                let orderIDS = []
                let tempItemsCount = 0
                this.activeCount = 0
                this.completedCount = 0
                snapshot.forEach(diners => {
                    diners.forEach(tables => {
                        tables.forEach(table => {
                            if(table.val().Seated){
                                if(table.val().Status.toLowerCase() === "inprogress"){
                                    let orderedItems = []
                                    let completedItems = []
                                    table.child('Cart').child('items').forEach(item => {
                                        if(item.val().status.toLowerCase() === "ordered"){
                                            var itemDetails = {
                                                'customization': item.val().customizationlist,
                                                'name': item.val().name,
                                                'qty': item.val().quantity,
                                                'key': item.val().item_id,
                                                'time': item.val().ordered_time,
                                                'elapsedTime' : 0,
                                                'kitchen': item.val().kitchen,
                                                'order_no': item.key,
                                                'colorCode' : 'background-color: white'
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
                                                'order_no': item.key
                                            }
                                            completedItems.push(itemDetails)
                                        }
                                    })
                                    //Count Items to play sound
                                    tempItemsCount = tempItemsCount + orderedItems.length + completedItems.length
                                    //See if tables Are Merged
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
                                                        'guests':table.val().NoOfGuest,
                                                        'steward':table.val().StewardName,
                                                        'OrderID':table.val().OrderID,
                                                        'OrderKey' : table.val().OrderID,
                                                        'orders': orderedItems,
                                                        'completed' : completedItems,
                                                        'special' : table.val().Cart.special_instruction,
                                                        'kdsStatus' : table.val().KdsStatus,
                                                        'time': table.val().TimeStamp,
                                                        'isKitchen' : true})
                                        orderIDS.push(table.val().OrderID)
                                        if(table.val().KdsStatus.toLowerCase() === 'completed'){
                                            this.completedCount+=1
                                        }
                                        else if(table.val().KdsStatus.toLowerCase() === 'inprogress' && (orderedItems.length > 0 || completedItems.length > 0)){
                                            this.activeCount+=1
                                        }
                                    }
                                }
                            }
                        })
                    })
                })
                //Playing sound if no of items increases
                if(this.itemsCount > tempItemsCount){
                    this.itemsCount = tempItemsCount
                    tempItemsCount = 0
                } 
                else if(this.itemsCount < tempItemsCount){
                    let audio = new Audio(require('../assets/newOrder.mp3'))
                    if(this.notify){
                        let play = audio.play()
                    }
                    this.itemsCount = tempItemsCount
                    tempItemsCount = 0
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
        },
        showCheckboxes: function() {
            let checkboxes = document.getElementById("checkboxes");
            if (!this.expanded) {
                checkboxes.style.display = "block";
                this.expanded = true;
            } 
            else {
                checkboxes.style.display = "none";
                this.expanded = false;
            }
        }
    },
    watch : {
        kitchenSelect : function(){
            if(!this.kitchenSelect.includes('All')){
                    this.orders.forEach(order => {
                        let flag=0
                        order.orders.forEach(item => {
                            if(this.kitchenSelect.includes(item.kitchen)){
                                order.isKitchen = true
                                flag=1
                            }
                        })
                        order.completed.forEach(item => {
                            if(this.kitchenSelect.includes(item.kitchen)){
                                order.isKitchen = true
                                flag=1
                            }
                        })
                        if(flag==0){
                            order.isKitchen = false
                        }
                    })
                }
            else{
                this.orders.forEach(order => {
                    order.isKitchen = true
                })
            }
        }
    },
    components : {
        Cards
    },
    filters : {
        beautifyKitchens : (kitchens) => {
            let dispKitchen = ''
            if(kitchens.length == 0){
                dispKitchen = ',Select Kitchen'
            }
            else{
                kitchens.forEach(kitchen => {
                    dispKitchen = dispKitchen + "," + kitchen
                })
            }
            return dispKitchen.substring(1)
        }
    },
    mounted(){
        M.AutoInit()
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

<style scoped>
.multiselect {
  width: 200px;
}

.selectBox {
  position: relative;
}

.selectBox select {
  width: 100%;
}

.overSelect {
  position: absolute;
  left: 0;
  right: 0;
  top: 0;
  bottom: 0;
}

#checkboxes {
  display: none;
  border: 1px #dadada solid;
}

#checkboxes label {
  display: block;
  color:black;
}

#checkboxes label:hover {
  background-color: #1e90ff;
}
</style>