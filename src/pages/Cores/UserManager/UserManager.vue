<template>
    <div id="userManager">
        <Row type="flex">
            <i-col class="tree">
                <div class="user-search">
                    <Input prefix="ios-search" placeholder="搜索成员，部门" />
                    <div class="more-btn" @click="addDepart">
                        <Tooltip content="添加部门" placement="right">
                            <Icon type="md-add" />
                        </Tooltip>
                    </div>
                </div>
                <Tree :data="orgTree" class="org-tree" :render="renderOrgTree" :empty-text="emptyText" :load-data="getChildTree"></Tree>
            </i-col>
            <i-col class="panel" v-if="showTab === 'user'">
                <div class="header">
                    <span>{{depart}}（{{totalUsers}}人）</span>
                </div>
                <Button @click="showUserDetail('')" v-if="permissions.add">添加成员</Button>
                <!-- <Button>删除成员</Button> -->
                <Table :loading="isLoadingUser" stripe :columns="columns1" :data="userData" class="user-table" width="100%">
                    <template slot="isBind" slot-scope="{row}">
                        <template v-if="row.OpenId">
                            <template v-if="permissions.unbind">
                                <a href="javascript:;" @click="unbind(row.ID, row.OpenId)">[解除微信绑定]</a>
                            </template>
                            <template v-else>
                                已绑定
                            </template>
                        </template>
                        <template v-else>
                            <template v-if="permissions.bind && row.UserType.indexOf('R') !== 0">
                                <a href="javascript:;" @click="bind(row.ID)">[发送绑定邀请]</a>
                            </template>
                            <template v-else-if="row.UserType.indexOf('R') === 0">
                                <a href="javascript:;" @click="bind(row.ID)" title="点此刷新二维码">
                                    <img width="100" :src="'/qr/' + row.UserType" style="margin: 10px 0px;" />
                                </a>
                            </template>
                            <template v-else>
                                未绑定
                            </template>
                        </template>
                    </template>
                </Table>
                <Page :total="totalUsers" :current.sync="page" :page-size="pageSize" @on-change="pageChage" @on-page-size-change="pageSizeChange" show-elevator show-sizer show-total/>
            </i-col>
            <user-detail :user-id="userId" v-if="showTab === 'detail'" @on-saved="showUser" />
        </Row>
        <Modal v-model="removeDialog.isShow" width="360">
            <p slot="header" style="color:#f60;text-align:center">
                <Icon type="ios-information-circle"></Icon>
                <span>确认删除部门</span>
            </p>
            <div style="text-align:center">
                <p>删除部门以后，会产生以下效果：</p>
                <p>1. 子部门全部被转移至“无部门”下；</p>
                <p>2. 该部门及其所有子部门所属的用户全部被转移至“无部门”下。</p>
            </div>
            <div slot="footer">
                <Button type="error" size="large" long :loading="removeDialog.isLoading" @click="confirmRemoveDepart" >确认删除</Button>
            </div>
        </Modal>
        <Modal v-model="removeUserShow" width="360">
            <p slot="header" style="color:#f60;text-align:center">
                <Icon type="ios-information-circle"></Icon>
                <span>是否删除用户？</span>
            </p>
            <div style="text-align:center">
                <p>删除用户，会产生以下效果：</p>
                <p>1. 该用户所有相关信息全部被清除，并且无法恢复。</p>
            </div>
            <div slot="footer">
                <Button type="error" size="large" long :loading="removeDialog.isLoading" @click="removeUser" >确认删除</Button>
            </div>
        </Modal>
        <Modal v-model="modifyDialog.isShow" width="600" :title="modifyDialog.title">
            <Form ref="modifyForm" :model="modifyDialog.model" :label-width="80" :rules="modifyDialog.rules">
                <FormItem label="部门名" label-for="departName" prop="name">
                    <Input v-model="modifyDialog.model.name" placeholder="请输入部门名" element-id="departName" :loading="true" />
                </FormItem>
                <FormItem label="母部门" label-for="parendId" prop="parentId">
                    <OrgSelector v-model="modifyDialog.model.parentId" :multiple="false" />
                </FormItem>
            </Form>
            <div slot="footer">
                <Button type="primary" :loading="modifyDialog.isLoading" @click="confirmDepart" >确认</Button>
            </div>
        </Modal>
    </div>
</template>

