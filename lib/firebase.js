import { initializeApp, getApps } from "firebase/app";
import { getAuth, setPersistence, browserSessionPersistence } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
const app = getApps()[0] || initializeApp({
  apiKey: process.env.NEXT_PUBLIC_FB_API_KEY, authDomain: process.env.NEXT_PUBLIC_FB_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FB_PROJECT_ID, appId: process.env.NEXT_PUBLIC_FB_APP_ID,
});
export const auth = getAuth(app);
export const db = getFirestore(app);
if (typeof window !== "undefined") setPersistence(auth, browserSessionPersistence); // tab band = logout
