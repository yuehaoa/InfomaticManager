<template>
  <i-row id="Categorise">
    <i-col span="5" class="tree">
      <Tree
        ref="tree"
        :data="categoryTree"
        class="org-tree"
        :empty-text="emptyText"
        @on-select-change="selectCategory"
      ></Tree>
    </i-col>
    <i-col span="18" offset="1">
      <i-row class="searcher" type="flex">
        <i-col span="2">
          <i-button size="large" class="ivu-btn ivu-btn-primary" @click="addModel()">新建</i-button>
        </i-col>
        <i-col span="17">
          <i-input
            prefix="ios-search"
            :disabled="display"
            size="large"
            placeholder="搜索分类名"
            v-model="keyword"
            @keyup.enter.native="getData()"
          />
        </i-col>
        <i-col span="3" offset="2">
          <i-button
            size="large"
            @click="display=!display"
            class="ivu-btn ivu-btn-text"
          >{{display?"普通搜索":"高级搜索"}}</i-button>
        </i-col>
      </i-row>
      <i-row style="height : 16px;" />
      <i-row v-show="display" class="advanced-searcher" type="flex">
        <i-col span="9">
          <span>分类名：</span>
          <Input v-model="cateKeyword" />
        </i-col>
        <i-col span="1" />
        <i-col span="9">
          <span>导航名:</span>
          <i-input v-model="actKeyword" />
        </i-col>
        <i-col span="24">
          <i-button
            class="ivu-btn ivu-btn-primary"
            style="margin-top:16px"
            @click="advancedSearch"
          >搜索</i-button>
          <i-button style="margin-top:16px" @click="removeAllTags()">清空</i-button>
        </i-col>
      </i-row>
      <i-row style="height : 5px;" />
      <i-row type="flex" class="filter-keywords" v-if="filters.length">
        <i-col span="2" class="title">
          <i-icon type="ios-funnel" />
          <span>检索项：</span>
        </i-col>
        <i-col span="22">
          <template v-for="(item, index) in filters">
            <i-tag :key="index" closable @on-close="removeTag(index)">{{item.display}}</i-tag>
          </template>
          <i-button type="text" size="small" @click="removeAllTags">清除所有</i-button>
        </i-col>
      </i-row>
      <divider />
      <i-table class="data-table" stripe :columns="columns" :data="data" ref="dataTable">
        <template slot-scope="{row}" slot="Operation">
          <a class="btn" href="javascript:;" @click="addModel(row)">[修改]</a>
          <a class="btn" href="javascript:;" @click="removeCategory(row.ID)">[删除]</a>
        </template>
      </i-table>
    </i-col>
    <i-modal title="添加/编辑新闻" v-model="showDialog" :mask-closable="false" :width="900">
      <i-form ref="form" :model="model" :label-width="100" :rules="rules">
        <i-form-item label="分类名" prop="CatName">
          <i-input v-model="model.CatName" />
        </i-form-item>
        <i-form-item label="导航名" prop="Act">
          <i-input v-model="model.Act" />
        </i-form-item>
        <i-form-item label="所属分类" prop="ParentId">
          <category-selector v-model="model.ParentId" :clearable="true" />
        </i-form-item>
        <i-form-item label="排序号" prop="Reorder">
          <i-input v-model="model.Reorder" />
          <p>
            排序号只能为
            <b>正整数</b>
          </p>
        </i-form-item>
      </i-form>
      <div slot="footer">
        <Button type="primary" @click="SaveData()">确认</Button>
        <Button @click="showDialog=false">取消</Button>
      </div>
    </i-modal>
  </i-row>
</template>

<script>
let app = require("@/config");
let axios = require("axios");
var _ = require("lodash");

