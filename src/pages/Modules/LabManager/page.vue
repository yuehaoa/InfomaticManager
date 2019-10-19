<template>
    <div id="lab-manager">
        <i-card>
            <p slot="title">实验室信息</p>
            <i-form :model="labInfo" :rules="rules">
                <i-row type="flex" justify="space-between" class="code-row-bg">
                    <i-col span="4">
                        <i-form-item label="实验室名称" prop="Name">
                            <i-input v-model="labInfo.Name" />
                        </i-form-item>
                    </i-col>
                    <i-col span="4">
                        <i-form-item label="当前实验室ID" prop="ID">
                            <i-input v-model="labInfo.ID" readonly />
                        </i-form-item>
                    </i-col>
                    <i-col span="4">
                        <i-form-item label="所在楼名称" prop="BuildingId">
                            <i-select v-model="labInfo.BuildingId" >
                                <i-option v-for="(item,index) in buildingInfo" :value="item.ID" :key="index">{{ item.Name }}</i-option>
                            </i-select>
                        </i-form-item>
                    </i-col>
                    <i-col span="4">
                        <i-form-item label="实验室联系人" prop="Administrator">
                            <i-input v-model="labInfo.Administrator" />
                        </i-form-item>
                    </i-col>
                    <i-col span="4">
                        <i-form-item label="联系人电话" prop="AdminTelephone">
                            <i-input v-model="labInfo.AdminTelephone" />
                        </i-form-item>
                    </i-col>
                </i-row>
                <i-row type="flex" justify="space-between" class="code-row-bg">
                    <i-col span="4">
                        <i-form-item label="安全负责人" prop="SecurityOfficer">
                            <i-input v-model="labInfo.SecurityOfficer" />
                        </i-form-item>
                    </i-col>
                    <i-col span="4">
                        <i-form-item label="安全负责人电话" prop="SOTelephone">
                            <i-input v-model="labInfo.SOTelephone" />
                        </i-form-item>
                    </i-col>
                    <i-col span="4">
                        <i-form-item label="排列序号" prop="DisplayOrder">
                            <i-input v-model="labInfo.DisplayOrder" />
                        </i-form-item>
                    </i-col>
                    <i-col span="4">
                        <i-form-item label="创建日期" prop="CreatedOn">
                            <i-input v-model="labInfo.CreatedOn" disabled />
                        </i-form-item>
                    </i-col>
                    <i-col span="4">
                        <i-form-item label="类型" prop="RoomType">
                            <i-input v-model="labInfo.RoomType" />
                        </i-form-item>
                    </i-col>
                </i-row>
                <i-form-item>
                    <i-button type="primary" @click="handleSubmit('form')">修改</i-button>
                </i-form-item>
            </i-form>
        </i-card>
        <i-table stripe :columns="columns">
            <template slot-scope="{row}" slot="action">
                <a class="btn" href="javascript:;">[转到]</a>
                <a class="btn" href="javascript:;" @click="removeLab(row.ID)">[删除]</a>
            </template>
        </i-table>
    </div>
</template>
<script>
const regex = require("@/regex.js");
let app = require("@/config");
//  var _ = require("lodash");
const axios = require("axios");
export default {
    mounted () {
        this.labInfo.ID = this.$route.params.ID || '';
        if(true)
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
            if (ID !== '00000000-0000-0000-0000-000000000000') {
                    axios.post("/api/building/GetRoom", {ID}, msg => {
                    this.labInfo = msg.data;
                    this.data = msg.data;
                });
            }
        },
        handleSubmit (name) {
            let form = this.$refs[name];
            form.validate(err => {
                if (!err) {
                    return;
                }
                axios.post("/api/building/SaveRoom", { ...this.labInfo }, msg => {
                    console.log(msg);
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
                Administrator: "",
                AdminTelephone: "",
                SecurityOfficer: "",
                SOTelephone: "",
                DisplayOrder: "",
                CreatedOn: "",
                RoomType: ""
            },
            modifyLab: true,
            buildingInfo: [],
            seatInfo: {},
            columns: [
                {
                    title: "楼栋名称",
                    key: "Name"
                },
                {
                    title: "所在楼栋ID（暂时）",
                    key: "BuildingId"
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
                    key: "RoomType"
                },
                {
                    title: "操作",
                    slot: "action"
                }
            ],
            data: [],
            rules: {
                "Name": [
                    {
                    required: true,
                    message: "必须输入楼栋名称",
                    trigger: "blur"
                    }
                ],
                "BuildingId": [
                    {
                        required: true,
                        massage: "必须输入楼栋ID",
                        trigger: "blur"
                    }
                ],
                "Administrator": [
                    {
                        required: true,
                        massage: "必须输入实验室联系人",
                        trigger: "blur"
                    }
                ],
                "AdminTelephone": [
                    {
                        required: true,
                        massage: "必须输入实验室联系人电话",
                        trigger: "blur"
                    },
                    {
                        type: "string",
                        pattern: regex.mobile,
                        massage: "联系人电话格式不正确",
                        trigger: "blur"
                    }
                ],
                "SecurityOfficer": [
                    {
                        required: true,
                        massage: "必须输入实验室安全负责人姓名",
                        trigger: "blur"
                    }
                ],
                "SOTelephone": [
                    {
                        required: true,
                        massage: "必须输入实验室安全负责人电话",
                        trigger: "blur"
                    },
                    {
                        type: "string",
                        pattern: regex.mobile,
                        massage: "安全负责人电话格式不正确",
                        trigger: "blur"
                    }
                ]
            }
        };
    }
}
</script>
<style lang="less">
</style>
