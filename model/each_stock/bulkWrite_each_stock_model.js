const db = require("../db_connect");

module.exports = function bulkWrite_each_stock_model(query) {
  return new Promise((resolve, reject) => {
    let collection = db.collection("stockAlert_eachStock");
    collection.bulkWrite(query, (err, result) => {
      if (err) {
        reject(err);
        return;
      }
      resolve(result);
    });
  });
};
