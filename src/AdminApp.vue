<template>
    <div v-if="!isLogined" class="login-frame">
        <Row type="flex" justify="center" class="code-row-bg">
            <Tabs value="pwd" class="login-tab" type="card">
                <TabPane label="账号密码" name="pwd">
                    <Card class="login-card">
                        <Form ref="login-form" :model="user" :rules="rules">
                            <FormItem label="账号名" label-position="top" label-for="#user" prop="username">
                                <Input prefix="ios-person" id="user" v-model="user.username" @keyup.enter.native="handleLogin"/>
                            </FormItem>
                            <FormItem label="密码" label-position="top" label-for="#pwd" prop="pwd">
                                <i-input prefix="ios-lock-outline" :type="pwdInputType" id="pwd" v-model="user.pwd" @keyup.enter.native="handleLogin">
                                </i-input>
                            </FormItem>
                            <FormItem>
                                <Button ref="login-btn" @click="handleLogin" long :loading="loading" :disabled="isLogined" type="success">登录</Button>
                            </FormItem>
                        </Form>
                    </Card>
                </TabPane>
                <TabPane label="微信扫码" name="wechat">标签二的内容</TabPane>
            </Tabs>
        </Row>
    </div>
    <div v-else>
        <component :is="layout">
            <transition name="fade" mode="out-in">
                <router-view></router-view>
            </transition>
        </component>
    </div>
</template>

<script>
import {Row, Tabs, TabPane, Card, Form, FormItem, Input} from 'iview'
const axios = require("axios");
const app = require("@/config");

export default {
    name: 'App',
    components: {Row, Tabs, TabPane, Card, Form, FormItem, Input},
    methods: {
      handleLogin () {
        let form = this.$refs["login-form"];
        form.validate(v => {
            this.loading = true;

            if (!v) {
                this.loading = false;
                return;
            }

            axios.post("/api/security/login", this.user, msg => {
              if (msg.success) {
                  // 跳转到成功页面
                  this.loginSuccess(msg.currentUserGuid);
              } else {
                  this.$Message.error(msg.msg);
              }
                this.loading = false;
            })
        })
      },
      loginSuccess (currentUserGuid) {
          app.currentUserGuid = currentUserGuid;
          localStorage.currentUserGuid = currentUserGuid;
          app.getMenus(menus => {
              this.$set(app, "menus", menus);
              this.isLogined = true;
              location.hash === "#/" && this.$router.push(app.dashboard);
          })
      },
      eyeClick () {
          console.log("eye");
          if (this.pwdInputType === "password") {
              this.pwdInputType = "text";
              this.eyeSuffix = "ios-eye-off-outline";
          } else {
              this.pwdInputType = "password";
              this.eyeSuffix = "ios-eye-outline";
          }
      },
      setTitle () {
          document.title = app.title + app.titlePerfix;
      },
      kick (msg) {
          this.$Message.error(msg || "登录超时，请重新登录。");
          this.isLogined = false;
      }
    },
    data () {
        return {
            isLogined: false,
            user: {
                username: "",
                pwd: ""
            },
            eyeSuffix: "ios-eye-outline",
            pwdInputType: "password",
            loading: false,
            app,
            rules: {
                username: [
                    {required: true, message: "请输入用户名", trigger: "blur"}
                ],
                pwd: [
                    {required: true, message: "请输入密码", trigger: "blur"}
                ]
            }
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
        axios.post("/api/security/loginByToken", {}, msg => {
            if (msg.success) {
                this.loginSuccess(msg.currentUserGuid);
            }
            this.$Spin.hide();
        })
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
