var express = require("express");
var router = express.Router();

const Get_controller = require("../controllers/stock_notify/get_controller");
const get_controller = new Get_controller();

router.get("/", get_controller.get_stock_notify);

const Delete_controller = require("../controllers/stock_notify/delete_controller");
const delete_controller = new Delete_controller();

router.delete("/:_id", delete_controller.delete_stock_notify);

const Put_controller = require("../controllers/stock_notify/put_controller");
const put_controller = new Put_controller();

router.put("/", put_controller.put_all_stock_notify);
router.put("/:_id/alert", put_controller.put_stock_notify_alert);

module.exports = router;
