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

if (!fs.existsSync("uploads")) {
    fs.mkdirSync("uploads")
}

// create folder
app.post("/mkdir", (req,res)=>{
    const { name } = req.body
    const dir = path.join("uploads", name)

    if(!fs.existsSync(dir)){
        fs.mkdirSync(dir)
        return res.json({msg:"folder created"})
    }

    res.json({msg:"folder exists"})
})

// upload
app.post("/upload", upload.single("file"), (req,res)=>{
    const folder = req.body.folder || ""
    const file = req.file

    const destPath = path.join("uploads", folder, file.originalname)

    fs.renameSync(file.path, destPath)

    res.json({msg:"uploaded"})
})

// Files with metadaata
app.get("/files", (req,res)=>{
    const folder = req.query.folder || ""
    const dirPath = path.join("uploads", folder)

    const items = fs.readdirSync(dirPath, { withFileTypes: true })

    const result = items.map(i=>{
        const fullPath = path.join(dirPath, i.name)
        const stats = fs.statSync(fullPath)

        return {
            name: i.name,
            isFolder: i.isDirectory(),
            size: stats.size,
            date: stats.mtime
        }
    })

    res.json(result)
})

// delete
app.delete("/delete/:name", (req,res)=>{
    const folder = req.query.folder || ""
    const filePath = path.join("uploads", folder, req.params.name)

    if(fs.existsSync(filePath)){
        fs.rmSync(filePath, { recursive:true, force:true })
        return res.json({msg:"deleted"})
    }

    res.json({msg:"not found"})
})

// download
app.get("/download/:name", (req,res)=>{
    const folder = req.query.folder || ""
    const filePath = path.join(__dirname, "uploads", folder, req.params.name)

    if(fs.existsSync(filePath)){
        return res.download(filePath)
    }

    res.json({msg:"not found"})
})

app.listen(3000, ()=>console.log("server running"))