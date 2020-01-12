<template>
    <i-card id="DataDictionary">
        <Alert show-icon>
            配置数据字典
            <template slot="desc">
                数据字典的<b>显示内容</b>指的是在系统使用过程中，显示给用户看的内容。而<b>数据库值</b>指的是在记录数据库中，使用的值。<br />
                如：在某流程中，第一步为“<b>待审核</b>”，记录数据库的值为0。则，对于数据字典而言，<b>显示内容</b>为“待审核”，<b>数据库值</b>为0。
            </template>
        </Alert>
        <i-row class="searcher" type="flex">
            <i-col span="2" class="add-btn-area">
                <i-button size="large" type="primary" @click="toEdit('', '', '')">新建数据</i-button>
            </i-col>
            <i-col span="6">
                <i-input prefix="ios-search" size="large" placeholder="按分类查询" v-model="category" @keyup.enter.native="getData" />
            </i-col>
        </i-row>
        <i-divider />
        <i-table class="data-table" stripe :columns="columns" @on-filter-change="onFilterChange" :data="data">
            <template slot-scope="{row}" slot="action">
                <a href="javascript:;" @click="toEdit(row.Display, row.Value, row.Category)" >[修改]</a>
                <a href="javascript:;" @click="removeData(row.Display, row.Value, row.Category)" style="margin-left: 8px;">[删除]</a>
            </template>
        </i-table>
        <Page v-if="totalPage > 1" :total="totalRow" ref="pager" :current.sync="page" :page-size="pageSize" @on-change="pageChage" @on-page-size-change="pageSizeChange" show-elevator show-sizer show-total/>
        <i-modal title="新建/编辑数据字典" v-model="showDialog" :mask-closable="false">
            <i-form ref="modifyForm" :model="model" :label-width="80" :rules="rules">
                <i-form-item label="显示内容" label-for="display" prop="display">
                    <i-input @keyup.enter="saveData" v-model="model.display" placeholder="请输入显示内容" element-id="display" />
                </i-form-item>
                <i-form-item label="数据库值" label-for="value" prop="value">
                    <i-input @keyup.enter="saveData" v-model="model.value" placeholder="请输入数据库值，为空则同显示内容相同。" element-id="value" />
                </i-form-item>
                <i-form-item label="字典归属" label-for="category" prop="category">
                    <i-auto-complete @keyup.enter="saveData" v-model="model.category" placeholder="字典归属" element-id="category" :data="filters"/>
                </i-form-item>
            </i-form>
            <div slot="footer">
                <Button type="primary" :loading="isloading" @click="saveData" >确认</Button>
            </div>
        </i-modal>
    </i-card>
</template>

<script>
var app = require("@/config")
var axios = require("axios");
export default {
    methods: {
        getData (reload) {
            let page = reload ? 1 : this.page;
            let pageSize = this.pageSize;
            let keyword = this.category;
            let dic = axios._post("/api/config/GetDataDictionary")
            let post = axios._post("/api/config/GetDataDictionaryList", { page, pageSize, keyword });
            let THIS = this;
            axios.all([dic, post]).then(axios.spread((dd, pd) => {
                let dMsg = dd.data;
                let msg = pd.data;
                if (msg.success) {
                    THIS.data = msg.data;
                    if (!reload) {
                        THIS.columns[2].filters = msg.filters.map(e => {
                            return { label: e, value: e };
                        });
                    }
                    this.totalRow = msg.totalRow;
                    THIS.filters = msg.filters;
                }
                if (dMsg.success) {
                    app.dictionary = dMsg.Dictionary;
                }
            }));
        },
        onFilterChange (e, e1) {
            let filter = e._filterChecked[0]
            this.category = filter;
            this.getData(true);
        },
        toEdit (display, value, category) {
            let model = {
                display, value, category
            };
            this.model = model;
            if (display) {
                let form = this.$refs["modifyForm"];
                this.$nextTick(vm => form.validate());
            }
            this.showDialog = true;
            this.isloading = false;
        },
        saveData () {
            let form = this.$refs["modifyForm"];
            form.validate(v => {
                this.isloading = false;
                if (!v) {
                    return;
                }
                this.model.value = this.model.value || this.model.display;
                axios.post("/api/config/SaveDataDictionary", this.model, msg => {
                    if (msg.success) {
                        this.$Message.success("修改成功");
                        this.showDialog = false;
                        this.getData();
                    } else {
                        this.$Message.warning(msg.msg);
                    }
                })
            })
        },
        removeData (display, value, category) {
            let model = {
                display, value, category
            };
            if (!confirm("是否删除该项？")) {
                return;
            }
            axios.post("/api/config/RemoveDataDictionary", model, msg => {
                if (msg.success) {
                    this.$Message.success("删除成功");
                    this.getData();
                }
            })
        }
    },
    data () {
        return {
            page: 1,
            pageSize: 10,
            totalRow: 0,
            columns: [
                {
                    title: "显示内容",
                    key: "Display"
                },
                {
                    title: "数据库值",
                    key: "Value"
                },
                {
                    title: "字典归属",
                    key: "Category",
                    filterMultiple: false,
                    filterRemote (value, key, col) {
                    },
                    filters: []
                },
                {
                    title: " ",
                    slot: "action"
                }
            ],
            data: [],
            model: {},
            rules: {
                display: [
                    {required: true, message: "请输入显示内容", trigger: "blur"}
                ],
                category: [
                    {required: true, message: "请输入字典归属", trigger: "change"}
                ]
            },
            isloading: false,
            showDialog: false,
            category: "",
            filters: []
        };
    },
    mounted () {
        app.title = "数据字典管理";
        this.getData();
    }
}
</script>

<style lang="less">
#DataDictionary {
    padding: 16px;
    .ivu-table-filter-list {
        width: 120px;
    }
}
</style>
