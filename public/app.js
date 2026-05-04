//zakarea erezzaghi 3074880
// message
function setMsg(text){
    document.getElementById('msg').innerText = text
}

// show current user
function showUser(){
    const user = localStorage.getItem('user')
    const el = document.getElementById('currentUser')

    if(user){
        el.innerText = "logged in as: " + user
    } else {
        el.innerText = ""
    }
}

// upload
async function uploadFile(){
    const file = document.getElementById('fileInput').files[0]
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
    formData.append('user', user)

    const res = await fetch('/upload',{
        method:'POST',
        body:formData
    })

    const data = await res.json()
    setMsg(data.msg)

    loadFiles()
}

// load files
async function loadFiles(){
    const user = localStorage.getItem('user')

    if(!user){
        setMsg('not logged in')
        return
    }

    const res = await fetch('/files?user=' + user)
    const files = await res.json()

    const div = document.getElementById('files')
    div.innerHTML = ''

    // show count
    setMsg("files: " + files.length)

    files.forEach(f=>{
        const el = document.createElement('div')

        el.innerHTML = `
            <b>${f.name}</b>
            <small>(${Math.round(f.size/1024)} KB)</small>
            <br>
            <small>${new Date(f.date).toLocaleString()}</small>
            <br>
            <button onclick="downloadFile('${f.name}')">download</button>
            <button onclick="del('${f.name}')">delete</button>
        `

        div.appendChild(el)
    })
}

// delete
async function del(name){
    const user = localStorage.getItem('user')

    await fetch('/delete/'+name+'?user='+user,{
        method:'DELETE'
    })

    setMsg('deleted')
    loadFiles()
}

// download
function downloadFile(name){
    const user = localStorage.getItem('user')
    window.location = '/download/' + name + '?user=' + user
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
        showUser()
        loadFiles()
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
    document.getElementById('files').innerHTML = ''
    showUser()
}

// folder
async function makeFolder(){
    const name = document.getElementById('folderName').value
    const user = localStorage.getItem('user')

    if(!user){
        setMsg('login first')
        return
    }

    await fetch('/mkdir',{
        method:'POST',
        headers:{'Content-Type':'application/json'},
        body: JSON.stringify({name: user + "/" + name})
    })

    setMsg('folder created')
    loadFiles()
}

// run on load
showUser()