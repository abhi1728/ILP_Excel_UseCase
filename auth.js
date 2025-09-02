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
const db = firebase.firestore();  // Firestore reference

// Show/hide loader
function showLoader(show, message = "") {
  const loader = document.getElementById("loader");
  if (loader) {
    loader.style.display = show ? "block" : "none";
    if (message) loader.innerHTML = `<i class="fa-solid fa-spinner fa-spin"></i> ${message}`;
  }
}

// Sign Up
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

      // Save display name
      return user.updateProfile({ displayName: name })
        .then(() => {
          // Save user data in Firestore
          return db.collection("users").doc(user.uid).set({
            name: name,
            department: dept,
            email: email,
            createdAt: firebase.firestore.FieldValue.serverTimestamp()
          });
        });
    })
    .then(() => {
      window.location.href = "index1.html";
    })
    .catch(err => {
      document.getElementById("message").textContent = err.message;
    })
    .finally(() => showLoader(false));
}

// Login
function login() {
  const email = document.getElementById("loginEmail").value;
  const pass = document.getElementById("loginPassword").value;

  showLoader(true, "Signing in...");
  firebase.auth().signInWithEmailAndPassword(email, pass)
    .then(userCred => {
      const user = userCred.user;

      // Fetch extra user data from Firestore
      return db.collection("users").doc(user.uid).get();
    })
    .then(doc => {
      if (doc.exists) {
        console.log("User Data:", doc.data());  // you can use this in index1.html
      }
      window.location.href = "index1.html";
    })
    .catch(err => {
      document.getElementById("message").textContent = err.message;
    })
    .finally(() => showLoader(false));
}
// Helper: Save token
function saveUserToken(user) {
  user.getIdToken().then(token => {
    localStorage.setItem("userToken", token);
    console.log("Token saved:", token);
  });
}

// Sign Up
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
      saveUserToken(user); // save token immediately

      // Save display name
      return user.updateProfile({ displayName: name })
        .then(() => {
          return db.collection("users").doc(user.uid).set({
            name: name,
            department: dept,
            email: email,
            createdAt: firebase.firestore.FieldValue.serverTimestamp()
          });
        });
    })
    .then(() => {
      window.location.href = "index1.html";
    })
    .catch(err => {
      document.getElementById("message").textContent = err.message;
    })
    .finally(() => showLoader(false));
}

// Login
function login() {
  const email = document.getElementById("loginEmail").value;
  const pass = document.getElementById("loginPassword").value;

  showLoader(true, "Signing in...");
  firebase.auth().signInWithEmailAndPassword(email, pass)
    .then(userCred => {
      const user = userCred.user;
      saveUserToken(user); // save token immediately

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
