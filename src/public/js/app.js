const socket = io();

const welcome = document.querySelector("#welcome");
const form = welcome.querySelector("form");
const room = document.querySelector("#room");

function showRoom(newCount) {
  welcome.hidden = true;
  room.hidden = false;
  const h2 = room.querySelector("h2");
  h2.innerText = `Room ${roomName} (${newCount})`;

  const messageForm = room.querySelector("#message");
  const nicknameForm = room.querySelector("#nickname");

  messageForm.addEventListener("submit", handelMessageSubmit);
  nicknameForm.addEventListener("submit", handelNicknameSubmit);
}

function handelNicknameSubmit(event) {
  event.preventDefault();
  const nicknameInput = room.querySelector("#nickname input");
  const value = nicknameInput.value;
  socket.emit("nickname", value);
}

function handelMessageSubmit(event) {
  event.preventDefault();
  const messageInput = room.querySelector("#message input");
  const value = messageInput.value;
  socket.emit("new_message", value, roomName, () => {
    addMessage(`You: ${value}`);
  });
  messageInput.value = "";
}

function addMessage(message) {
  const ul = room.querySelector("ul");
  const li = document.createElement("li");
  li.innerText = message;
  ul.append(li);
}

room.hidden = true;
let roomName;
function handleRoomSubmit(event) {
  event.preventDefault();
  const input = form.querySelector("input");
  socket.emit("enter_room", input.value, showRoom);
  roomName = input.value;
  input.value = "";
}

form.addEventListener("submit", handleRoomSubmit);

socket.on("welcome", (user, newCount) => {
  const h2 = room.querySelector("h2");
  h2.innerText = `Room ${roomName} (${newCount})`;
  addMessage(`${user} joined!`);
});

socket.on("bye", (user, newCount) => {
  const h2 = room.querySelector("h2");
  h2.innerText = `Room ${roomName} (${newCount})`;
  addMessage(`${user} left!`);
});

socket.on("new_message", (msg) => {
  addMessage(msg);
});

socket.on("room_change", (rooms) => {
  const roomList = welcome.querySelector("ul");
  roomList.innerHTML = "";

  rooms.forEach((room) => {
    const li = document.createElement("li");
    li.innerText = room;
    roomList.append(li);
  });
});
