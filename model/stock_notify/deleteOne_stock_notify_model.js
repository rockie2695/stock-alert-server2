const db = require("../db_connect");

module.exports = function find_stock_price_model(query, filter) {
  return new Promise((resolve, reject) => {
    let collection = db.collection("stockAlert_stockNotify");
    collection.deleteOne(query, (err, result) => {
      if (err) {
        reject(err);
        return;
      }
      resolve(result);
    });
  });
};
