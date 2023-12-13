const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const userRoutes = require("./routes/userRoutes");
const messagesRoute = require("./routes/messagesRoute");
const socket = require("socket.io");
const app = express();

app.use(cors());
app.use(express.json());

app.use("/api/auth", userRoutes);
app.use("/api/messages", messagesRoute);

mongoose.connect("mongodb://shantanus2410:zen06744@ac-2eeg2c7-shard-00-00.zoymdx8.mongodb.net:27017,ac-2eeg2c7-shard-00-01.zoymdx8.mongodb.net:27017,ac-2eeg2c7-shard-00-02.zoymdx8.mongodb.net:27017/chat-app?ssl=true&replicaSet=atlas-vsgx2l-shard-0&authSource=admin&retryWrites=true&w=majority",{
    useNewUrlParser : true,
    useUnifiedTopology : true,
}).then(()=>{
    console.log('MongoDB Connected');
}).catch((err) => {
    console.log(err.message);
});

const server = app.listen(5000, ()=>{
    console.log(`Server started on port ${process.env.PORT || 5000}`);
});

const io = socket(server, {
    cors: {
        origin : "https://chatme-zph8.onrender.com",
        credentials: true,
    },
});

global.onlineUsers = new Map();

io.on("connection", (socket) => {
    global.chatSocket = socket;
    socket.on("add-user",(userId) => {
        onlineUsers.set(userId, socket.id);
    });

    socket.on("send-msg", (data) => {
        const sendUserSocket = onlineUsers.get(data.to);
        if(sendUserSocket) {
            socket.to(sendUserSocket).emit("msg-recieve", data.message);
        }
    });
});
