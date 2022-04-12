const socket = new WebSocket(`ws://${window.location.host}`);

socket.addEventListener("open", () => {
  console.log("Connected Server ✅");
});

socket.addEventListener("message", (message) => {
  console.log("Just got this:", message.data, " -from server");
});

setTimeout(() => {
  socket.send("hello from the browser!");
}, 3000);

socket.addEventListener("close", () => {
  console.log("Connected Server ❌");
});
