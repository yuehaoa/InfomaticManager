// The Vue build version to load with the `import` command
// (runtime-only or standalone) has been set in webpack.base.conf with an alias.
import Vue from 'vue'
import App from './App'
import router from './router/ucenter'
import iView from 'iview'
import rView from './components'
import {} from './init'
import './assets/less/iview.less'
import globalMixin from './api/mixin'
import ucenterLayout from './layouts/ucenter.vue'
import emptyLayout from './layouts/empty.vue'
import loginLayout from './layouts/login.vue'
require('font-awesome-webpack');
require('./api/signalR')
require('vue2-animate/dist/vue2-animate.min.css')
var axios = require("axios");
var app = require("./config");

Vue.config.productionTip = false
Vue.mixin(globalMixin);
Vue.use(router);
Vue.use(iView);
Vue.use(rView);
Vue.component("empty-layout", emptyLayout);
Vue.component("ucenter-layout", ucenterLayout);
Vue.component("login-layout", loginLayout);

axios.post("/api/config/GetBasicConfig", {}, msg => {
  if (msg.success) {
    app.webInfo = msg.info;
    app.titlePerfix = " - " + app.webInfo.title;
    app.userInfo = msg.userInfo;
    let ps = app.userInfo.permissons;
    app.checkPermission = (p) => {
        return ps && ps.indexOf(p) >= 0;
    }

    /* eslint-disable no-new */
    let vm = new Vue({
        el: '#app',
        router,
        components: {
            App
        },
        template: '<App/>'
    });
    globalMixin.app = vm;
  }
})
