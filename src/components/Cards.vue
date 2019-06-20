<template>
    <div class="row">
        <div :class="cardsNo" v-for="order in orders" v-if="order.kdsStatus == activeTab && (order.orders.length != 0 || order.completed.length != 0)" v-bind:key="order.OrderKey" style="height: 44vh">
            <div class="card blue-grey darken-1">
                <div class="card-content white-text" style="padding:0">
                    <span class="card-title" style="font-size:18px">
                        &nbsp;Table:{{order.table}} In {{order.diner}} Hall<br>&nbsp;Steward:{{order.steward}}
                        <a v-if="order.orders.length == 0 && order.completed.length != 0 && activeTab != 'Completed'" class="btn-floating btn-small halfway-fab  waves-effect waves-light green" v-on:click="changeKDS(order.diner,order.table,'Completed')">
                            <i class="material-icons">check</i>
                        </a>
                    </span>
                        <ul class="collection black-text" style="max-height:30vh;overflow:auto;">
                            <li class="white" v-if="order.special" style="border-bottom:1px solid black"><marquee><p>{{order.special}}</p></marquee></li>
                            <li class="collection-item" v-for="item in order.orders" v-on:click="itemComplete(order.diner, order.table, item.order_no)" :style="item.bgColor">
                                {{item.qty}} X {{item.name}}<span style="float:right">{{item.time | convertTime}}</span>
                                <br>
                                <small style="white-space: pre;">{{item.customization | replacePipe}}</small>
                            </li>
                            <li class="collection-item" v-for="item in order.completed" :style="item.bgColor">
                                {{item.qty}} X {{item.name}}<span style="float:right">{{item.time | convertTime}}</span>
                                <br>
                                <small style="white-space: pre;">{{item.customization | replacePipe}}</small>
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

export default {
    name: 'Cards',
    props: ['orders','cardsNo','location','activeTab'],
    data: function(){
        return{
            
        }
    },
    methods:{
        itemComplete: function(diner, table, order_no){
            let tables = table.split(',')
            tables.forEach(table => {
                 firebaseApp.database().ref('Location/'+this.location+'/'+diner+'/Tables/'+table+'/cart/items/'+order_no).update({'status' : "Served"})
            })      
        },
        changeKDS: function(diner,table,status){
            firebaseApp.database().ref('Location/'+this.location+'/'+diner+'/Tables/'+table).update({'KdsStatus' : status})   
        },
    },
    filters: {
        replacePipe: function (value) {
            return value.split('|').join('\n')
        },
        convertTime: function(timestamp) {
            let date = new Date(timestamp*1000)
            let hours = date.getHours()
            let minutes = "0" + date.getMinutes()
            return hours + ':' + minutes.substr(-2)
        }
}

}
</script>