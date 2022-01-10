var express = require("express");
var router = express.Router();

const DialogService_controller = require("../controllers/dialogService_controller");
const dialogService_controller = new DialogService_controller();

router.get("/stockNews/:stock", dialogService_controller.get_stockNews);
router.get("/stockDailyPrice/:stock", dialogService_controller.get_stockDailyPrice);

const Get_controller = require("../controllers/stock_price/get_controller");
const get_controller = new Get_controller();

router.get("/allStockPrice/:stock", get_controller.get_stock_all_price);

module.exports = router;
