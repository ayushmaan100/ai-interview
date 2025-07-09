"use server";

// firebase Admin SDK (used server-side only)
import { auth, db } from "@/firebase/admin";
import { cookies } from "next/headers";

// Session cookie expiry time (1 week)
const SESSION_DURATION = 60 * 60 * 24 * 7; // seconds

//	Uses session cookies instead of localStorage, which is more secure for SSR.
//This code is placed in a server-only file (likely inside lib/actions/auth.action.ts) due to firebase-admin and cookies() usage.
// 	It supports Firebase Auth for sign-in, but stores additional user data in Firestore (users collection

// ----------------------------
// Set session cookie (server-side only)
// ----------------------------
export async function setSessionCookie(idToken: string) {
    const cookieStore = await cookies(); // Access the response's cookie store

    // Create a session cookie from firebase ID token
    const sessionCookie = await auth.createSessionCookie(idToken, {
        expiresIn: SESSION_DURATION * 1000, // expiresIn is in ms
    });

    // Store it as an HTTP-only secure cookie
    cookieStore.set("session", sessionCookie, {
        maxAge: SESSION_DURATION,
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        path: "/",
        sameSite: "lax",
    });
}

// ----------------------------
// Sign up new user in Firestore (not firebase Auth)
// ----------------------------
export async function signUp(params: SignUpParams) {
    const { uid, name, email } = params;

    try {
        // Check if the user already exists in Firestore
        const userRecord = await db.collection("users").doc(uid).get();
        if (userRecord.exists) {
            return {
                success: false,
                message: "User already exists. Please sign in.",
            };
        }

        // Add new user document to Firestore
        await db.collection("users").doc(uid).set({
            name,
            email,
            // Optional fields like profileURL, resumeURL can go here
        });

        return {
            success: true,
            message: "Account created successfully. Please sign in.",
        };
    } catch (error: any) {
        console.error("Error creating user:", error);

        // Handle specific firebase errors
        if (error.code === "auth/email-already-exists") {
            return {
                success: false,
                message: "This email is already in use",
            };
        }

        return {
            success: false,
            message: "Failed to create account. Please try again.",
        };
    }
}

// ----------------------------
// Sign in existing user
// ----------------------------
export async function signIn(params: SignInParams) {
    const { email, idToken } = params;

    try {
        // Validate user exists in firebase Auth
        const userRecord = await auth.getUserByEmail(email);
        if (!userRecord) {
            return {
                success: false,
                message: "User does not exist. Create an account.",
            };
        }

        // Set the session cookie for persistent login
        await setSessionCookie(idToken);
    } catch (error: any) {
        console.log("Sign-in error:", error);

        return {
            success: false,
            message: "Failed to log into account. Please try again.",
        };
    }
}

// ----------------------------
// Sign out by clearing session cookie
// ----------------------------
export async function signOut() {
    const cookieStore = await cookies();
    cookieStore.delete("session");
}

// ----------------------------
// Get the current logged-in user from session
// ----------------------------
export async function getCurrentUser(): Promise<User | null> {
    const cookieStore = await cookies();

    // Read the session cookie
    const sessionCookie = cookieStore.get("session")?.value;
    if (!sessionCookie) return null;

    try {
        // Verify the session cookie using firebase Admin
        const decodedClaims = await auth.verifySessionCookie(sessionCookie, true);

        // Fetch user details from Firestore
        const userRecord = await db
            .collection("users")
            .doc(decodedClaims.uid)
            .get();

        if (!userRecord.exists) return null;

        return {
            ...userRecord.data(),
            id: userRecord.id,
        } as User;
    } catch (error) {
        console.log("Session verification failed:", error);
        return null; // Invalid or expired session
    }
}

// ----------------------------
// Check if a user is authenticated
// ----------------------------
export async function isAuthenticated() {
    const user = await getCurrentUser();
    return !!user;
}