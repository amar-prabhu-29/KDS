<template>
    <div class="row">
        <div class="col l3" v-for="order in orders" v-if="order.orders.length != 0">
            <div class="card blue-grey darken-1">
                <div class="card-content white-text" style="padding:0">
                    <span class="card-title" style="font-size:18px">&nbsp;Table:{{order.table}} In {{order.diner}} Hall<br>&nbsp;Steward:{{order.steward}}</span>
                        <ul class="collection black-text" style="max-height:33vh;overflow:auto;">
                            <li class="collection-item" v-for="item in order.orders" v-on:click="itemComplete(item.key)">
                                {{item.qty}} X {{item.name}}<span style="float:right">{{item.time | convertTime}}</span>
                                <br>
                                <small style="white-space: pre;">{{item.customization | replaceComma}}</small>
                            </li>
                        </ul>
                </div>
            </div>    
        </div>
    </div>
</template>

<script>
export default {
    name: 'Cards',
    props: ['orders'],
    data: function(){
        return{

        }
    },
    methods:{
        itemComplete: function(key){
            console.log(key)
        }
    },
    filters: {
        replaceComma: function (value) {
            return value.split(',').join('\n')
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