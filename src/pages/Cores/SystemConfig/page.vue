<template>
    <div id="system-config">
        <i-row type="flex" :gutter="16">
            <i-col span="19">
                <i-card title="基本设置" id="basic" icon="ios-cog" class="mb16">
                    <i-spin size="large" fix v-if="basic.init" />
                    <i-form :label-width="110" ref="basic" :model="basic.model" :rules="basic.rules">
                        <i-form-item label="网站名称" prop="title">
                            <i-input class="form-control" v-model="basic.model.title" placeholder="显示在登录页面，以及网站标题上" />
                        </i-form-item>
                        <i-form-item label="网站副标题" prop="subtitle">
                            <i-input class="form-control" v-model="basic.model.subtitle" placeholder="显示在登录页面上" />
                        </i-form-item>
                        <i-form-item label="网站的图标">
                            <avatar-uploader :width="128" :height="128" v-model="basic.model.avatar" usage="imgWebsiteAvatar" single relate-table="config" />
                        </i-form-item>
                    </i-form>
                    <i-divider />
                    <i-button class="confirm" type="primary" size="large" :loading="basic.loading" @click="confirm('basic', '/api/config/SetBasicConfig')">确认</i-button>
                    <i-button size="large" @click="bindConfig('basic', '/api/config/GetBasicConfig')">取消</i-button>
                </i-card>
                <i-card id="wechat" icon="ios-cog" class="mb16">
                    <p slot="title">
                        微信配置
                    </p>
                    <i-form :label-width="120" :model="wechat.model" ref="wechat" :rules="wechat.rules">
                        <i-form-item label="AppId" prop="appId">
                            <i-input v-model="wechat.model.appId" placeholder="填写微信公众平台申请到的AppId" class="form-control" />
                        </i-form-item>
                        <i-form-item label="AppSecret">
                            <i-input v-model="wechat.model.appSecret" type="password" placeholder="填写微信公众平台申请到的AppSecret" class="form-control" />
                            <p>此处放空则视为不修改。</p>
                        </i-form-item>
                        <i-form-item label="商户号">
                            <i-input v-model="nms.model.signature" placeholder="填写微信公众平台申请到的MerchantId" class="form-control" />
                            <p>此处放空则视为不修改。</p>
                        </i-form-item>
                        <i-form-item label="Key">
                            <i-input v-model="nms.model.templateCode" placeholder="填写微信公众平台申请到的交易Key" class="form-control" />
                            <p>此处放空则视为不修改。</p>
                        </i-form-item>
                        <i-form-item label="">
                            <i-button type="default" @click="testWechat()">测试链接</i-button>
                            <p>在保存后，点此链接可以测试是否成功。</p>
                        </i-form-item>
                    </i-form>
                    <i-divider />
                    <i-button class="confirm" type="primary" size="large" :loading="nms.loading" @click="confirm('wechat', '/api/config/SaveWechatConfig')">确认</i-button>
                    <i-button size="large" @click="bindConfig('wechat', '/api/config/GetWechatConfig')">取消</i-button>
                </i-card>
                <i-card id="email" icon="ios-cog" class="mb16">
                    <p slot="title">
                        <i-switch v-model="email.model.emailOpen" size="small" />  邮箱配置
                    </p>
                    <i-alert type="error" show-icon v-if="!email.model.emailOpen">
                        禁用邮箱模式
                        <template slot="desc">
                            在禁用邮箱模式后，系统不再允许使用邮箱找回密码，也不允许任何模块发送邮件。
                        </template>
                    </i-alert>
                    <i-alert type="warning" show-icon v-if="email.model.emailOpen && email.model.emailDebug">
                        邮箱调试模式
                        <template slot="desc">
                            启用邮箱调试模式以后，系统不会发送邮件。如果需要使用邮箱验证码，系统会自动填写
                        </template>
                    </i-alert>
                    <i-form :label-width="120" :model="email.model" ref="email" :rules="email.rules">
                        <i-form-item label="启用调试模式" prop="emailDebug">
                            <i-switch v-model="email.model.emailDebug" />
                        </i-form-item>
                        <i-form-item label="发送邮箱">
                            <i-input v-model="email.model.emailFrom" placeholder="填写发送邮件使用的邮箱名" class="form-control" />
                            <p>此处放空则视为不修改。</p>
                        </i-form-item>
                        <i-form-item label="邮箱密码">
                            <i-input v-model="email.model.emailPassword" placeholder="填写发送邮件使用的密码" type="password" class="form-control" />
                            <p>此处放空则视为不修改。如果使用QQ，163等邮箱，则需要填写授权号</p>
                        </i-form-item>
                        <i-form-item label="SMTP">
                            <i-input v-model="email.model.emailClient" placeholder="填写发送邮件使用的SMTP地址" class="form-control" />
                            <p>此处放空则视为不修改。例如QQ邮箱使用“smtp.qq.com”</p>
                        </i-form-item>
                        <i-form-item label="端口号">
                            <i-input-number v-model="email.model.emailPort" placeholder="填写发送邮件使用的端口号" class="form-control" />
                            <p>此处放空则视为不修改。例如QQ邮箱使用的是587</p>
                        </i-form-item>
                        <i-form-item label="启用Ssl加密模式" prop="enableSsl">
                            <i-switch v-model="email.model.enableSsl" />
                            <p>例如QQ邮箱需要启用Ssl加密</p>
                        </i-form-item>
                        <i-form-item label="发送测试邮件">
                            <i-input v-model="email.model.test" placeholder="发送到的邮箱" class="form-control" />
                            <i-button :disabled="!email.model.emailOpen" :loading="email.testLoading" @click="sendTestEmail">发送</i-button>
                        </i-form-item>
                    </i-form>
                    <i-divider />
                    <i-button class="confirm" type="primary" size="large" :loading="email.loading" @click="confirm('email', '/api/config/SaveEmailConfig')">确认</i-button>
                    <i-button size="large" @click="bindConfig('email', '/api/config/GetEmailConfig')">取消</i-button>
                </i-card>
                <i-card id="nms" icon="ios-cog" class="mb16">
                    <p slot="title">
                        <i-switch v-model="nms.model.nmsOpen" size="small" />  短信配置
                    </p>
                    <i-alert type="error" show-icon v-if="!nms.model.nmsOpen">
                        禁用短信模式
                        <template slot="desc">
                            在短信模式禁用后，系统不会再发送任何短信，同时也不会产生短信相关的费用。前台所有界面，关于短信发送的内容全部禁用。
                        </template>
                    </i-alert>
                    <i-alert type="warning" show-icon v-if="nms.model.nmsOpen && nms.model.nmsDebug">
                        短信调试模式
                        <template slot="desc">
                            启用短信调试模式以后，系统不会发送手机短信，不会产生短信相关费用。前台所有界面，在点击“获取手机验证码”按钮以后，均会自动填写正确的验证码。<br/>
                            并且没有1分钟只能发一条的限制。
                        </template>
                    </i-alert>
                    <i-form :label-width="120" :model="nms.model" ref="nms" :rules="nms.rules">
                        <i-form-item label="启用调试模式" prop="nmsDebug">
                            <i-switch v-model="nms.model.nmsDebug" />
                        </i-form-item>
                        <i-form-item label="AccessKeyID">
                            <i-input v-model="nms.model.accessKeyID" placeholder="填写阿里云处申请到的AccessKeyID" class="form-control" />
                            <p>此处放空则视为不修改。</p>
                        </i-form-item>
                        <i-form-item label="AccessKeySecret">
                            <i-input v-model="nms.model.accessKeySecret" type="password" placeholder="填写阿里云处申请到的AccessKeySecret" class="form-control" />
                            <p>此处放空则视为不修改。</p>
                        </i-form-item>
                        <i-form-item label="短信签名">
                            <i-input v-model="nms.model.signature" placeholder="填写阿里云处申请到的短信签名" class="form-control" />
                            <p>此处放空则视为不修改。</p>
                        </i-form-item>
                        <i-form-item label="模板代码">
                            <i-input v-model="nms.model.templateCode" placeholder="填写阿里云处申请到的模板代码" class="form-control" />
                            <p>此处放空则视为不修改。</p>
                        </i-form-item>
                    </i-form>
                    <i-divider />
                    <i-button class="confirm" type="primary" size="large" :loading="nms.loading" @click="confirm('nms', '/api/config/SaveMNSConfig')">确认</i-button>
                    <i-button size="large" @click="bindConfig('nms', '/api/config/GetMNSConfig')">取消</i-button>
                </i-card>
            </i-col>
            <i-col span="4">
                <i-anchor show-ink :offset-top="84">
                    <i-anchor-link title="网站设置" href="#basic" />
                    <i-anchor-link title="微信配置" href="#wechat" />
                    <i-anchor-link title="邮箱配置" href="#email" />
                    <i-anchor-link title="短信配置" href="#nms" />
                </i-anchor>
            </i-col>
        </i-row>
    </div>
