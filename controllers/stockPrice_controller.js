const find_stock_price_model = require("../../model/stock_price/find_stock_price_model");
const Common = require("../../common/common");

module.exports = class StockPrice_controller {
    get_stock_price(req, res, next) {
        if (!Common.checkEmail(req.headers["email"])) {
            res.status(500).json({
                error: "please enter email！",
            });
            return;
        }
        let STOCK = req.params.stock;
        let { todayHour, todayDay, today } = Common.getDayTime();
        let onlyToday = new Date(today.toDateString());
        let onlyNextDay = new Date(today.toDateString());
        if (todayDay === 0) {
            //Sunday
            onlyToday = new Date(onlyToday.setDate(onlyToday.getDate() - 2));
            onlyNextDay = new Date(onlyNextDay.setDate(onlyNextDay.getDate() - 1));
        } else if (todayDay === 6) {
            //saturday
            onlyToday = new Date(onlyToday.setDate(onlyToday.getDate() - 1));
        } else {
            if (todayHour < 9) {
                onlyToday = new Date(onlyToday.setDate(onlyToday.getDate() - 1));
            } else {
                onlyNextDay = new Date(onlyNextDay.setDate(onlyNextDay.getDate() + 1));
            }
        }
        onlyToday = new Date(onlyToday.setHours(8));
        onlyNextDay = new Date(onlyNextDay.setHours(8));
        find_stock_price_model(
            { time: { $lt: onlyNextDay, $gte: onlyToday }, stock: STOCK },
            { projection: { _id: 0 } }
        )
            .then(function (result) {
                res.status(200).json({ ok: result });
            })
            .catch(function (error) {
                console.log(error);
                res.status(500).json({ error: error });
            });
    }
    get_stock_all_price(req, res, next) {
        if (!Common.checkEmail(req.headers["email"])) {
            res.status(500).json({
                error: "please enter email！",
            });
            return;
        }
        let STOCK = req.params.stock;
        find_stock_price_model({ stock: STOCK }, { projection: { _id: 0 } })
            .then(function (result) {
                res.status(200).json({ ok: result });
            })
            .catch(function (error) {
                console.log(error);
                res.status(500).json({ error: error });
            });
    }
};