<script>
import OrgSelector from '@c/OrgSelector'
import UserDetail from './UserDetail'
var _ = require("lodash")
const app = require("@/config")
const axios = require("axios");
export default {
    name: "um",
    components: { OrgSelector, UserDetail },
    methods: {
        unbind (id, openId) {
            axios.post("/api/security/UnbindWechat", { id, openId }, msg => {
                if (msg.success) {
                    this.$Message.success("解绑成功");
                    this.getUsers();
                } else {
                    this.$Message.warning(msg.msg || "解绑失败");
                }
            })
        },
        bind (id) {
            axios.post("/api/security/BindingWechat", { id }, msg => {
                if (msg.success) {
                    this.$Message.success("已经发送绑定邀请");
                    this.getUsers();
                } else {
                    this.$Message.warning(msg.msg || "解绑失败");
                }
            })
        },
        renderOrgTree (h, {root, node, data}) {
            let THIS = this;
            return h('span', {
                class: { "ivu-tree-title": true, "ivu-tree-title-selected": data.selected },
                on: {
                    click () {
                        root.map(e => e.node.selected = false);
                        data.selected = !data.selected;
                        THIS.departId = data.id;
                        THIS.depart = data.name === "无部门" ? "所有部门" : data.name
                        THIS.isAll = data.name === "无部门";
                        THIS.getUsers(1);
                    }
                }
            }, [
                h("span", [
                    h("Icon", { props: { type: data.isDepart ? 'md-folder' : 'ios-person' }, style: { marginRight: "8px" } }),
                    h("span", data.name === "无部门" ? "所有部门" : data.name)
                ]),
                (data.id !== "00000000-0000-0000-0000-000000000000" && data.isDepart) ? h("span", { class: { "btn-area": true } }, [
                    h("span", { class: { "btn": true }, on: { click: () => THIS.modifyDepart(data.id, data) } }, [
                        h("Icon", { props: { type: "md-create" } })
                    ]),
                    h("span", { class: { "btn": true }, on: { click: () => THIS.removeDepart(data.id) } }, [
                        h("Icon", { props: { type: "md-close" } })
                    ])
                ]) : ""
            ])
        },
        getDepartTree () {
            axios.post("/api/security/GetDepartTree", { ajax: true }, msg => {
                if (!msg.success) {
                    this.orgTree = [];
                    this.emptyText = msg.msg;
                    return;
                }
                this.emptyText = "数据加载中...";
                this.orgTree = msg.data;
                console.log(this.orgTree);
                if (!this.orgTree.length) this.emptyText = "暂无数据";
            })
        },
        getChildTree (item, cb) {
            axios.post("/api/security/GetDepartTree", { id: item.id, ajax: true }, msg => {
                if (!msg.success) {
                    this.$Message.error(msg.msg);
                    let data = [];
                    cb(data);
                } else {
                    cb(msg.data);
                }
            })
        },
        removeDepart (departId) {
            this.removeDialog.isShow = true;
            this.removeDialog.departId = departId;
        },
        confirmRemoveDepart () {
            this.removeDialog.isLoading = true;
            let departId = this.removeDialog.departId;
            axios.post("/api/security/RemoveDepart", { departId }, msg => {
                if (!msg.success) {
                    this.$Message.error(msg.msg);
                }

                this.removeDialog.isLoading = false;
                this.removeDialog.isShow = false;
                app.reloadOrg = new Date();
                this.getDepartTree();
            })
        },
        modifyDepart (departId, depart) {
            this.modifyDialog.title = "编辑部门";
            this.modifyDialog.isLoading = false;
            this.modifyDialog.model.departId = departId;
            this.modifyDialog.model.name = depart.name;
            this.modifyDialog.model.parentId = depart.pid
            // this.modifyDialog.isShow = true;
            this.$router.push({ name: "OrgManager", query: { id: departId } });
        },
        addDepart () {
            this.modifyDialog.title = "添加部门";
            this.modifyDialog.isLoading = false;
            this.modifyDialog.model.departId = "00000000-0000-0000-0000-000000000000";
            this.modifyDialog.model.name = "";
            this.modifyDialog.model.parentId = this.departId || "00000000-0000-0000-0000-000000000000"
            this.modifyDialog.isShow = true;
        },
        confirmDepart () {
            let model = this.modifyDialog.model;
            let form = this.$refs["modifyForm"];
            this.modifyDialog.isLoading = true;
            form.validate(v => {
                if (!v) {
                    this.modifyDialog.isLoading = false;
                    return;
                }

                axios.post("/api/security/SaveDepart", model, msg => {
                    if (!msg.success) {
                        this.$Message.error(msg.msg);
                    }

                    this.modifyDialog.isLoading = false;
                    this.modifyDialog.isShow = false;
                    app.reloadOrg = new Date();
                    this.getDepartTree();
                })
            })
        },
        pageChage (p) {
            this.page = p;
            this.getUsers();
        },
        pageSizeChange (pz) {
            this.pageSize = pz;
            this.getUsers();
        },
        getUsers: _.debounce(function (page) {
            this.isLoadingUser = true;
            this.showTab = "user";
            this.page = page || this.page;
            axios.post("/api/security/GetUsers", { departId: this.departId, isAll: this.isAll, page: this.page, pageSize: this.pageSize }, msg => {
                this.isLoadingUser = false;
                if (msg.success) {
                    this.totalUsers = msg.totalRow;
                    this.userData = msg.data;
                }
            })
        }, 100),
        showUser () {
            this.showTab = "user";
            this.getUsers();
        },
        showUserDetail (id) {
            this.showTab = "detail"
            this.userId = id;
        },
        removeUser () {
            this.removeUserShow = false;
            axios.post("/api/security/RemoveUser", { userId: this.userId }, msg => {
                if (msg.success) {
                    this.$Message.success("删除成功");
                    this.getUsers();
                } else {
                    this.$Message.error(msg.msg);
                }
            })
        }
    },
    data () {
        let THIS = this;
        return {
            columns1: [
                {
                    title: '姓名',
                    key: 'RealName'
                },
                {
                    title: '部门',
                    key: 'departName'
                },
                {
                    title: '学/工号',
                    key: 'Code'
                },
                {
                    title: '手机',
                    key: 'Mobile'
                },
                {
                    title: "是否绑定微信",
                    slot: "isBind"
                },
                {
                    title: '操作',
                    key: 'ID',
                    render (h, params) {
                        let row = params.row;
                        let id = row.ID;
                        let operate = [];
                        THIS.permissions.edit && operate.push(h("a", {
                            style: { marginRight: "10px", display: "inline-block" },
                            on: {
                                click () {
                                    THIS.showUserDetail(id);
                                }
                            }
                        }, "[详细]"));
                        THIS.permissions.remove && operate.push(h("a", {
                            style: { marginRight: "10px", display: "inline-block" },
                            on: {
                                click () {
                                    THIS.removeUserShow = true;
                                    THIS.userId = id;
                                }
                            }
                        }, "[删除]"));
                        return h("div", [...operate])
                    }
                }
            ],
            userData: [],
            showTab: "user",
            emptyText: "数据加载中...",
            orgTree: [],
            userId: "",
            page: 1,
            pageSize: 20,
            departId: "",
            isAll: true,
            totalUsers: 0,
            isLoadingUser: false,
            depart: "所有部门",
            permissions: {
                add: app.checkPermission("Security.AddUser"),
                edit: app.checkPermission("Security.EditUser"),
                bind: app.checkPermission("Security.SendWechatLink"),
                unbind: app.checkPermission("Security.UnbindWechat"),
                remove: app.checkPermission("Security.RemoveUser")
            },
            removeDialog: {
                isShow: false,
                isLoading: false,
                departId: ""
            },
            modifyDialog: {
                isShow: false,
                isLoading: false,
                title: "编辑部门",
                model: {
                    name: "",
                    departId: "",
                    parentId: ""
                },
                rules: {
                    name: [
                        {required: true, message: "请输入部门名", trigger: "blur"}
                    ],
                    parentId: [
                        {required: true, message: "必须选择一个部门", trigger: "input"}
                    ]
                }
            },
            removeUserShow: false
        };
    },
    mounted () {
        this.getDepartTree();
        this.getUsers();
        app.title = "用户管理";
    }
}
</script>

<style lang="less">
#userManager {
    position: relative;
    background: #fff;
    .panel {
        width: calc(~"100% - 260px");
        padding: 16px 16px 24px;
        .header {
            color: #000;
            font-size: 18px;
            line-height: 28px;
            margin-bottom: 10px;
        }

        .user-table {
            margin-top: 10px;
            margin-bottom: 10px;
            width: 100%;
        }
    }
    .tree {
        background: #808695;
        color: #fff;
        width: 260px;
        min-height: fill-available;

        .user-search {
            padding: 10px;
            border-bottom: 1px solid #E4E6E9;
            position: relative;

            input {
                width: 218px;
                height: 26px;
            }

            .ivu-input-prefix i, .ivu-input-suffix i {
                line-height: 26px;
            }

            .more-btn {
                position: absolute;
                top: 13px;
                right: 6px;
                width: 20px;
                height: 20px;
                text-align: center;
                vertical-align: middle;
                background-color: transparent;
                border-radius: 2px;
                cursor: pointer;
            }
        }

        // .tree
        @import "../../../assets/less/orgTree.less";
    } // .tree
}
</style>
