import express from "express";
import path from "path";
import { fileURLToPath } from "url";

import http from "http";
import { Server } from "socket.io";

const app = express();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

app.set("view engine", "pug");
app.set("views", __dirname + "/views");
app.use("/public", express.static(__dirname + "/public"));

app.get("/", (req, res) => res.render("home"));
app.get("/*", (req, res) => res.redirect("/"));

// Socket.io in Node JS
const httpServer = http.createServer(app);
const wsServer = new Server(httpServer); // after "socket.io" : v4.4.0 -> SocketIO (x) / Server (o)

wsServer.on("connection", (socket) => {
  socket.on("enter_room", (msg, done) => {
    console.log(msg);
    setTimeout(() => {
      done();
    }, 5000);
  });
});

const handleListen = () => console.log(`Listening on http://localhost:3000`);
httpServer.listen(3000, handleListen);
