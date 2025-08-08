// dashboard.js
import { initializeApp } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-app.js";
import { getAuth, onAuthStateChanged, signOut, signInAnonymously, signInWithCustomToken } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-auth.js";
import { getFirestore, collection, query, where, addDoc, getDocs, deleteDoc, doc, onSnapshot, orderBy } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-firestore.js";

// Firebase configuration from global variables
const appId = typeof __app_id !== 'undefined' ? __app_id : 'default-app-id';
const firebaseConfig = JSON.parse(typeof __firebase_config !== 'undefined' ? __firebase_config : '{}');
const initialAuthToken = typeof __initial_auth_token !== 'undefined' ? __initial_auth_token : null;

let app, auth, db;
let userId = null;

// DOM elements
const userNameElem = document.getElementById('user-name');
const userIdElem = document.getElementById('user-id');
const profileImgElem = document.getElementById('profile-img');
const logoutButton = document.getElementById('logout-button');
const generateMusicBtn = document.getElementById('generate-music-btn');
const musicListContainer = document.getElementById('music-list');
const noMusicMessage = document.getElementById('no-music-message');

const modal = document.getElementById('info-modal');
const modalTitle = document.getElementById('modal-title');
const modalContent = document.getElementById('modal-content');
const closeModalBtn = document.querySelector('.close-btn');

// Initialize Firebase and set up auth listener
const initFirebaseAndAuth = async () => {
    try {
        if (Object.keys(firebaseConfig).length === 0) {
            console.error("Firebase config is empty. Please ensure the global variable is set.");
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
            if (user) {
                userId = user.uid;
                userNameElem.textContent = user.displayName ? `Welcome, ${user.displayName}!` : 'Welcome, User!';
                userIdElem.textContent = userId;
                if (user.photoURL) {
                    profileImgElem.src = user.photoURL;
                } else {
                    profileImgElem.src = "https://placehold.co/100x100/36454F/ffffff?text=User"; // Default placeholder
                }
                
                console.log("User is signed in:", userId);
                // Start listening for music files for the current user
                setupMusicFileListener(userId);

            } else {
                console.log("No user is signed in. Redirecting to login.");
                window.location.href = 'index.html'; // Redirect to the login page
            }
        });
    } catch (error) {
        console.error("Error initializing Firebase or authentication:", error);
    }
};

// Function to handle adding mock music file to Firestore
const addMockMusicFile = async (currentUserId) => {
    if (!currentUserId) {
        console.error("User not authenticated.");
        return;
    }
    const musicData = {
        name: `Generated Track ${Date.now()}`,
        dateCreated: new Date().toISOString(),
        url: 'https://example.com/mock-music.mp3', // Mock URL
        userId: currentUserId,
    };

    try {
        const musicRef = collection(db, 'artifacts', appId, 'users', currentUserId, 'musicFiles');
        await addDoc(musicRef, musicData);
        console.log("Mock music file added successfully!");
    } catch (error) {
        console.error("Error adding document: ", error);
    }
};

// Function to delete a music file from Firestore
const deleteMusicFile = async (fileId) => {
    if (!userId) {
        console.error("User not authenticated.");
        return;
    }
    try {
        const docRef = doc(db, 'artifacts', appId, 'users', userId, 'musicFiles', fileId);
        await deleteDoc(docRef);
        console.log("Music file deleted successfully!");
    } catch (error) {
        console.error("Error deleting document: ", error);
    }
};

// Function to render a single music card
const renderMusicCard = (file) => {
    const card = document.createElement('div');
    card.classList.add('music-card');
    card.setAttribute('data-id', file.id);

    const nameElem = document.createElement('h3');
    nameElem.textContent = file.name;

    const dateElem = document.createElement('p');
    dateElem.textContent = `Date Created: ${new Date(file.dateCreated).toLocaleDateString()}`;

    const actionsElem = document.createElement('div');
    actionsElem.classList.add('card-actions');

    const downloadBtn = document.createElement('button');
    downloadBtn.classList.add('btn-download');
    downloadBtn.textContent = 'Download';
    downloadBtn.onclick = () => {
        // This would be a real download link in a production app
        console.log(`Downloading file: ${file.name}`);
        alert(`Downloading "${file.name}"... (simulated)`);
    };

    const infoBtn = document.createElement('button');
    infoBtn.classList.add('btn-info');
    infoBtn.textContent = 'Info';
    infoBtn.onclick = () => {
        modalTitle.textContent = file.name;
        modalContent.innerHTML = `
            <strong>Date Created:</strong> ${new Date(file.dateCreated).toLocaleString()}<br>
            <strong>File ID:</strong> ${file.id}<br>
            <strong>URL:</strong> <a href="${file.url}" target="_blank" class="text-red-400 hover:underline">Link</a>
        `;
        modal.style.display = 'flex';
    };

    const deleteBtn = document.createElement('button');
    deleteBtn.classList.add('btn-delete');
    deleteBtn.textContent = 'Delete';
    deleteBtn.onclick = () => {
        if(confirm(`Are you sure you want to delete "${file.name}"?`)) {
            deleteMusicFile(file.id);
        }
    };

    actionsElem.appendChild(downloadBtn);
    actionsElem.appendChild(infoBtn);
    actionsElem.appendChild(deleteBtn);

    card.appendChild(nameElem);
    card.appendChild(dateElem);
    card.appendChild(actionsElem);

    return card;
};

// Setup Firestore listener for the user's music files
const setupMusicFileListener = (currentUserId) => {
    const musicRef = collection(db, 'artifacts', appId, 'users', currentUserId, 'musicFiles');
    // Using onSnapshot to listen for real-time changes
    const q = query(musicRef);
    onSnapshot(q, (snapshot) => {
        musicListContainer.innerHTML = ''; // Clear the list
        if (snapshot.empty) {
            noMusicMessage.style.display = 'block';
        } else {
            noMusicMessage.style.display = 'none';
            const docs = [];
            snapshot.forEach(doc => {
                docs.push({ id: doc.id, ...doc.data() });
            });
            // Sort by dateCreated, newest first
            docs.sort((a, b) => new Date(b.dateCreated) - new Date(a.dateCreated));
            docs.forEach(doc => {
                musicListContainer.appendChild(renderMusicCard(doc));
            });
        }
    });
};

// Event listeners for UI buttons
logoutButton.addEventListener('click', async () => {
    try {
        await signOut(auth); // Redirect to login page
    } catch (error) {
        console.error("Error signing out:", error);
    }
    window.location.href = 'login.html';
});

generateMusicBtn.addEventListener('click', () => {
    // Redirect to the login page (which we are using as a "generator" page)
    window.location.href = 'index.html';
    // For now, let's also add a mock music file to demonstrate the list functionality
    addMockMusicFile(userId);
});

// Modal close button
closeModalBtn.addEventListener('click', () => {
    modal.style.display = 'none';
});

// Close modal when clicking outside
window.addEventListener('click', (event) => {
    if (event.target === modal) {
        modal.style.display = 'none';
    }
});

// Initialize on window load
window.addEventListener('load', initFirebaseAndAuth);
