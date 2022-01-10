var express = require("express");
var router = express.Router();

const Get_controller = require("../controllers/stock_price/get_controller");
const get_controller = new Get_controller();

router.get("/:stock", get_controller.get_stock_price);
router.get("/all/:stock", get_controller.get_stock_all_price);

router.get("/stockName/:stock", dialogService_controller.get_stockName);
module.exports = router;
