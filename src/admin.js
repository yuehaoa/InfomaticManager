// The Vue build version to load with the `import` command
// (runtime-only or standalone) has been set in webpack.base.conf with an alias.
import Vue from 'vue'
import App from './App.vue'
import router from './router/admin'
import iView from 'view-design'
import {} from './init'
import './assets/less/iview.less'
import rView from './components'
import globalMixin from './api/mixin'
import adminLayout from './layouts/admin.vue'
import emptyLayout from './layouts/empty.vue'
import loginLayout from './layouts/login.vue'
require('font-awesome-webpack');
require('./api/signalR')
var axios = require("axios");
var app = require("./config");
var enums = require("./config/enums");
Vue.config.productionTip = false
Vue.mixin(globalMixin);
Vue.use(router);
Vue.use(iView);
Vue.use(rView);
Vue.use(iView, {
    capture: false
});
Vue.component("admin-layout", adminLayout);
Vue.component("empty-layout", emptyLayout);
Vue.component("login-layout", loginLayout);
let dic = axios._post("/api/config/GetDataDictionary")
let config = axios._post("/api/config/GetBasicConfig")
axios.all([dic, config]).then(axios.spread((d, c) => {
    let msg = c.data;
    let dictionary = d.data;
    if (msg.success) {
        app.webInfo = msg.info;
        app.titlePerfix = " - " + app.webInfo.title;
        app.userInfo = msg.userInfo;
        let ps = app.userInfo.permissons;
        app.checkPermission = (p) => {
            return ps && ps.indexOf(p) >= 0;
        }
    }

    app.dictionary = { ...enums };
    if (dictionary.success) {
        app.dictionary = { ...app.dictionary, ...dictionary.Dictionary };
    }

    /* eslint-disable no-new */
    let vm = new Vue({
        el: '#app',
        router,
        components: { App },
        template: '<App/>'
    })
    globalMixin.setApp(vm);
}))
