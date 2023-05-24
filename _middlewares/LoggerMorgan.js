const morgan = require("morgan");
const path = require("path");
const rfs = require("rotating-file-stream");

module.exports = function (req, res, next) {
  morgan.token("user_id", function getId(req) {
    return req.user_id || null;
  });
  if (process.env.NODE_ENV == "production") {
    const accessLogStream = rfs.createStream("access.log", {
      interval: "10d", // rotate every 10 days
      size: "5M", // rotates the file when size exceeds 5 MegaBytes
      path: path.join(__dirname, "../logs/access"),
    });
    return morgan(
      ':user_id :remote-addr - :remote-user [:date[clf]] ":method :url HTTP/:http-version" :status :response-time ms :res[content-length] ":referrer" ":user-agent"',
      {
        stream: accessLogStream,
      }
    );
  } else {
    return morgan(
      ":user_id :method :url :status :response-time ms - :res[content-length]"
    ); //log to console on development
  }
};
