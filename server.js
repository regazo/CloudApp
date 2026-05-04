import express from "express"
import multer from "multer"
import fs from "fs"
import path from "path"
import mongoose from "mongoose"
import { fileURLToPath } from "url"

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const app = express()
app.use(express.json())
app.use(express.static("public"))

const upload = multer({ dest: "uploads/" })

mongoose.connect("mongodb://zmbame11_db_user:11223344@ac-07nbr9g-shard-00-00.wzyfr0z.mongodb.net:27017,ac-07nbr9g-shard-00-01.wzyfr0z.mongodb.net:27017,ac-07nbr9g-shard-00-02.wzyfr0z.mongodb.net:27017/cloudapp?ssl=true&replicaSet=atlas-2ad74z-shard-0&authSource=admin&retryWrites=true&w=majority")
.then(()=>console.log("mongo connected"))
.catch(err=>console.log(err))

const User = mongoose.model("User", new mongoose.Schema({ uid:String }))

if (!fs.existsSync("uploads")) fs.mkdirSync("uploads")

function userDir(user){
    return path.join("uploads", user)
}

app.post("/user", async (req,res)=>{
    const { uid } = req.body
    let u = await User.findOne({ uid })
    if(!u) await new User({uid}).save()
    res.json({msg:"ok"})
})

app.get("/files",(req,res)=>{
    const { user } = req.query
    const dir = userDir(user)

    if(!fs.existsSync(dir)) return res.json([])

    const items = fs.readdirSync(dir)

    const result = items.map(name=>{
        const stat = fs.statSync(path.join(dir,name))
        return { name, size: stat.size }
    })

    res.json(result)
})

app.post("/mkdir",(req,res)=>{
    const { user,name } = req.body
    const dir = path.join(userDir(user),name)

    if(fs.existsSync(dir)) return res.json({msg:"exists"})

    fs.mkdirSync(dir,{recursive:true})
    res.json({msg:"created"})
})

app.delete("/delete",(req,res)=>{
    const { user,name } = req.body
    const file = path.join(userDir(user),name)

    if(!fs.existsSync(file)) return res.json({msg:"not found"})

    fs.rmSync(file)
    res.json({msg:"deleted"})
})

app.post("/upload", upload.single("file"), (req,res)=>{
    const { user, overwrite } = req.body

    const dir = userDir(user)
    if(!fs.existsSync(dir)) fs.mkdirSync(dir)

    const dest = path.join(dir, req.file.originalname)

    if(fs.existsSync(dest) && overwrite !== "true"){
        fs.unlinkSync(req.file.path)
        return res.json({msg:"duplicate"})
    }

    fs.renameSync(req.file.path, dest)
    res.json({msg:"uploaded"})
})

app.get("/download",(req,res)=>{
    const { user,name } = req.query
    const file = path.join(userDir(user),name)

    if(fs.existsSync(file)){
        return res.download(file)
    }

    res.json({msg:"not found"})
})

app.listen(3000,()=>console.log("server running"))