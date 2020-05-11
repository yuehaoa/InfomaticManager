<template>
    <i-card id="org-manager">
        <div class="header">
            <span>部门详情</span>
        </div>
        <div class="top-btn-area">
            <Button @click="cancel"><Icon type="ios-arrow-back"/>返回</Button>
            <Divider type="vertical" />
            <Button type="primary" class="mr8" :loading="isSaving" @click="save">保存</Button><Button @click="cancel">取消</Button>
        </div>
        <Divider />
        <Form ref="org-form" label-position="right" :rules="rules" :model="model" :label-width="100">
            <i-form-item label="部门名称" prop="Name">
                <i-input placeholder="请填写部门名称" v-model="model.Name" />
            </i-form-item>
            <i-form-item label="部门别称" prop="CategoryName">
                <i-input placeholder="请填写部门别称" v-model="model.CategoryName" />
                <div class="help-block">
                    部门别称是<b class="text-info">工作流引擎</b>中，识别部门的一种方法。<br />
                    比如：在工作流中，使用“<b class="text-info">本学院</b>的副院长”，即是代指用户所在的在部门及其母部门中，最近一个<b class="text-info">部门别称</b>为<strong class="text-info">学院</strong>的部门。
                </div>
            </i-form-item>
            <i-form-item label="上级部门" prop="ParentId">
                <org-selector v-model="model.ParentId" :multiple="false" :withOut="id" />
            </i-form-item>
            <i-form-item label="排序号" prop="Sort">
                <i-input v-model="model.Sort" type="number" />
                <div class="help-block">
                   排序号以<b class="text-info">降序</b>排列
                </div>
            </i-form-item>
        </Form>
        <i-divider />
        <div class="header" v-if="isSaved">
            <span>部门职位</span>
            <span class="help-block">
                部门职位是用于<strong class="text-info">工作流引擎</strong>中，识别用户的一种方法。<br />
                比如：在工作流中，使用“本学院的<strong class="text-info">副院长</strong>”，即是代指符合“本学院”的部门中，职位“<strong class="text-info">副院长</strong>”所对应的所有用户。<br/>
                <strong class="text-error">特别注意：在此添加的用户不一定要属于此部门。</strong>
            </span>
        </div>
        <div class="position-table" v-if="isSaved">
            <i-row class="t-header" type="flex">
                <i-col span="4" class="td-name">职位名称</i-col>
                <i-col span="16" class="td-users">对应用户</i-col>
                <i-col span="4" class="td-action">操作</i-col>
            </i-row>
            <i-row class="" type="flex" v-for="(item, index) in this.positions" :key="index">
                <i-form rel="add" class="position-form">
                    <i-col span="4" class="td-name">
                        <i-form-item>
                            <i-input placeholder="请填写分类" v-model="item.name" />
                        </i-form-item>
                    </i-col>
                    <i-col span="16" class="td-users">
                        <i-form-item>
                            <user-selector placeholder="选择对应用户" :multiple="true" v-model="item.ids" />
                        </i-form-item>
                    </i-col>
                    <i-col span="4" class="td-action">
                        <i-form-item>
                            <a href="javascript:;" @click="savePosition(item)">[保存]</a>
                            <a href="javascript:;" @click="removePosition(item.name)">[删除]</a>
                        </i-form-item>
                    </i-col>
                </i-form>
            </i-row>
            <i-row class="t-footer" type="flex">
                <i-form rel="add" class="position-form">
                    <i-col span="4" class="td-name">
                        <i-form-item>
                            <i-input placeholder="请填写分类" v-model="newPosition.name" />
                        </i-form-item>
                    </i-col>
                    <i-col span="16" class="td-users">
                        <i-form-item>
                            <user-selector placeholder="选择对应用户" :multiple="true" v-model="newPosition.ids" />
                        </i-form-item>
                    </i-col>
                    <i-col span="4" class="td-action">
                        <i-form-item>
                            <a href="javascript:;" @click="savePosition(newPosition)">[保存]</a>
                        </i-form-item>
                    </i-col>
                </i-form>
            </i-row>
        </div>
    </i-card>