export default {
  methods: {
    removeCategory (id) {
            if (!confirm("是否删除这条记录")) {
                return;
            }
            axios.post("/api/cms/RemoveCategory", {id: id}, msg => {
                if (msg.success) {
                    this.$Message.success("删除成功");
                    this.getData();
                    this.getcategoryTree();
                } else {
                    this.$Message.warning(msg.msg);
                }
            })
        },
    selectCategory (node, n) {
      if (n.id === "00000000-0000-0000-0000-000000000000") {
        this.setFilter("id");
      } else {
        this.setFilter("id", n.id, "所属分类", n.name);
      }
      this.getData();
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
    getcategoryTree () {
      axios.post("/api/cms/GetCategoryTree", { withEmpty: true }, msg => {
        if (msg.success) {
          this.emptyText = "数据加载中...";
          this.categoryTree = msg.data;
        }
      });
    },
    addModel (row) {
      let form = this.$refs["form"];
      row = row || {
        ID: "",
        CatName: "",
        Action: "",
        ParentId: "",
        Reorder: 1
      };
      form.resetFields();
      this.model = {
        ID: row.ID,
        CatName: row.CatName,
        Act: row.Action,
        ParentId: row.ParentId,
        Reorder: row.Reorder
      };
      this.showDialog = true;
    },
    SaveData () {
      axios.post("/api/cms/SaveCategory", this.model, msg => {
        if (msg.success) {
          this.getData();
          this.getcategoryTree();
        }
      });
      this.showDialog = false;
    },
    getData () {
      let params = {
        id: "00000000-0000-0000-0000-000000000000"
      };
      this.filters.forEach(e => {
        if (!e.key || !e.value) {
          return;
        }
        params[e.key] = e.value;
      });
      axios.post("/api/cms/categorylist", params, msg => {
        if (msg.success) {
          this.data = msg.data;
        }
      });
    },
    removeTag (index) {
      let item = this.filters.splice(index, 1);
      switch (item[0].key) {
        case "cate":
          this.keyword = "";
          this.cateKeyword = "";
          break;
        case "act":
          this.actKeyword = "";
          break;
        case "id":
          let tree = this.$refs["tree"];
          tree.handleSelect(0);
          break;
        default:
          break;
      }
      this.getData();
    },
    removeAllTags () {
      this.filters = [];
      this.keyword = "";
      this.cateKeyword = "";
      this.actKeyword = "";
      let tree = this.$refs["tree"];
      tree.handleSelect(0);
      this.getData();
    },
    advancedSearch () {
      let cateKeyword = this.cateKeyword;
      let actKeyword = this.actKeyword;
      this.setFilter("cate", cateKeyword, "分类名", cateKeyword);
      this.setFilter("act", actKeyword, "导航名", actKeyword);
      this.getData();
    },
    setKeyword: _.debounce(function () {
      let keyword = this.keyword;
      this.setFilter("cate", keyword, "分类名", keyword);
      this.getData();
    }, 500)
  },
  data () {
    return {
      columns: [
        {
          key: "CatName",
          title: "分类"
        },
        {
          key: "Action",
          title: "导航名"
        },
        {
          key: "ParentName",
          title: "所属分类"
        },
        {
          slot: "Operation",
          title: "操作"
        }
      ],
      display: false,
      filters: [],
      data: [],
      categoryTree: [],
      emptyText: "暂无数据",
      keyword: "",
      cateKeyword: "",
      actKeyword: "",
      id: "00000000-0000-0000-0000-000000000000",
      showDialog: false,
      model: {},
      rules: {
        CatName: { required: true, message: "必须填写分类名" },
        Act: { required: true, message: "必须填写导航名" },
        ParentId: { required: true, message: "必须填写所属分类" },
        Reorder: { required: true, message: "必须填写排序号" }
      }
    };
  },
  watch: {
    keyword (v) {
      this.setKeyword();
    }
    /*
        $route () {
            let audit = this.$route.name.indexOf("Final") > -1 ? 5 : 4;
            this.getData(1, audit);
        }
        */
  },
  mounted () {
    app.title = "新闻分类管理";
    // let audit = this.$route.name.indexOf("Final") > -1 ? 5 : 4;
    this.getData();
    this.getcategoryTree();
  }
};
</script>

<style lang="less">
#Categorise {
  .advanced-searcher {
    font-size: 16px;
    line-height: 32px;
  }
  .tree {
    background: #808695;
    color: #fff;
    width: 260px;
    min-height: fill-available;
    @import "../../../assets/less/orgTree.less";
  }
  @import "../../../assets/less/theme.less";
  .title {
    line-height: 26px;
    color: @subsidiary-color;
  }
}
</style>
