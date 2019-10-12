import Vue from 'vue'
import Router from 'vue-router'

Vue.use(Router)

const components = {
  Login: {
    path: "/ucenter/login",
    layout: "login",
    component: () => import(/* webpackChunkName: "setting" */"@p/UCenter/Login")
  },
  Forgot: {
    path: "/ucenter/forgot",
    layout: "login",
    component: () => import(/* webpackChunkName: "setting" */"@p/UCenter/ForgotPassword")
  },
  Register: {
    path: "/ucenter/register",
    layout: "login",
    component: () => import(/* webpackChunkName: "setting" */"@p/UCenter/Register")
  },
  UCProfile: {
    path: "/ucenter/settings/profile",
    component: () => import(/* webpackChunkName: "setting" */"@p/UCenter/Profile")
  }
}

function generatePath (page) {
  let obj = components[page];
  let result = {
    path: '/' + page,
    name: page,
    meta: { layout: "ucenter" },
    component: null
  };
  if (typeof obj === "function") {
    result.component = obj;
  } else {
    if (obj.layout) {
      obj.meta = { layout: obj.layout };
    }
    result = {...result, ...obj};
  }
  return result;
}

let pages = [];
for (let pc in components) {
  pages.push(generatePath(pc));
}

export default new Router({
  mode: "history",
  routes: pages
})
