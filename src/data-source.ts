import "reflect-metadata";
import { DataSource } from "typeorm";
import { Category } from "./models/Category";
import { Level } from "./models/Level";

import * as dotenv from "dotenv";

dotenv.config();

const { DB_HOST, DB_PORT, DB_USERNAME, DB_PASSWORD, DB_DATABASE, NODE_ENV } =
    process.env;

export const AppDataSource = new DataSource({
    type: "postgres",
    host: DB_HOST,
    port: parseInt(DB_PORT || "5432"),
    username: DB_USERNAME,
    password: DB_PASSWORD,
    database: DB_DATABASE,

    synchronize: NODE_ENV === "dev" ? false : false,
    //logging logs sql command on the treminal
    logging: NODE_ENV === "dev" ? false : false,
    entities: [Category, Level],
    //migrations: [__dirname + "/migration/*.ts"],
    subscribers: [],
});