const log = require("../logger");

exports.index = async (req, res, next) => {
  try {
    res.status(200).send("<h2>XFUNdmate<h2>");
  } catch (error) {
    log.error(error);
    res.status(500).send("<h3>Internal Server Error<h3>");
  }
};

exports.test = async (req, res, next) => {
  try {
    return res
      .status(200)
      .send({ status: true, message: "From test open resource" });
  } catch (err) {
    if (err.details) {
      return res
        .status(400)
        .send({ status: false, message: err.details[0].message });
    } else {
      log.error(err);
      return res.status(500).send({
        status: false,
        message: err.message ? err.message : "Internal Server Error.",
      });
    }
  }
};

exports.protected = async (req, res, next) => {
  try {
    return res
      .status(200)
      .send({ status: true, message: "From protected resource" });
  } catch (err) {
    if (err.details) {
      return res
        .status(400)
        .send({ status: false, message: err.details[0].message });
    } else {
      log.error(err);
      return res.status(500).send({
        status: false,
        message: err.message ? err.message : "Internal Server Error.",
      });
    }
  }
};
