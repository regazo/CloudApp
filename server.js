import express from "express";
import { MongoClient } from "mongodb";
import dotenv from "dotenv";

dotenv.config();

const app = express();
app.use(express.json());

const client = new MongoClient(process.env.MONGO_URI);
let db;

await client.connect();
db = client.db("cloud");

console.log("db conected...");

app.listen(3000, () => console.log("server running"));