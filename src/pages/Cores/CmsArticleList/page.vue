<template>
    <i-row id="article-list" :gutter="16">
        <i-col span="5" class="tree">
            <Tree ref="tree" :data="categoryTree" class="org-tree" :empty-text="emptyText" @on-select-change="selectCategory"></Tree>
        </i-col>
        <i-col span="19">
            <i-card class="panel">
                <div class="header">
                    <span>{{category}}下的新闻</span>
                </div>
                <i-row class="searcher" type="flex">
                    <i-col span="2" class="add-btn-area">
                        <i-button size="large" type="primary" @click="toDetail()"><i-icon type="md-add"></i-icon>新建</i-button>
                    </i-col>
                    <i-col span="8">
                        <i-input prefix="ios-search" size="large" placeholder="按标题搜索" v-model="topic" @keyup.enter.native="setFilter('topic', topic, '标题')" />
                    </i-col>
                    <i-col span="11"></i-col>
                    <i-col span="2">
                        <i-button size="large" type="text" @click="toAdvance">{{ searchType }}</i-button>
                    </i-col>
                </i-row>
                <i-row class="advance-searcher" v-if="searchType === '普通搜索'" :gutter="16">
                    <i-col span="4">
                        <span>作者：</span>
                        <i-input v-model="author" />
                    </i-col>
                    <i-col span="4">
                        <span>发布时间：</span>
                        <DatePicker type="daterange" placement="bottom-end" v-model="releaseTime"></DatePicker>
                    </i-col>
                    <i-col span="24" class="filter-btn-area">
                        <i-button type="primary" @click="advSearch">搜索</i-button>
                        <i-button @click="removeAllTags">清空</i-button>
                    </i-col>
                </i-row>
                <i-row type="flex" class="filter-keywords" v-if="filters.length">
                    <i-col span="3" class="title">
                        <Icon type="ios-funnel" /> 检索项：
                    </i-col>
                    <i-col span="21">
                        <template v-for="(item, index) in filters">
                            <i-tag :key="index" closable @on-close="removeTag(index)">{{item.display}}</i-tag>
                        </template>
                        <i-button type="text" size="small" @click="removeAllTags">清除所有</i-button>
                    </i-col>
                </i-row>
                <i-table class="data-table" stripe :columns="columns" :data="data" ref="dataTable">
                    <template slot-scope="{row}" slot="Topic">
                        <a href="javascript:;" @click="toDetail(row.ID)">{{row.Topic || "暂无标题"}}</a>
                    </template>
                    <template slot-scope="{row}" slot="action">
                        <a class="btn" href="javascript:;" @click="removeArticle(row.ID)">[删除]</a>
                    </template>
                </i-table>
                <Page v-if="totalPage > 1" :total="totalRow" ref="pager" :current.sync="page" :page-size="pageSize" @on-change="pageChage" @on-page-size-change="pageSizeChange" show-elevator show-sizer show-total/>
            </i-card>
        </i-col>
    </i-row>
</template>

<script>
let axios = require("axios");
let app = require("@/config")
export default {
    methods: {
        toAdvance () {
            this.searchType = this.searchType === "高级搜索" ? "普通搜索" : "高级搜索";
        },
        advSearch () {
            this.setFilter('topic', this.topic, '标题')
            this.setFilter('author', this.author, '作者')
            if (this.releaseTime[0]) {
                this.setFilter('start', this.releaseTime[0].toLocaleDateString(), '开始时间')
            }
            if (this.releaseTime[1]) {
                this.setFilter('end', this.releaseTime[1].toLocaleDateString(), '结束时间')
            }
        },
        getCategoryTree () {
            axios.post("/api/cms/GetCategoryTree", { withEmpty: true }, msg => {
                if (!msg.success) {
                    this.categoryTree = [];
                    this.emptyText = msg.msg;
                    return;
                }

                this.emptyText = "数据加载中...";
                this.categoryTree = msg.data;
                if (!this.categoryTree.length) this.emptyText = "暂无数据";
            })
        },
        selectCategory (node, n) {
            if (n.id !== "00000000-0000-0000-0000-000000000000") {
                this.setFilter("CategoryId", n.id, "所属分类", n.name);
            } else {
                this.clearFilter("CategoryId");
            }
            this.category = n.name;
        },
        setFilter (key, value, displayKey, displayValue) {
            displayKey = displayKey || key;
            displayValue = displayValue || value;
            let f = this.filters.findIndex(e => e.key === key);
            if (f > -1) {
                this.filters.splice(f, 1)
            }

            if (value) {
                this.filters.push({
                    key,
                    display: `${displayKey}：${displayValue}`,
                    value
                })
            }

            this.getData(1);
        },
        clearFilter (key) {
            this.setFilter(key);
        },
        removeTag (index, flag) {
            let item = this.filters.splice(index, 1);
            switch (item[0].key) {
                case "CategoryId":
                    let tree = this.$refs["tree"];
                    tree.handleSelect(0);
                    break;
                default:
                    this[item[0].key] = "";
                    break;
            }
            !flag && this.getData(1);
        },
        removeAllTags () {
            while (this.filters.length) {
                this.removeTag(0, true);
            }
            this.getData(1);
        },
        getData (page) {
            let params = {
                page: page || this.page,
                pageSize: this.pageSize
            }
            this.filters.forEach(e => {
                if (!e.key || !e.value) {
                    return;
                }
                params[e.key] = e.value;
            });
            axios.post("/api/cms/GetArticleList", params, msg => {
                if (msg.success) {
                    this.data = msg.data;
                    this.totalRow = msg.totalRow;
                    this.page = msg.page;
                    this.pageSize = msg.pageSize;
                }
            })
        },
        toDetail (id) {
            this.$router.push({ name: "ArticleDetail", query: { id } })
        },
        removeArticle (id) {
            if (!confirm("是否删除这条记录")) {
                return;
            }

            axios.post("/api/cms/RemoveArticle", {id}, msg => {
                if (msg.success) {
                    this.$Message.success("删除成功");
                    this.getData(1);
                } else {
                    this.$Message.warning(msg.msg);
                }
            })
        }
    },
    data () {
        return {
            columns: [
                {
                    slot: "Topic",
                    title: "标题"
                },
                {
                    key: "CategoryName",
                    title: "所属分类"
                },
                {
                    key: "Author",
                    title: "作者"
                },
                {
                    key: "ReleaseTime",
                    title: "发布时间"
                },
                {
                    slot: "action",
                    title: "操作"
                }
            ],
            categoryTree: [],
            emptyText: "暂无数据",
            category: "所有分类",
            searchType: "高级搜索",
            topic: "",
            author: "",
            releaseTime: [],
            page: 1,
            pageSize: 10,
            totalRow: 0,
            data: [],
            filters: []
        };
    },
    mounted () {
        app.title = "新闻管理";
        this.getCategoryTree();
        this.getData(1);
    }
}
</script>

<style lang="less">
@import "../../../assets/less/theme.less";
#article-list {
    .tree {
        background: #808695;
        color: #fff;
        width: 260px;
        min-height: fill-available;
        @import "../../../assets/less/orgTree.less";
    }

    .panel {
        .header {
            color: #000;
            font-size: 18px;
            line-height: 28px;
            margin-bottom: 10px;
        }

        .advance-searcher {
            margin: 24px 0px;
            .filter-btn-area {
                margin-top: 16px;
            }
        }
    }
    .filter-keywords {
        margin-top: 24px;
        .title {
            width: 6em;
            text-align: right;
            color: @subsidiary-color;
        }
    }
    .data-table {
        margin-top: 24px;
    }
}
</style>
