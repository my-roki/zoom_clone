import express from "express";
import path from "path";
import { fileURLToPath } from "url";

import http from "http";
import { WebSocketServer } from "ws";

const app = express();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

app.set("view engine", "pug");
app.set("views", __dirname + "/views");
app.use("/public", express.static(__dirname + "/public"));

app.get("/", (req, res) => res.render("home"));
app.get("/*", (req, res) => res.redirect("/"));

/* 
// http
const handleListen = () => console.log(`Listening on http://localhost:3000`);
app.listen(3000, handleListen);
*/

// Web Socket in Node JS
const server = http.createServer(app);
const wss = new WebSocketServer({ server }); // after "ws": "^8.2.3" -> Websocket.Server (x) / WebSocketServer (o)

const sockets = [];
wss.on("connection", (socket) => {
  sockets.push(socket);
  socket["nickname"] = "Anonymous";
  console.log("Connected Browser ✅");

  socket.on("close", () => {
    console.log("Disonnected from Browser ❌");
  });
  socket.on("message", (message) => {
    const parsed = JSON.parse(message);
    switch (parsed.type) {
      case "nickname":
        socket["nickname"] = parsed.payload;
        break;
      case "message":
        // for All
        sockets.forEach((aSocket) =>
          aSocket.send(`${socket.nickname} : ${parsed.payload.toString()}`),
        );

        /* 
        // except me
        sockets
          .filter((aSocket) => aSocket != socket)
          .forEach((aSocket) =>
            aSocket.send(`${socket.nickname} : ${parsed.payload.toString()}`),
          );
        */
        break;
    }
  });
});

const handleListen = () => console.log(`Listening on http://localhost:3000`);
server.listen(3000, handleListen);
