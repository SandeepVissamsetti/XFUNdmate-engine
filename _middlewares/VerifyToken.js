// const ConfigSchema = require("../db/models").configs;
const Users = require("../db/models").users;
const FirebaseAdmin = require("../helpers/FirebaseConfig");

module.exports = async (req, res, next) => {
  try {
    let token = req.headers["token"];
    if (!token) {
      res.status(401);
      throw { message: "Error! Unauthorized" };
    }
    const decodeValue = await FirebaseAdmin.auth().verifyIdToken(token);
    if (decodeValue && decodeValue.email) {
      let user = await Users.findOne({
        where: { email: decodeValue.email },
        raw: true,
        attributes: { exclude: ["token"] },
      });
      if (!user) {
        res.status(401);
        throw { message: "Error! User not found" };
      }
      req.auth_user = user;
      let config = await ConfigSchema.findOne({
        where: { user_id: user.id },
        raw: true,
      });
      if (config) {
        req.server_config = config;
        process.env.XRPL_WS_CLIENT_ADDRESS = config.url;
      }
      next();
    }
  } catch (err) {
    if (err.message && err.message.includes("Firebase")) {
      err.message = "Invalid Token";
    }
    return res.status(401).send({
      status: false,
      auth: false,
      message: err.message ? err.message : "Internal Server Error.",
    });
  }
};
