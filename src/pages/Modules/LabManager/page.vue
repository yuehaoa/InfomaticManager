<template>
  <div id="lab-manager">
    <i-card>
      <p slot="title">实验室信息</p>
      <i-form :model="labInfo">
        <i-row type="flex" justify="space-between" class="code-row-bg">
          <i-col span="4">
            <i-form-item label="实验室名称">
              <i-input v-model="labInfo.Name" />
            </i-form-item>
          </i-col>
          <i-col span="4">
            <i-form-item label="当前实验室ID">
              <i-input v-model="labInfo.ID" readonly />
            </i-form-item>
          </i-col>
          <i-col span="4">
            <i-form-item label="所在楼名称">
              <i-select v-model="labInfo.BuildingId" >
                <i-option v-for="(item,index) in buildingInfo" :value="item.ID" :key="index">{{ item.Name }}</i-option>
              </i-select>
            </i-form-item>
          </i-col>
          <i-col span="4">
            <i-form-item label="实验室联系人">
              <i-input v-model="labInfo.Administrator" />
            </i-form-item>
          </i-col>
          <i-col span="4">
            <i-form-item label="联系人电话">
              <i-input v-model="labInfo.AdminTelephone" />
            </i-form-item>
          </i-col>
        </i-row>
        <i-row type="flex" justify="space-between" class="code-row-bg">
          <i-col span="4">
            <i-form-item label="安全负责人">
              <i-input v-model="labInfo.SecurityOfficer" />
            </i-form-item>
          </i-col>
          <i-col span="4">
            <i-form-item label="安全负责人电话">
              <i-input v-model="labInfo.SOTelephone" />
            </i-form-item>
          </i-col>
          <i-col span="4">
            <i-form-item label="排列序号">
              <i-input v-model="labInfo.DisplayOrder" />
            </i-form-item>
          </i-col>
          <i-col span="4">
            <i-form-item label="创建日期">
              <i-input v-model="labInfo.CreatedOn" disabled />
            </i-form-item>
          </i-col>
          <i-col span="4">
            <i-form-item label="类型">
              <i-input v-model="labInfo.RoomType" />
            </i-form-item>
          </i-col>
        </i-row>
        <i-form-item>
          <i-button type="primary" @click="handleSubmit('form')">修改</i-button>
        </i-form-item>
      </i-form>
    </i-card>
    <i-table stripe :columns="columns" :data="data">
      <template slot-scope="{row}" slot="action">
        <a class="btn" href="javascript:;">[转到]</a>
        <a class="btn" href="javascript:;" @click="removeLab(row.ID)">[删除]</a>
      </template>
    </i-table>
  </div>
</template>
<script>
//  const regex = require("@/regex.js");
let app = require("@/config");
//  var _ = require("lodash");
const axios = require("axios");
export default {
  mounted () {
    this.labInfo.ID = this.$route.params.ID || '00000000-0000-0000-0000-000000000000';
    console.log(this.labInfo.ID);
    this.GetLabData();
    this.GetBuildingData();
    app.title = "楼栋管理";
  },
  methods: {
    GetBuildingData () {
      axios.post("/api/building/GetBuildings", {}, msg => {
        this.buildingInfo = msg.data;
      });
    },
    GetLabData () {
      axios.post("/api/building/GetRooms", {id: this.labInfo.ID}, msg => {
        this.labInfo = msg.data[0];
        this.data = msg.data;
      });
    },
    handleSubmit (name) {
      axios.post("/api/building/SaveRoom", { ...this.labInfo }, msg => {
        console.log(msg);
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
      data: []
    };
  }
};
</script>
<style lang="less">
</style>
