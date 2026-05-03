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

// LOGIN ROUTE
app.post("/login", async (req,res)=>{
  const { uid, email } = req.body;

  let user = await db.collection("users").findOne({_id:uid});

  if(!user){
    await db.collection("users").insertOne({
      _id: uid,
      email: email
    });

    await db.collection("directories").insertOne({
      _id: "root-" + uid,
      userId: uid,
      name: "/",
      path: "/",
      parent: null
    });
  }

  res.send("ok");
});

app.listen(3000, () => console.log("server running"));