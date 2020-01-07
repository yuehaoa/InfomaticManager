<template>
    <component :is="layout">
        <transition name="fade" mode="out-in" :duration="250">
            <router-view></router-view>
        </transition>
    </component>
</template>

<script>
// const axios = require("axios");
const app = require("@/config");
export default {
    name: 'app',
    // created () {
    //     this.$on("connected", connId => {
    //         console.log(connId);
    //     })
    // },
    methods: {
        connected (connId) {
            window._console.log(`已成功连接服务器 -> ${connId}`);
        },
        debugCMsg (msg) {
            window._console.log(`成功接收服务器下发的测试信息：${msg}`);
        },
        showAlert (msg) {
            alert(msg);
        },
        connectMsg (msg) {
            window._console.log(msg);
        },
        kickUser (msg) {
            this.$Message.info(msg);
            this.$router.push({ name: "Login" });
        },
        setTitle () {
            document.title = app.title + app.titlePerfix;
        },
        loginSuccess (currentUserGuid) {
            app.currentUserGuid = currentUserGuid;
            localStorage.currentUserGuid = currentUserGuid;

            let path = document.location.href;
            let arrUrl = path.split("//");
            let start = arrUrl[1].indexOf("/");
            let relUrl = arrUrl[1].substring(start);
            path = relUrl;

            if (path === "/") {
                this.$router.push({ name: "Login" });
            } else {
                this.$router.push(path);
            }
        }
    },
    data () {
        return {
            app
        };
    },
    computed: {
        layout () {
            let lay = (this.$route.meta.layout || "empty") + "-layout";
            return lay;
        }
    },
    mounted () {
        app.kick = this.kick;
        this.setTitle();
        this.$Spin.show();
        if (app.userInfo.isLogined) {
            let ps = app.userInfo.permissons;
            app.checkPermission = (p) => {
                return ps && ps.indexOf(p) >= 0;
            }
            this.loginSuccess(app.userInfo.currentUserGuid);
        } else {
            let path = document.location.href;
            let arrUrl = path.split("//");
            let start = arrUrl[1].indexOf("/");
            let relUrl = arrUrl[1].substring(start);
            path = relUrl;
            let query;
            if (path.indexOf("/manage/login") < 0) {
                query = { goto: path };
            }
            this.$router.push({ name: "Login", query });
        }
        this.$Spin.hide();
    },
    watch: {
        app: {
            handler (o, n) {
                this.setTitle();
            },
            deep: true
        }
    }
}
</script>

<style lang="less">
.login-frame {
    background-color: #f8f8f9;
    width: 100%;
    min-height: fill-available;

    .login-tab {
      width: 400px;
      margin: 50px auto;
      padding: 16px;

      .login-card {
        border-radius: 0px 0px 4px 4px;
        margin-top: -16px;
      }
    }
}
</style>
