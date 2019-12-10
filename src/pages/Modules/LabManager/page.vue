<template>
    <i-row id="lab-manager">
        <i-col span="19">
            <i-tabs type="card" class="tab-panel">
                <i-tab-pane label="时间安排表">
                    <TimeTable :rid="labInfo.ID" />
                </i-tab-pane>
                <i-tab-pane label="机位安排表">
                    <i-alert show-icon>
                        敬请期待
                        <Icon type="md-analytics" slot="icon"/>
                        <template slot="desc">非本周开发内容，占位使用。</template>
                    </i-alert>
                </i-tab-pane>
            </i-tabs>
        </i-col>
        <i-col span="5">
            <i-card>
                <p slot="title">实验室信息</p>
                <i-form :model="labInfo" :rules="rules" ref="form">
                    <i-form-item label="流程审核负责人">
                        <user-selector placeholder="请输入学/工号或姓名" v-model="labInfo.AuditAdministrator" />
                    </i-form-item>
                    <i-form-item label="实验室名称" prop="Name">
                        <i-input v-model="labInfo.Name" />
                    </i-form-item>
                    <i-form-item label="实验室房间号" prop="RoomCode">
                        <i-input v-model="labInfo.RoomCode" />
                    </i-form-item>
                    <i-form-item label="实验室类型" prop="RoomType">
                        <i-select v-model="labInfo.RoomType">
                            <i-option
                                v-for="(value, key) in RoomType"
                                :value="key"
                                :key="key"
                                >{{ value }}</i-option>
                        </i-select>
                    </i-form-item>
                    <i-form-item label="所在楼名称" prop="BuildingId">
                        <i-select v-model="labInfo.BuildingId">
                            <i-option
                                v-for="(item,index) in buildingInfo"
                                :value="item.ID"
                                :key="index"
                            >{{ item.Name }}</i-option>
                        </i-select>
                    </i-form-item>
                    <i-form-item label="实验室联系人" prop="Administrator">
                        <i-input v-model="labInfo.Administrator" />
                    </i-form-item>
                    <i-form-item label="联系人电话" prop="AdminTelephone">
                        <i-input v-model="labInfo.AdminTelephone" />
                    </i-form-item>
                    <i-form-item label="安全负责人" prop="SecurityOfficer">
                        <i-input v-model="labInfo.SecurityOfficer" />
                    </i-form-item>
                    <i-form-item label="安全负责人电话" prop="SOTelephone">
                        <i-input v-model="labInfo.SOTelephone" />
                    </i-form-item>
                    <i-form-item>
                        <i-button type="primary" @click="handleSubmit('form')">{{labInfo.ID?'修改':'新建'}}</i-button>
                    </i-form-item>
                </i-form>
            </i-card>
        </i-col>
    </i-row>
</template>
<script>
import TimeTable from './TimeTable'
const regex = require("@/regex.js");
let app = require("@/config");
let enums = require("@/config/enums");
//    var _ = require("lodash");
const axios = require("axios");
const guidEmpty = "00000000-0000-0000-0000-000000000000";
export default {
    components: { TimeTable },
    mounted () {
        this.labInfo.ID = this.$route.query.ID;
        this.GetLabData(this.labInfo.ID);
        this.GetBuildingData();
        app.title = "楼栋管理";
    },
    methods: {
        GetBuildingData () {
            axios.post("/api/building/GetBuildings", {}, msg => {
                this.buildingInfo = msg.data;
            });
        },
        GetLabData (ID) {
            if (!ID) return;
            axios.post("/api/building/GetRoom", { ID }, msg => {
                this.labInfo = msg.data;
                this.data = msg.data;
            });
        },
        handleSubmit (name) {
            let form = this.$refs[name];
            form.validate(err => {
                if (!err) {
                    this.$Modal.error({
                        title: "表单有误",
                        content: "请正确输入表单"
                    });
                    return;
                }
                axios.post("/api/building/SaveRoom", { ...this.labInfo }, msg => {
                    this.$Message.success("实验室保存成功");
                });
            });
        },
        removeLab (id) {
            axios.post("/api/building/RemoveRoom", { id }, msg => {
                console.log(msg);
            });
        }
    },
    data () {
        return {
            labInfo: {
                ID: "",
                Name: "",
                BuildingId: "",
                RoomCode: "",
                Administrator: "",
                AdminTelephone: "",
                SecurityOfficer: "",
                SOTelephone: "",
                DisplayOrder: "",
                CreatedOn: "",
                AuditAdministrator: guidEmpty,
                RoomType: ""
            },
            RoomType: enums.RoomType,
            modifyLab: true,
            buildingInfo: [],
            seatInfo: {},
            data: [],
            rules: {
                Name: [
                    {
                        required: true,
                        message: "必须输入楼栋名称",
                        trigger: "blur"
                    }
                ],
                RoomCode: [
                    {
                        required: true,
                        message: "必须输入房间号",
                        trigger: "blur"
                    },
                    {
                        type: "string",
                        pattern: "\\d+",
                        message: "必须输入数字",
                        trigger: "blur"
                    }
                ],
                RoomType: [
                    {
                        required: true,
                        message: "必须输入房间类型",
                        trigger: "blur"
                    }
                ],
                BuildingId: [
                    {
                        required: true,
                        message: "必须输入楼栋ID",
                        trigger: "blur"
                    }
                ],
                Administrator: [
                    {
                        required: true,
                        message: "必须输入实验室联系人",
                        trigger: "blur"
                    }
                ],
                AdminTelephone: [
                    {
                        required: true,
                        message: "必须输入实验室联系人电话",
                        trigger: "blur"
                    },
                    {
                        type: "string",
                        pattern: regex.mobile,
                        message: "联系人电话格式不正确",
                        trigger: "blur"
                    }
                ],
                SecurityOfficer: [
                    {
                        required: true,
                        message: "必须输入安全负责人姓名",
                        trigger: "blur"
                    }
                ],
                SOTelephone: [
                    {
                        required: true,
                        message: "必须输入安全负责人电话",
                        trigger: "blur"
                    },
                    {
                        type: "string",
                        pattern: regex.mobile,
                        message: "安全负责人电话格式不正确",
                        trigger: "blur"
                    }
                ]
            }
        };
    }
};
</script>
<style lang="less">
.tab-panel {
    padding-right: 16px;
    .ivu-tabs-content {
        margin-top: -16px;
        .ivu-tabs-tabpane {
            background: #fff;
            padding: 16px;
        }
    }
    .ivu-tabs.ivu-tabs-card > .ivu-tabs-bar .ivu-tabs-tab {
        border-color: transparent;
    }
    .ivu-tabs-card > .ivu-tabs-bar .ivu-tabs-tab-active {
        border-color: #fff;
    }
}
</style>
