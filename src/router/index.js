import Vue from 'vue'
import Router from 'vue-router'
import Login from '@/components/Login'
import Dashboard from '@/components/Dashboard'
import firebase from 'firebase'
Vue.use(Router)

let router =  new Router({
  mode: 'history',
  routes: [
    {
      path: '/login',
      name: 'login',
      component: Login,
      meta: {
        requiresGuest: true
      }
    },
    {
      path: '/dashboard',
      name : 'dashboard',
      component: Dashboard,
      meta: {
        requiresAuth: true
      }
    }
  ]
})

//Navguards
router.beforeEach((to, from, next) => {
  //Check For Required Auth Guard
  if(to.matched.some(record => record.meta.requiresAuth)){
    //Check if not logged in
    if(!firebase.auth().currentUser){
      //Go To Login
      next({
        path: '/login',
        query: {
          redirect: to.fullPath
        }
      });
    }
    else{
      //Proceed To Route
      next()
    }
  }
  else if(to.matched.some(record => record.meta.requiresGuest)){
    //Check if logged in
    if(firebase.auth().currentUser){
      //Go To HGome
      next({
        path: '/dashboard',
        query: {
          redirect: to.fullPath
        }
      });
    }
    else{
      //Proceed To Route
      next()
    }
  }
  else{
    //Proceed To Route
    next()
  }
  
})

export default router
