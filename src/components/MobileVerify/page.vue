<template>
    <i-form-item class="mobile-verify" :prop="prop">
        <i-input placeholder="手机验证码" prefix="ios-lock" size="large" class="mobile-input" v-model="innerValue" />
        <i-button :loading="isloading" class="get-code" @click="getVerifyCode()">{{timeout !== 0 ? timeout : "获取验证码"}}</i-button>
    </i-form-item>
</template>

<script>
var axios = require("axios");
let app = require("@/config");
let timer;
export default {
    props: {
        prop: {
            type: String,
            default: ""
        },
        value: {
            type: String,
            default: ""
        },
        mobile: {
            type: String,
            required: true
        },
        register: {
            type: Boolean,
            default: false
        }
    },
    methods: {
        getVerifyCode () {
            if (!this.nmsOpen) {
                return;
            }
            let timeout = this.timeout;
            if (timeout) {
                return;
            }

            let userName = this.mobile;
            if (!userName) {
                this.$Message.warning("必须填写手机号");
                return;
            }

            let params = { mobile: userName };
            if (this.register) {
                params.register = true;
            }
            this.isloading = true;
            axios.post("/api/security/GetVerifyCode", params, msg => {
                this.isloading = false;
                if (msg.success) {
                    this.innerValue = msg.Code;
                    this.$emit("on-recieve", msg.sceneId);
                    this.timeout = 60;
                    timer = setInterval(() => {
                        if (this.timeout > 0) {
                            this.timeout--;
                        } else {
                            clearInterval(timer);
                        }
                    }, 1000)
                } else {
                    this.$Message.warning(msg.msg);
                }
            })
        }
    },
    data () {
        return {
            timeout: 0,
            isloading: false,
            nmsOpen: app.webInfo.nmsOpen || false,
            innerValue: this.value
        }
    },
    mounted () {
        this.nmsOpen = app.webInfo.nmsOpen;
    },
    watch: {
        innerValue (v) {
            this.$emit("input", v);
        },
        value (v) {
            this.innerValue = v;
        }
    }
}
</script>

<style lang="less">
.mobile-verify .ivu-form-item-content {
    display: flex;
    .mobile-input {
        flex: 1 1;
    }
    .get-code {
        min-width: 104px;
        margin-left: 8px;
    }
}
</style>
