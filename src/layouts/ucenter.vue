<template>
    <div>
        ucenter
    </div>
</template>

<script>
export default {
    created () {
        let signalR = require("@/api/signalR").default;
        signalR.ready(msg => {
            signalR.resetUserId();
        })
    },
    data () {
        return {};
    },
    watch: {
        $route (v) {
            console.log(v);
        }
    }
}
</script>

<style lang="less">

</style>