</template>

<script>
let axios = require("axios")
let app = require("@/config")
let regex = require("@/regex")
export default {
    methods: {
        confirm (name, url) {
            let form = this.$refs[name];
            let model = this[name].model;

            this[name].loading = true;
            form.validate(v => {
                if (!v) {
                    this[name].loading = false;
                    return;
                }
                axios.post(url, model, msg => {
                    this[name].loading = false;
                    if (msg.success) {
                        this.$Message.success(msg.msg);
                    } else {
                        this.$Message.warning(msg.msg);
                    }
                })
            })
        },
        bindConfig (name, url) {
            this[name].init = true;
            axios.post(url, {}, msg => {
                if (msg.success) {
                    this[name].init = false;
                    this[name].model = msg.info;
                }
            })
        },
        sendTestEmail () {
            this.email.testLoading = true;
            if (!regex.email.test(this.email.model.test)) {
                this.email.testLoading = false;
                this.$Message.warning("必须填写测试邮箱");
                return;
            }

            axios.post("/api/config/SendTestEmail", { test: this.email.model.test }, msg => {
                this.$Message.success(msg.msg);
                this.email.testLoading = false;
                this.email.model.test = "";
            })
        },
        testWechat () {
            axios.post("/api/wechat/WechatInfo", {}, msg => {
                if (msg.success) {
                    this.$Message.success("配置成功");
                } else {
                    this.$Message.warning("配置失败")
                }
            })
        }
    },
    mounted () {
        app.title = "系统配置"
        this.bindConfig('basic', '/api/config/GetBasicConfig');
        this.bindConfig('wechat', '/api/config/GetWechatConfig');
        this.bindConfig('nms', '/api/config/GetMNSConfig');
        this.bindConfig('email', '/api/config/GetEmailConfig');
    },
    data () {
        let data = {
            basic: {
                loading: false,
                init: true,
                model: {
                    title: "",
                    subtitle: "",
                    avatar: ""
                },
                rules: {
                    title: { required: true, message: "必须填写网站名称" },
                    subtitle: { required: true, message: "必须填写网站副标题" }
                }
            },
            wechat: {
                loading: false,
                init: true,
                model: {
                    appId: "",
                    appSecret: "",
                    merchantId: "",
                    key: ""
                },
                rules: {
                    appId: { required: true, message: "必须填写AppId" }
                }
            },
            nms: {
                loading: false,
                init: true,
                model: {
                    accessKeyID: "",
                    accessKeySecret: "",
                    nmsDebug: false,
                    nmsOpen: true,
                    signature: "",
                    templateCode: ""
                },
                rules: {
                    nmsDebug: { required: true, message: "" }
                }
            },
            email: {
                loading: false,
                testLoading: false,
                init: true,
                model: {
                    emailFrom: "",
                    emailPassword: "",
                    emailDebug: false,
                    emailOpen: true,
                    emailClient: "",
                    emailPort: 0,
                    enableSsl: false,
                    test: ""
                },
                rules: {
                    emailDebug: { required: true, message: "" }
                }
            }
        };
        return data;
    }
}
</script>

<style lang="less">
#system-config {
    .form-control {
        width: 600px;
    }
    .confirm {
        width: 100px;
    }
}
</style>
