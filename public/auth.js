// Import Firebase modules
// import firebase from "firebase/app"
// import "firebase/auth"
// import "firebase/firestore"

// Your Firebase config (keeping your existing configuration)
const firebaseConfig = {
  apiKey: "AIzaSyA5uGmM7zu3W8J-xGcNngT2A3m0VgCX3LE",
  authDomain: "todo-web-547a1.firebaseapp.com",
  projectId: "todo-web-547a1",
  storageBucket: "todo-web-547a1.appspot.com",
  messagingSenderId: "24532435669",
  appId: "1:24532435669:web:fe2b5ca22ebfb2ff74585c",
  measurementId: "G-9HVK5SBZW7",
}

// Initialize Firebase
firebase.initializeApp(firebaseConfig)
const auth = firebase.auth()
const db = firebase.firestore()

// Check if user is already logged in
auth.onAuthStateChanged((user) => {
  if (
    user &&
    (window.location.pathname.includes("index.html") ||
      window.location.pathname.includes("signup.html") ||
      window.location.pathname === "/")
  ) {
    window.location.href = "dashboard.html"
  } else if (!user && window.location.pathname.includes("dashboard.html")) {
    window.location.href = "index.html"
  }
})

// Login Form Handler
if (document.getElementById("loginForm")) {
  document.getElementById("loginForm").addEventListener("submit", async (e) => {
    e.preventDefault()

    const email = document.getElementById("loginEmail").value
    const password = document.getElementById("loginPassword").value

    try {
      await auth.signInWithEmailAndPassword(email, password)
      showToast("Login successful!", "success")
      setTimeout(() => {
        window.location.href = "dashboard.html"
      }, 1000)
    } catch (error) {
      showToast(error.message, "error")
    }
  })
}

// Signup Form Handler
if (document.getElementById("signupForm")) {
  document.getElementById("signupForm").addEventListener("submit", async (e) => {
    e.preventDefault()

    const name = document.getElementById("signupName").value
    const email = document.getElementById("signupEmail").value
    const password = document.getElementById("signupPassword").value

    try {
      const userCredential = await auth.createUserWithEmailAndPassword(email, password)

      // Update user profile with name
      await userCredential.user.updateProfile({
        displayName: name,
      })

      // Store user data in Firestore
      await db.collection("users").doc(userCredential.user.uid).set({
        name: name,
        email: email,
        createdAt: firebase.firestore.FieldValue.serverTimestamp(),
      })

      showToast("Account created successfully!", "success")
      setTimeout(() => {
        window.location.href = "dashboard.html"
      }, 1000)
    } catch (error) {
      showToast(error.message, "error")
    }
  })
}

// Toast notification function
function showToast(message, type = "info") {
  const toast = document.createElement("div")
  toast.className = `toast ${type} show`
  toast.textContent = message
  document.body.appendChild(toast)

  setTimeout(() => {
    toast.classList.remove("show")
    setTimeout(() => {
      document.body.removeChild(toast)
    }, 300)
  }, 3000)
}
