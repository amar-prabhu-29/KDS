<template>
    <div class="row">
        <div class="col l4" v-for="order in orders" v-if="order.orders.length != 0">{{order.steward}}<br>
            <p v-for="item in order.orders">{{item}}</p>
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
    }

}
</script>