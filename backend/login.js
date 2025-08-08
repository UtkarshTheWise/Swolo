// login.js
import { initializeApp } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-app.js";
import { getAuth, signInWithEmailAndPassword, createUserWithEmailAndPassword, GoogleAuthProvider, signInWithPopup, onAuthStateChanged, signOut, signInAnonymously, signInWithCustomToken } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-auth.js";
import { getFirestore, collection, addDoc } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-firestore.js";

// Firebase configuration from global variables
const appId = typeof __app_id !== 'undefined' ? __app_id : 'default-app-id';
const firebaseConfig = JSON.parse(typeof __firebase_config !== 'undefined' ? __firebase_config : '{}');
const initialAuthToken = typeof __initial_auth_token !== 'undefined' ? __initial_auth_token : null;

// Loudly API credentials
const API_KEY = "OZpXEIHRaE0hchUAqfC_YCNf4UcLeVN6n9ByQobRZzw";
const API_URL = "https://soundtracks.loudly.com/api/ai/prompt/songs";

let app, auth, db;
let isAuthReady = false;
let userId = null;

// DOM elements
const authSection = document.getElementById('auth-section');
const generateSection = document.getElementById('generate-section');
const messageBox = document.getElementById('message-box');
const statusBox = document.getElementById('status-box');
const musicForm = document.getElementById('musicForm');
const audioPlayer = document.getElementById('audioPlayer');
const logoutButtonGen = document.getElementById('logout-button-gen');

// Function to display messages in the message box
const showMessage = (message, isError = false) => {
    const box = document.querySelector('#auth-section .message-box');
    box.textContent = message;
    box.style.display = 'block';
    if (isError) {
        box.classList.add('error');
        box.classList.remove('success');
    } else {
        box.classList.add('success');
        box.classList.remove('error');
    }
};

// Function to display status messages in the generation section
const showStatus = (message, isError = false) => {
    statusBox.textContent = message;
    statusBox.style.display = 'block';
    if (isError) {
        statusBox.classList.add('error');
        statusBox.classList.remove('success');
    } else {
        statusBox.classList.add('success');
        statusBox.classList.remove('error');
    }
};

// Initialize Firebase and set up auth listener
const initFirebaseAndAuth = async () => {
    try {
        if (Object.keys(firebaseConfig).length === 0) {
            console.error("Firebase config is empty. Please ensure the global variable is set.");
            showMessage("Error: Firebase configuration is missing.", true);
            return;
        }
        app = initializeApp(firebaseConfig);
        auth = getAuth(app);
        db = getFirestore(app);

        // Sign in with custom token if available, otherwise sign in anonymously
        if (initialAuthToken) {
            await signInWithCustomToken(auth, initialAuthToken);
        } else {
            await signInAnonymously(auth);
        }

        // Listen for auth state changes
        onAuthStateChanged(auth, (user) => {
            isAuthReady = true;
            if (user) {
                userId = user.uid;
                console.log("User is signed in:", userId);
                authSection.classList.add('hidden');
                generateSection.classList.remove('hidden');
                showStatus("Enter a prompt to generate music!", false);
            } else {
                console.log("No user is signed in.");
                authSection.classList.remove('hidden');
                generateSection.classList.add('hidden');
                showMessage("Please log in to continue.", false);
            }
        });
    } catch (error) {
        console.error("Error initializing Firebase or authentication:", error);
        showMessage(`Firebase Error: ${error.message}`, true);
    }
};

// Handle email/password login
const handleLogin = async (event) => {
    event.preventDefault();
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    if (!isAuthReady) {
        showMessage("Authentication is not ready yet. Please wait.", true);
        return;
    }
    try {
        await signInWithEmailAndPassword(auth, email, password);
    } catch (error) {
        console.error("Login failed:", error);
        showMessage(`Login Failed: ${error.message}`, true);
    }
};

// Handle email/password sign-up
const handleSignUp = async () => {
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    if (!isAuthReady) {
        showMessage("Authentication is not ready yet. Please wait.", true);
        return;
    }
    try {
        await createUserWithEmailAndPassword(auth, email, password);
        showMessage("Account created successfully! Logging in...", false);
    } catch (error) {
        console.error("Sign-up failed:", error);
        showMessage(`Sign Up Failed: ${error.message}`, true);
    }
};

// Handle Google Sign-in
const handleGoogleAuth = async () => {
    if (!isAuthReady) {
        showMessage("Authentication is not ready yet. Please wait.", true);
        return;
    }
    try {
        const provider = new GoogleAuthProvider();
        await signInWithPopup(auth, provider);
    } catch (error) {
        console.error("Google login failed:", error);
        showMessage(`Google Login Failed: ${error.message}`, true);
    }
};

// Handle Logout
const handleLogout = async () => {
    try {
        await signOut(auth);
    } catch (error) {
        console.error("Error signing out:", error);
    }
};

// Function to save a generated music file to Firestore
const saveMusicFile = async (fileName, fileUrl) => {
    if (!userId) {
        console.error("User not authenticated for saving file.");
        return;
    }
    const musicData = {
        name: fileName,
        dateCreated: new Date().toISOString(),
        url: fileUrl,
        userId: userId,
    };
    try {
        const musicRef = collection(db, 'artifacts', appId, 'users', userId, 'musicFiles');
        await addDoc(musicRef, musicData);
        console.log("Music file saved to Firestore!");
    } catch (error) {
        console.error("Error adding document: ", error);
        showStatus("❌ Error saving file to dashboard.", true);
    }
};

// Add event listeners
window.addEventListener('load', () => {
    initFirebaseAndAuth();
    document.getElementById('auth-form').addEventListener('submit', handleLogin);
    document.getElementById('signup-button').addEventListener('click', handleSignUp);
    document.getElementById('google-auth-button').addEventListener('click', handleGoogleAuth);
    logoutButtonGen.addEventListener('click', handleLogout);
});
