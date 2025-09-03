// Initialize Firebase
const firebaseConfig = {
  apiKey: "AIzaSyALIq-7sKX_yi4qbikHldoIDbymSem2gxg",
  authDomain: "sampledb-9009e.firebaseapp.com",
  projectId: "sampledb-9009e",
  storageBucket: "sampledb-9009e.firebasestorage.app",
  messagingSenderId: "894153581819",
  appId: "1:894153581819:web:d1d73e4345957781cb3c5e",
  measurementId: "G-7EDBYZMJVR"
};

firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();

// Show/hide loader
function showLoader(show, message = "") {
  const loader = document.getElementById("loader");
  if (loader) {
    loader.style.display = show ? "block" : "none";
    if (message) loader.innerHTML = `<i class="fa-solid fa-spinner fa-spin"></i> ${message}`;
  }
}

// Save token helper
function saveUserToken(user) {
  user.getIdToken().then(token => {
    localStorage.setItem("userToken", token);
    console.log("Token saved:", token);
  });
}

// 🔹 Sign Up
// --- SIGNUP ---
function signup() {
  const name = document.getElementById("name").value;
  const dept = document.getElementById("department").value;
  const email = document.getElementById("email").value;
  const pass = document.getElementById("password").value;
  const confirmPass = document.getElementById("confirmPassword").value;

  if (pass !== confirmPass) {
    document.getElementById("message").textContent = "Passwords do not match!";
    return;
  }

  showLoader(true, "Creating account...");
  firebase.auth().createUserWithEmailAndPassword(email, pass)
    .then(userCred => {
      const user = userCred.user;
      saveUserToken(user);

      return user.updateProfile({ displayName: name })
        .then(() => {
          // Save in Firestore
          return db.collection("users").doc(user.uid).set({
            name,
            department: dept,
            email,
            createdAt: firebase.firestore.FieldValue.serverTimestamp()
          });
        })
        .then(() => {
          // 🔹 Save name locally for instant greeting
          localStorage.setItem("userName", name);
          localStorage.setItem("userDept", dept);

          window.location.href = "index1.html";
        });
    })
    .catch(err => {
      document.getElementById("message").textContent = err.message;
    })
    .finally(() => showLoader(false));
}

// --- GREETING (on index1.html only) ---
firebase.auth().onAuthStateChanged(user => {
  if (user) {
    const greetEl = document.getElementById("greeting");

    // 🔹 Check localStorage first (instant after signup)
    const cachedName = localStorage.getItem("userName");
    const cachedDept = localStorage.getItem("userDept");
    if (cachedName && cachedDept) {
      greetEl.textContent = `Hi, ${cachedName} (${cachedDept})`;
      return;
    }

    // Otherwise fetch from Firestore
    db.collection("users").doc(user.uid).get().then(doc => {
      if (doc.exists) {
        const userData = doc.data();
        greetEl.textContent = `Hi, ${userData.name} (${userData.department})`;

        // Cache for next time
        localStorage.setItem("userName", userData.name);
        localStorage.setItem("userDept", userData.department);
      }
    });
  } else {
    // Redirect only if on protected pages (like index1.html)
    const path = window.location.pathname;
    const isLogin = path.includes("login.html");
    const isSignup = path.includes("signup.html");

    if (!isLogin && !isSignup) {
      window.location.href = "login.html";
    }
  }
});


// 🔹 Login
function login() {
  const email = document.getElementById("loginEmail").value;
  const pass = document.getElementById("loginPassword").value;

  showLoader(true, "Signing in...");
  firebase.auth().signInWithEmailAndPassword(email, pass)
    .then(userCred => {
      const user = userCred.user;
      saveUserToken(user);
      return db.collection("users").doc(user.uid).get();
    })
    .then(doc => {
      if (doc.exists) {
        console.log("User Data:", doc.data());
      }
      window.location.href = "index1.html";
    })
    .catch(err => {
      document.getElementById("message").textContent = err.message;
    })
    .finally(() => showLoader(false));
}

// 🔹 Greeting Logic (only on index1.html)
firebase.auth().onAuthStateChanged(async (user) => {
  if (user) {
    try {
      const doc = await db.collection("users").doc(user.uid).get();
      const greetEl = document.getElementById("greeting");
      if (doc.exists && greetEl) {
        const userData = doc.data();
        greetEl.textContent = `Hi, ${userData.name} (${userData.department})`;
      }
    } catch (err) {
      console.error("Error fetching user data:", err);
    }
  } else {
    // Redirect if not logged in
    if (!window.location.pathname.includes("login.html") &&
        !window.location.pathname.includes("signup.html")) {
      window.location.href = "login.html";
    }
  }
});
