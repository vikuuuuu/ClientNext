# Marketplace + Business Manager (Next.js + Firebase)
## Roles & routing
- Admin = `NEXT_PUBLIC_OWNER_EMAIL` (also in firestore.rules). Client / Freelancer = `users/{uid}.role`, set at registration in the matching portal.
- `/portal` accepts clients only, `/freelancer` freelancers only, `/login` admin only. A wrong-portal login shows a notice with a link to the right portal. Blocked users are locked out (UI + rules).
## Workflow
inquiry (items, budget, timeline) -> auto-accepted after 10 s unless freelancer handles it -> chat opens -> freelancer proposal (items + tax) -> client accepts/rejects -> client pays (TXN id + UTR) -> admin verifies (work starts) -> freelancer delivers -> client approves -> admin releases payout (commission deducted) -> booking + payment "completed".
## Commission
Settings -> platform commission % (default). Services & orders -> per-service override. Finance gets the commission as income at release.
## Deploy
GitHub -> Vercel (env vars from .env.local.example) -> Firebase Auth authorized domains -> publish firestore.rules.
