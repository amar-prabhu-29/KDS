<template>
    <div class="row">
        <div :class="cardsNo" v-for="order in orders" v-if="order.isKitchen && order.kdsStatus == activeTab && (order.orders.length != 0 || order.completed.length != 0)" v-bind:key="order.OrderKey" style="height: 44vh">
            <div class="card" style="border-radius:3%;background-color: #3A81FD" >
                <div class="card-content white-text" style="padding:0">
                    <span class="card-title" style="font-size:15px;line-height: 22.5px">
                        <b>&nbsp;Table:{{order.table | tableIncriment}}<span style="float:right">{{order.steward}}&nbsp;</span>
                        <center>{{order.orders.length}} Active Orders</center>
                        &nbsp;Dine In<span style="float:right">{{order.diner}}&nbsp;</span></b>
                        
                        <a v-if="order.orders.length == 0 && order.completed.length != 0 && activeTab != 'Completed'" class="btn-floating btn-small halfway-fab  waves-effect waves-light green" v-on:click="changeKDS(order.diner,order.table,'Completed')">
                            <i class="material-icons">check</i>
                        </a>
                    </span>
                        <ul class="collection black-text" style="max-height:30vh;overflow:auto;">
                            <li class="white" v-if="order.special" style="border-bottom:1px solid black"><marquee><p>{{order.special}}</p></marquee></li>
                            <li class="collection-item" v-for="item in order.orders" v-if="selectedKitchens.includes(item.kitchen) || selectedKitchens.includes('All')" v-on:click="itemComplete(order.diner, order.table, item.order_no)" :style="item.colorCode">
                                <b>{{item.qty}} X {{item.name}}<span style="float:right">{{item.elapsedTime}}</span></b>
                                <br>
                                <small style="white-space: pre;color: #007AFF;">{{item.customization | replacePipe}}</small>
                            </li>
                            <li class="collection-item" v-for="item in order.completed" v-if="selectedKitchens.includes(item.kitchen) || selectedKitchens.includes('All')" v-on:click="itemRecalled(order.diner, order.table, item.order_no)"  style="background-color: #2FB866">
                                <b style="color:white">{{item.qty}} X {{item.name}}<span style="float:right">Completed</span></b>
                                <br>
                                <small style="white-space: pre-wrap;color:white;">{{item.customization | replacePipe}}</small>
                            </li>
                        </ul>
                </div>
            </div>    
        </div>
    </div>
</template>

<script>
import firebase from 'firebase'
import firebaseApp from './firebaseInit'
import { setInterval, clearInterval } from 'timers';

export default {
    name: 'Cards',
    props: ['orders','cardsNo','location','activeTab','selectedKitchens'],
    data: function(){
        return{
            kitchensFiltered : this.selectedKitchens
        }
    },
    methods:{
        itemComplete: function(diner, table, order_no){
            let tables = table.split(',')
            tables.forEach(table => {
                firebaseApp.database().ref('Location/'+this.location+'/'+diner+'/Tables/'+table+'/Cart/items/'+order_no).update({'status' : "Served"})
                firebaseApp.database().ref('Location/'+this.location+'/'+diner+'/Tables/'+table).update({'TimeStamp' : new Date().getTime()})
            })      
        },
        itemRecalled: function(diner, table, order_no){
            let tables = table.split(',')
            tables.forEach(table => {
                firebaseApp.database().ref('Location/'+this.location+'/'+diner+'/Tables/'+table+'/Cart/items/'+order_no).update({'status' : "Ordered"})
                firebaseApp.database().ref('Location/'+this.location+'/'+diner+'/Tables/'+table).update({'TimeStamp' : new Date().getTime()})
                firebaseApp.database().ref('Location/'+this.location+'/'+diner+'/Tables/'+table).update({'KdsStatus' : 'InProgress'}) 
            })      
        },
        changeKDS: function(diner,table,status){
            let tables = table.split(',')
            tables.forEach(table => {
                firebaseApp.database().ref('Location/'+this.location+'/'+diner+'/Tables/'+table).update({'TimeStamp' : new Date().getTime()})
                firebaseApp.database().ref('Location/'+this.location+'/'+diner+'/Tables/'+table).update({'KdsStatus' : status})   
            })
        },
    },
    mounted(){
        setInterval(()=>{
        this.orders.forEach(order => {
            order.orders.forEach(item => {
                let difference =  new Date().getTime()+17000 - (item.time * 1000)

                let daysDifference = Math.floor(difference/1000/60/60/24)
                difference -= daysDifference*1000*60*60*24

                let hoursDifference = Math.floor(difference/1000/60/60)
                difference -= hoursDifference*1000*60*60

                let minutesDifference = Math.floor(difference/1000/60)
                difference -= minutesDifference*1000*60

                let secondsDifference = Math.floor(difference/1000)
                
                if(hoursDifference >= 1){
                    item.colorCode = "background-color: red;color: white"
                }
                else if(minutesDifference >= 20){
                    item.colorCode = "background-color: red;color: white"
                }
                else if( minutesDifference >= 10){
                    item.colorCode = "background-color: yellow"
                }
                
                if(hoursDifference >= 1){
                    item.elapsedTime = "59:59"
                }else{
                    item.elapsedTime = ("0"+minutesDifference).substr(-2) +':'+ ("0"+secondsDifference).substr(-2)
                }
            })
        })},1000)
    },
    beforeDestroy(){
        clearInterval()
    },
    filters: {
        replacePipe: function (value) {
            return value.split('|').join('\n')
        },
        convertTime: function(timestamp) {
            let date = new Date(timestamp*1000)
            let hours = date.getHours()
            let minutes = "0" + date.getMinutes()
            return hours +":"+minutes.substr(-2)
        },
        tableIncriment: function(value){
            let tables = value.split(',')
            let ret = []
            tables.forEach(table => {
                ret.push(parseInt(table)+1)
            })
            return ret.join(',')
        }
    },

}
</script>

<style scoped>
.reducedFont{
    font-size:10px
}

/* width */
::-webkit-scrollbar {
  background-color: aliceblue;
  width: 10px;
}

/* Track */
::-webkit-scrollbar-track {
  box-shadow: inset 0 0 5px grey; 
  border-radius: 10px;
}
 
/* Handle */
::-webkit-scrollbar-thumb {
  background: grey; 
  border-radius: 10px;
}

/* Handle on hover */
::-webkit-scrollbar-thumb:hover {
  background: grey; 
}
</style>