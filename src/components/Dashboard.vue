<template>
    <div><h1>Welcome To KDS</h1>
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
                customerData : {}
            }
        },
    methods:{

    },
    created() {
        var database = firebaseApp.database().ref('Location/WoUc2HdIJePYcpztRB9j/Floors/')
        database.on('value', snapshot => {
            snapshot.forEach(floors => {
                floors.forEach(floor => {
                    floor.forEach(table => {
                        if(table.val().Seated){
                            if(table.val().Status.toLowerCase === "Ordered"){

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