</template>

<script>
var axios = require("axios");
const app = require("@/config");
const guidEmpty = "00000000-0000-0000-0000-000000000000";
export default {
    methods: {
        save () {
            this.isSaving = true;
            let model = this.model;
            let form = this.$refs["org-form"];
            form.validate(err => {
                if (!err) {
                    this.isSaving = false;
                    return;
                }

                let params = {
                    departId: model.ID,
                    name: model.Name,
                    parentId: model.ParentId,
                    categoryName: model.CategoryName,
                    sort: model.Sort,
                    code: model.Code,
                    deposit: model.Deposit
                }

                axios.post("/api/security/SaveDepart", params, msg => {
                    if (!msg.success) {
                        this.$Message.error(msg.msg);
                    } else {
                        this.$Message.success("修改成功");
                        this.model = msg.data;
                        this.id = msg.data.ID;
                    }
                    this.isSaving = false;
                })
            })
        },
        savePosition (model) {
            let params = {
                id: this.id,
                ids: model.ids.join(','),
                name: model.name
            }
            axios.post("/api/security/SetPosition", params, msg => {
                if (!msg.success) {
                    this.$Message.warning(msg.msg);
                } else {
                    this.$Message.success(msg.msg || "保存成功");
                    this.positions = msg.positions.map(e => {
                        return {
                            name: e.name,
                            ids: e.ids.split(",")
                        };
                    });
                    this.newPosition.id = "";
                    this.newPosition.ids = [];
                    this.newPosition.name = "";
                }
            })
        },
        removePosition (name) {
            axios.post("/api/security/RemovePostion", { id: this.id, name }, msg => {
                if (!msg.success) {
                    this.$Message.warning(msg.msg);
                } else {
                    this.$Message.success(msg.msg || "删除成功");
                    this.positions = msg.positions.map(e => {
                        return {
                            name: e.name,
                            ids: e.ids.split(",")
                        };
                    });
                    this.newPosition.id = "";
                    this.newPosition.ids = [];
                    this.newPosition.name = "";
                }
            })
        },
        reload () {
            let id = this.id;
            if (id && id !== guidEmpty) {
                axios.post("/api/security/GetDepart", { departId: id }, msg => {
                    if (!msg.success) {
                        this.$Message.warning("加载错误");
                        this.cancel();
                        return;
                    }
                    this.model = msg.data;
                    this.positions = msg.positions.map(e => {
                        return {
                            name: e.name,
                            ids: e.ids.split(",")
                        };
                    });
                });
            }
        },
        cancel () {
            this.$router.push({ name: "UserManager" });
        }
    },
    data () {
        let id = this.$route.query.id;
        return {
            id,
            isSaved: id !== guidEmpty,
            isSaving: false,
            rules: {
                Name: [
                    {required: true, message: "必须输入部门名称", trigger: "blur"}
                ]
            },
            model: {
                ID: "",
                Name: "",
                ParentId: "",
                Code: "",
                Sort: "",
                CategoryName: ""
            },
            positions: [],
            newPosition: {
                id: "",
                departId: id,
                name: "",
                ids: []
            }
        }
    },
    mounted () {
        app.title = "部门管理";
        this.reload();
    }
}
</script>

<style lang="less">
#org-manager {
    .mr8 {
        margin-right: 8px;
    }

    .top-btn-area {
        background: #fff;
        padding: 8px;
        padding-bottom: 0px;
    }

    .header {
        color: #000;
        font-size: 18px;
        line-height: 28px;
        margin-bottom: 10px;
    }

    .position-table {
        text-align: center;

        .t-header {
            padding-bottom: 8px;
            border-bottom: #e8eaec 1px solid;
        }

        .position-form {
            width: 100%;
            text-align: left;
        }

        .ivu-form-item {
            margin-bottom: 0px;
            padding: 8px;
        }

        .td-action {
            text-align: center;
        }
    }
}
</style>
