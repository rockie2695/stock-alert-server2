const Common = require("../common/common");
const fetch = require("node-fetch");

module.exports = class StockName_controller {
  async get_stockName(req, res, next) {
    let { todayHour, todayMinute, todaySecond } = Common.getDayTime();
    let STOCK = req.params.stock;
    //let promises = [];
    let settings = {
      method: "get",
      headers: Common.headers,
    };

    let url = `http://realtime-money18-cdn.on.cc/securityQuote/genStockDetailHKJSON.php?stockcode=${STOCK}&time=${todayHour}${todayMinute}${todaySecond}`;
    /*promises.push(
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
    );*/
    try {
      const result = await fetch(url, settings);
      const stockDetail = await result.json();
      let { shortPut, real, daily, calculation } = stockDetail;
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
    } catch (error) {
      console.log(error);
      res.status(500).send({ error: error.message });
    }
    /*Promise.all(promises)
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
      });*/
  }
};
