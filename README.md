# LetRank Guest Post Marketplace

Next.js (App Router) + MongoDB marketplace where sellers list websites and buyers order guest posts, with live order chat.

## Stack

- **Next.js 16** pages in `src/app`, API route handlers in `src/app/api`
- **MongoDB / Mongoose** models in `src/server/models`
- **socket.io** for live chat and notification toasts, hosted by the custom server in `server.js`
- Tailwind CSS 4, framer-motion, lucide-react

## Setup

```bash
npm install
cp .env.example .env   # then fill in the values
```

| Variable | Purpose |
| --- | --- |
| `PORT` | Port the server listens on (default 5000) |
| `MONGO_URI` | MongoDB connection string |
| `JWT_SECRET` | Signs login tokens; keep it the same or every user is logged out |
| `FRONTEND_URL` | Public site URL, used in email links and the socket.io CORS origin |
| `MY_EMAIL` / `EMAIL_PASSWORD` | Gmail account + app password for outgoing email |

## Run

```bash
npm run dev     # development, hot reload
npm run build   # production build
npm start       # production server (Next.js + socket.io on PORT)
```

Always start the app through `server.js` (`npm run dev` / `npm start`), not `next dev` / `next start`: those skip socket.io, so chat and live notifications would stop working.

## Layout

```
server.js                 custom server: Next.js + socket.io
src/app/                  routes (pages + api/)
src/app/(dashboard)/      logged-in pages; layout.js applies the login/role guard and sidebar shell
src/views/                page components
src/components/           Layout (dashboard shell), ProtectedRoute, landing page sections
src/server/               db connection, auth, controllers, models, email
src/lib/                  browser helpers: axios instance, socket client
```
