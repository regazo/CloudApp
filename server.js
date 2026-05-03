//zakarea erezzaghi 3074880
import express from "express";
import { MongoClient } from "mongodb";
import dotenv from "dotenv";
import { v4 as uuidv4 } from "uuid";

dotenv.config();

const app = express();
app.use(express.json());

const client = new MongoClient(process.env.MONGO_URI);
let db;

// connect db
await client.connect();
db = client.db("cloud");

console.log("db conected...");

// login + makeuser
app.post("/login", async (req,res)=>{
  const { uid, email } = req.body;

  let user = await db.collection("users").findOne({_id:uid});

  if(!user){
    await db.collection("users").insertOne({
      _id: uid,
      email: email
    });

    // make root folder
    await db.collection("directories").insertOne({
      _id: "root-"+uid,
      userId: uid,
      name: "/",
      path: "/",
      parent: null
    });
  }

  res.send("ok");
});

// creates the folder
app.post("/mkdir", async (req,res)=>{
  const {userId,name,path} = req.body;

  await db.collection("directories").insertOne({
    _id:uuidv4(),
    userId,
    name,
    path:path+name+"/",
    parent:path
  });

  res.send("dir made");
});

// delete folde
app.post("/rmdir", async (req,res)=>{
  const {path} = req.body;

  const f = await db.collection("files").findOne({path});
  const d = await db.collection("directories").findOne({parent:path});

  if(f || d){
    return res.send("not empty");
  }

  await db.collection("directories").deleteOne({path});
  res.send("deleted");
});

app.listen(3000, () => console.log("server running"));