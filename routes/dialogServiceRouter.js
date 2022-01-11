var express = require("express");
var router = express.Router();

const DialogService_controller = require("../controllers/dialogService_controller");
const dialogService_controller = new DialogService_controller();

router.get("/stockNews/:stock", dialogService_controller.get_stockNews);
router.get("/stockDailyPrice/:stock", dialogService_controller.get_stockDailyPrice);

module.exports = router;
