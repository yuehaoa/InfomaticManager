<template>
    <Select v-bind="$attrs" :multiple="multiple" ref="control" @on-clear="onClear"
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
            axios.post("/api/security/SearchUser", {keyword: query, role: this.role, id}, msg => {
                console.log(msg);
                if (msg.success) {
                    if (msg.select) {
                        // 只有一个的情况下
                        let user = msg.data;
                        this.select(user)
                    } else {
                        this.userOptions = msg.data;
                    }
                }
                this.loading = false;
            })
        }, 500),
        onClear () {},
        select (user) {
            user = user || {};
            user.ID = user.ID || guidEmpty;
            let control = this.$refs["control"];
            this.setValue = true;
            control.onOptionClick({
                value: user.ID,
                label: `${user.RealName}(${user.Code})`
            })

            if (this.multiple) {
                this.outValue.indexOf(user.ID) < 0 && this.outValue.push(user.ID);
            } else {
                this.outValue = user.ID;
            }

            this.$emit("input", this.outValue);
            this.$emit("on-change", user);
        },
        setSelect (user) {
            if (this.setValue && !this.multiple) {
                return;
            }
            if (typeof user === "string") user = JSON.parse(user);
            this.select(user);
        }
    },
    data () {
        // let finalValue = "";
        if (this.value !== guidEmpty) {
            this.userRemote("", this.value);
        }
        return {
            finalValue: this.value,
            loading: false,
            oldQuery: "",
            setValue: false,
            outValue: this.value,
            userOptions: []
        }
    }
}
</script>
