var axios = require("axios");
// var Vue = require("vue").default;
var appSettings = require("@/config");

if (!appSettings.isInit) {
    appSettings.isInit = true;

    var get = axios.get;
    var post = axios.post;

    axios._get = get;
    axios._post = post;

    axios.get = (url, params, callback) => {
        var result = get(appSettings.api + url, {
            params
        });

        if (callback) {
            return result.then(msg => {
                if (msg.code && msg.code === "40001") {
                    appSettings.kick && appSettings.kick();
                    return;
                }
                callback(msg.data);
            })
        } else {
            return result;
        }
    }

    axios.post = (url, params, callback) => {
          var result = axios({
              method: "post",
              url: appSettings.api + url,
              params
          });

        if (callback) {
            return result.then(msg => {
                if (msg.code && msg.code === "40001") {
                    appSettings.kick && appSettings.kick();
                    return;
                }
                callback(msg.data);
            })
        } else {
            return result;
        }
    }

    axios.postStream = (url, params, callback) => {
        var result = post(appSettings.api + url, params);
        if (callback) {
            return result.then(msg => {
               callback(msg.data);
            })
        } else {
            return result;
        }
    }

    axios.post2 = (url, params, callback) => {
        var result = post(appSettings.api + url, params);

        if (callback) {
            return result.then(msg => {
                if (msg.code && msg.code === "40001") {
                    appSettings.kick && appSettings.kick();
                    return;
                }
                callback(msg.data);
            })
        } else {
            return result;
        }
    }

    require("@/api");
}
