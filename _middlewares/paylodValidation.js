const log = require("../logger");

module.exports = function (schema, body) {
  return async (req, res, next) => {
    try {
      await schema.validateAsync(req.body);
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
    next();
  };
};
