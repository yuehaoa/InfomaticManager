<template>
    <i-card id="role-manager">
        <i-button v-if="permissions.add" type="primary" @click="addRole">添加角色</i-button>
        <i-divider />
        <i-collapse v-if="data.length">
            <i-panel v-for="(item, index) in data" :key="index">
                {{item.Name}}<a href="javascript:;" v-if="permissions.remove" @click.stop="removeRole(item.ID)">[删除]</a>
                <div slot="content">
                    <div v-for="(v, k) in all" :key="k" class="role-line">
                        <!-- <i-checkbox @click.prevent.native="onCheckAll(item.permission, item[k])" v-model="item[k].select" :indeterminate="item[k].indeterminate">{{k}} (全选)</i-checkbox> -->
                        {{k}}:
                        <i-checkbox-group v-model="item.permission" @on-change="onGroupChanged(item.permission, item[k])">
                            <i-checkbox v-for="(v1, k1) in v" :key="k1" :label="v1.ID">{{v1.DisplayName}}</i-checkbox>
                        </i-checkbox-group>
                    </div>
                    <i-button class="btn" :loading="item.loading" type="primary" @click="saveRole(item)">提交</i-button>
                </div>
            </i-panel>
        </i-collapse>
        <p v-else style="text-align: center;">暂无角色</p>
    </i-card>
</template>

<script>
var app = require("@/config");
var axios = require("axios");
export default {
    methods: {
        saveRole (item) {
            item.loading = true;
            let id = item.ID;
            let permissions = item.permission.join(',');
            axios.post("/api/security/SaveRolePermission", { id, permissions }, msg => {
                if (msg.success) {
                    this.$Message.success(msg.msg);
                }
                this.getData();
                item.loading = false;
            })
        },
        onGroupChanged (p, ele) {
            let intersect = p.filter(v => ele.entry.indexOf(v) !== -1);
            let length = intersect.length;
            if (length === 0) {
                ele.select = false;
                ele.indeterminate = false;
            } else if (length < ele.length) {
                ele.select = false;
                ele.indeterminate = true;
            } else if (length >= ele.length) {
                ele.select = true;
                ele.indeterminate = false;
            }
        },
        getData () {
            axios.post("/api/security/GetRoles", {}, msg => {
                msg.data.map(e => {
                    e.loading = false;
                    e.permission = e.Permissions.map(p => p.ID);
                    for (let x in msg.permissions) {
                        e[x] = {
                            length: msg.permissions[x].length,
                            select: false,
                            indeterminate: false,
                            entry: msg.permissions[x].map(ele => ele.ID)
                        }
                    }
                });
                this.data = msg.data;
                this.all = msg.permissions;
            })
        },
        removeRole (id) {
            if (!confirm("是否删除该角色")) {
                return;
            }
            axios.post("/api/security/RemoveRole", { id }, msg => {
                if (msg.success) {
                    this.$Message.success(msg.msg)
                }
                this.getData();
            })
        },
        addSingleRole () {
            axios.post("/api/security/SaveRole", { role: this.newRole }, msg => {
                if (msg.success) {
                    this.$Message.success(msg.msg);
                } else {
                    this.$Message.warning(msg.msg);
                }
                this.getData();
            })
        },
        addRole () {
            debugger
            this.$Modal.confirm({
                render: (h) => {
                    return h('Input', {
                        props: {
                            value: this.newRole,
                            autofocus: true,
                            placeholder: '请输入角色名'
                        },
                        on: {
                            input: (val) => {
                                this.newRole = val;
                            },
                            "on-keyup" (event) {
                                if (event.keyCode === 13) {
                                   this.addSingleRole();
                                }
                            }
                        }
                    })
                },
                onOk: this.addSingleRole(),
                loading: true
            })
        }
    },
    data () {
        return {
            newRole: "",
            data: {},
            all: {},
            permissions: {
                add: app.checkPermission("Security.AddRole"),
                remove: app.checkPermission("Security.RemoveRole")
            }
        };
    },
    mounted () {
        app.title = "角色管理";
        this.getData();
    }
}
</script>

<style lang="less">
#role-manager {
    .btn {
        margin-top: 16px;
    }
    .role-line {
        padding: 16px 0px;
        font-size: 16px !important;
        border-bottom: #eee 1px solid;
        .ivu-checkbox-group  {
            display: inline-block;
        }
        .ivu-checkbox-wrapper {
            font-size: 16px !important;
        }
    }
}
</style>
