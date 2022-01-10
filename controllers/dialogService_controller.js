import { checkEmail, getDayTime, headers as _headers } from "../common/common";
import fetch from "node-fetch";
import { encode } from "node-base64-image";

export default class DialogService {
    get_stockName(req, res, next) {
        if (!checkEmail(req.headers["email"])) {
            res.status(500).json({
                error: "please enter email！",
            });
            return;
        }
        let { todayHour, todayMinute, todaySecond } = getDayTime();
        let STOCK = req.params.stock;
        let promises = [];
        let settings = {
            method: "get",
            headers: _headers,
        };

        let url = `http://realtime-money18-cdn.on.cc/securityQuote/genStockDetailHKJSON.php?stockcode=${STOCK}&time=${todayHour}${todayMinute}${todaySecond}`;
        promises.push(
            fetch(url, settings)
                .then((res) => res.json())
                .then((res) => {
                    //console.log(res)
                    // do something with JSON
                    return res;
                })
                .catch((err) => {
                    return Promise.reject(err.message);
                })
        );

        Promise.all(promises)
            .then(function (result) {
                let { shortPut, real, daily, calculation } = result[0];
                res.status(200).send({
                    stock: shortPut.StockNo,
                    name: shortPut.Company,
                    past: parseFloat(daily.preCPrice),
                    nowPrice: parseFloat(real.np),
                    nowTime: real.ltt,
                    tenDayHigh: parseFloat(daily.tenDayHigh), //10日高
                    tenDayLow: parseFloat(daily.tenDayLow), //10日低
                    tenDayAvg: parseFloat(daily.ma10), //10日平均價
                    monthLow: parseFloat(daily.mthLow), //1個月低
                    monthHigh: parseFloat(daily.mthHigh), //1個月高
                    twentyDayAvg: parseFloat(daily.ma20), //20日平均價
                    wk52Low: parseFloat(daily.wk52Low), //52周低
                    wk52High: parseFloat(daily.wk52High), //52周高
                    fiftyDayAvg: parseFloat(daily.ma50), //50日平均價
                    lotSize: parseInt(daily.lotSize), //每手股數
                    eps: parseFloat(daily.eps), //全年每股盈利(元)
                    dividend: parseFloat(daily.dividend), //全年每股派息(元)
                    rsi10: parseFloat(daily.rsi10), //10日RSI
                    rsi14: parseFloat(daily.rsi14), //14日RSI
                    rsi20: parseFloat(daily.rsi20), //20日RSI
                    pe: parseFloat(calculation.pe), //市盈率(倍)
                    marketValue: parseFloat(calculation.marketValue), //市值
                    issuedShare: parseFloat(daily.issuedShare), //發行股數
                    vol: parseFloat(real.vol), //成交量
                    tvr: parseFloat(real.tvr), //成交金額
                });
            })
            .catch((err) => {
                res.status(500).send({ error: err });
            });
    }
    get_stockNews(req, res, next) {
        if (!checkEmail(req.headers["email"])) {
            res.status(500).json({
                error: "please enter email！",
            });
            return;
        }
        let { todayHour, todayMinute, todaySecond } = getDayTime();
        let STOCK = req.params.stock;
        let promises = [];
        let promises2 = []; //for photo
        let settings = {
            method: "get",
            headers: _headers,
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
                                    headers: _headers,
                                };

                                let image = encode(rebuild_imgUrl, options);
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
        if (!checkEmail(req.headers["email"])) {
            res.status(500).json({
                error: "please enter email！",
            });
            return;
        }
        let { todayHour, todayMinute, todaySecond } = getDayTime();
        let STOCK = req.params.stock;
        let promises = [];
        let settings = {
            method: "get",
            headers: _headers,
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
