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

// create folder
async function makeFolder(){
    const name = document.getElementById("folderName").value

    await fetch("/mkdir", {
        method:"POST",
        headers:{ "Content-Type":"application/json" },
        body: JSON.stringify({ name })
    })

    loadFiles()
}

// upload
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

// load files
async function loadFiles(){
    const res = await fetch("/files?folder=" + currentFolder)
    const items = await res.json()

    const div = document.getElementById("files")
    div.innerHTML = ""

    // back button
    if(currentFolder){
        const back = document.createElement("div")
        back.innerHTML = `<button onclick="goBack()">⬅ back</button>`
        div.appendChild(back)
    }

    items.forEach(i=>{
        const el = document.createElement("div")

        if(i.isFolder){
            el.innerHTML = `📁 ${i.name} 
            <button onclick="openFolder('${i.name}')">open</button>`
        }else{
            el.innerHTML = `📄 ${i.name} 
            <button onclick="downloadFile('${i.name}')">download</button>
            <button onclick="deleteFile('${i.name}')">delete</button>`
        }

        div.appendChild(el)
    })
}

// open folder
function openFolder(name){
    currentFolder = currentFolder ? currentFolder + "/" + name : name
    loadFiles()
    updateUI()
}

// go back
function goBack(){
    const parts = currentFolder.split("/")
    parts.pop()
    currentFolder = parts.join("/")
    loadFiles()
    updateUI()
}

// delete
async function deleteFile(name){
    await fetch("/delete/" + name + "?folder=" + currentFolder, {
        method:"DELETE"
    })

    loadFiles()
}

// download
function downloadFile(name){
    window.open("/download/" + name + "?folder=" + currentFolder)
}