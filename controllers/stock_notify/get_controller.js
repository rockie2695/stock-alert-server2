const find_stock_notify_model = require("../../model/stock_notify/find_stock_notify_model");
const Common = require("../../common/common");

module.exports = class get_controller {
  async get_stock_notify(req, res, next) {
    try {
      const result = await find_stock_notify_model(
        { email: req.headers["email"] },
        {}
      );
      res.status(200).json({ ok: result });
    } catch (error) {
      console.log(error);
      res.status(500).json({ error: error.message });
    }

    /*find_stock_notify_model({ email: req.headers["email"] }, {})
      .then(function (result) {
        res.status(200).json({ ok: result });
      })
      .catch(function (error) {
        console.log(error);
        res.status(500).json({ error: error });
      });*/
  }
};
