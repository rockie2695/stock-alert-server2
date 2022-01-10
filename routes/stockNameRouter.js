var express = require("express");
var router = express.Router();

const StockName_controller = require("../controllers/stockName_controller");
const stockName_controller = new StockName_controller();

router.get("/:stock", stockName_controller.get_stockName);

module.exports = router;
