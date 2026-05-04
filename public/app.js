let currentUser = localStorage.getItem("user")
let currentFolder = ""

updateUI()
loadFiles()

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
    currentFolder = ""

    updateUI()
    document.getElementById("files").innerHTML = ""
}

function updateUI(){
    const msg = document.getElementById("msg")

    if(currentUser){
        msg.innerText = "user: " + currentUser + " | folder: " + (currentFolder || "root")
    }else{
        msg.innerText = "not logged in"
    }
}

async function makeFolder(){
    const name = document.getElementById("folderName").value

    await fetch("/mkdir", {
        method:"POST",
        headers:{ "Content-Type":"application/json" },
        body: JSON.stringify({ name })
    })

    loadFiles()
}

async function uploadFile(){
    const file = document.getElementById("fileInput").files[0]

    const formData = new FormData()
    formData.append("file", file)
    formData.append("folder", currentFolder)

    await fetch("/upload", {
        method:"POST",
        body: formData
    })

    loadFiles()
}

// format size
function formatSize(bytes){
    if(bytes < 1024) return bytes + " B"
    if(bytes < 1024*1024) return (bytes/1024).toFixed(1) + " KB"
    return (bytes/(1024*1024)).toFixed(1) + " MB"
}

// load files
async function loadFiles(){
    const res = await fetch("/files?folder=" + currentFolder)
    const items = await res.json()

    const div = document.getElementById("files")
    div.innerHTML = ""

    if(currentFolder){
        const back = document.createElement("div")
        back.innerHTML = `<button onclick="goBack()">⬅ back</button>`
        div.appendChild(back)
    }

    items.forEach(i=>{
        const el = document.createElement("div")

        const date = new Date(i.date).toLocaleString()

        if(i.isFolder){
            el.innerHTML = `
            📁 ${i.name} 
            <button onclick="openFolder('${i.name}')">open</button>
            `
        }else{
            el.innerHTML = `
            📄 ${i.name} (${formatSize(i.size)})
            <br><small>${date}</small>
            <br>
            <button onclick="downloadFile('${i.name}')">download</button>
            <button onclick="deleteFile('${i.name}')">delete</button>
            `
        }

        div.appendChild(el)
    })
}

function openFolder(name){
    currentFolder = currentFolder ? currentFolder + "/" + name : name
    loadFiles()
    updateUI()
}

function goBack(){
    const parts = currentFolder.split("/")
    parts.pop()
    currentFolder = parts.join("")
    loadFiles()
    updateUI()
}

async function deleteFile(name){
    await fetch("/delete/" + name + "?folder=" + currentFolder, {
        method:"DELETE"
    })

    loadFiles()
}

function downloadFile(name){
    window.open("/download/" + name + "?folder=" + currentFolder)
}