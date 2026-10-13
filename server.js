// Custom Next.js server: serves the app and API on one port and hosts the
// socket.io real-time layer (live chat + notification toasts), which Next.js
// route handlers cannot do on their own.
const http = require('http');
const { loadEnvConfig } = require('@next/env');

const dev = process.env.NODE_ENV !== 'production';
loadEnvConfig(__dirname, dev);

const next = require('next');
const { Server } = require('socket.io');

const PORT = parseInt(process.env.PORT || '5000', 10);
const allowedOrigin = process.env.FRONTEND_URL || "https://guestposting.live";

const app = next({ dev, dir: __dirname });
const handle = app.getRequestHandler();

app.prepare().then(() => {
    const server = http.createServer((req, res) => handle(req, res));

    const io = new Server(server, {
        cors: {
            origin: allowedOrigin,
            methods: ["GET", "POST"]
        },
        // Leave non-socket.io upgrade requests (Next's dev HMR) alone.
        destroyUpgrade: false,
    });

    const connectedUsers = new Map();

    io.on("connection", (socket) => {
        socket.on("identify", (userId) => {
            connectedUsers.set(userId, socket.id);
            console.log(`User ${userId} is online.`);
        });

        socket.on("join_order", (orderId) => {
            socket.join(orderId);
        });

        socket.on("send_message", (data) => {
            socket.to(data.orderId).emit("receive_message", data);

            const recipientSocket = connectedUsers.get(data.recipientId);
            if (recipientSocket) {
                io.to(recipientSocket).emit("new_notification", {
                    message: data.notificationText || "New message received",
                    link: `/orders/${data.orderId}`,
                    isRead: false
                });
            }
        });

        socket.on("disconnect", () => {
            for (let [userId, socketId] of connectedUsers.entries()) {
                if (socketId === socket.id) {
                    connectedUsers.delete(userId);
                    break;
                }
            }
        });
    });

    server.listen(PORT, () => console.log(`Server running on port ${PORT} (${dev ? 'development' : 'production'})`));
}).catch((err) => {
    console.error(err);
    process.exit(1);
});
