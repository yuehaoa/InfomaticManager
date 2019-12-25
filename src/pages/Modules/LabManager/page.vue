<template>
    <i-row id="lab-manager">
        <i-col span="19">
            <i-tabs type="card" class="tab-panel">
                <i-tab-pane label="机位安排表">
                    <i-row>
                         <i-col span="3">
                            <i-button size="large" @click="createSeat()" type="primary">新建机位</i-button>
                         </i-col>
                         <i-col span="17">
                            <i-input prefix="ios-search" size="large" placeholder="搜索机房座位号" v-model="keyword" @keyup.enter.native="getSeatsData" />
                        </i-col>
                    </i-row>
                    <i-divider/>
                    <i-table stripe :columns="columns" :data="seatInfo">
                        <template slot-scope="{row}" slot="State">{{enums.StateType[row.State]}}</template>
                        <template slot-scope="{row}" slot="action">
                        <a class="btn" href="javascript:;" @click="modifySeat(row)">[修改]</a>
                        <a class="btn" href="javascript:;" @click="removeSeat(row.ID)">[删除]</a>
                    </template>
                    </i-table>
                    <i-page
                    :total="seatNum"
                    :current.sync="page"
                    :page-size="pageSize"
                    @on-change="pageChage"
                    @on-page-size-change="pageSizeChange"
                    show-sizer
                    show-size
                    show-total
                    style="margin-top:10px;"
                    />
                </i-tab-pane>
                <i-tab-pane label="时间安排表">
                    <TimeTable :rid="labInfo.ID" />
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
                                v-for="(item, index) in RoomType"
                                :value="index"
                                :key="index"
                                >{{ item }}</i-option>
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
        <i-modal v-model="modalShow" title="新建/修改机位" @on-ok="submit()" @on-cancel="cancel()">
            <i-form ref="seatForm" :model="modal" :rules="seatRules">
                <i-form-item label="机位座位号" prop="Code">
                    <i-input v-model="modal.Code" />
                </i-form-item>
                <i-form-item label="机位设备信息" prop="Memo">
                    <i-input v-model="modal.Memo" type="textarea" :rows="4" />
                </i-form-item>
                <i-form-item label="机位状态" prop="State">
                    <i-select v-model="modal.State">
                        <i-option
                            v-for="(item,index) in StateType"
                            :value="index"
                            :key="index"
                        >{{ item }}</i-option>
                    </i-select>
                </i-form-item>
            </i-form>
        </i-modal>
    </i-row>
</template>
<script>
import TimeTable from './TimeTable'
const regex = require("@/regex.js");
let app = require("@/config");
let enums = require("@/config/enums");
let _ = require("lodash");
const axios = require("axios");
const guidEmpty = "00000000-0000-0000-0000-000000000000";
export default {
    components: { TimeTable },
    mounted () {
        this.labInfo.ID = this.$route.query.ID;
        this.getLabData(this.labInfo.ID);
        this.getBuildingData();
        this.getSeatsData();
        app.title = "实验室及机位管理";
    },
    methods: {
        getSeatsData () {
            let id = this.labInfo.ID;
            let param = {
                page: this.page,
                pageSize: this.pageSize,
                pid: id
            }
            param.Code = this.keyword ? this.keyword : undefined;
            axios.post("/api/building/GetSeats", param, msg => {
                if (msg.success) {
                    this.seatInfo = msg.data;
                    this.seatNum = msg.totalRow;
                }
            });
        },
        getBuildingData () {
             axios.post("/api/building/GetBuildings", {}, msg => {
                this.buildingInfo = msg.data;
             });
        },
        pageChage (p) {
            this.page = p;
            this.getSeatsData();
        },
        pageSizeChange (pz) {
            this.pageSize = pz;
            this.getSeatsData();
        },
        removeSeat (id) {
            this.$Modal.confirm({
                title: "确认删除该机位？",
                onOk: () => {
                    axios.post("/api/building/RemoveSeat", { id }, msg => {
                        if (msg.success) {
                            this.$Message.success("机位删除成功");
                        }
                        this.getSeatsData();
                    });
                }
            });
        },
        submit () {
            let formSeat = this.$refs["seatForm"];
            formSeat.validate(v => {
                if (!v) {
                    this.$Modal.error({
                        title: "表单有误",
                        content: "请正确输入表单"
                    });
                    return;
                }
                axios.post("/api/building/SaveSeat", { ...this.modal }, msg => {
                    if (msg.success) {
                        this.$Message.success("机位保存成功");
                        this.getSeatsData();
                    }
                });
            });
        },
        cancel () {

        },
        createSeat () {
            this.modal.RoomId = this.labInfo.ID;
            this.modalShow = true;
        },
        modifySeat (row) {
            this.modal = row;
            this.modal.State = String(this.modal.State);
            this.modalShow = true;
        },
        getLabData (ID) {
            if (!ID) return;
            axios.post("/api/building/GetRoom", { ID }, msg => {
                this.labInfo = msg.data;
                this.labInfo.RoomType = String(this.labInfo.RoomType);
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
        },
        setKeyword: _.debounce(function () {
            this.getSeatsData();
        }, 500)
    },
    watch: {
    keyword (v) {
      this.setKeyword();
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
            modal: {
                Code: "",
                RoomId: "",
                Memo: "",
                State: ""
            },
            keyword: "",
            seatNum: 0,
            modalShow: false,
            columns: [
                { title: "机房座位号",
                    key: "Code"
                },
                { title: "机位设备信息",
                  key: "Memo"
                },
                { title: "机位状态",
                  slot: "State"
                },
                {
                    title: "创建时间",
                    key: "CreatedOn"
                },
                 {
                    title: "操作",
                    slot: "action"
                }
            ],
            seatRules: {
                Code: [
                    {
                        required: true,
                        message: "必须输入机房座位号",
                        trigger: "blur"
                    }
                ],
                Memo: [
                    {
                        required: true,
                        message: "必须输入机房设备信息",
                        trigger: "blur"
                    }
                ],
                State: [
                    {
                        required: true,
                        message: "必须选择机位状态",
                        trigger: "blur"
                    }
                ]
            },
            page: 1,
            pageSize: 100,
            RoomType: enums.RoomType,
            StateType: enums.StateType,
            enums,
            modifyLab: true,
            buildingInfo: [],
            seatInfo: [],
            data: [],
            rules: {
                Name: [
                    {
                        required: true,
                        message: "必须输入实验室名称",
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
}
</style>
