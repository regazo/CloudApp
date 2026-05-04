// upload file
async function uploadFile(){
    const fileInput = document.getElementById('fileInput')
    const file = fileInput.files[0]

    if(!file){
        setMsg('no file')
        return
    }

    const formData = new FormData()
    formData.append('file', file)

    const res = await fetch('/upload',{
        method:'POST',
        body:formData
    })

    const data = await res.json()
    setMsg(data.msg)

    loadFiles()
}

// get files
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
    await fetch('/delete/'+name,{method:'DELETE'})
    setMsg('deleted')
    loadFiles()
}

// login user (real now)
async function login(){
    const username = prompt('enter user')
    const password = prompt('enter pass')

    const res = await fetch('/login',{
        method:'POST',
        headers:{'Content-Type':'application/json'},
        body: JSON.stringify({username,password})
    })

    const data = await res.json()
    setMsg(data.msg)

    if(data.msg === 'login ok'){
        localStorage.setItem('user',username) // save user
    }
}

// register user
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

// fake folder (not saved yet)
function makeFolder(){
    const name = document.getElementById('folderName').value
    setMsg('folder "'+name+'" made')
}

// msg helper (just prints text)
function setMsg(text){
    document.getElementById('msg').innerText = text
}