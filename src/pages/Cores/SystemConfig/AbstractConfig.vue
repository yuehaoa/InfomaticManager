<script>
let axios = require("axios")
export default {
    methods: {
        confirm (name, url) {
            let form = this.$refs[name];
            let model = this[name].model;

            this[name].loading = true;
            form.validate(v => {
                if (!v) {
                    this[name].loading = false;
                    return;
                }
                axios.post(url, model, msg => {
                    this[name].loading = false;
                    if (msg.success) {
                        this.$Message.success(msg.msg);
                    } else {
                        this.$Message.warning(msg.msg);
                    }
                })
            })
        },
        bindConfig (name, url) {
            this[name].init = true;
            axios.post(url, {}, msg => {
                if (msg.success) {
                    this[name].init = false;
                    this[name].model = msg.info;
                }
            })
        }
    }
}
</script>
