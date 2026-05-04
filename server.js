//zakarea erezzaghi 3074880
import express from "express"
import multer from "multer"
import fs from "fs"
import path from "path"
import { fileURLToPath } from "url"

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const app = express()
app.use(express.json())
app.use(express.static("public"))

const upload = multer({ dest: "uploads/" })

// make uploads folder
if (!fs.existsSync("uploads")) {
    fs.mkdirSync("uploads")
}

// ===== USERS =====
const usersFile = "users.json"

if (!fs.existsSync(usersFile)) {
    fs.writeFileSync(usersFile, JSON.stringify([]))
}

// register
app.post("/register", (req,res)=>{
    const { username, password } = req.body

    if(!username || !password){
        return res.json({msg:"missing fields"})
    }

    const users = JSON.parse(fs.readFileSync(usersFile))

    if(users.find(u=>u.username===username)){
        return res.json({msg:"user exists"})
    }

    users.push({username,password})
    fs.writeFileSync(usersFile, JSON.stringify(users))

    res.json({msg:"registered"})
})

// login
app.post("/login", (req,res)=>{
    const { username, password } = req.body

    const users = JSON.parse(fs.readFileSync(usersFile))
    const user = users.find(u=>u.username===username && u.password===password)

    if(user){
        return res.json({msg:"login ok"})
    }

    res.json({msg:"invalid"})
})

// ===== FOLDER =====
app.post("/mkdir", (req,res)=>{
    const { name } = req.body
    const dir = path.join("uploads", name)

    if(!fs.existsSync(dir)){
        fs.mkdirSync(dir, { recursive:true })
        return res.json({msg:"folder created"})
    }

    res.json({msg:"folder exists"})
})

// ===== UPLOAD =====
app.post("/upload", upload.single("file"), (req,res)=>{
    const user = req.body.user

    if(!user){
        return res.json({msg:"no user"})
    }

    const userDir = path.join("uploads", user)

    if(!fs.existsSync(userDir)){
        fs.mkdirSync(userDir)
    }

    let fileName = req.file.originalname
    let destPath = path.join(userDir, fileName)

    // stop duplicates
    if(fs.existsSync(destPath)){
        const time = Date.now()
        fileName = time + "_" + fileName
        destPath = path.join(userDir, fileName)
    }

    fs.renameSync(req.file.path, destPath)

    res.json({msg:"uploaded"})
})

// ===== FILES =====
app.get("/files", (req,res)=>{
    const user = req.query.user || ""
    const dirPath = path.join("uploads", user)

    if(!fs.existsSync(dirPath)){
        return res.json([])
    }

    const items = fs.readdirSync(dirPath, { withFileTypes: true })

    const result = items.map(i=>{
        const fullPath = path.join(dirPath, i.name)
        const stats = fs.statSync(fullPath)

        return {
            name: i.name,
            size: stats.size,
            date: stats.mtime
        }
    })

    res.json(result)
})

// delete
app.delete("/delete/:name", (req,res)=>{
    const user = req.query.user || ""
    const filePath = path.join("uploads", user, req.params.name)

    if(fs.existsSync(filePath)){
        fs.rmSync(filePath, { recursive:true, force:true })
        return res.json({msg:"deleted"})
    }

    res.json({msg:"not found"})
})

// download
app.get("/download/:name", (req,res)=>{
    const user = req.query.user || ""
    const filePath = path.join(__dirname, "uploads", user, req.params.name)

    if(fs.existsSync(filePath)){
        return res.download(filePath)
    }

    res.json({msg:"not found"})
})

app.listen(3000, ()=>console.log("server running"))