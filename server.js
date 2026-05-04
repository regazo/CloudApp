import express from "express";
import multer from "multer";
import fs from "fs";
import path from "path";

const app = express();
app.use(express.json());
app.use(express.static("public"));

const upload = multer({ dest: "uploads/" });

// simple in memory users (not best but works)
let users = [];

// register
app.post('/register',(req,res)=>{
    const {username,password} = req.body

    const exists = users.find(u=>u.username===username)

    if(exists){
        return res.json({msg:'user exists'})
    }

    users.push({username,password})
    res.json({msg:'registered'})
})

// login
app.post('/login',(req,res)=>{
    const {username,password} = req.body

    const user = users.find(u=>u.username===username && u.password===password)

    if(!user){
        return res.json({msg:'login fail'})
    }

    res.json({msg:'login ok'})
})

// upload (now linked to user)
app.post('/upload', upload.single('file'), (req,res)=>{
    const user = req.body.user // who upload

    if(!req.file){
        return res.json({msg:'no file'})
    }

    const newName = user + '-' + req.file.originalname

    fs.renameSync(req.file.path, 'uploads/' + newName)

    res.json({msg:'file uploaded'})
})

// get files (only user files)
app.get('/files',(req,res)=>{
    const user = req.query.user

    const files = fs.readdirSync('uploads')

    const userFiles = files.filter(f=>f.startsWith(user + '-'))

    res.json(userFiles)
})

// delete
app.delete('/delete/:name',(req,res)=>{
    const file = req.params.name

    fs.unlinkSync('uploads/' + file)

    res.json({msg:'deleted'})
})

app.listen(3000,()=>console.log("server running"))