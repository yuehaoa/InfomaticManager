<template>
  <card>
    <div style="margin-top:10px">个人信息</div>
    <divider/>
    <i-form ref="user-form" label-position="top" :model="model" :rules="rules">
      <i-form-item label="姓名" prop="realName">
        <i-input style="width:700px;" type="text" size="large" v-model="model.realName" />
      </i-form-item>
      <i-form-item label="学/工号" prop="code">
        <i-input style="width:700px;" disabled type="text" size="large" :value="model.userCode" />
      </i-form-item>
      <i-form-item label="手机" prop="mobile">
        <i-input style="width:700px;" type="text" size="large" v-model="model.mobile" />
      </i-form-item>
      <i-form-item label="邮箱" prop="email">
        <i-input style="width:700px;" type="text" size="large" v-model="model.email" />
      </i-form-item>
      <i-form-item label="头像" prop="avatar">
        <i-row>
          <i-col span="3">
            <avatar-uploader
              :width="128"
              :height="128"
              usage="imgAvatar"
              single
              relate-table="Users"
              v-model="model.avatar"
            />
          </i-col>
        </i-row>
        <i-button type="success" style="margin-top:10px" @click="save" :loading="isloading">确认更新</i-button>
      </i-form-item>
    </i-form>
  </card>
</template>
<script>
const regex = require("@/regex.js");
let app = require("@/config");
var _ = require("lodash");
const axios = require("axios");
export default {
  methods: {
    save () {
      this.isloading = true;
      let form = this.$refs["user-form"];
      let model = this.model;
      form.validate(err => {
        if (!err) {
          return;
        }

        axios.post("/api/security/SaveUserProfile", model, msg => {
          this.isloading = false;
          if (!msg.success) {
            this.$Message.error(msg.msg);
          } else {
            this.$Message.success("修改成功");
          }
        });
      });
    }
  },
  data () {
    return {
      isloading: false,
      model: {},
      rules: {
        "mobile": [
          {
            required: true,
            message: "必须输入手机号",
            trigger: "blur"
          },
          {
            type: "string",
            pattern: regex.mobile,
            message: "手机格式不正确",
            trigger: "blur"
          },
          _.debounce(function (rule, value, cb, source, options) {
            axios.post(
              "/api/security/MobileValidate",
              { mobile: value },
              msg => {
                if (msg.success) {
                  cb();
                } else {
                  cb(msg.remote);
                }
              }
            );
          }, 500)
        ],
        "email": [
          {
            required: true,
            message: "必须输入电子邮箱",
            trigger: "blur"
          },
          {
            type: "string",
            pattern: regex.email,
            message: "电子邮箱格式不正确",
            trigger: "blur"
          },
          _.debounce((rule, value, cb, source, options) => {
            axios.post(
              "/api/security/EmailValidate",
              { email: value },
              msg => {
                if (msg.success) {
                  cb();
                } else {
                  cb(msg.remote);
                }
              }
            );
          }, 500)
        ],
        "realName": { required: true, message: "必须输入姓名", trigger: "blur" },
        "avatar": { required: true, message: "必须上传图片", trigger: "blur" }
      }
    };
  },
  mounted () {
    this.model = app.userInfo;
  }
};
</script>
<style lang="less">
</style>
