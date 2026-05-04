// upload file
async function uploadFile(){
    const fileInput = document.getElementById('fileInput')
    const file = fileInput.files[0]

    const user = localStorage.getItem('user')

    if(!file){
        setMsg('no file')
        return
    }

    if(!user){
        setMsg('login first')
        return
    }

    const formData = new FormData()
    formData.append('file', file)
    formData.append('user', user) // send user

    const res = await fetch('/upload',{
        method:'POST',
        body:formData
    })

    const data = await res.json()
    setMsg(data.msg)

    loadFiles()
}

// load files for user
async function loadFiles(){
    const user = localStorage.getItem('user')

    if(!user){
        setMsg('not loged in')
        return
    }

    const res = await fetch('/files?user=' + user)
    const files = await res.json()

    const div = document.getElementById('files')
    div.innerHTML = ''

    files.forEach(f=>{
        const el = document.createElement('div')
        el.innerHTML = f + ` <button onclick="del('${f}')">x</button>`
        div.appendChild(el)
    })
}

// delete
async function del(name){
    await fetch('/delete/'+name,{method:'DELETE'})
    setMsg('deleted')
    loadFiles()
}

// login
async function login(){
    const username = prompt('user')
    const password = prompt('pass')

    const res = await fetch('/login',{
        method:'POST',
        headers:{'Content-Type':'application/json'},
        body: JSON.stringify({username,password})
    })

    const data = await res.json()
    setMsg(data.msg)

    if(data.msg === 'login ok'){
        localStorage.setItem('user',username)
    }
}

// register
async function register(){
    const username = prompt('new user')
    const password = prompt('new pass')

    const res = await fetch('/register',{
        method:'POST',
        headers:{'Content-Type':'application/json'},
        body: JSON.stringify({username,password})
    })

    const data = await res.json()
    setMsg(data.msg)
}

// logout
function logout(){
    localStorage.removeItem('user')
    setMsg('logged out')
}

// folder (still basic)
function makeFolder(){
    const name = document.getElementById('folderName').value
    setMsg('folder made: '+name)
}

// message
function setMsg(text){
    document.getElementById('msg').innerText = text
}