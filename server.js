//zakarea erezzaghi 3074880
import express from "express";
import { MongoClient } from "mongodb";
import dotenv from "dotenv";
import { v4 as uuidv4 } from "uuid";
import multer from "multer";
import crypto from "crypto";

dotenv.config();

const app = express();
app.use(express.json());

const upload = multer({ storage: multer.memoryStorage() });

const client = new MongoClient(process.env.MONGO_URI);
let db;

// connect db
await client.connect();
db = client.db("cloud");

console.log("db conected...");

// login + make user
app.post("/login", async (req,res)=>{
  const { uid, email } = req.body;

  let user = await db.collection("users").findOne({_id:uid});

  if(!user){
    await db.collection("users").insertOne({
      _id: uid,
      email: email
    });

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

// create folder
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

// delete folder
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

// upload file
app.post("/upload", upload.single("file"), async (req,res)=>{
  const { userId, path } = req.body;
  const file = req.file;

  const hash = crypto.createHash("md5").update(file.buffer).digest("hex");

  await db.collection("files").insertOne({
    _id: uuidv4(),
    userId,
    filename: file.originalname,
    path,
    hash
  });

  res.send("uploaded");
});

// delete file
app.post("/delete-file", async (req,res)=>{
  await db.collection("files").deleteOne({_id:req.body.id});
  res.send("deleted");
});

app.listen(3000, () => console.log("server running"));