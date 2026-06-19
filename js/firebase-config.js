/**
 * Firebase configuration — Church of St. Peter (Community Life)
 *
 * Paste the values from your Firebase project below (one-time setup — see
 * COMMUNITY_LIFE.md for click-by-click instructions).
 *
 * NOTE: none of these values are secret. They identify your project in the
 * browser; your data is protected by Firestore *security rules*, not by hiding
 * these. It is safe to commit this file.
 */
export const firebaseConfig = {
  apiKey: "AIzaSyAusOqk8WhhZWa7B-aE4g4uusZtCjaxFOs",
  authDomain: "peter-530e5.firebaseapp.com",
  projectId: "peter-530e5",
  storageBucket: "peter-530e5.firebasestorage.app",
  messagingSenderId: "187729204041",
  appId: "1:187729204041:web:c261f7d8b9add2d314c098"
};

/**
 * The single shared staff account used to sign in to /admin.
 * Create this account once in Firebase (Authentication → Users). Staff then
 * only ever type the PASSWORD on the admin page — the email is filled in here
 * so they never have to remember it.
 */
export const ADMIN_EMAIL = "dylan@dylanbrowncpa.com";

/** True once the placeholders above have actually been replaced. */
export function isFirebaseConfigured() {
  return !!firebaseConfig.apiKey && !/^PASTE_/.test(firebaseConfig.apiKey);
}

/** Firebase SDK version loaded on demand from Google's CDN. */
export const FIREBASE_VERSION = "10.12.5";
