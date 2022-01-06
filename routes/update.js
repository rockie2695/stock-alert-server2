var express = require("express");
var router = express.Router();

const Put_controller = require("../controllers/stock_notify/put_controller");
const put_controller = new Put_controller();

router.put("/stockNotify", put_controller.put_all_stock_notify);
router.put("/stockNotify/:_id/alert", put_controller.put_stock_notify_alert);

module.exports = router;
