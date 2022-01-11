const deleteOne_stock_notify_model = require("../../model/stock_notify/deleteOne_stock_notify_model");
const Common = require("../../common/common");
const { ObjectId } = require("mongodb");
const bulkWrite_each_stock_model = require("../../model/each_stock/bulkWrite_each_stock_model");

module.exports = class delete_controller {
  delete_stock_notify(req, res, next) {
    if (typeof req.body.stock === "undefined") {
      res.status(500).json({
        error: "empty body !",
      });
      return;
    }
    let _id = req.params._id;
    let stock = req.body.stock;
    let delete_notify = deleteOne_stock_notify_model({ _id: ObjectId(_id) });
    delete_notify
      .then(function (result) {
        if (result.deletedCount <= 0) {
          res.status(500).json({ error: "delete error" });
          return;
        }
      })
      .then(function () {
        let promises = [];
        promises.push({
          updateOne: {
            filter: {
              stock: stock,
            },
            update: {
              $inc: {
                people: -1,
              },
            },
          },
        });
        return bulkWrite_each_stock_model(promises);
      })
      .then(function (result) {
        res.status(204).json({ _id: _id, ok: true });
      })
      .catch((err) => {
        console.error(err);
        res.status(500).json({ error: "server error" });
      });
  }
};
