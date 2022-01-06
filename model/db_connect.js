var MongoClient = require("mongodb").MongoClient;
const mongourl =
  "mongodb+srv://rockie2695:26762714Rockie@cluster-test-cw81o.gcp.mongodb.net/test?retryWrites=true";
const mongoConectClient = new MongoClient(mongourl, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});
mongoConectClient.connect((err) => {
  if (err) {
    console.log(err);
    res.send({ error: err });
  } else {
    console.log("hey connect");
    if (/*interval === null*/ true) {
      //deleteNoUse();
      //startServer();
      console.log("start run");
    }
  }
});
module.exports = mongoConectClient.db("rockie2695_mongodb");
