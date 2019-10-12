<template>
    <div id="register-form">
        <i-form :model="model" ref="mobile" :rules="rules">
            <i-form-item prop="mobile">
                <i-input placeholder="手机号" size="large" v-model="model.mobile">
                    <span slot="prepend">+86</span>
                </i-input>
            </i-form-item>
            <mobile-verify prop="code" :mobile="model.mobile" @on-recieve="onRecieve" v-model="model.code" :register="true" />
            <i-form-item>
                <i-button long size="large" type="primary" @click="submit()" :loading="isloading">快速注册</i-button>
                <p>
                    点击“快速注册”，即代表你同意<a href="javascript:;" target="_blank" class="ivu-">《{{app.webInfo.title}}服务协议》</a>
                </p>
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
                <router-link :to="{name: 'Login'}">直接登录</router-link>
            </i-col>
        </i-row>
    </div>
</template>

<script>
var regex = require("@/regex");
var axios = require("axios");
let app = require("@/config");
export default {
    methods: {
        onRecieve (sceneId) {
            this.model.sceneId = sceneId;
        },
        submit () {
            let form = this.$refs.mobile;
            form.validate(v => {
                if (!v) {
                    return;
                }
                this.isloading = true;

                axios.post("/api/security/FastRegister", { ...this.model }, msg => {
                    this.isloading = false;
                    form.resetFields();
                    this.$router.push({name: "Login"});
                })
            })
        }
    },
    data () {
        return {
            isloading: false,
            app,
            model: {
                mobile: "",
                code: "",
                sceneId: ""
            },
            rules: {
                mobile: { required: true, pattern: regex.mobile, message: "必须输入一个手机号码", trigger: "submit" },
                code: { required: true, message: "必须输入手机验证码", trigger: "submit" }
            }
        };
    }
}
</script>

<style lang="less">
#register-form {
    .third-login {
        text-align: left;
    }
    .register {
        text-align: right;
    }
}
</style>
