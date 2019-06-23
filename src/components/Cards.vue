<template>
    <div class="row">
        <div :class="cardsNo" v-for="order in orders" v-if="order.kdsStatus == activeTab && (order.orders.length != 0 || order.completed.length != 0)" v-bind:key="order.OrderKey" style="height: 44vh">
            <div class="card blue-grey darken-1">
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
                            <li class="collection-item" v-for="item in order.orders" v-on:click="itemComplete(order.diner, order.table, item.order_no)" style="cursor:pointer">
                                <b>{{item.qty}} X {{item.name}}<span style="float:right">{{item.elapsedTime}}</span></b>
                                <br>
                                <small style="white-space: pre;color: blue">{{item.customization | replacePipe}}</small>
                            </li>
                            <li class="collection-item" v-for="item in order.completed" style="background-color:#388e3c">
                                <b style="color:white">{{item.qty}} X {{item.name}}<span style="float:right">Completed</span></b>
                                <br>
                                <small style="white-space: pre;color:white">{{item.customization | replacePipe}}</small>
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
    props: ['orders','cardsNo','location','activeTab'],
    data: function(){
        return{

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
        changeKDS: function(diner,table,status){
            firebaseApp.database().ref('Location/'+this.location+'/'+diner+'/Tables/'+table).update({'TimeStamp' : new Date().getTime()})
            firebaseApp.database().ref('Location/'+this.location+'/'+diner+'/Tables/'+table).update({'KdsStatus' : status})   
        },
    },
    mounted(){
        setInterval(()=>{
        this.orders.forEach(order => {
            order.orders.forEach(item => {
                let difference =  new Date().getTime() - (item.time * 1000)

                let hoursDifference = Math.floor(difference/1000/60/60);
                difference -= hoursDifference*1000*60*60

                let minutesDifference = Math.floor(difference/1000/60);
                difference -= minutesDifference*1000*60

                let secondsDifference = Math.floor(difference/1000);

                item.elapsedTime = ("0"+minutesDifference).substr(-2) +':'+ ("0"+secondsDifference).substr(-2)
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