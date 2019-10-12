// 枚举型的数据字典
var axios = require("axios");

let dic = null;

let getDic = async function (callback) {
    return new Promise((resolve, reject) => {
        if (!dic) {
            axios.post("/api/config/GetDataDictionary", {}, msg => {
                if (msg.success) {
                    dic = msg.Dictionary;
                    callback && callback(dic);
                    resolve(dic);
                } else {
                    reject(msg.msg);
                }
            })
        } else {
            callback && callback(dic);
            resolve(dic);
        }
    });
 }

export default getDic;
