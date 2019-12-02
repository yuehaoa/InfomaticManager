<template>
    <div id="time-table">
        <BigCalendar @input="onDateChanged" />
        <divider />
        <div class="btn-area">
            <i-button type="success">新建日程</i-button>
        </div>
    </div>
</template>
<script>
import BigCalendar from './BigCalendar'
export default {
    components: { BigCalendar },
    methods: {
        onDateChanged (date) {
        }
    },
    data () {
        let rid = this.$route.query.ID;
        return {
            rid
        };
    }
}
</script>
<style lang="less">
</style>
