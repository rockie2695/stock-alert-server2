var express = require("express");
var router = express.Router();

const StockPrice_controller = require("../controllers/stockPrice_controller");
const stockPrice_controller = new StockPrice_controller();

router.get("/:stock", stockPrice_controller.get_stock_price);
router.get("/all/:stock", stockPrice_controller.get_stock_all_price);

module.exports = router;
