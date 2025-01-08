import morgan from "morgan";
import logger from "./logger";

const morganMiddleware = morgan(
  function (tokens, req, res) {
    return JSON.stringify({
      method: tokens.method(req, res),
      url: tokens.url(req, res),
      status: Number.parseFloat(tokens.status(req, res) ?? ""),
      response_time: Number.parseFloat(tokens["response-time"](req, res) ?? ""),
    });
  },
  {
    stream: {
      // Configure Morgan to use our custom logger with the http severity
      write: (message) => {
        const data = JSON.parse(message);
        logger.http(`Incoming request`, data);
      },
    },
  }
);

export default morganMiddleware;
