import Vue from 'vue'
import Router from 'vue-router'

let bussiness = require("./admin/index")
Vue.use(Router)

const components = {
  Login: {
    path: "/manage/login",
    layout: "login",
    component: () => import(/* webpackChunkName: "setting" */"@p/UCenter/Login")
  },
  Forgot: {
    path: "/manage/forgot",
    layout: "login",
    component: () => import(/* webpackChunkName: "setting" */"@p/UCenter/ForgotPassword")
  },
  Register: {
    path: "/manage/register",
    layout: "login",
    component: () => import(/* webpackChunkName: "setting" */"@p/UCenter/Register")
  },
  Dashboard: {
    path: "/manage/dashboard",
    layout: "admin",
    component: () => import(/* webpackChunkName: "security" */"@p/Dashboard")
  },
  UserManager: {
    path: "/manage/usermanager",
    layout: "admin",
    component: () => import(/* webpackChunkName: "security" */"@p/Cores/UserManager")
  },
  OrgManager: {
    path: "/manage/orgmanager",
    showAs: "UserManager",
    layout: "admin",
    component: () => import(/* webpackChunkName: "security" */"@p/Cores/OrgManager")
  },
  RoleManager: {
    path: "/manage/rolemanager",
    layout: "admin",
    component: () => import(/* webpackChunkName: "security" */"@p/Cores/RoleManager")
  },
  SystemConfig: {
    path: "/manage/config/system",
    layout: "admin",
    component: () => import(/* webpackChunkName: "config" */"@p/Cores/SystemConfig")
  },
  DataDictionary: {
    path: "/manage/config/datadictionary",
    layout: "admin",
    component: () => import(/* webpackChunkName: "config" */"@p/Cores/DataDictionary")
  },
  Categorise: {
    path: "/manage/cms/categories",
    layout: "admin",
    component: () => import(/* webpackChunkName: "cms" */"@p/Cores/CmsCategorise")
  },
  Profile: {
    path: "/manage/profile",
    layout: "admin",
    component: () => import(/* webpackChunkName: "security" */"@p/UCenter/Profile")
  },
  ArticleList: {
    path: "/manage/cms/articlelist",
    layout: "admin",
    component: () => import(/* webpackChunkName: "cms" */"@p/Cores/CmsArticleList")
  },
  ArticleDetail: {
    path: "/manage/cms/articledetail",
    layout: "admin",
    showAs: "ArticleList",
    component: () => import(/* webpackChunkName: "cms" */"@p/Cores/CmsArticleDetail")
  },
  ...bussiness
}

function generatePath (page) {
  let obj = components[page];
  let result = {
    path: '/' + page,
    name: page,
    meta: { layout: "admin", showAs: obj.showAs || page },
    component: null
  };
  if (typeof obj === "function") {
    result.component = obj;
  } else {
    if (obj.layout) {
      obj.meta = { layout: obj.layout, showAs: obj.showAs || page };
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
