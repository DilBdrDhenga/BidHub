import dotenv from 'dotenv';
import { app } from "./app.js";
import connectDB from './db/db.js';
import http from "http";
import { Server } from "socket.io";
import { socketIoConnection } from './socketio/socketio.js';



dotenv.config({path: "./.env"});

const server = http.createServer(app);
const io = new Server(server, {
    cors: {
        origin: "http://localhost:5173",
        methods: ["GET", "POST"],
        credentials: true
    }
});


connectDB()
.then(
  server.listen(process.env.PORT || 8000, () => {
    console.log(`server is running at port ${process.env.PORT}`)
  })
)


socketIoConnection()

export { io, server }


