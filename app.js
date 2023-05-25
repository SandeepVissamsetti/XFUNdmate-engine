const createError = require("http-errors");
const express = require("express");
const logger = require("./logger");
const path = require("path");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const morgan = require("morgan");

const indexRouter = require("./routes/index");
const usersRouter = require("./routes/users");

const app = express();

// view engine setup
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "ejs");

app.use((req, res, next) => {
  return cors({
    origin: req.headers.origin,
    // credentials: true,
  })(req, res, next);
});

app.use(require("./_middlewares/LoggerMorgan")());
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, "public")));

app.use("/", indexRouter);
app.use("/users", usersRouter);
app.use("/fund", require("./routes/funds"));
app.use("/xrpl", require("./routes/xrpl"));

// catch 404 and forward to error handler
app.use(function (req, res, next) {
  next(createError(404, "Resource not found"));
});

// global error handler
app.use(require("./_middlewares/error-handler"));

module.exports = app;
