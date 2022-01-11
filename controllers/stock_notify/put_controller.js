const bulkWrite_stock_notify_model = require("../../model/stock_notify/bulkWrite_stock_notify_model");
const find_stock_notify_model = require("../../model/stock_notify/find_stock_notify_model");
const Common = require("../../common/common");
const bulkWrite_each_stock_model = require("../../model/each_stock/bulkWrite_each_stock_model");
const { ObjectId } = require("mongodb");

module.exports = class put_controller {
  put_all_stock_notify(req, res, next) {
    if (
      typeof req.body.update === "undefined" ||
      typeof req.body.insert === "undefined"
    ) {
      res.status(500).json({
        error: "empty body !",
      });
      return;
    }

    let query = [];
    let updateMessage = req.body.update;
    let insertMessage = req.body.insert;

    if (updateMessage.length !== 0) {
      for (let i = 0; i < updateMessage.length; i++) {
        console.log(i)
        if (
          updateMessage[i].stock !== "" &&
          parseInt(updateMessage[i].stock) || 0 !== 0 &&
          updateMessage[i].price !== ""
        ) {
          let row = {
            updateOne: {
              filter: {
                email: req.headers["email"],
                _id: ObjectId(updateMessage[i]._id),
              },
              update: {
                $set: {
                  stock: encodeURIComponent(updateMessage[i].stock),
                  price: parseFloat(updateMessage[i].price) || 0,
                  equal: updateMessage[i].equal,
                  alert: updateMessage[i].alert == true,
                },
              },
            },
          };
          query.push(row);
        }
      }
    }
    if (insertMessage.length !== 0) {
      for (let i = 0; i < insertMessage.length; i++) {
        if (
          insertMessage[i].stock !== "" &&
          parseInt(insertMessage[i].stock) || 0 !== 0 &&
          insertMessage[i].price !== ""
        ) {
          let row = {
            insertOne: {
              stock: encodeURIComponent(insertMessage[i].stock),
              price: parseFloat(insertMessage[i].price) || 0,
              equal: insertMessage[i].equal,
              alert: insertMessage[i].alert == true,
              email: req.headers["email"],
            },
          };
          query.push(row);
        }
      }
    }

    console.log(query)
    let update_notify = bulkWrite_stock_notify_model(query);

    if (query.length === 0) {
      res.status(500).json({
        error: "empty query !",
      });
      return;
    }
    update_notify
      .then(function (result) {
        let promises = [];
        for (let i = 0; i < updateMessage.length; i++) {
          if (
            updateMessage[i].oldStock !== updateMessage[i].stock &&
            updateMessage[i].stock !== "" &&
            parseInt(updateMessage[i].stock) !== 0 &&
            updateMessage[i].price !== ""
          ) {
            promises.push({
              updateOne: {
                filter: {
                  stock: updateMessage[i].oldStock,
                },
                update: {
                  $inc: {
                    people: -1,
                  },
                },
              },
            });
            promises.push({
              updateOne: {
                filter: {
                  stock: updateMessage[i].stock,
                },
                update: {
                  $inc: {
                    people: 1,
                  },
                },
                upsert: true,
              },
            });
          }
        }
        for (let i = 0; i < insertMessage.length; i++) {
          if (
            insertMessage[i].stock !== "" &&
            parseInt(insertMessage[i].stock) !== 0 &&
            insertMessage[i].price !== ""
          ) {
            promises.push({
              updateOne: {
                filter: {
                  stock: insertMessage[i].stock,
                },
                update: {
                  $inc: {
                    people: 1,
                  },
                },
                upsert: true,
              },
            });
          }
        }
        if (promises.length !== 0) {
          return bulkWrite_each_stock_model(promises);
        }
      })
      .then(function (result) {
        let whereCondition = { email: req.headers["email"] };
        return find_stock_notify_model(whereCondition, {});
      })
      .then(function (result) {
        res.status(200).json({ ok: result });
      })
      .catch(function (error) {
        console.log(error);
        res.status(500).json({ error: error });
      });
  }
  put_stock_notify_alert(req, res, next) {
    if (!Common.checkEmail(req.headers["email"])) {
      res.status(500).json({
        error: "please enter email！",
      });
      return;
    }
    if (typeof req.body.alert === "undefined") {
      res.status(500).json({
        error: "empty body",
      });
      return;
    }

    let whereCondition = {
      email: req.headers["email"],
      _id: ObjectId(req.params._id),
    };
    let isAlert = req.body.alert;
    let query = [];
    let row = {
      updateOne: {
        filter: whereCondition,
        update: {
          $set: {
            alert: isAlert,
          },
        },
      },
    };
    query.push(row);
    let update_notify = bulkWrite_stock_notify_model(query);

    if (query.length === 0) {
      res.status(500).json({ error: "empty query" });
      return;
    }
    update_notify
      .then(function (result) {
        res.status(201).json({ ok: result });
      })
      .catch(function (error) {
        console.log(error);
        res.status(500).json({ error: error });
      });
  }
};
