function loadFiles(){
    const user = localStorage.getItem("user")
    if(!user) return

    fetch(`/files?user=${user}`)
    .then(r=>r.json())
    .then(items=>{
        const div = document.getElementById("files")
        div.innerHTML = ""

        items.forEach(i=>{
            const sizeKB = (i.size / 1024).toFixed(1)

            const el = document.createElement("div")

            el.innerHTML = `
                <span>${i.name} (${sizeKB} KB)</span>
                <div>
                    <button onclick="downloadFile('${i.name}')">download</button>
                    <button onclick="deleteFile('${i.name}')">delete</button>
                </div>
            `

            div.appendChild(el)
        })
    })
}

function downloadFile(name){
    const user = localStorage.getItem("user")
    window.location = `/download?user=${user}&name=${name}`
}

function uploadFile(){
    const file = document.getElementById("fileInput").files[0]
    const user = localStorage.getItem("user")

    const fd = new FormData()
    fd.append("file", file)
    fd.append("user", user)

    fetch("/upload",{method:"POST",body:fd})
    .then(r=>r.json())
    .then(data=>{
        if(data.msg === "duplicate"){
            if(confirm("file exists overwrite?")){
                const fd2 = new FormData()
                fd2.append("file", file)
                fd2.append("user", user)
                fd2.append("overwrite","true")

                fetch("/upload",{method:"POST",body:fd2})
                .then(()=>loadFiles())
            }
            return
        }

        setMsg(data.msg)
        loadFiles()
    })
}

function deleteFile(name){
    const user = localStorage.getItem("user")

    fetch("/delete",{
        method:"DELETE",
        headers:{"Content-Type":"application/json"},
        body: JSON.stringify({user,name})
    })
    .then(r=>r.json())
    .then(data=>{
        setMsg(data.msg)
        loadFiles()
    })
}

function makeFolder(){
    const name = document.getElementById("folderName").value
    const user = localStorage.getItem("user")

    fetch("/mkdir",{
        method:"POST",
        headers:{"Content-Type":"application/json"},
        body: JSON.stringify({user,name})
    })
    .then(r=>r.json())
    .then(data=>{
        setMsg(data.msg)
        loadFiles()
    })
}