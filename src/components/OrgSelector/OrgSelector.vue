<template>
    <Select class="org-selector" ref="select"
        @on-query-change="debounce"
        :multiple="multiple"
        :disabled="disabled"
        :placeholder="placeholder"
        :clearable="clearable"
        :filterable="filterable"
        :loading="loading"
        :capture="false"
        @on-select-selected="onInternalSelectChange"
        @on-clear="onClear"
    >
        <Tree :data="orgTree" class="org-tree" :render="renderOrgTree" :empty-text="emptyText" :load-data="getChildTree"></Tree>
    </Select>
</template>

<script>
import Emitter from 'view-design/src/mixins/emitter'
import { Tree, Select } from 'view-design'
const axios = require("axios")
const app = require("@/config")
let timer = null;
const empty = "00000000-0000-0000-0000-000000000000";
export default {
    components: { Select, Tree },
    mixins: [Emitter],
    props: {
        multiple: {
            type: Boolean,
            default: false
        },
        value: {
            type: String | Number | Array,
            default: function () {
                return this.multiple ? [] : ""
            }
        },
        withOut: {
            type: String | Array,
            default: empty
        },
        disabled: {
            type: Boolean,
            default: false
        },
        clearable: {
            type: Boolean,
            default: false
        },
        placeholder: {
            type: String
        },
        filterable: {
            type: Boolean,
            default: false
        },
        loading: {
            type: Boolean,
            default: false
        }
    },
    methods: {
        renderOrgTree (h, {root, node, data}) {
            let THIS = this;
            this.orgRoot = root;
            data.name = data.name === "无部门" ? "根部门" : data.name

            return h('span', {
                class: { "ivu-tree-title-text": true, "ivu-tree-title-selected": data.selected },
                on: {
                    click () {
                        if (!THIS.multiple) {
                            // 单选的情况下，清掉所有其它选项
                            root.map(e => e.node.selected = false);
                        } else {
                            // 多选的情况下，先了无就要清掉其它选项，选了其它的就要清掉无
                            if (data.id === empty) {
                                root.map(e => {
                                    e.node.selected = false
                                });
                            } else {
                                root.map(e => {
                                    if (e.node.id === empty && e.node.selected) {
                                        e.node.selected = false
                                    }
                                });
                            }
                        }
                        data.selected = !data.selected;
                        THIS.departId = data.id;
                        THIS.select();
                    }
                }
            }, [
                h("span", [
                    h("Icon", { props: { type: data.isDepart ? 'md-folder' : 'ios-person' }, style: { marginRight: "8px" } }),
                    h("span", data.name)
                ]),
                h("span", { class: { "btn-area": true } }, [
                    h("span", { class: { "btn": true } }, [
                        h("Icon", { props: { type: "md-checkmark" } })
                    ])
                ])
            ])
        },
        getDepartTree () {
            axios.post("/api/security/GetDepartTree", { withEmpty: this.clearable }, msg => {
                if (!msg.success) {
                    this.orgTree = [];
                    this.emptyText = msg.msg;
                    return;
                }

                this.emptyText = "数据加载中...";
                this.orgTree = msg.data.filter(e => {
                    let withOut = this.withOut;
                    if (typeof withOut === "string" && withOut !== empty && withOut === e.id) {
                        return false;
                    }

                    if (withOut instanceof Array && e.id !== empty && withOut.indexOf(e.id) > -1) {
                        return false;
                    }

                    return true;
                });
                if (!this.orgTree.length) this.emptyText = "暂无数据";
            })
        },
        getChildTree (item, cb) {
            axios.post("/api/security/GetDepartTree", { id: item.id }, msg => {
                if (!msg.success) {
                    this.$Message.error(msg.msg);
                    let data = [];
                    cb(data);
                } else {
                    let data = msg.data.filter(e => {
                        let withOut = this.withOut;
                        if (typeof withOut === "string" && withOut !== empty && withOut === e.id) {
                            return false;
                        }

                        if (withOut instanceof Array && e.id !== empty && withOut.indexOf(e.id) > -1) {
                            return false;
                        }

                        return true;
                    }) || [];

                    if (data === []) {
                        delete item.children;
                    }

                    data.map(e => {
                        if (e.id === this.innerValue) {
                            e.selected = true;
                        }
                    })

                    cb(data);
                }
            })
        },
        onClear () {
            let root = this.orgRoot;
            root.map(e => e.node.selected = false);
            // 在这里点击了清除按钮
            this.select();
        },
        onInternalSelectChange (e) {
            e.node.selected = false;
            // 在选择框里取消了选择
            this.select(false, e.node);
        },
        select (flag, n) {
            let control = this.$refs.select;
            control.values = [];
            let root = this.orgRoot;
            root.map(e => {
                if (e.node.selected || (n && e.node.id === n.id)) {
                    let item = e.node;
                    control.onOptionClick({
                        value: item.id,
                        label: item.label,
                        node: item
                    })
                }
            })

            // 在树里进行或者取消了选择
            if (!flag) {
                this.isChangeValue = true;
                this.$nextTick(() => {
                    this.$emit("input", this.multiple ? control.values.map(e => e.value) : control.values[0] && control.values[0].value);
                });
            }
        },
        debounce () {
            let args = arguments;
            clearTimeout(timer);
            timer = setTimeout(() => {
                this.onQuery.apply(this, args);
            }, 500);
        },
        onQuery (str) {
            // console.log(this.innerValue);
        }
    },
    data () {
        return {
            emptyText: "正在加载中...",
            orgTree: [],
            orgRoot: [],
            innerValue: this.value,
            isChangeValue: false,
            app
        };
    },
    watch: {
        'app.reloadOrg': {
            handler (v) {
                this.getDepartTree();
            }
        },
        value (v) {
            if (!this.isChangeValue) {
                // 外部赋值
                let control = this.$refs.select;
                control.values = this.multiple ? [] : "";
                let arry = Array.isArray(v) ? v : [v]
                arry.map(e => {
                    this.orgRoot.map(x => {
                        x.node.selected = (e === x.node.id) || x.node.selected;
                    })
                })
                this.select(true);
            } else {
                this.isChangeValue = false;
            }
        }
    },
    mounted () {
        this.getDepartTree();
    }
}
</script>

<style lang="less">
.org-selector {
    @import "../../assets/less/orgTree.less";
    .ivu-tree-title {
        color: #515a6e !important;
    }
    .ivu-tree-title-selected, .ivu-tree-title-selected:hover, .ivu-tree-title:hover {
        color: #fff;
    }
}
</style>
