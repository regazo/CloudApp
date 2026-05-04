import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getAuth, GoogleAuthProvider, signInWithPopup, signOut }
from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";

const firebaseConfig = {
 apiKey: "YOUR_KEY",
 authDomain: "YOUR_DOMAIN"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const provider = new GoogleAuthProvider();

window.login = async () => {
 const result = await signInWithPopup(auth, provider);
 return result.user;
};

window.logout = () => signOut(auth);
