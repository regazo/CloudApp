let user=null
let path="/"

async function login(){
 user=await window.login()

 await fetch("/login",{
  method:"POST",
  headers:{"Content-Type":"application/json"},
  body:JSON.stringify({uid:user.uid,email:user.email})
 })

 load()
}

function logout(){window.logout()}

async function mkdir(){
 const name=document.getElementById("dirname").value

 await fetch("/mkdir",{
  method:"POST",
  headers:{"Content-Type":"application/json"},
  body:JSON.stringify({userId:user.uid,name,path})
 })

 load()
}

async function upload(){
 const file=document.getElementById("file").files[0]

 let form=new FormData()
 form.append("file",file)
 form.append("userId",user.uid)
 form.append("path",path)

 await fetch("/upload",{method:"POST",body:form})
 load()
}

async function load(){
 const res=await fetch("/list",{
  method:"POST",
  headers:{"Content-Type":"application/json"},
  body:JSON.stringify({userId:user.uid,path})
 })

 const data=await res.json()
 const list=document.getElementById("list")
 list.innerHTML=""

 data.dirs.forEach(d=>{
  let li=document.createElement("li")
  li.innerText="[DIR] "+d.name
  li.onclick=()=>{path=d.path;load()}
  list.appendChild(li)
 })

 data.files.forEach(f=>{
  let li=document.createElement("li")
  li.innerText=f.filename
  list.appendChild(li)
 })
}
async function uploadFile(){
    const fileInput = document.getElementById('fileInput')
    const file = fileInput.files[0]

    if(!file){
        setMsg('no file selected')
        return
    }

    const formData = new FormData()
    formData.append('file', file)

    const res = await fetch('/upload', {
        method: 'POST',
        body: formData
    })

    const data = await res.json()
    setMsg(data.msg)

    loadFiles()
}

// load files
async function loadFiles(){
    const res = await fetch('/files')
    const files = await res.json()

    const div = document.getElementById('files')
    div.innerHTML = ''

    files.forEach(f=>{
        const el = document.createElement('div')
        el.innerHTML = f + ` <button onclick="del('${f}')">x</button>`
        div.appendChild(el)
    })
}

// delete file
async function del(name){
    await fetch('/delete/' + name, { method:'DELETE' })
    setMsg('deleted file')
    loadFiles()
}

// fake login (simple)
function login(){
    setMsg('logged in')
}

// fake logout
function logout(){
    setMsg('logged out')
}

// folder (just visual rn)
function makeFolder(){
    const name = document.getElementById('folderName').value
    setMsg('folder "' + name + '" created')
}

// msg helper
function setMsg(text){
    document.getElementById('msg').innerText = text
}