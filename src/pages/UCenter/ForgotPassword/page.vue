<template>
    <div id="forgot-password">
        <i-form v-show="step === 1">
            <i-form-item :error="step1Error">
                <i-input placeholder="手机号" prefix="ios-phone-portrait" size="large" v-model="model.mobile"/>
            </i-form-item>
            <i-form-item>
                <i-button long size="large" type="primary" @click="nextStep()">下一步</i-button>
            </i-form-item>
        </i-form>
        <i-form v-show="step === 2" :model="model" ref="form" :rules="rules">
            <i-form-item prop="mobile">
                <i-input placeholder="手机号" prefix="ios-phone-portrait" size="large" v-model="model.mobile" disabled/>
            </i-form-item>
            <i-form-item prop="pwd">
                <i-input placeholder="输入密码" prefix="ios-lock" size="large" type="password" v-model="model.pwd"/>
            </i-form-item>
            <i-form-item prop="confirm">
                <i-input placeholder="确认密码" prefix="ios-lock" size="large" type="password" v-model="model.confirm"/>
            </i-form-item>
            <mobile-verify prop="code" :mobile="model.mobile" @on-recieve="onRecieve" v-model="model.code" />
            <i-form-item>
                <i-button long size="large" type="primary" @click="confirm()" :isloading="true">提交</i-button>
            </i-form-item>
        </i-form>
        <i-divider />
        <i-row type="flex" justify="end">
            <i-col class="register" span="4">
                <router-link :to="{name: 'Login'}">直接登录</router-link>
            </i-col>
        </i-row>
    </div>
</template>

<script>
var regex = require("@/regex");
var md5 = require("md5");
var axios = require("axios");
export default {
    methods: {
        nextStep () {
            if (!regex.mobile.test(this.model.mobile)) {
                this.step1Error = "必须输入手机号码";
            } else {
                this.step1Error = "";
                this.step = 2;
            }
        },
        confirm () {
            let form = this.$refs.form;
            form.validate(v => {
                if (!v) {
                    return;
                }

                let mobile = this.model.mobile;
                let pwd = md5(this.model.pwd);
                let code = this.model.code;
                let sceneId = this.model.sceneId;
                this.isloading = true;
                axios.post("/api/security/forgot", { mobile, pwd, code, sceneId }, msg => {
                    if (msg.success) {
                        this.$Message.success("密码修改成功");
                    } else {
                        this.$Message.warning(msg.msg);
                    }
                    form.resetFields();
                    this.isloading = false;
                    this.$router.push({name: "Login"});
                })
            })
        },
        onRecieve (sceneId) {
            this.model.sceneId = sceneId;
        }
    },
    data () {
        let THIS = this;
        return {
            step: 1,
            step1Error: "",
            timeout: 0,
            isloading: false,
            model: {
                mobile: "",
                pwd: "",
                confirm: "",
                code: "",
                sceneId: ""
            },
            rules: {
                pwd: {
                    validator (rule, value, cb, soure, options) {
                        let msg = "密码必须在6至16位之间";
                        (value && value.length >= 6 && value.length <= 16) ? cb() : cb(msg);
                    }
                },
                confirm: {
                    validator (rule, value, cb, soure, options) {
                        let msg = "必须和密码相同";
                        value === THIS.model.pwd ? cb() : cb(msg);
                    }
                },
                code: { required: true, message: "必须填写手机验证码" }
            }
        };
    }
}
</script>

<style lang="less">
#forgot-password {
    .register {
        text-align: right;
    }
}
</style>
