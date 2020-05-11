<template>
    <i-select v-bind="$attrs" @input="onInput" :value="internalValue">
        <i-option v-for="(item, index) in opts" :key="index" :value="index">{{item}}</i-option>
    </i-select>
</template>

<script>
let app = require("@/config");
export default {
    props: {
        dic: {
            type: String,
            required: true
        },
        value: {
            type: String
        }
    },
    methods: {
        onInput (v) {
            this.$emit("input", v);
        }
    },
    data () {
        let dic = app.dictionary[this.dic];
        if (!dic) {
            dic = {};
        }
        return {
            opts: dic,
            internalValue: this.value
        };
    },
    watch: {
        value (nv) {
            this.internalValue = nv;
        }
    }
}
</script>

<style lang="less">
</style>
