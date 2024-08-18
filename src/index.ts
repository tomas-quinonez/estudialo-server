import * as dotenv from "dotenv";
import express from "express";
import cors from "cors";
import helmet from "helmet";
import { AppDataSource } from "./data-source";
import { error } from "console";
import { routes } from './routes';

dotenv.config();

if (!process.env.PORT) {
    process.exit(1);
}

const PORT: number = parseInt(process.env.PORT as string, 10);

AppDataSource.initialize()
    .then(() => {
        console.log('Data Source has been initialized!');
    })
    .catch((error) => console.log(error));

const app = express();

app.use(helmet());
app.use(cors());
app.use(express.json());


/*app.get('/', (req: Request, res: Response) => {
    res.send('Hello, TypeScript Express!');
});*/

// routes
app.use('/api', routes);

app.listen(PORT, () => {
    console.log(`Listening on port ${PORT}`);
});
