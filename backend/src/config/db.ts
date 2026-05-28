// backend/src/config/db.ts
import { Sequelize } from "sequelize";

const DB_HOST = process.env.DB_HOST || "db";
const DB_PORT = Number(process.env.DB_PORT || 3306);
const DB_NAME = process.env.DB_NAME || "ascaledin_db";
const DB_USER = process.env.DB_USER || "ascaledin_user";
const DB_PASSWORD = process.env.DB_PASSWORD || "ascaledin_pass";

export const sequelize = new Sequelize(DB_NAME, DB_USER, DB_PASSWORD, {
  host: DB_HOST,
  port: DB_PORT,
  dialect: "mysql",
  logging: false,
});