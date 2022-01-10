var express = require("express");
var path = require("path");
var cookieParser = require("cookie-parser");
var logger = require("morgan");
var compression = require("compression");
var helmet = require("helmet");
var cors = require("cors");
var db = require("./model/db_connect");
const Common = require("./common/common");

//var findRouter = require("./routes/find");
//var selectRouter = require("./routes/select");
//var deleteRouter = require("./routes/delete");
//var updateRouter = require("./routes/update");
var dialogServiceRouter = require("./routes/dialogServiceRouter");
var stockNotifyRouter = require("./routes/stockNotifyRouter");
var stockPriceRouter = require("./routes/stockPriceRouter");

var app = express();
app.use(logger("dev"));
app.use(helmet());
app.use(compression());
app.use(cors({ origin: Common.allowedDomains })); // Use this after the variable declaration
app.use(express.json()); // 解析 application/json
app.use(express.urlencoded({ extended: false })); // 解析 application/x-www-form-urlencoded
app.use(cookieParser());
app.use(express.static(path.join(__dirname, "public")));

//app.use("/find", findRouter);
//app.use("/select", selectRouter);
//app.use("/update", updateRouter);
//app.use("/delete", deleteRouter);

app.use("/dialogService", dialogServiceRouter);
app.use("/stockNotify", stockNotifyRouter);
app.use("/stockPrice", stockPriceRouter);

app.get("/", function (req, res) {
  /*if (interval === null) {
    time = {};
    startServer();
  }*/
  res.send("ok");
});

app.all(/.*/, function (req, res) {
  res
    .status(404)
    .send({ method: req.method, result: req.url + " Not Supported" });
});

module.exports = app;
