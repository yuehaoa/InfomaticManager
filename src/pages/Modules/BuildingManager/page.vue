<template>
    <i-row id="building-manager" :gutter="16">
        <i-col span="5" class="tree">
            <div class="user-search">
                <i-input prefix="ios-search" placeholder="搜索成员，部门" />
                <div class="more-btn" @click="modifyBuilding()">
                    <i-tooltip content="添加部门" placement="right">
                        <Icon type="md-add" />
                    </i-tooltip>
                </div>
            </div>
            <i-tree :data="buildingInfo" :render="renderContent" class="org-tree"></i-tree>
        </i-col>
        <i-col span="19">
            <i-card class="panel">
                <p slot="title">实验室列表</p>
                <i-button @click="toLabDetail()">添加实验室</i-button>
                <i-table stripe :columns="columns" :data="labInfo">
                    <template slot-scope="{row}" slot="action">
                        <a class="btn" href="javascript:;" @click="toLabDetail(row.ID)">[转到]</a>
                        <a class="btn" href="javascript:;" @click="removeLab(row.ID)">[删除]</a>
                    </template>
                </i-table>
                <i-page :total="labNum" :current.sync="page" :page-size="pageSize" @on-change="pageChage" @on-page-size-change="pageSizeChange" show-elevator show-size show-total/>
            </i-card>
        </i-col>
        <i-modal v-model="modal.isShown" title="新建/修改楼栋" @on-ok="Submit" @on-cancel="Cancel">
            <i-form ref="Form" :model="modal" >
                <FormItem label="楼栋名"  prop="Name">
                    <i-input v-model="modal.Name" />
                </FormItem>
                <FormItem label="所属校区"  prop="SubCampus">
                    <i-input v-model="modal.SubCampus" />
                </FormItem>
                <FormItem label="楼栋管理员"  prop="Administrator">
                    <i-input v-model="modal.Administrator" />
                </FormItem>
                <FormItem label="联系电话"  prop="Telephone">
                    <i-input v-model="modal.Telephone" />
                </FormItem>
                <FormItem label="排列顺序"  prop="DisplayOrder">
                    <i-input v-model="modal.DisplayOrder" />
                </FormItem>
            </i-form>
        </i-modal>
    </i-row>
</template>
<script>
//  const regex = require("@/regex.js");
let app = require("@/config");
//  var _ = require("lodash");
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
        console.log(this.buildingInfo);
        let final = {};
        msg.data.map(e => final[e.ID] = e.Name);
      });
    },
    renderContent (h, { root, node, data }) {
        let THIS = this;
        return h("span", {
            class: {"ivu-tree-title": true},
            on: {
                click () {
                    THIS.GetLabData(data.ID);
                }
            }
        }, [
            h("span", { style: {width: '100%', marginRight: "8px"} }, data.Name),
            h("Icon", { props: { type: "md-create" }, on: { click: () => THIS.modifyBuilding(data) } }),
            h("Icon", { props: { type: "md-close" }, on: { click: () => THIS.removeBuilding(data.ID) } })
        ]);
    },
    GetLabData (pid) {
        let page = this.page;
        let pageSize = this.pageSize;
        axios.post("/api/building/GetRooms", {pid, page, pageSize}, msg => {
            this.labInfo = msg.data;
            this.labNum = msg.totalRow;
        });
    },
    modifyBuilding (data) {
        this.modal = data || this.emptyModal();
        this.modal.isShown = true;
    },
    Submit () {
        axios.post("/api/building/SaveBuilding", {...this.modal}, msg => {});
    },
    Cancel () {
        this.$Message.info('Clicked cancel');
        this.modal.isShown = false;
    },
    pageChage (p) {
        this.page = p;
        this.getLabs();
    },
    pageSizeChange (pz) {
        this.pageSize = pz;
        this.getLabs();
    },
    removeBuilding (id) {
        axios.post("/api/building/RemoveBuilding", { id }, msg => {});
    },
    removeLab (id) {
        axios.post("/api/building/RemoveRoom", { id }, msg => {});
    },
    toLabDetail (ID) {
        ID = ID || '00000000-0000-0000-0000-000000000000';
        this.$router.push({name: 'LabManager', params: { ID }});
    }
  },
  data () {
      let emptyModal = () => {
          return {
            isShown: false,
            ID: '',
            Name: '',
            SubCampus: '',
            Administrator: '',
            Telephone: '',
            DisplayOrder: '',
            CreatedOn: ''
      };
      };
    return {
      labInfo: [],
      buildingInfo: [],
      modal: emptyModal(),
      emptyModal,
      buildingTree: [],
      seatInfo: {},
      page: 1,
      pageSize: 10,
      labNum: 0,
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
