<template>
    <i-row id="building-manager" :gutter="16">
        <i-col span="5" class="tree">
            <i-row class="user-search">
                <i-input prefix="ios-search" placeholder="搜索楼栋" />
                <div class="more-btn" @click="modifyBuilding()">
                    <i-tooltip content="添加部门" placement="right">
                        <Icon type="md-add" />
                    </i-tooltip>
                </div>
            </i-row>
            <Tree :data="buildingInfo" class="org-tree" :render="renderContent"></Tree>
        </i-col>
        <i-col span="19">
            <i-card class="panel">
                <p slot="title">{{dataName}} 实验室列表</p>
                <i-row style="margin-bottom: 8px;" type="flex" align="middle">
                    <i-col span="3">
                        <i-button @click="toLabDetail()" size="large" type="primary">添加实验室</i-button>
                    </i-col>
                    <i-col span="11" offset="1">
                        <i-input prefix="ios-search" size="large" placeholder="搜索实验室名称" v-model="keyword" @keyup.enter.native="GetLabData" />
                    </i-col>
                    <i-col span="3">
                        <i-button size="large" @click="switchSearchMode()" type="text">{{display?"普通搜索":"高级搜索"}}</i-button>
                    </i-col>
                    <i-col span="1" offset="5">
                        <i-tooltip content="下载房间二维码" placement="left">
                            <Icon type="ios-download-outline " size="24"  @click="downloadQRCode()"></Icon>
                        </i-tooltip>
                    </i-col>
                 </i-row>
                 <i-row v-show="display" type="flex" style="margin-bottom:8px;">
                    <i-col span="8">
                        实验室联系人:
                        <i-input v-model="admin"/>
                    </i-col>
                    <i-col span="1"/>
                    <i-col span="8">
                        实验室类型：
                        <i-select v-model="type">
                        <i-option
                            v-for="(item,index) in roomType"
                            :value="index"
                            :key="index"
                        >{{ item }}</i-option>
                    </i-select>
                    </i-col>
                    <i-col span="24" style="margin-top:8px">
                        <i-button type="primary" @click="advancedSearch">搜索</i-button>
                        <i-button  @click="removeAllTags()">清空</i-button>
                    </i-col>
                </i-row>
                <i-row type="flex" align="middle" v-if="filters.length">
                    <i-col span="24">
                        <i-icon type="ios-funnel" /> 检索项：
                        <i-tag v-for="(item, index) in filters" :key="index" closable @on-close="removeTag(index)">{{item.display}}</i-tag>
                        <i-button type="text" size="small" @click="removeAllTags">清除所有</i-button>
                    </i-col>
                </i-row>
                <i-divider/>
                <i-table stripe :columns="columns" :data="labInfo">
                    <template slot-scope="{row}" slot="Name">{{row.Name}}</template>
                    <template slot-scope="{row}" slot="Location"><p>{{final[row.BuildingId]}}--{{row.RoomCode}}</p></template>
                    <template slot-scope="{row}" slot="Administrator">{{row.Administrator}}<p>({{row.SOTelephone}})</P></template>
                    <template slot-scope="{row}" slot="roomType">{{enums.RoomType[row.RoomType]}}</template>
                    <template slot-scope="{row}" slot="action">
                        <a class="btn" href="javascript:;" @click="toLabDetail(row.ID)">[详情]</a>
                        <a class="btn" href="javascript:;" @click="removeLab(row.ID)">[删除]</a>
                    </template>
                </i-table>
                <i-page
                    :total="labNum"
                    :current.sync="page"
                    :page-size="pageSize"
                    @on-change="pageChage"
                    @on-page-size-change="pageSizeChange"
                    show-sizer
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
let _ = require("lodash");
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
                let final = [];
                msg.data.map(e => (final[e.ID] = e.Name));
                this.final = final;
            });
        },
        removeTag (index) {
            let item = this.filters.splice(index, 1);
            switch (item[0].key) {
                case "keyword":
                    this.keyword = "";
                    break;
                case "admin":
                    this.admin = "";
                    break;
                case "type":
                    this.type = "";
                    break;
                default:
                    break;
            }
            this.GetLabData();
        },
        removeAllTags () {
            this.filters = [];
            this.keyword = "";
            this.type = "";
            this.admin = "";
            this.GetLabData();
        },
        advancedSearch () {
            let admin = this.admin;
            let type = this.type;
            let roomType = this.roomType;
            this.setFilter("admin", admin, "实验室负责人", admin);
            if (type !== "") {
                this.setFilter("type", type, "实验室类型", roomType[type]);
            }
            this.GetLabData();
        },
        renderContent (h, { root, node, data }) {
            let THIS = this;
            return h(
                "span",
                {
                    style: {
                        display: 'inline-block',
                        width: '100%'
                    },
                    on: {
                        click () {
                            THIS.GetLabData(data.ID);
                        }
                    }
                },
                [
                    h(
                        "span",
                        { style: {} },
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
            let params = {
                 page: this.page,
                 pageSize: this.pageSize,
                 pid: pid
            }
            this.filters.forEach(e => {
                if (!e.key || !e.value) {
                    return;
                }
                params[e.key] = e.value;
            });
            axios.post("/api/building/GetRooms", params, msg => {
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
            // this.$Message.info("Clicked cancel");
        },
        pageChage (p) {
            this.page = p;
            this.GetLabData();
        },
        pageSizeChange (pz) {
            this.pageSize = pz;
            this.GetLabData();
        },
        switchSearchMode () {
            if (this.display === false) {
            this.display = true;
            } else {
            this.display = false;
        }
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
            this.$router.push({ name: "LabManager", query: { ID } });
        },
       setFilter (key, value, displayKey, displayValue) {
            let f = this.filters.findIndex(e => e.key === key);
            if (f > -1) {
                this.filters.splice(f, 1);
            }
            if (value) {
                let ele = {
                key: key,
                display: `${displayKey}：${displayValue}`,
                value: value
                }
                this.filters.push(ele);
            }
        },
        setKeyword: _.debounce(function () {
            let keyword = this.keyword;
            this.setFilter("name", keyword, "实验室名称", keyword);
            this.GetLabData();
        }, 500),
        downloadQRCode () {
            window.open("/api/building/GetQrCodeZip");
        }
    },
    watch: {
        keyword (v) {
            this.setKeyword();
        }
    },
    data () {
         let labState = [];
        for (let index in enums.RoomType) {
            let item = enums.RoomType[index]
            labState.push({
                value: index,
                key: index,
                label: item
            });
        }
        let THIS = this;
        return {
            labInfo: [],
            buildingInfo: [],
            modal: emptyModal(),
            modalShow: false,
            display: false,
            page: 1,
            pageSize: 10,
            dataName: "",
            labNum: 0,
            enums,
            filters: [],
            keyword: "",
            admin: "",
            type: "",
            final: [],
            labState: enums.RoomType,
            displayRemove: false,
            roomType: enums.RoomType,
            columns: [
                {
                    title: "实验室名称",
                    slot: "Name"
                },
                {
                    title: "地点",
                    slot: "Location"
                },
                {
                    title: "实验室联系人",
                    slot: "Administrator"
                },
                {
                    title: "实验室类型",
                    slot: "roomType",
                    filters: labState,
                    filterMultiple: false,
                    filterRemote (value, key, label) {
                        let v = value[0];
                        let f = THIS.filters.findIndex(e => e.key === "type");
                        if (f > -1) {
                            THIS.filters.splice(f, 1)
                        }
                        if (v) {
                            let ele = {
                                key: "type",
                                display: `实验室类型：${enums.RoomType[v]}`,
                                value: v
                            };
                            THIS.filters.push(ele);
                            THIS.GetLabData();
                        }
                    }

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
        position: absolute;
        right: 0px;
        top: 10px;
        width: 24px;
        height: 24px;
        cursor: pointer;
    }
}
</style>
