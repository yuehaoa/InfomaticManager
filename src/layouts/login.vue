<template>
    <div id="login-layout">
        <div class="wrapper">
            <div class="layout-container">
                <div class="login-form">
                    <div class="main">
                        <div class="form-logo">
                            <router-link to="login">
                                <img :src="app.webInfo.avatar" />
                            </router-link>
                        </div>
                        <div class="form-slogon">
                            <div class="main-title">{{app.webInfo.title}}</div>
                            <div class="slogon-subtitle">{{app.webInfo.subtitle}}</div>
                        </div>
                        <div class="form-content">
                            <slot></slot>
                        </div>
                    </div>
                    <!-- main-form -->
                </div>
            </div>
        </div>
    </div>
</template>

<script>
let app = require("@/config")
export default {
    data () {
        return {
            app
        };
    }
}
</script>

<style lang="less">
#login-layout {
    background-color: #fafafa;
    position: relative;
    background: #fff;
    margin: 0 auto;
    height: 100%;
    .wrapper {
        width: 100%;
        min-height: calc(100vh);
        background: #fafafa;
    }
    .layout-container {
        max-width: 1056px;
        padding-left: 16px;
        padding-right: 16px;
        margin: 0 auto;
        height: 100%;
        .login-form {
            padding-top: 96px;
            width: 430px;
            margin: auto;
            .main {
                background-color: #fff;
                padding: 40px 8px 48px;
                margin-bottom: 64px;
                border: 1px solid #e9e9e9;
                border-radius: 4px;
                .form-logo {
                    max-width: 320px;
                    margin: 0 auto;
                    text-align: center;
                    padding-bottom: 20px;
                    img {
                        width: 64px;
                        height: 64px;
                    }
                }
                .form-slogon {
                    margin: 0 auto;
                    border-radius: 4px;
                    font-size: 14px;
                    text-align: center;
                    max-width: 340px;
                    .main-title {
                        font-size: 32px;
                        line-height: 32px;
                        color: #262626;
                    }
                    .slogon-subtitle {
                        color: #595959;
                        margin-top: 8px;
                        font-size: 18px;
                    }
                }
                .form-content {
                    margin: 0 auto;
                    border-radius: 4px;
                    font-size: 14px;
                    text-align: center;
                    max-width: 340px;
                    margin-top: 32px;
                }
            }
        }
    }
}
</style>
