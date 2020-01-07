var _ = require("lodash")
var axios = require("axios");
let app = {};
function broadcast (componentName, eventName, params) {
    this.$children.forEach(child => {
        const name = child.$options.name;
        if (name === componentName) {
            if (typeof child[eventName] === "function") {
                child[eventName].apply(child, params);
            }
            child.$emit.apply(child, [eventName].concat(params));
        } else if (!componentName) {
            if (typeof child[eventName] === "function") {
                child[eventName].apply(child, params);
            }
            child.$emit.apply(child, [eventName].concat(params));
            broadcast.apply(child, [componentName, eventName].concat([params]));
        } else {
            broadcast.apply(child, [componentName, eventName].concat([params]));
        }
    });
}
export default {
    computed: {
        totalPage () {
            return Math.ceil(this.totalRow / this.pageSize)
        }
    },
    methods: {
        buildValidate: function (url, fieldName, otherRules = []) {
            let THIS = this;
            if (otherRules && !Array.isArray(otherRules)) otherRules = [otherRules];
            return {
                [fieldName]: [
                ...otherRules,
                _.debounce(function (rule, value, cb, source, options) {
                    let id = THIS.id;
                    axios.post(url, { id, fieldName, value }, msg => {
                        if (msg.success) {
                            cb();
                        } else {
                            cb(msg.msg);
                        }
                    })
                }, 500)
                ]
            }
        },
        buildOrRegex: function (msg, regexs, trigger) {
            return {
                validator (rule, value, cb, soure, options) {
                    let result = false;
                    for (let r of regexs) {
                        result = result || r.test(value);
                    }
                    result ? cb() : cb(msg);
                },
                trigger: trigger || "blur"
            }
        },
        buildRequired: function (url, fieldName, requiredMsg, otherRules = []) {
            if (otherRules && !Array.isArray(otherRules)) otherRules = [otherRules];
            otherRules = [{required: true, message: requiredMsg}, ...otherRules];
            return this.buildValidate(url, fieldName, otherRules);
        },
        getData () {
        },
        pageChage (p) {
            this.page = p;
            this.getData();
        },
        pageSizeChange (pz) {
            this.pageSize = pz;
            this.changePage(1);
        },
        changePage (p) {
            let pager = this.$refs["pager"];
            if (this.page === p) {
                this.getData();
            } else {
                pager.changePage(1);
            }
        },
        onSearch: _.debounce(function () {
            this.changePage(1);
        }, 500),
        toDate (str) {
            var re = /-?\d+/;
            var m = re.exec(str);
            var d = new Date(parseInt(m[0]));
            return d
        },
        broadcast (componentName, eventName, params) {
            broadcast.call(app, componentName, eventName, params);
        }
    },
    setApp (vm) {
        app = vm;
    }
}
