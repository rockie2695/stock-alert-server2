var express = require("express");
var router = express.Router();

const Delete_controller = require("../controllers/stock_notify/delete_controller");
const delete_controller = new Delete_controller();

router.delete("/stockNotify/:_id", delete_controller.delete_stock_notify);

module.exports = router;
