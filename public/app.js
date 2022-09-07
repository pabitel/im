mdc.ripple.MDCRipple.attachTo(document.querySelector('.mdc-button'));

const configuration = {
  iceServers: [
    {
      urls: [
        'stun:stun1.l.google.com:19302',
        'stun:stun2.l.google.com:19302',
      ],
    },
  ],
  iceCandidatePoolSize: 10,
};

let peerConnection = null;
let localStream = null;
let remoteStream = null;
let roomDialog = null;
let roomId = null;
function init() {
  document.querySelector('#cameraBtn').addEventListener('click', openUserMedia);
  document.querySelector('#hangupBtn').addEventListener('click', hangUp);
  document.querySelector('#createBtn').addEventListener('click', createRoom);
  document.querySelector('#joinBtn').addEventListener('click', joinRoom);
  roomDialog = new mdc.dialog.MDCDialog(document.querySelector('#room-dialog'));
}

async function createRoom() {
  document.querySelector('#createBtn').disabled = true;
  document.querySelector('#joinBtn').disabled = true;
  console.log('Create PeerConnection with configuration: ', configuration);
  peerConnection = new RTCPeerConnection(configuration);

  registerPeerConnectionListeners();

  localStream.getTracks().forEach(track => {
    peerConnection.addTrack(track, localStream);
  });


  // Code for creating a room below
  const offer = await peerConnection.createOffer();
  await peerConnection.setLocalDescription(offer);
  console.log('Created offer:', offer);

  const roomWithOffer = {
    'offer': {
      type: offer.type,
      sdp: offer.sdp,
    },
  };


  roomId = addToCollection("rooms", roomWithOffer);
  console.log(`New room created with SDP offer. Room ID: ${roomId}`);
  document.querySelector(
      '#currentRoom').innerText = `Current room is ${roomId} - You are the caller!`;
  // Code for creating a room above

  peerConnection.addEventListener('track', event => {
    console.log('Got remote track:', event.streams[0]);
    event.streams[0].getTracks().forEach(track => {
      console.log('Add a track to the remoteStream:', track);
      remoteStream.addTrack(track);
    });
  });

  peerConnection.addEventListener('icecandidate', event => {
    if (!event.candidate) {
      console.log('Got final candidate!');
      return;
    }
    console.log('Got candidate: ', event.candidate);
    addToCollection(callerCandidates, {
      roomId: roomId,
      candidate: event.candidate.toJSON()
    })
  });


 roomMonitorFun(async ()=>{
   let room = getRoomByCallerRoomId(roomId);
   if(room!=null){
      clearInterval(roomMonitor);
      if (!peerConnection.currentRemoteDescription && room && room.answer) {
       console.log('Got remote description: ', room.answer);
       const rtcSessionDescription = new RTCSessionDescription(room.answer);
       await peerConnection.setRemoteDescription(rtcSessionDescription);
     }
   }
 })



  // Listening for remote session description above

  // Listen for remote ICE candidates below
  calleeCanMonitorFunc(async ()=>{
    let data = getCalleeByRoomId(roomId);
    if(data!=null &&  data!=undefined && data.length>0){
      clearInterval(calleeCanMonitor);
      console.log(`Got new remote ICE candidate: ${JSON.stringify(data)}`);
      let candidate = data[data.length-1]
      await peerConnection.addIceCandidate(new RTCIceCandidate(candidate.candidate));
    }

  });
  // Listen for remote ICE candidates above
}

function joinRoom() {
  document.querySelector('#createBtn').disabled = true;
  document.querySelector('#joinBtn').disabled = true;

  document.querySelector('#confirmJoinBtn').
  addEventListener('click', async () => {
    roomId = document.querySelector('#room-id').value;
    console.log('Join room: ', roomId);
    document.querySelector(
        '#currentRoom').innerText = `Current room is ${roomId} - You are the callee!`;
    await joinRoomById(roomId);
  }, {once: true});
  roomDialog.open();
}

