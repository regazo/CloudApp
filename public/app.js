let currentUser = localStorage.getItem("user")

updateUI()

function login(){
    const user = prompt("enter username")
    if(!user) return

    currentUser = user
    localStorage.setItem("user", user)

    updateUI()
    loadFiles()
}

function register(){
    const user = prompt("choose username")
    if(!user) return

    currentUser = user
    localStorage.setItem("user", user)

    updateUI()
}

function logout(){
    currentUser = null
    localStorage.removeItem("user")

    updateUI()
    document.getElementById("files").innerHTML = ""
}

function updateUI(){
    const msg = document.getElementById("msg")

    if(currentUser){
        msg.innerText = "logged in as: " + currentUser
    }else{
        msg.innerText = "not logged in"
    }
}

async function makeFolder(){
    if(!currentUser) return alert("login first")

    const name = document.getElementById("folderName").value

    await fetch("/mkdir", {
        method:"POST",
        headers:{ "Content-Type":"application/json" },
        body: JSON.stringify({ name, user: currentUser })
    })

    loadFiles()
}

async function uploadFile(){
    if(!currentUser) return alert("login first")

    const file = document.getElementById("fileInput").files[0]
    const formData = new FormData()
    formData.append("file", file)
    formData.append("user", currentUser)

    await fetch("/upload", {
        method:"POST",
        body: formData
    })

    loadFiles()
}

async function loadFiles(){
    if(!currentUser) return

    const res = await fetch("/files?user=" + currentUser)
    const files = await res.json()

    const div = document.getElementById("files")
    div.innerHTML = ""

    files.forEach(f=>{
        const el = document.createElement("div")

        el.innerHTML = `
            ${f.name}
            <button onclick="deleteFile('${f.name}')">delete</button>
        `

        div.appendChild(el)
    })
}

async function deleteFile(name){
    await fetch("/delete/" + name, { method:"DELETE" })
    loadFiles()
}