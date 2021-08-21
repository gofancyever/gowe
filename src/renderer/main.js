import Vue from 'vue'
import axios from 'axios'

import App from './App'
import router from './router'
import store from './store'
import { Button, Input,TabPane,Tabs,Table,TableColumn,Dialog,Form,FormItem,Radio,RadioGroup,Select,Option } from 'element-ui';
import JsonViewer from 'vue-json-viewer'

Vue.use(Button)
Vue.use(Input);
Vue.use(TabPane);
Vue.use(Tabs);
Vue.use(JsonViewer)
Vue.use(Table)
Vue.use(TableColumn)
Vue.use(Dialog)
Vue.use(Form)
Vue.use(FormItem)
Vue.use(Radio)
Vue.use(RadioGroup)
Vue.use(Select)
Vue.use(Option)


if (!process.env.IS_WEB) Vue.use(require('vue-electron'))
Vue.http = Vue.prototype.$http = axios
Vue.config.productionTip = false

/* eslint-disable no-new */
new Vue({
  components: { App },
  router,
  store,
  template: '<App/>'
}).$mount('#app')
