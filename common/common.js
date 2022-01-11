var validator = require("email-validator");

module.exports = {
  getDayTime: function () {
    let today = new Date().toLocaleString("en-US", {
      timeZone: "Asia/Hong_Kong",
    });
    today = new Date(today);
    const todayHour = today.getHours();
    const todayMinute = today.getMinutes();
    const todayDay = today.getDay(); //todayDay=0(sunday),1,2,3,4,5,6
    const todaySecond = today.getSeconds();
    const returnObj = {
      todayHour: todayHour,
      todayMinute: todayMinute,
      todayDay: todayDay,
      todaySecond: todaySecond,
      today: today,
    };
    return returnObj;
  },
  checkEmail: function (email) {
    return validator.validate(email);
  },
  headers: {
    "user-agent":
      "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/51.0.2704.103 Safari/537.36",
    "content-type": "application/json",
  },
  allowedDomains: [
    "http://localhost:3000",
    "https://rockie-stockalertclient.herokuapp.com",
    "https://trusting-austin-bb7eb7.netlify.app"
  ],
};
