import * as dotenv from "dotenv";
import express from "express";
import cors from "cors";
import helmet from "helmet";
import logger from "./middlewares/logger";
import morganMiddleware from "./middlewares/morgan";
import { AppDataSource } from "./data-source";
import { routes } from "./routes";
import errorHandler, { APIError } from "./middlewares/errorHandling";

dotenv.config();

if (!process.env.PORT) {
  process.exit(1);
}

const PORT: number = parseInt(process.env.PORT as string, 10);

AppDataSource.initialize()
  .then(() => logger.info("Data Source ha sido inicializado!"))
  .catch((error) => logger.error(new APIError(error.message, 500)));

const app = express();

app.use(helmet());
app.use(morganMiddleware);
app.use(cors());
app.use(express.json());

/*app.get('/', (req: Request, res: Response) => {
    res.send('Hello, TypeScript Express!');
});*/

// routes
app.use("/api", routes);

app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`Listening on port ${PORT}`);
});
