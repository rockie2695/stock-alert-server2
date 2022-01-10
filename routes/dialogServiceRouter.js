var express = require("express");
var router = express.Router();

/* GET home page. */
router.get("/", function (req, res, next) {
    res.render("index", { title: "Express" });
});

const DialogService_controller = require("../controllers/dialogService_controller").default;
const dialogService_controller = new DialogService_controller();

router.get("/stockName/:stock", dialogService_controller.get_stockName);
router.get("/stockNews/:stock", dialogService_controller.get_stockNews);
router.get("/stockDailyPrice/:stock", dialogService_controller.get_stockDailyPrice);

module.exports = router;
