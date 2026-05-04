const express = require('express')
const mongoose = require('mongoose')
const multer = require('multer')
const path = require('path')
const fs = require('fs')

const app = express()
app.use(express.json())

// connect db (might fail if uri wrong btw)
mongoose.connect('mongodb://127.0.0.1:27017/cloudapp')
.then(()=> console.log('db conected..'))
.catch(err=> console.log(err))

// user schema (basic for now)
const User = mongoose.model('User', {
    username: String,
    password: String
})

// file storage setup
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/')
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + '-' + file.originalname) // random name
    }
})

const upload = multer({ storage: storage })

// serve frontend files (this fixes ur issue)
app.use(express.static(path.join(__dirname, 'public')))

// home route (just in case)
app.get('/', (req,res)=>{
    res.sendFile(path.join(__dirname,'public','index.html'))
})

// register user
app.post('/register', async (req,res)=>{
    try{
        const {username, password} = req.body

        const exist = await User.findOne({username})
        if(exist){
            return res.json({msg:'user alredy exists'})
        }

        const user = new User({username, password})
        await user.save()

        res.json({msg:'user created'})
    }catch(err){
        res.json({msg:'error'})
    }
})

// login user
app.post('/login', async (req,res)=>{
    const {username, password} = req.body

    const user = await User.findOne({username, password})

    if(!user){
        return res.json({msg:'invlaid login'})
    }

    res.json({msg:'login ok'})
})

// upload file
app.post('/upload', upload.single('file'), (req,res)=>{
    if(!req.file){
        return res.json({msg:'no file'})
    }

    // very basic duplicate check (not perfect tbh)
    const files = fs.readdirSync('uploads')
    const same = files.filter(f => f.includes(req.file.originalname))

    if(same.length > 1){
        return res.json({msg:'duplicate file maybe'})
    }

    res.json({msg:'file uploaded'})
})

// get files
app.get('/files', (req,res)=>{
    const files = fs.readdirSync('uploads')
    res.json(files)
})

// delete file
app.delete('/delete/:name', (req,res)=>{
    const filePath = path.join(__dirname, 'uploads', req.params.name)

    if(fs.existsSync(filePath)){
        fs.unlinkSync(filePath)
        return res.json({msg:'deleted'})
    }

    res.json({msg:'not found'})
})

// start server
app.listen(3000, ()=>{
    console.log('server running')
})