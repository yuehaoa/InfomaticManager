<template>
    <i-col class="panel" id="UserDetail">
        <div class="header">
            <span>成员详情</span>
        </div>
        <Affix :offset-top="64">
            <div class="top-btn-area">
                <Button @click="cancel"><Icon type="ios-arrow-back"/>返回</Button>
                <Divider type="vertical" />
                <Button type="primary" class="mr8" :loading="isSaving" @click="save">保存</Button><Button @click="cancel">取消</Button>
            </div>
        </Affix>
        <Divider />
        <Form ref="user-form" :model="model" :rules="rules" label-position="right" :label-width="100">
            <FormItem prop="UserName">
                <label slot="label">
                    ID卡号 <Tooltip content="使用读卡器读取，该字段可以视为用户名。"><Icon type="ios-help-circle" style="color: #2d8cf0" /></Tooltip>
                </label>
                <Input v-model="model.UserName" placeholder="请输入用户ID卡号" />
            </FormItem>
            <FormItem label="手机" prop="Mobile">
                <Input v-model="model.Mobile" placeholder="请输入手机" />
            </FormItem>
            <FormItem label="邮箱" prop="Email">
                <Input v-model="model.Email" placeholder="请输入邮箱" />
            </FormItem>
            <FormItem label="学/工号" prop="Code">
                <Input v-model="model.Code" placeholder="请输入学/工号" />
            </FormItem>
            <FormItem label="姓名" prop="RealName">
                <Input v-model="model.RealName" placeholder="请输入姓名" />
            </FormItem>
            <FormItem label="排序号" prop="Currency">
                <Input v-model="model.DisplayOrder" placeholder="请输入排序号" />
                <div class="help-block">
                   排序号以<b class="text-info">降序</b>排列
                </div>
            </FormItem>
            <FormItem label="所属部门" v-if="permissions.giveDepart">
                <OrgSelector v-model="model.departs" :multiple="true" />
            </FormItem>
            <i-form-item label="角色" v-if="permissions.giveRole">
                <i-select v-model="model.roles" multiple>
                    <i-option v-for="(item, index) in roles" :key="index" :value="item.ID">{{item.Name}}</i-option>
                </i-select>
            </i-form-item>
            <FormItem>
                <Button :loading="isSaving" type="primary" @click="save">保存</Button>
                <Button style="margin-left: 8px" @click="cancel">取消</Button>
            </FormItem>
        </Form>
    </i-col>
</template>

<script>
import OrgSelector from '@c/OrgSelector'
const regex = require("@/regex.js")
let app = require("@/config");
var _ = require("lodash")
const axios = require("axios");
export default {
    components: {OrgSelector},
    props: {
        userId: {
            type: String,
            default: ""
        }
    },
    methods: {
        cancel () {
            this.$emit("on-saved");
        },
        save () {
            let form = this.$refs["user-form"];
            let model = this.model;
            model.userId = model.ID;
            this.isSaving = true;

            form.validate(err => {
                if (!err) {
                    this.isSaving = false;
                    return;
                }

                axios.post("/api/security/SaveUser", model, msg => {
                    if (!msg.success) {
                        this.$Message.error(msg.msg);
                    } else {
                        this.$Message.success("修改成功");
                        this.cancel();
                    }
                    this.isSaving = false;
                })
            })
        }
    },
    data () {
        let THIS = this;
        return {
            isSaving: false,
            roles: [],
            model: {
            },
            departs: [],
            permissions: {
                giveRole: app.checkPermission("Security.GiveRoles"),
                giveDepart: app.checkPermission("Security.GiveDeparts")
            },
            rules: {
               "UserName": [
                   {required: true, message: "必须输入用户名或ID卡号", trigger: "blur"},
                   _.debounce((rule, value, cb, source, options) => {
                       let userId = this.model.ID;
                       axios.post("/api/security/UserNameValidate", { userId, userName: value }, msg => {
                           if (msg.success) {
                               cb();
                           } else {
                               cb(msg.remote);
                           }
                       })
                   }, 500)
               ],
               "Mobile": [
                   {required: true, message: "必须输入手机号", trigger: "blur"},
                   {type: "string", pattern: regex.mobile, message: "手机格式不正确", trigger: "blur"},
                   _.debounce(function (rule, value, cb, source, options) {
                       let userId = THIS.model.ID;
                       axios.post("/api/security/MobileValidate", { userId, mobile: value }, msg => {
                           if (msg.success) {
                               cb();
                           } else {
                               cb(msg.remote);
                           }
                       })
                   }, 500)
               ],
               "Email": [
                   {required: true, message: "必须输入电子邮箱", trigger: "blur"},
                   {type: "string", pattern: regex.email, message: "电子邮箱格式不正确", trigger: "blur"},
                   _.debounce((rule, value, cb, source, options) => {
                       let userId = THIS.model.ID;
                       axios.post("/api/security/EmailValidate", { userId, email: value }, msg => {
                           if (msg.success) {
                               cb();
                           } else {
                               cb(msg.remote);
                           }
                       })
                   }, 500)
               ],
               "Code": [
                   {required: true, message: "必须输入学/工号", trigger: "blur"},
                   _.debounce(function (rule, value, cb, source, options) {
                       let userId = THIS.model.ID;
                       axios.post("/api/security/CodeValidate", { userId, code: value }, msg => {
                           if (msg.success) {
                               cb();
                           } else {
                               cb(msg.remote);
                           }
                       })
                   }, 500)
               ],
               "RealName": {required: true, message: "必须输入姓名", trigger: "blur"},
               "Currency": [
                   {required: false, message: "必须输入排序号", trigger: "blur"},
                   {type: "string", pattern: "\\d+", message: "排序号格式不正确", trigger: "blur"}
               ]
            }
        };
    },
    mounted () {
        axios.post("/api/security/GetUserDetail", {id: this.userId}, msg => {
            if (msg.success) {
                msg.user.roles = msg.user.Roles.map(e => e.ID);
                delete msg.user.Roles
                this.$set(this, "model", msg.user);
                this.roles = msg.roles || [];
            }
        })
    }
}
</script>

<style lang="less">
#UserDetail {
    .mr8 {
        margin-right: 8px;
    }

    .top-btn-area {
        background: #fff;
        padding: 8px;
        padding-bottom: 0px;
    }
}
</style>
