<template>
    <Select v-bind="$attrs" :multiple="multiple" ref="control" @on-clear="onClear" :capture="false"
            :loading="loading" filterable remote :remote-method="userRemote" @on-change="setSelect" :clearable="true"
    >
        <Option v-for="option in userOptions" :value="JSON.stringify(option)" :key="option.ID">
            {{ option.RealName }}({{ option.Code }})
        </Option>
    </Select>
</template>

<script>
var _ = require("lodash");
var axios = require("axios");
const guidEmpty = "00000000-0000-0000-0000-000000000000";
export default {
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
        role: {
            type: String,
            default: function () {
                return "";
            }
        },
        depart: {
            type: String,
            default: guidEmpty
        }
    },
    methods: {
        userRemote: _.debounce(function (query, id) {
            if (query === ' ') {
                this.userOptions = [];
                return;
            }
            if (this.setValue && !this.multiple) {
                this.setValue = false;
                return;
            }
            this.loading = true;
            axios.post("/api/security/SearchUser", {keyword: query, role: this.role, id, departId: this.departId}, msg => {
                if (msg.success) {
                    if (msg.select) {
                        // 只有一个的情况下
                        // let user = msg.data;
                        this.userOptions = [msg.data];
                        !this.multiple && this.setSelect(msg.data, true)
                    } else {
                        this.userOptions = msg.data;
                    }
                }
                this.loading = false;
            })
        }, 500),
        initMultiple (ids) {
            let control = this.$refs["control"];
            control.reset();
            if (!ids.length) {
                return;
            }
            axios.post("/api/security/SearchUserByIds", { id: ids.join(',') }, msg => {
                if (msg.success) {
                    msg.data.forEach(e => {
                        this.select(e, true);
                    })
                }
            })
        },
        onClear () {
            this.select()
        },
        select (user, trigger) {
            let control = this.$refs["control"];
            this.setValue = true;
            if (trigger || !this.multiple) {
                user = user || {};
                user.ID = user.ID || guidEmpty;
                if (!user.ID) return;
                control.onOptionClick({
                    value: JSON.stringify(user),
                    label: `${user.RealName}(${user.Code})`
                })
            }

            if (this.multiple) {
                this.outValue = control.values.map(e => {
                    let obj = JSON.parse(e.value);
                    return obj.ID;
                });
                this.$emit("input", this.outValue);
                return;
            } else {
                this.outValue = user.ID;
            }

            this.$emit("input", this.outValue);
            this.$emit("on-change", user);
        },
        setSelect (user, trigger) {
            if (this.setValue) {
                this.setValue = false;
                return;
            }

            if (this.multiple && user.length && user instanceof Array) {
                user && this.select(user, trigger);
                return;
            }

            if (typeof user === "string") {
                user = JSON.parse(user);
            }

            user && this.select(user, trigger);
        }
    },
    data () {
        // let finalValue = "";
        return {
            finalValue: this.value,
            loading: false,
            oldQuery: "",
            setValue: false,
            outValue: this.value,
            userOptions: [],
            users: []
        }
    },
    watch: {
        value (nv) {
            if (this.setValue) {
                this.setValue = false;
                return;
            }

            if (nv !== guidEmpty && !this.multiple) {
                this.userRemote("", this.value);
            }

            if (this.multiple) {
                this.initMultiple(nv);
            }
        }
    },
    mounted () {
        let nv = this.value;
        if (nv !== guidEmpty && !this.multiple) {
            this.userRemote("", this.value);
        }

        if (this.multiple) {
            this.initMultiple(nv);
        }
    }
}
</script>
