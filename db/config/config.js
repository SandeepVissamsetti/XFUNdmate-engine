const moment = require("moment-timezone");
module.exports = {
  dev: {
    username: "admin",
    password: "Qazujm4321",
    database: "xfundmate",
    host: "xfundmate.c3sgfid2hsnd.ap-south-1.rds.amazonaws.com",
    dialect: "mysql",
    dialectOptions: {
      connectTimeout: 60000,
    },
    logging: false,
    // dialectOptions: {
    //     typeCast: function (field, next) {// for reading from database
    //         // if (field.type == 'DATETIME' || field.type == 'TIMESTAMP') {
    //         //     return new Date(field.string() + 'Z');
    //         // }
    //         if (field.type == 'DATE') {
    //             return moment(field.string()).format("DD-MM-YYYY")
    //         }
    //         return next();
    //     }
    // },
    // timezone: "+09:30"
    // timezone: moment.tz(new Date(), "Australia/Adelaide").format("Z"),
    pool: {
      max: 1,
      min: 0,
      idle: 1000,
      acquire: 60000,
      evict: 1000,
    },
  },

  test: {
    username: process.env.DB_USERNAME,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_DATABASE,
    host: process.env.DB_HOST,
    dialect: process.env.DB_CONNECTION,
    dialectOptions: {
      connectTimeout: 60000,
    },
    logging: false,
    // dialectOptions: {
    //     typeCast: function (field, next) {// for reading from database
    //         // if (field.type == 'DATETIME' || field.type == 'TIMESTAMP') {
    //         //     return new Date(field.string() + 'Z');
    //         // }
    //         if (field.type == 'DATE') {
    //             return moment(field.string()).format("DD-MM-YYYY")
    //         }
    //         return next();
    //     }
    // },
    // timezone: "+09:30"
    // timezone: moment.tz(new Date(), "Australia/Adelaide").format("Z"),
    pool: {
      max: 1,
      min: 0,
      idle: 1000,
      acquire: 60000,
      evict: 1000,
    },
  },

  prod: {
    username: process.env.DB_USERNAME,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_DATABASE,
    host: process.env.DB_HOST,
    dialect: process.env.DB_CONNECTION,
    dialectOptions: {
      connectTimeout: 60000,
    },
    logging: false,
    // dialectOptions: {
    //     typeCast: function (field, next) {// for reading from database
    //         // if (field.type == 'DATETIME' || field.type == 'TIMESTAMP') {
    //         //     return new Date(field.string() + 'Z');
    //         // }
    //         if (field.type == 'DATE') {
    //             return moment(field.string()).format("DD-MM-YYYY")
    //         }
    //         return next();
    //     }
    // },
    // timezone: "+09:30"
    // timezone: moment.tz(new Date(), "Australia/Adelaide").format("Z"),
    pool: {
      max: 1,
      min: 0,
      idle: 1000,
      acquire: 60000,
      evict: 1000,
    },
  },
};
