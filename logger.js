const winston = require("winston");
const path = require("path");
require("winston-daily-rotate-file");

const { timestamp, colorize, combine, printf, errors } = winston.format;

const logFormat = printf(({ level, message, label, timestamp, stack }) => {
  return `${timestamp} [${level}] ${stack || message}`;
});

winston.addColors({
  error: "red",
  warn: "yellow",
  info: "cyan",
  verbose: "magenta",
  debug: "green",
});

const logger = winston.createLogger({
  level: "info",
  format: combine(
    timestamp({ format: "YYYY-MM-DD HH:mm:ss" }),
    errors({ stack: true }),
    logFormat
  ),
  transports: [
    new winston.transports.Console({
      level: "info",
      colorize: true,
      stderrLevels: ["error"],
      format: combine(colorize(), logFormat),
    }),
    new winston.transports.DailyRotateFile({
      filename: path.join(__dirname, "logs", "error", "error-%DATE%.log"),
      datePattern: "YYYY-MM-DD",
      zippedArchive: true,
      maxSize: "5m",
      maxFiles: "10d",
      level: "error",
    }),
  ],
});

if (process.env.NODE_ENV == "production") {
  logger.transports[0].silent = true;
}

module.exports = logger;
