<template>
    <div id="login-form">
        <i-form v-show="method === 'password'" :model="passwordModel" :rules="passwordRules" ref="password">
            <i-form-item prop="userName">
                <i-input placeholder="手机号或邮箱" prefix="ios-contact" size="large" v-model="passwordModel.userName"/>
            </i-form-item>
            <i-form-item prop="password">
                <i-input placeholder="密码" @keyup.enter.native="submit()" @input="isPwd=true" prefix="ios-lock" size="large" type="password" v-model="passwordModel.password" />
                <i-checkbox v-model="isRemember" style="float:left;">记住密码</i-checkbox>
                <router-link class="forgot-link" :to="{name:'Forgot'}">忘记密码?</router-link>
            </i-form-item>
            <i-form-item>
                <i-button long size="large" type="primary" @click="submit()" :loading="isloading">登 录</i-button>
                <a v-if="app.webInfo.nmsOpen" href="javascript:;" class="to-mobile" @click="method='mobile'">使用手机短信登录</a>
            </i-form-item>
        </i-form>
        <i-form v-show="method === 'mobile'" :model="mobileModel" ref="mobile" :rules="mobileRules">
            <i-form-item prop="userName">
                <i-input placeholder="手机号" prefix="ios-contact" size="large" v-model="mobileModel.userName" />
            </i-form-item>
            <mobile-verify prop="password" :mobile="mobileModel.userName" @on-recieve="onRecieve" v-model="mobileModel.password" />
            <i-form-item>
                <i-button long size="large" type="primary" @click="submit()" :loading="isloading">登 录</i-button>
                <a href="javascript:;" class="to-mobile" @click="method='password'">使用账号密码登录</a>
            </i-form-item>
        </i-form>
        <i-divider />
        <i-row>
            <i-col class="third-login" span="20">
                <a href="javascript:;">
                    <Icon type="ios-chatbubbles-outline" />微信登录
                </a>
            </i-col>
            <i-col class="register" span="4">
                <router-link :to="{name: 'Register'}">快速注册</router-link>
            </i-col>
        </i-row>
    </div>
</template>

<script>
let regex = require("@/regex")
let axios = require("axios");
let md5 = require("md5");
let app = require("@/config");
export default {
    methods: {
        submit () {
            let method = this.method;
            let userName = this[method + "Model"].userName;
            let password = this[method + "Model"].password;
            let sceneId = this[method + "Model"].sceneId;
            let form = this.$refs[method];
            form.validate(v => {
                if (!v) {
                    return;
                }
                this.isloading = true;
                password = method === "mobile" ? password : md5(password);
                axios.post("/api/security/Login", { method, username: userName, pwd: password, sceneId, isRemember: this.isRemember, isPwd: this.isPwd, code: localStorage.code }, msg => {
                    this.isloading = false;
                    if (msg.success) {
                        app.userInfo = msg.userInfo;
                        let ps = app.userInfo.permissons;
                        app.checkPermission = (p) => {
                            return ps && ps.indexOf(p) >= 0;
                        }
                        this.$nextTick(() => {
                            if (msg.success) {
                                let path = this.$route.query.goto || app.dashboard;
                                path = path === "/" ? app.dashboard : path;
                                let ui = msg.userInfo;
                                if (ui.isRemember) {
                                    localStorage.isRemember = "1";
                                    localStorage.userName = this.passwordModel.userName;
                                    localStorage.code = ui.code;
                                } else {
                                    localStorage.isRemember = "";
                                    localStorage.userName = "";
                                    localStorage.code = "";
                                }
                                this.$router.push(path);
                            } else {
                                this.$Message.warning(msg.msg);
                            }
                        });
                    } else {
                        this.$Message.warning(msg.msg);
                    }
                })
            })
        },
        onRecieve (sceneId) {
            this.mobileModel.sceneId = sceneId;
        }
    },
    data () {
        // let mobileOrEmail = [this.buildOrRegex("请输入正确的手机号或邮箱。", [regex.mobile, regex.email], "submit")];
        return {
            method: "password",
            isloading: false,
            isRemember: !!localStorage.isRemember,
            isPwd: !localStorage.isRemember,
            passwordModel: {
                userName: localStorage.userName || "",
                password: localStorage.code ? "记住的密码" : ""
            },
            mobileModel: {
                userName: "",
                password: "",
                sceneId: ""
            },
            app,
            passwordRules: {
                userName: [
                    { required: true, message: "请输入正确的手机号或邮箱", trigger: 'submit' }
                ],
                password: { required: true, message: "请输入密码", trigger: 'submit' }
            },
            mobileRules: {
                userName: { required: true, pattern: regex.mobile, message: "请输入正确的手机号", trigger: 'submit' },
                password: { required: true, message: "请输入手机验证码", trigger: 'submit' }
            }
        };
    },
    watch: {
        method (v) {
            app.title = "登录"
            this.$nextTick(() => {
                let method = this.method;
                let form = this.$refs[method];
                form.resetFields();
            });
        }
    }
}
</script>

<style lang="less">
#login-form {
    .forgot-link {
        color: #8c8c8c;
        font-size: 14px;
        float: right;
    }
    .to-mobile {
        color: #8c8c8c;
        font-size: 14px;
        float: left;
    }
    .third-login {
        text-align: left;
    }
    .register {
        text-align: right;
    }
}
</style>
