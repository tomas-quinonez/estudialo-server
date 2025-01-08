import { createLogger, format, transports } from "winston";
import "winston-daily-rotate-file";

const errorFilter = format((info, opts) => {
  return info.level === "error" ? info : false;
});

const infoFilter = format((info, opts) => {
  return info.level === "info" ? info : false;
});

const httpFilter = format((info, opts) => {
  return info.level === "http" ? info : false;
});

const logger = createLogger({
  level: "http",
  format: format.combine(
    format.timestamp(),
    format.json(),
    format.errors({ stack: true })
  ),
  transports: [
    new transports.Console({
      format: format.combine(
        format.colorize({ all: true }),
        format.timestamp({ format: "YYYY-MM-DD HH:MM:SS" }),
        format.printf((info: any) => {
          return `[${info.timestamp}] ${info.level}: ${info.message} stack: ${info.stack}`;
        })
      ),
    }),
    new transports.File({
      dirname: "logs",
      filename: "info.log",
      level: "info",
      format: format.combine(
        infoFilter(),
        format.timestamp({ format: "YYYY-MM-DD HH:MM:SS" }),
        format.json()
      ),
    }),
    new transports.File({
      dirname: "logs",
      filename: "error.log",
      level: "error",
      format: format.combine(
        errorFilter(),
        format.timestamp({ format: "YYYY-MM-DD HH:MM:SS" }),
        format.json()
      ),
    }),
    new transports.DailyRotateFile({
      dirname: "logs",
      filename: "%DATE%_http.log",
      datePattern: "YYYY-w",
      maxFiles: "60d",
      maxSize: "2m",
      level: "http",
      format: format.combine(
        httpFilter(),
        format.timestamp({ format: "YYYY-MM-DD HH:MM:SS" }),
        format.json()
      ),
    }),
  ],
});

export default logger;
