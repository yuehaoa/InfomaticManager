<template>
    <i-row id="building-manager" :gutter="16">
        <i-col span="5" class="tree">
            <div class="user-search">
                <i-input prefix="ios-search" placeholder="搜索楼栋" />
                <div class="more-btn" @click="modifyBuilding()">
                    <i-tooltip content="添加部门" placement="right">
                        <Icon type="md-add" />
                    </i-tooltip>
                </div>
            </div>
            <Tree :data="buildingInfo" class="org-tree" :render="renderContent"></Tree>
        </i-col>
        <i-col span="19">
            <i-card class="panel">
                <p slot="title">{{dataName}} 实验室列表</p>
                <div style="margin-bottom:10px;">
                    <i-button @click="toLabDetail()">添加实验室</i-button>
                </div>
                <i-table stripe :columns="columns" :data="labInfo">
                    <template slot-scope="{row}" slot="roomType">{{enums.LabType[row.RoomType]}}</template>
                    <template slot-scope="{row}" slot="action">
                        <a class="btn" href="javascript:;" @click="toLabDetail(row.ID)">[转到]</a>
                        <a class="btn" href="javascript:;" @click="removeLab(row.ID)">[删除]</a>
                    </template>
                </i-table>
                <i-page
                    :total="labNum"
                    :current.sync="page"
                    :page-size="pageSize"
                    @on-change="pageChage"
                    @on-page-size-change="pageSizeChange"
                    show-elevator
                    show-size
                    show-total
                    style="margin-top:10px;"
                />
            </i-card>
        </i-col>
        <i-modal v-model="modalShow" title="新建/修改楼栋" @on-ok="submit()" @on-cancel="cancel()">
            <i-form ref="Form" :model="modal" :rules="rules">
                <FormItem label="楼栋名" prop="Name">
                    <i-input v-model="modal.Name" />
                </FormItem>
                <FormItem label="所属校区" prop="SubCampus">
                    <i-input v-model="modal.SubCampus" />
                </FormItem>
                <FormItem label="楼栋管理员" prop="Administrator">
                    <i-input v-model="modal.Administrator" />
                </FormItem>
                <FormItem label="联系电话" prop="Telephone">
                    <i-input v-model="modal.Telephone" />
                </FormItem>
                <FormItem label="排列顺序" prop="DisplayOrder">
                    <i-input v-model="modal.DisplayOrder" />
                </FormItem>
            </i-form>
        </i-modal>
    </i-row>
</template>
<script>
const regex = require("@/regex.js");
let app = require("@/config");
let enums = require("@/config/enums");
let emptyModal = () => {
            return {
                ID: "",
                Name: "",
                SubCampus: "",
                Administrator: "",
                Telephone: "",
                DisplayOrder: "",
                CreatedOn: ""
            };
        };
//    var _ = require("lodash");
const axios = require("axios");
export default {
    mounted () {
        this.GetLabData();
        this.GetBuildingData();
        app.title = "楼栋管理";
    },
    methods: {
        GetBuildingData () {
            axios.post("/api/building/GetBuildings", {}, msg => {
                this.buildingInfo = msg.data;
                let final = {};
                msg.data.map(e => (final[e.ID] = e.Name));
            });
        },
        renderContent (h, { root, node, data }) {
            let THIS = this;
            return h(
                "span",
                {
                    class: { "ivu-tree-title": true },
                    on: {
                        click () {
                            THIS.GetLabData(data.ID);
                        }
                    }
                },
                [
                    h(
                        "span",
                        { style: { marginRight: "8px" } },
                        data.Name
                    ),
                    h("Icon", {
                        style: { float: "right", marginTop: "7px" },
                        props: { type: "md-close" },
                        on: { click: () => THIS.removeBuilding(data.ID) }
                    }),
                    h("Icon", {
                        style: { float: "right", marginTop: "7px" },
                        props: { type: "md-create" },
                        on: { click: () => THIS.modifyBuilding(data) }
                    })
                ]
            );
        },
        GetLabData (pid) {
            let page = this.page;
            let pageSize = this.pageSize;
            axios.post("/api/building/GetRooms", { pid, page, pageSize }, msg => {
                this.labInfo = msg.data;
                this.labNum = msg.totalRow;
            });
        },
        modifyBuilding (data) {
            this.modal = data || emptyModal();
            this.modalShow = true;
        },
        submit () {
            let formBuilding = this.$refs["Form"];
            formBuilding.validate(v => {
                if (!v) {
                    this.$Modal.error({
                        title: "表单有误",
                        content: "请正确输入表单"
                    });
                    return;
                }
                axios.post("/api/building/SaveBuilding", { ...this.modal }, msg => {
                    if (msg.success) {
                        this.$Message.success("楼栋保存成功");
                        this.GetBuildingData();
                    }
                });
            });
        },
        cancel () {
            this.$Message.info("Clicked cancel");
        },
        pageChage (p) {
            this.page = p;
            this.getLabs();
        },
        pageSizeChange (pz) {
            this.pageSize = pz;
            this.getLabs();
        },
        removeLab (id) {
            this.$Modal.confirm({
                title: "确认删除该实验室？",
                onOk: () => {
                    axios.post("/api/building/RemoveRoom", { id }, msg => {
                        if (msg.success) {
                            this.$Message.success("实验室删除成功");
                        }
                        this.GetLabData();
                    });
                }
            });
        },
        removeBuilding (id) {
            this.$Modal.confirm({
                title: "确认删除该楼栋？",
                onOk: () => {
                    axios.post("/api/building/RemoveBuilding", { id }, msg => {
                        this.GetBuildingData();
                    });
                }
            });
        },
        toLabDetail (ID) {
            this.$router.push({ name: "LabManager", params: { ID } });
        }
    },
    data () {
        return {
            labInfo: [],
            buildingInfo: [],
            modal: emptyModal(),
            modalShow: false,
            page: 1,
            pageSize: 10,
            dataName: "",
            labNum: 0,
            enums,
            columns: [
                {
                    title: "楼栋名称",
                    key: "Name"
                },
                {
                    title: "实验室联系人",
                    key: "Administrator"
                },
                {
                    title: "联系人电话",
                    key: "AdminTelephone"
                },
                {
                    title: "安全负责人",
                    key: "SecurityOfficer"
                },
                {
                    title: "安全负责人电话",
                    key: "SOTelephone"
                },
                {
                    title: "实验室类型",
                    slot: "roomType"
                },
                {
                    title: "操作",
                    slot: "action"
                }
            ],
            data: [],
            rules: {
                Name: [
                    {
                        required: true,
                        message: "必须输入楼栋名",
                        trigger: "blur"
                    }
                ],
                SubCampus: [
                    {
                        required: true,
                        message: "必须输入校区名",
                        trigger: "blur"
                    }
                ],
                Telephone: [
                    {
                        required: false,
                        message: "必须输入楼栋名",
                        trigger: "blur"
                    },
                    {
                        type: "string",
                        pattern: regex.mobile,
                        message: "电话格式不正确",
                        trigger: "blur"
                    }
                ]
            }
        };
    }
};
</script>
<style lang="less">
.tree {
    background: #808695;
    color: #fff;
    @import "../../../assets/less/orgTree.less";
}
.user-search {
    padding-top: 5px;
    padding-bottom: 5px;
    border-bottom: 1px solid #e4e6e9;
    position: relative;
    input {
        width: 220px;
    }
    .more-btn {
        padding-left: 3px;
        position: absolute;
        right: 0px;
        top: 13px;
        width: 20px;
        height: 20px;
        cursor: pointer;
    }
}
</style>