async function joinRoomById(roomId) {
  const room = getRoomByRoomId(roomId);
  console.log('Got room:', room);

  if (room!=null) {
    console.log('Create PeerConnection with configuration: ', configuration);
    peerConnection = new RTCPeerConnection(configuration);
    registerPeerConnectionListeners();
    localStream.getTracks().forEach(track => {
      peerConnection.addTrack(track, localStream);
    });

    // Code for collecting ICE candidates below
    peerConnection.addEventListener('icecandidate', event => {
      if (!event.candidate) {
        console.log('Got final candidate!');
        return;
      }
      console.log('Got candidate: ', event.candidate);
      addToCollection("calleeCandidates",{roomId:roomId,candidate: event.candidate.toJSON()})
    });
    // Code for collecting ICE candidates above
    peerConnection.addEventListener('track', event => {
      console.log('Got remote track:', event.streams[0]);
      event.streams[0].getTracks().forEach(track => {
        console.log('Add a track to the remoteStream:', track);
        remoteStream.addTrack(track);
      });
    });

    // Code for creating SDP answer below
    const offer = room.offer;
    console.log('Got offer:', offer);
    await peerConnection.setRemoteDescription(new RTCSessionDescription(offer));
    const answer = await peerConnection.createAnswer();
    console.log('Created answer:', answer);
    await peerConnection.setLocalDescription(answer);

    const roomWithAnswer = {
      'answer': {
        type: answer.type,
        sdp: answer.sdp,
      },
      'callerRoomId': roomId
    };

    addToCollection("rooms",roomWithAnswer)

    // Listening for remote ICE candidates below

    // Listen for remote ICE candidates below
    callerCanMonitorFunc(async ()=>{
      let data = getCallerByRoomId(roomId);
      if(data!=null &&  data!=undefined && data.length>0){
        clearInterval(callerCanMonitor)
        console.log(`Got new remote ICE candidate: ${JSON.stringify(data)}`);
        // 取最后一个
        let candidate = data[data.length-1];
        await peerConnection.addIceCandidate(new RTCIceCandidate(candidate.candidate));
      }
    });
    // Listening for remote ICE candidates above
  }
}

async function openUserMedia(e) {
  const stream = await navigator.mediaDevices.getUserMedia(
      {video: false, audio: true});
  document.querySelector('#localVideo').srcObject = stream;
  localStream = stream;
  remoteStream = new MediaStream();
  document.querySelector('#remoteVideo').srcObject = remoteStream;

  console.log('Stream:', document.querySelector('#localVideo').srcObject);
  document.querySelector('#cameraBtn').disabled = true;
  document.querySelector('#joinBtn').disabled = false;
  document.querySelector('#createBtn').disabled = false;
  document.querySelector('#hangupBtn').disabled = false;
}

async function hangUp(e) {
  const tracks = document.querySelector('#localVideo').srcObject.getTracks();
  tracks.forEach(track => {
    track.stop();
  });

  if (remoteStream) {
    remoteStream.getTracks().forEach(track => track.stop());
  }

  if (peerConnection) {
    peerConnection.close();
  }

  document.querySelector('#localVideo').srcObject = null;
  document.querySelector('#remoteVideo').srcObject = null;
  document.querySelector('#cameraBtn').disabled = false;
  document.querySelector('#joinBtn').disabled = true;
  document.querySelector('#createBtn').disabled = true;
  document.querySelector('#hangupBtn').disabled = true;
  document.querySelector('#currentRoom').innerText = '';

  // Delete room on hangup
  if (roomId) document.location.reload(true);
}

function registerPeerConnectionListeners() {
  peerConnection.addEventListener('icegatheringstatechange', () => {
    console.log(
        `ICE gathering state changed: ${peerConnection.iceGatheringState}`);
  });

  peerConnection.addEventListener('connectionstatechange', () => {
    console.log(`Connection state change: ${peerConnection.connectionState}`);
  });

  peerConnection.addEventListener('signalingstatechange', () => {
    console.log(`Signaling state change: ${peerConnection.signalingState}`);
  });

  peerConnection.addEventListener('iceconnectionstatechange ', () => {
    console.log(
        `ICE connection state change: ${peerConnection.iceConnectionState}`);
  });
}

init();
