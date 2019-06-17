<template>
    <div>
        <h1>Welcome To KDS</h1>
        <p v-for="order in orders" v-bind:key="order.OrderID">{{order}}</p>
    </div>

</template>

<script>
import firebase from 'firebase'
import firebaseApp from './firebaseInit'

export default {
    name: 'dashboard',
    data: 
        function() {
            return{
                orders : [],
            }
        },
    methods:{

    },
    created() {
        var database = firebaseApp.database().ref('Location/WoUc2HdIJePYcpztRB9j/')
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
                                            'qty':item.quantity
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
    }
}
</script>