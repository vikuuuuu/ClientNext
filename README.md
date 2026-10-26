# Biz Manager (Next.js + Firebase free)
1. Firebase: Authentication (Email/Password) + Firestore enable karo.
2. `.env.local.example` -> `.env.local`, keys bharo. Pehla account banane ke baad `NEXT_PUBLIC_ALLOW_SIGNUP=false` karo.
3. `firestore.rules` Firestore Rules me paste + Publish.
4. `npm install && npm run dev`
Security: login ke bina kuch render nahi hota, rules me sirf owner (uid) data padh/likh sakta hai, 15 min idle auto-logout, tab band = logout, security headers.
