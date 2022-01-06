const db = require("../db_connect");

module.exports = function bulkWrite_stock_price_model(query) {
  return new Promise((resolve, reject) => {
    let collection = db.collection("stockAlert_stockNotify");
    collection.bulkWrite(query, (err, result) => {
      if (err) {
        reject(err);
        return;
      }
      resolve(result);
    });
  });
};
