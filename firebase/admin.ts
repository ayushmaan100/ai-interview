// firebase Admin SDK imports
import { initializeApp, getApps, cert } from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";
import { getFirestore } from "firebase-admin/firestore";

// Function to initialize firebase Admin SDK
function initFirebaseAdmin() {
    const apps = getApps(); // Returns a list of initialized firebase admin apps

    // If no apps are initialized yet, initialize one
    if (!apps.length) {
        initializeApp({
            credential: cert({
                projectId: process.env.FIREBASE_PROJECT_ID,
                clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
                // The private key from env often contains escaped newlines,
                // so we replace "\\n" with actual newlines
                privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, "\n"),
            }),
        });
    }

    // Return instances of auth and Firestore from the initialized app
    return {
        auth: getAuth(),
        db: getFirestore(),
    };
}

// Export the auth and db instances for use in server-side functions or API routes
export const { auth, db } = initFirebaseAdmin();