var express = require("express");
var router = express.Router();

/* GET home page. */
router.get("/", function (req, res, next) {
  res.render("index", { title: "Express" });
});

const Find_controller = require("../controllers/find_controller");
const find_controller = new Find_controller();

router.get("/stockName/:stock", find_controller.get_stockName);
router.get("/stockNews/:stock", find_controller.get_stockNews);
router.get("/stockDailyPrice/:stock", find_controller.get_stockDailyPrice);

/**

 */
module.exports = router;
