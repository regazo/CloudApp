const firebaseConfig = {
  apiKey: "AIzaSyD5P2MVLZhhbwk2q_zViiFhOIWpsC1FymE",
  authDomain: "cloud-app-6643e.firebaseapp.com",
  projectId: "cloud-app-6643e",
  storageBucket: "cloud-app-6643e.firebasestorage.app",
  messagingSenderId: "621571802258",
  appId: "1:621571802258:web:ed22ebbaa6c07917e2124b"
}

firebase.initializeApp(firebaseConfig)

function setMsg(t){
    document.getElementById("msg").innerText = t
}

function showUser(){
    const user = firebase.auth().currentUser
    document.getElementById("currentUser").innerText =
        user ? "logged in as: " + user.email : ""
}

// 🔥 FIXED STATE HANDLING
firebase.auth().onAuthStateChanged(user=>{
    if(user){
        localStorage.setItem("user", user.uid)
        document.getElementById("authSection").style.display = "none"
        document.getElementById("appContent").style.display = "block"
        showUser()
        loadFiles()
    }else{
        localStorage.removeItem("user")
        document.getElementById("authSection").style.display = "flex"
        document.getElementById("appContent").style.display = "none"
        showUser()
    }
})

function register(){
    const email = prompt("email")
    const pass = prompt("password")

    firebase.auth().createUserWithEmailAndPassword(email, pass)
    .then(()=>setMsg("registered"))
    .catch(err=>setMsg(err.message))
}

function login(){
    const email = prompt("email")
    const pass = prompt("password")

    firebase.auth().signInWithEmailAndPassword(email, pass)
    .then(res=>{
        fetch("/user",{
            method:"POST",
            headers:{ "Content-Type":"application/json" },
            body: JSON.stringify({ uid: res.user.uid })
        })
        setMsg("login ok")
    })
    .catch(err=>setMsg(err.message))
}

function googleLogin(){
    const provider = new firebase.auth.GoogleAuthProvider()

    firebase.auth().signInWithPopup(provider)
    .then(res=>{
        fetch("/user",{
            method:"POST",
            headers:{ "Content-Type":"application/json" },
            body: JSON.stringify({ uid: res.user.uid })
        })
        setMsg("google login ok")
    })
    .catch(err=>setMsg(err.message))
}

function logout(){
    firebase.auth().signOut()
    setMsg("logged out")
}