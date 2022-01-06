var express = require("express");
var router = express.Router();

const Get_controller = require("../controllers/stock_price/get_controller");
const get_controller = new Get_controller();

router.get("/stockPrice/:stock", get_controller.get_stock_price);
router.get("/allStockPrice/:stock", get_controller.get_stock_all_price);

const Get_controller2 = require("../controllers/stock_notify/get_controller");
const get_controller2 = new Get_controller2();

router.get("/stockNotify", get_controller2.get_stock_notify);

module.exports = router;
