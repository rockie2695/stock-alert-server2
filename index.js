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

const test = false;
let time = {};

const intervalWaitForMongo = setInterval(async () => {
  try {
    await db.admin().ping();
    //startServer function
    deleteNoUse();
    startServer();
    clearInterval(intervalWaitForMongo);
  } catch (e) {
    //wait for mongodb connect
    console.log("MongoNotConnectedError", e);
  }
}, 500);

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

  if (process.env.NODE_ENV === "production") {
    let settings = {
      method: "get",
      headers: Common.headers,
    };
    let url = `https://www.googleapis.com/oauth2/v3/tokeninfo?id_token=${req.headers["authorization"]}`;
    fetch(url, settings)
      .then((res) => res.json())
      .then((res) => {
        // do something with JSON
        if (
          res.azp ===
            "56496239522-mgnu8mmkmt1r8u9op32b0ik8n7b625pd.apps.googleusercontent.com" ||
          res.azp ===
            "637550083168-0aqnadjb5ealolonvioba828rki4dhlo.apps.googleusercontent.com"
        ) {
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
      });
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

const headers = {
  "user-agent":
    "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/51.0.2704.103 Safari/537.36",
  "content-type": "application/json",
};

function checkEmail(email) {
  return validator.validate(email);
}
function getDayTime() {
  let today = new Date().toLocaleString("en-US", {
    timeZone: "Asia/Hong_Kong",
  });
  today = new Date(today);
  let todayHour = today.getHours();
  let todayMinute = today.getMinutes();
  let todayDay = today.getDay(); //todayDay=0(sunday),1,2,3,4,5,6
  let todaySecond = today.getSeconds();
  let returnObj = {
    todayHour: todayHour,
    todayMinute: todayMinute,
    todayDay: todayDay,
    todaySecond: todaySecond,
    today: today,
  };
  return returnObj;
}
function deleteNoUse() {
  let { today } = getDayTime();
  let collection = db.collection("stockAlert_" + "stockPrice");
  today.setDate(today.getDate() - 8);
  collection.deleteMany({ time: { $lt: today } });
  let collection2 = db.collection("stockAlert_" + "eachStock");
  collection2.deleteMany({ people: { $lt: 1 } });
}
function startServer() {
  let stockPriceInsert = [];
  //open in 9:30-12:05,1:00-4:08
  interval = setInterval(
    function () {
      let { todayHour, todayMinute, todayDay, today, todaySecond } =
        getDayTime();
      if (test || (todayDay !== 6 && todayDay !== 0)) {
        if (
          test === false &&
          (todayHour < 9 ||
            (todayHour === 9 && todayMinute < 20) ||
            (todayHour >= 16 && todayMinute > 1) ||
            todayHour > 16)
        ) {
          //do nothing
        } else if (test === false && todayHour === 12 && todayMinute >= 07) {
          //do nothing
        } else {
          //get ajax
          let collection = db.collection("stockAlert_" + "eachStock");
          let findstock = new Promise(function (resolve, reject) {
            findRecord(
              collection,
              { people: { $gt: 0 } },
              {},
              function (err, result) {
                if (err) {
                  reject(err);
                } else {
                  resolve(result);
                }
              }
            );
          });
          findstock
            .then(function (result) {
              let promises = [];
              //to get all stock
              //https://money18.on.cc/securityQuote/genStockJSONHKWithDelay.php?stockcode=1,10,8&t=20201910143020
              for (let i = 0; i < result.length; i++) {
                if (result[i].stock !== "") {
                  //let url = `https://money18.on.cc/js/real/hk/quote/${result[i].stock}_r.js?time=${todayHour}${todayMinute}${todaySecond}`;
                  let url = `https://realtime-money18-cdn.on.cc/securityQuote/genStockDetailHKJSON.php?stockcode=${result[i].stock}&time=${todayHour}${todayMinute}${todaySecond}`;
                  console.log(url);
                  let settings = {
                    method: "Get",
                    follow: 0,
                    headers: headers,
                  };
                  promises.push(
                    fetch(url, settings)
                      .then((res) => res.text())
                      .then((res) =>
                        res
                          .replace(/\r\n/g, "")
                          .replace(/\t/g, "")
                          .replace(/\'/g, '"')
                      )
                      //.then((res) => res.substring(14))
                      //.then((res) => res.substring(0, res.length - 1))
                      .then((res) => JSON.parse(res))
                      .then((res) => {
                        // do something with JSON
                        return { ...res, stock: result[i].stock };
                      })
                      .catch((err) => console.error(err))
                  );
                }
              }
              return new Promise(function (resolve, reject) {
                Promise.all(promises)
                  .then(function (result) {
                    resolve(result);
                  })
                  .catch(function (error) {
                    console.log(error);
                    reject(error);
                  });
              });
            })
            .then(function (result) {
              stockPriceInsert = [];
              for (let i = 0; i < result.length; i++) {
                if (result[i]?.real?.ltt) {
                  let rowDate = new Date(result[i].real.ltt);
                  if (
                    test ||
                    (rowDate.getDate() === today.getDate() &&
                      rowDate.getMonth() === today.getMonth() &&
                      rowDate.getFullYear() === today.getFullYear())
                  ) {
                    console.log("here 1");
                    if (
                      typeof time[result[i].stock] === "undefined" ||
                      (typeof time[result[i].stock] !== "undefined" &&
                        time[result[i].stock] !== result[i].real.ltt)
                    ) {
                      console.log("here 2");
                      console.log(global.io);
                      global.io.sockets.in(result[i].stock).emit("stockPrice", {
                        stock: result[i].stock,
                        price: parseFloat(result[i].real.np),
                        time: result[i].real.ltt,
                        high: parseFloat(result[i].real.dyh),
                        low: parseFloat(result[i].real.dyl),
                      });
                      stockPriceInsert.push({
                        stock: result[i].stock,
                        time: rowDate,
                        price: parseFloat(result[i].real.np),
                        stringTime: result[i].real.ltt,
                        high: parseFloat(result[i].real.dyh),
                        low: parseFloat(result[i].real.dyl),
                      });
                      time[result[i].stock] = result[i].real.ltt;
                    }
                  }
                }
              }
              console.log(stockPriceInsert.length);
              if (stockPriceInsert.length !== 0) {
                var insert_stock = function (query) {
                  let collection = db.collection("stockAlert_" + "stockPrice");
                  return new Promise(function (resolve, reject) {
                    insertManyRecord(collection, query, function (err, result) {
                      if (err) {
                        console.log(err);
                        reject(err);
                      } else {
                        resolve(result);
                      }
                      return;
                    });
                  });
                };
                return insert_stock(stockPriceInsert);
              }
            })
            .then(function (result) {
              if (stockPriceInsert.length !== 0) {
                // get notification and subscription
                let promises = [];
                let collection = db.collection("stockAlert_" + "stockNotify");
                promises.push(
                  new Promise(function (resolve, reject) {
                    findRecord(
                      collection,
                      { alert: true },
                      {},
                      function (err, result) {
                        if (err) {
                          console.log(err);
                          reject(err);
                        } else {
                          resolve(result);
                        }
                      }
                    );
                  })
                );
                let collection2 = db.collection("stockAlert_" + "subscription");
                promises.push(
                  new Promise(function (resolve, reject) {
                    findRecord(collection2, {}, {}, function (err, result) {
                      if (err) {
                        console.log(err);
                        reject(err);
                      } else {
                        resolve(result);
                      }
                    });
                  })
                );
                return new Promise(function (resolve, reject) {
                  Promise.all(promises)
                    .then(function (result) {
                      resolve(result);
                    })
                    .catch(function (error) {
                      console.log(error);
                      reject(error);
                    });
                });
              }
            })
            .then(function (result) {
              let update_notify = function (query) {
                let collection = db.collection("stockAlert_" + "stockNotify");
                return new Promise(function (resolve, reject) {
                  updateRecordMulti(collection, query, function (err, result) {
                    if (err) {
                      reject(err);
                    } else {
                      resolve(result);
                    }
                    return;
                  });
                });
              };
              if (
                typeof result !== "undefined" &&
                (test || (test === false && app?.settings?.port !== 3001))
              ) {
                let stockNotifyArray = result[0];
                let alertSubscription = result[1];
                if (
                  stockPriceInsert.length !== 0 &&
                  typeof stockNotifyArray !== "undefined" &&
                  stockNotifyArray.length !== 0
                ) {
                  let query = [];
                  for (let i = 0; i < stockPriceInsert.length; i++) {
                    //find same stock in result
                    let j;
                    for (j = 0; j < stockNotifyArray.length; j++) {
                      if (
                        stockNotifyArray[j].stock === stockPriceInsert[i].stock
                      ) {
                        if (
                          typeof j !== "undefined" &&
                          j != stockNotifyArray.length
                        ) {
                          let isNotify = false;
                          if (stockNotifyArray[j].equal === ">=") {
                            if (
                              parseFloat(stockPriceInsert[i].price) >=
                              parseFloat(stockNotifyArray[j].price)
                            ) {
                              isNotify = true;
                            }
                          } else if (stockNotifyArray[j].equal === "<=") {
                            if (
                              parseFloat(stockPriceInsert[i].price) <=
                              parseFloat(stockNotifyArray[j].price)
                            ) {
                              isNotify = true;
                            }
                          }
                          if (
                            isNotify === true &&
                            checkEmail(stockNotifyArray[j].email)
                          ) {
                            //send notification and email
                            var transporter = nodemailer.createTransport({
                              service: "Gmail",
                              auth: {
                                user: "rockie2695@gmail.com",
                                pass: "hgyjjddozhaomlzt",
                              },
                            });

                            var mailOptions = {
                              from: '"Stock Alert" <rockie2695@gmail.com>',
                              to: stockNotifyArray[j].email,
                              subject: "Notify stock price",
                              html: `Stock <b>${stockNotifyArray[j].stock}</b> :<br />Now Price ${stockPriceInsert[i].price} is ${stockNotifyArray[j].equal} than your Alert Price ${stockNotifyArray[j].price}`,
                            };
                            //update
                            let row = {
                              updateOne: {
                                filter: {
                                  _id: ObjectId(stockNotifyArray[j]._id),
                                },
                                update: {
                                  $set: {
                                    alert: false,
                                  },
                                },
                              },
                            };
                            query.push(row);
                            transporter.sendMail(
                              mailOptions,
                              function (error, info) {
                                if (error) {
                                  console.log(error);
                                } else {
                                  global.io.sockets
                                    .in(stockNotifyArray[j].email)
                                    .emit("changeAlert", {
                                      stock: stockNotifyArray[j].stock,
                                      _id: stockNotifyArray[j]._id,
                                      alert: false,
                                    });
                                }
                              }
                            );
                            const payload = JSON.stringify({
                              title: "Notify Stock Price",
                              body: `Stock ${stockNotifyArray[j].stock}: Now Price ${stockPriceInsert[i].price} is ${stockNotifyArray[j].equal} than your Alert Price ${stockNotifyArray[j].price}`,
                              icon: "https://rockie-stockalertclient.herokuapp.com/logo512.png",
                              badge:
                                "https://rockie-stockalertclient.herokuapp.com/favicon-32x32.png",
                              url: "https://rockie-stockalertclient.herokuapp.com",
                            });
                            for (let i = 0; i < alertSubscription.length; i++) {
                              if (
                                alertSubscription[i].email ===
                                stockNotifyArray[j].email
                              ) {
                                webpush
                                  .sendNotification(
                                    alertSubscription[i].subscription,
                                    payload
                                  )
                                  .catch((e) => {
                                    console.log(e.stack);
                                    unsubscription(
                                      alertSubscription[i].subscription,
                                      alertSubscription[i].email
                                    );
                                  });
                              }
                            }
                          }
                          /*if (
                            i + 1 === stockPriceInsert.length &&
                            query.length !== 0
                          ) {
                            return update_notify(query);
                          }*/
                        }
                        if (query.length !== 0) {
                          return update_notify(query);
                        }
                      }
                    }
                  }
                }
              }
            })
            .catch(function (error) {
              console.log(error);
            });
        }
      } else {
        clearInterval(interval);
        interval = null;
      }
      //60*1000 is 1 mins
    },
    test ? 5 * 1000 : 30 * 1000
  );
}
app.post("/notifications/subscribe", (req, res) => {
  const subscription = req.body.subscription;
  const email = req.body.email;
  console.log("subscription here", subscription);
  if (checkEmail(email)) {
    //update
    let collection = db.collection("stockAlert_" + "subscription");
    let whereCondition = {
      count: true,
      "subscription.endpoint": subscription.endpoint,
    };
    var find = new Promise(function (resolve, reject) {
      findRecord(collection, whereCondition, {}, function (result) {
        resolve(result);
      });
    });
    find
      .then(function (result) {
        if (result == 0) {
          //insert
          var insert_subscription = function (query) {
            return new Promise(function (resolve, reject) {
              insertManyRecord(collection, query, function (err, result) {
                if (err) {
                  reject(err);
                } else {
                  resolve(result);
                }
                return;
              });
            });
          };
          return insert_subscription([
            {
              email: email,
              subscription: subscription,
            },
          ]);
        }
      })
      .then(function () {
        res.status(200).json({ success: true });
      })
      .catch(function (error) {
        console.log(error);
      });
  } else {
    res.send({ error: "Email not validate" });
  }
});

function unsubscription(subscription, email) {
  let collection = db.collection("stockAlert_" + "subscription");
  collection.deleteMany({
    "subscription.endpoint": subscription.endpoint,
    email: email,
  });
}

app.all(/.*/, function (req, res) {
  res
    .status(404)
    .send({ method: req.method, result: req.url + " Not Supported" });
});

function findRecord(collection = "", query = {}, filter = {}, callback) {
  let middleQuery = collection.find(query, filter);
  if (query.hasOwnProperty("count")) {
    delete query.count;
    callback(middleQuery.count());
  } else {
    if (query.hasOwnProperty("orderBy")) {
      let orderBy = query.orderBy;
      delete query.orderBy;
      middleQuery = middleQuery.sort(orderBy);
    }
    if (query.hasOwnProperty("limit")) {
      let limit = query.limit;
      delete query.limit;
      middleQuery = middleQuery.limit(limit);
    }

    middleQuery.toArray(function (err, result) {
      callback(err, result);
    });
  }
}
function insertManyRecord(collection = "", query = {}, callback) {
  collection.insertMany(query, function (err, result) {
    callback(err, result);
  });
}
function updateRecordMulti(collection = "", query = {}, callback) {
  collection.bulkWrite(query, function (err, result) {
    callback(err, result);
  });
}
function deleteRecord(collection = "", query = {}, callback) {
  collection.deleteOne(query, function (err, result) {
    callback(err, result);
  });
}

module.exports = app;
