const socket = io();

// Video Call
const myFace = document.querySelector("#myFace");
const muteButton = document.querySelector("#mute");
const cameraButton = document.querySelector("#camera");
const cameraSelect = document.querySelector("#camera-device");

let myStream;
let mute = false;
let camera = false;

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
    if (!deviceId) {
      await getCameras();
    }
    myFace.srcObject = myStream;
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
}

getMedia();
muteButton.addEventListener("click", handleMuteClick);
cameraButton.addEventListener("click", handleCameraClick);
cameraSelect.addEventListener("input", handleCameraChange);
