var express = require("express");
var path = require("path");
var cookieParser = require("cookie-parser");
var logger = require("morgan");
var compression = require("compression");
var helmet = require("helmet");
var cors = require("cors");
var db = require("./model/db_connect");
const Common = require("./common/common");
const fetch = require("node-fetch");

var dialogServiceRouter = require("./routes/dialogServiceRouter");
var stockNotifyRouter = require("./routes/stockNotifyRouter");
var stockPriceRouter = require("./routes/stockPriceRouter");
var stockNameRouter = require("./routes/stockNameRouter");

var dotenv = require("dotenv");
dotenv.config();

var app = express();
app.use(logger("dev"));
app.use(helmet());
app.use(compression());
app.use(cors({ origin: Common.allowedDomains })); // Use this after the variable declaration
app.use(express.json()); // 解析 application/json
app.use(express.urlencoded({ extended: false })); // 解析 application/x-www-form-urlencoded
app.use(cookieParser());
app.use(express.static(path.join(__dirname, "public")));

app.get("/", function (req, res) {
  /*if (interval === null) {
    time = {};
    startServer();
  }*/
  res.send("ok");
});

app.use(function (req, res, next) {
  /*if (!Common.checkEmail(req.headers["email"])) {
    res.status(401).json({
      error: "please enter email！",
    });
    return;
  }*/

  if (process.env.NODE_ENV === 'production') {
    let settings = {
      method: "get",
      headers: Common.headers,
    };
    let url = `https://www.googleapis.com/oauth2/v3/tokeninfo?id_token=${req.headers["Authorization"]}`
    console.log(url)
    fetch(url, settings)
      .then((res) => res.json())
      .then((res) => {
        console.log(res)
        // do something with JSON
        if (res.azp === "56496239522-mgnu8mmkmt1r8u9op32b0ik8n7b625pd.apps.googleusercontent.com" ||
          res.azp === "637550083168-0aqnadjb5ealolonvioba828rki4dhlo.apps.googleusercontent.com") {
          next();
        } else {
          res.status(401).json({
            error: "please login first！",
          });
          return;
        }
      })
      .catch((err) => {
        res.status(500).json({
          error: "login checking error！",
        });
        return;
      })
    //56496239522-mgnu8mmkmt1r8u9op32b0ik8n7b625pd.apps.googleusercontent.com //rockie-stockalertclient.herokuapp.com
    //637550083168-0aqnadjb5ealolonvioba828rki4dhlo.apps.googleusercontent.com//trusting-austin-bb7eb7.netlify.app
  } else {
    next();
  }

});

app.use("/dialogService", dialogServiceRouter);
app.use("/stockNotify", stockNotifyRouter);
app.use("/stockPrice", stockPriceRouter);
app.use("/stockName", stockNameRouter);



app.all(/.*/, function (req, res) {
  res
    .status(404)
    .send({ method: req.method, result: req.url + " Not Supported" });
});

module.exports = app;
