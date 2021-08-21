import Vue from 'vue'
import Router from 'vue-router'
import tool from "@/views/tool"
Vue.use(Router)

export default new Router({
  routes: [
    {
      path: '/',
      name: 'tool',
      component: tool
    },
    {
      path: '/tool',
      name: 'tool',
      component: tool
    },
    {
      path: '*',
      redirect: '/tool'
    }
  ]
})
