const socket = io();

// Video Call
const myFace = document.querySelector("#myFace");
const yourFace = document.querySelector("#yourFace");
const muteButton = document.querySelector("#mute");
const cameraButton = document.querySelector("#camera");
const cameraSelect = document.querySelector("#camera-device");

let myStream;
let mute = false;
let camera = false;
let roomName;
let myPeerConnection;

async function getCameras() {
  try {
    const devices = await navigator.mediaDevices.enumerateDevices();
    const cameras = devices.filter((device) => device.kind === "videoinput");
    const currentCamera = myStream.getVideoTracks()[0];
    cameras.forEach((camera) => {
      const option = document.createElement("option");
      option.value = camera.deviceId;
      option.innerText = camera.label;
      if (currentCamera.label === camera.label) {
        option.selected = true;
      }
      cameraSelect.appendChild(option);
    });
  } catch (e) {
    console.error(e);
  }
}

async function getMedia(deviceId) {
  const initialConstrains = {
    audio: true,
    video: { facingMode: "user" },
  };
  const afterConstraions = {
    audio: true,
    video: { deviceId: { exact: deviceId } },
  };
  try {
    myStream = await navigator.mediaDevices.getUserMedia(
      deviceId ? afterConstraions : initialConstrains,
    );
    myFace.srcObject = myStream;
    if (!deviceId) {
      await getCameras();
    }
  } catch (e) {
    console.error(e);
  }
}

function handleMuteClick() {
  myStream
    .getAudioTracks()
    .forEach((track) => (track.enabled = !track.enabled));
  if (mute) {
    muteButton.innerText = "UnMute";
    mute = false;
  } else {
    muteButton.innerText = "Mute";
    mute = true;
  }
}

function handleCameraClick() {
  myStream
    .getVideoTracks()
    .forEach((track) => (track.enabled = !track.enabled));

  if (camera) {
    cameraButton.innerText = "Camera Off";
    camera = false;
  } else {
    cameraButton.innerText = "Camera On";
    camera = true;
  }
}

async function handleCameraChange() {
  await getMedia(cameraSelect.value);
  if (myPeerConnection) {
    const videoTrack = myStream.getVideoTracks()[0];
    const videoSender = myPeerConnection
      .getSenders()
      .find((sender) => sender.track.kind === "video");
    videoSender.replaceTrack(videoTrack);
  }
}

muteButton.addEventListener("click", handleMuteClick);
cameraButton.addEventListener("click", handleCameraClick);
cameraSelect.addEventListener("input", handleCameraChange);

// Welcome Form (Choose Room)
const welcome = document.querySelector("#welcome");
const welcomeForm = welcome.querySelector("form");
const call = document.querySelector("#call");
call.hidden = true;

async function initCall() {
  welcome.hidden = true;
  call.hidden = false;
  await getMedia();
  makeConnection();
}

async function handleWelcomeSubmit(event) {
  event.preventDefault();
  const input = welcomeForm.querySelector("input");
  await initCall();
  socket.emit("join_room", input.value);
  roomName = input.value;
  input.value = "";
}

welcomeForm.addEventListener("submit", handleWelcomeSubmit);

// Socket Code
socket.on("welcome", async () => {
  const offer = await myPeerConnection.createOffer();
  myPeerConnection.setLocalDescription(offer);
  socket.emit("offer", offer, roomName);
  console.log("sent offer");
});

socket.on("offer", async (offer) => {
  myPeerConnection.setRemoteDescription(offer);
  console.log("received offer");
  const answer = await myPeerConnection.createAnswer();
  myPeerConnection.setLocalDescription(answer);
  socket.emit("answer", answer, roomName);
  console.log("sent answer");
});

socket.on("answer", (answer) => {
  myPeerConnection.setRemoteDescription(answer);
  console.log("received answer");
});

socket.on("ice_candidate", (iceCandidate) => {
  myPeerConnection.addIceCandidate(iceCandidate);
  console.log("received candidate");
});

// RTC Code
function makeConnection() {
  myPeerConnection = new RTCPeerConnection({
    iceServers: [
      {
        urls: [
          "stun:stun.l.google.com:19302",
          "stun:stun1.l.google.com:19302",
          "stun:stun2.l.google.com:19302",
          "stun:stun3.l.google.com:19302",
          "stun:stun4.l.google.com:19302",
        ],
      },
    ],
  });
  myPeerConnection.addEventListener("icecandidate", handleIceCandidate);
  myPeerConnection.addEventListener("track", handleTrack);
  myStream
    .getTracks()
    .forEach((track) => myPeerConnection.addTrack(track, myStream));
}

function handleIceCandidate(data) {
  socket.emit("ice_candidate", data.candidate, roomName);
  console.log("sent candidate");
}

function handleTrack(data) {
  console.log("handle track");
  const yourFace = document.querySelector("#yourFace");
  yourFace.srcObject = data.streams[0];
}
