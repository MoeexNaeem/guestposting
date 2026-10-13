# LetRank Guest Post Marketplace

A plain Next.js (App Router) + MongoDB marketplace where sellers list websites and buyers order guest posts, with order chat.

## Stack

- **Next.js 16** pages in `src/app`, API route handlers in `src/app/api`
- **MongoDB / Mongoose** models in `src/server/models`
- Tailwind CSS 4, framer-motion, lucide-react

## Setup

```bash
npm install
cp .env.example .env   # then fill in the values
```

| Variable | Purpose |
| --- | --- |
| `MONGO_URI` | MongoDB connection string |
| `JWT_SECRET` | Signs login tokens; keep it the same or every user is logged out |
| `FRONTEND_URL` | Public site URL, used for links inside emails |
| `MY_EMAIL` / `EMAIL_PASSWORD` | Gmail account + app password for outgoing email |

## Run

```bash
npm run dev     # development, hot reload
npm run build   # production build
npm start       # production server (port 3000, or the PORT your host sets)
```

Order chat and the notification bell refresh automatically every few seconds while the tab is open, so no extra server is needed. The app runs on any Node.js host or on Vercel.

## Layout

```
src/app/                  routes (pages + api/)
src/app/(dashboard)/      logged-in pages; layout.js applies the login/role guard and sidebar shell
src/views/                page components
src/components/           Layout (dashboard shell), ProtectedRoute, landing page sections
src/server/               db connection, auth, controllers, models, email
src/lib/api.js            browser axios instance
```
