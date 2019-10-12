const app = require("@/config");
const axios = require("axios");

app.getMenus = (callback) => {
    axios.post("/api/security/GetMenus", {}, msg => {
        callback && callback(msg.menus);
    });
}
