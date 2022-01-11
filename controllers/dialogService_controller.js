const Common = require("../common/common");
const fetch = require("node-fetch");
const base64 = require("node-base64-image");

module.exports = class DialogService_controller {
    get_stockNews(req, res, next) {
        let { todayHour, todayMinute, todaySecond } = Common.getDayTime();
        let STOCK = req.params.stock;
        let promises = [];
        let promises2 = []; //for photo
        let settings = {
            method: "get",
            headers: Common.headers,
        };
        let url = `https://money18.on.cc/cnt/utf8/stockList/HK/${STOCK}/${STOCK}_all.js?time=${todayHour}${todayMinute}${todaySecond}`;
        promises.push(
            fetch(url, settings)
                .then((res) => res.json())
                .then((res) => {
                    // do something with JSON
                    return res;
                })
                .catch((err) => {
                    return Promise.reject(err.message);
                })
        );
        let test1 = "";
        Promise.all(promises)
            .then(function (result) {
                let addArray = [];
                let breakloopCount = 10;
                if (Object.keys(result[0]).length < 10) {
                    breakloopCount = Object.keys(result[0]).length;
                }
                for (let i = 0; i < breakloopCount; i++) {
                    addArray.push(result[0][i]);
                }
                test1 = addArray;
                for (let i = 0; i < addArray.length; i++) {
                    promises2.push(
                        new Promise(function (resolve, reject) {
                            if (addArray[i].thumbnail === "") {
                                resolve("");
                            } else {
                                let rebuild_imgUrl_array = addArray[i].thumbnail.split("/");
                                let rebuild_imgUrl = `https://hk.on.cc/hk/bkn/cnt/finance/${rebuild_imgUrl_array[3]}/photo//${rebuild_imgUrl_array[4]}`;

                                let options = {
                                    string: true,
                                    headers: Common.headers,
                                };

                                let image = base64.encode(rebuild_imgUrl, options);
                                return resolve(image);
                            }
                        })
                    );
                }
                return new Promise(function (resolve, reject) {
                    Promise.all(promises2)
                        .then(function (result) {
                            resolve(result);
                        })
                        .catch((err) => {
                            reject(err);
                        });
                });
            })
            .then(function (result) {
                for (let i = 0; i < test1.length; i++) {
                    test1[i].photo = result[i];
                    if (test1[i]["link"] !== "") {
                        test1[i]["link"] =
                            "https://money18.on.cc/finnews/content/related_news/" +
                            test1[i]["link"].split("/")[4];
                    }
                    if (test1[i]["content"] !== "") {
                        let replaceWord = [
                            "&lt;br/&gt;&lt;br/&gt;",
                            "&lt;br/&gt;&lt;br",
                            "&lt;br/&gt;&lt;b",
                            "/&g",
                            "&lt;br",
                        ];
                        for (let j = 0; j < replaceWord.length; j++) {
                            test1[i]["content"] = test1[i]["content"].replace(
                                replaceWord[j],
                                ""
                            );
                        }
                    }
                }
                res.status(200).json(test1);
            })
            .catch((err) => {
                console.log(err);
                res.status(500).json({ error: err });
            });
    }
    get_stockDailyPrice(req, res, next) {
        let { todayHour, todayMinute, todaySecond } = Common.getDayTime();
        let STOCK = req.params.stock;
        let promises = [];
        let settings = {
            method: "get",
            headers: Common.headers,
        };
        let url = `https://www.quandl.com/api/v3/datasets/HKEX/${STOCK}.json?api_key=xCJuSM5DeG9s9PtmNbFg&time=${todayHour}${todayMinute}${todaySecond}`;
        promises.push(
            fetch(url, settings)
                .then((res) => res.json())
                .then((res) => {
                    return res;
                })
                .catch((err) => {
                    return Promise.reject(err.message);
                })
        );
        Promise.all(promises)
            .then(function (result) {
                res.status(200).json(result[0]);
            })
            .catch((err) => {
                console.log(err);
                res.status(500).json({ error: err });
            });
    }
};
