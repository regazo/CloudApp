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
