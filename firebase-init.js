// Firebase initialization (module)
// Uses user's provided config and exposes Firestore globally (window.db)
import { initializeApp } from "https://www.gstatic.com/firebasejs/12.4.0/firebase-app.js";
import { getAnalytics } from "https://www.gstatic.com/firebasejs/12.4.0/firebase-analytics.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/12.4.0/firebase-firestore.js";

const firebaseConfig = {
    apiKey: "AIzaSyBJSkEsTmA03HhsqUDLC5paO5kaL8MhRy8",
    authDomain: "maxima-38ec4.firebaseapp.com",
    projectId: "maxima-38ec4",
    storageBucket: "maxima-38ec4.firebasestorage.app",
    messagingSenderId: "573220023235",
    appId: "1:573220023235:web:98df793476d75cb50feb76",
    measurementId: "G-YWRR66P3NR"
};

try {
    const app = initializeApp(firebaseConfig);
    try { getAnalytics(app); } catch (_) {}
    const db = getFirestore(app);
    // Expose globally for non-module scripts
    window.db = db;
    window.firebaseReady = true;
    console.log('Firebase initialized successfully');
} catch (e) {
    console.error('Firebase init error:', e);
    window.firebaseReady = false;
}


