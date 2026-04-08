const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const http = require('http');
const { Server } = require('socket.io');
const connectDB = require('./config/db');
const contactRoutes = require('./routes/contactRoutes');

dotenv.config();
connectDB();

const app = express();
app.use(cors());
app.use(express.json());

app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/listings', require('./routes/listingRoutes'));
app.use('/api/orders', require('./routes/orderRoutes'));
app.use('/api/messages', require('./routes/messageRoutes'));
app.use('/api/notifications', require('./routes/notificationRoutes'));
app.use('/api/users', require('./routes/userRoutes'));
app.use('/api/reviews', require('./routes/reviewRoutes'));
app.use('/api/admin', require('./routes/adminRoutes'));
app.use('/api/contact', contactRoutes);

const server = http.createServer(app);
const io = new Server(server, {
  cors: { origin: "https://guestpostinglive.netlify.app", methods: ["GET", "POST"] }
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

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => console.log(`Server on port ${PORT}`));