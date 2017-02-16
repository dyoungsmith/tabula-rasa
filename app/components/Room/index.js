import React, { Component } from 'react';
import 'aframe-firebase-component';
import '../aframe/components/canvasMaterial.js';
import config from '../../db/config.js';

// // Used to send logs to the server in case we don't have remote mobile console setup
// function netLog(...input){
//   // console.log("here")
//   let joinedInput = input.join(' , ')
//   // console.log(joinedInput)
//   // axios.post('/api/logs', {message: joinedInput } )
// }

let isVR = false;


// Copy the config.js object from the slack channel
let aframeConfig = AFRAME.utils.styleParser.stringify(config);

const drawColor = {
    index:0,
    color:'black'
  }

var connection = new RTCMultiConnection();

export default class Room extends Component {


  componentDidMount() {

    connection.audiosContainer = document.getElementById('audios-container');

    var predefinedRoomId = 'YOUR_Name';

    document.getElementById('btn-open-room').onclick = function() {
        this.disabled = true;
        connection.open( predefinedRoomId );
    };

    document.getElementById('btn-join-room').onclick = function() {
        this.disabled = true;
        connection.join( predefinedRoomId );
    };

    document.addEventListener("loaded", () => {

      const possibleColors = ['black','red','orange','yellow','green','blue','indigo','violet']

      const wBoard = document.getElementById('wBoard')  // whiteboard
      const undoButton = document.getElementById('undoButton')
      const colorBox = document.getElementById('colorBox')
      const ray = document.getElementById('ray')

      const component = document.getElementById("wBoard").components["canvas-material"];
      const ctx = component.getContext("2d");
      const marker = document.querySelector('#marker')

      const scene = document.querySelector('a-scene')
      const remote = document.getElementById('remote')
      const cursor = document.querySelector('a-cursor')


      //The firebase object
      // const firebase = document.querySelector('a-scene').systems.firebase.firebase
      // const db = firebase.database();

      ctx.lineWidth = 2;
      ctx.lineJoin = 'bevel';
      ctx.lineCap = 'round';


      const currentRayPosition = { x: 0, y: 0 };
      const lastRayPosition = { x: 0, y: 0 };

      let drawing = false;

      let position;

      let history = []
      let currentStroke = []

      function intersectsWithRaycaster(entityId){
        const intersectedEls = remote.components.raycaster.intersectedEls
        return intersectedEls.some(item=>item.id===entityId)
      }

      const colorChange = ()=>{
        drawColor.index++
        if (drawColor.index >= possibleColors.length) drawColor.index = 0
        drawColor.color = possibleColors[drawColor.index]
        colorBox.setAttribute('color', drawColor.color)
        ray.setAttribute('color', drawColor.color)
      }

      remote.addEventListener('buttondown', function (e) {

          if (intersectsWithRaycaster('colorBox')) return colorChange()
          if (intersectsWithRaycaster('undoButton')) return undo()

          drawing = true
          let proj = toBoardPosition(position, wBoard)
          //offsets would be necessary for whiteboards not placed at origin
          currentRayPosition.x = proj.x //- this.offsetLeft;
          currentRayPosition.y = proj.y //- this.offsetTop;
      });

      remote.addEventListener('buttonup', function (e) {

          if (currentStroke.length){
            history.push(currentStroke)
            currentStroke = []
          }

          drawing = false
      });

      //converts 3D point to 2d space


      function toBoardPosition(pointPosition, wBoard) {
          const canvasMat = wBoard.components["canvas-material"];
          const canWidth = canvasMat.data.width;
          const canHeight = canvasMat.data.height;

          const wBoardHeight = wBoard.getAttribute('height')
          const wBoardWidth = wBoard.getAttribute('width')
          const x = (wBoardWidth/2 + pointPosition.x)*(canWidth/wBoardWidth)
          const y = (wBoardHeight/2 - pointPosition.y)*(canHeight/wBoardHeight)

          return {
              x,
              y
          }
      }

      const draw = function (start, end, strokeColor = drawColor.color, shouldBroadcast=true, shouldRecord=true) {

        if (shouldRecord) {
          //deep copy of subStroke as to not close over and overwrite
          const subStroke = {
            start:Object.assign({}, start),
            end:Object.assign({},end),
            strokeColor
          }
          currentStroke.push(subStroke)
        }

        // Draw the line between the start and end positions
        // that is colored with the given color.
        ctx.beginPath()
        ctx.strokeStyle = strokeColor;
        ctx.moveTo(start.x, start.y);
        ctx.lineTo(end.x, end.y);
        ctx.stroke();

        //change later to emit a firebase "draw" event
        if (shouldBroadcast) {
            // whiteboard.emit('draw', start, end, strokeColor);
        }
        component.updateTexture()
      };

      const undo = function(){
        if (!history.length) return
        history.pop()
        component.clearContext()
        history.forEach(stroke =>
          stroke.forEach(subStroke =>
            draw(subStroke.start, subStroke.end, subStroke.strokeColor, true, false)))

      }


      function raycasterEventHandler (e) {
              //for raycaster-intersected, access intersection.point
             position = e.detail.intersections[0].point
             marker.setAttribute('position', position)
             if (!drawing) return;
             let proj = toBoardPosition(position, wBoard)

             lastRayPosition.x = currentRayPosition.x;
             lastRayPosition.y = currentRayPosition.y;

             currentRayPosition.x = proj.x //- this.offsetLeft;
             currentRayPosition.y = proj.y //- this.offsetTop;

             draw(lastRayPosition, currentRayPosition, drawColor.color, true);

      }

      let eventTimeout

      function eventThrottler (e, fn) {

        if (!eventTimeout) {
          eventTimeout = setTimeout(function(){
            eventTimeout = null
            fn(e)
          }, 2)
        }
      }

      //change the drawColor by entering box with gaze
      colorBox.addEventListener('mouseenter', ()=>{
        drawColor.index++
        if (drawColor.index >= possibleColors.length) drawColor.index = 0
        drawColor.color = possibleColors[drawColor.index]
        colorBox.setAttribute('color', drawColor.color)
        ray.setAttribute('color', drawColor.color)
      })




      //before listener was on whiteboard, was triggered by gaze
      // wBoard.addEventListener('raycaster-intersected',
      //   e => {
      //     console.log('!!!', e.detail.raycaster)
      //     eventThrottler(e, raycasterEventHandler)
      //   }
      // )
      remote.addEventListener('raycaster-intersection',
        e => {
          eventThrottler(e, raycasterEventHandler)
        }
      )


      //for simulating click without remote
      document.addEventListener('keydown', (e)=> remote.emit('buttondown'))
      document.addEventListener('keyup', (e)=> remote.emit('buttonup'))

    });
  }

  render() {
    let value;
    let value2;
    function chooseDest() {
        let radios = Array.from(document.getElementsByName('switch'));
        console.log("radios", radios);
        value = radios.filter(radio => radio.checked === true)[0].value
        value2 = radios.filter(radio => radio.checked !== true)[0].value
    }

    connection.socketURL = 'https://rtcmulticonnection.herokuapp.com:443/';

    connection.socketMessageEvent = 'audio-conference-demo';

    connection.session = {
        audio: true
    };

    connection.sdpConstraints.mandatory = {
        OfferToReceiveAudio: true,
        OfferToReceiveVideo: false
    };

    connection.mediaConstraints.video = false;


    connection.onstream = function(event) {
      console.log("event", event);
      var width = parseInt(connection.audiosContainer.clientWidth / 2) - 20;
      var mediaElement = getMediaElement(event.mediaElement, {
        title: event.userid,
        buttons: ['full-screen'],
        width: width,
        showOnMouseEnter: false
      });
      connection.audiosContainer.appendChild(mediaElement);

      setTimeout(function() {
          console.log("this is playing")
          mediaElement.media.play();
        }, 5000);

      mediaElement.id = event.streamid;
    };

    connection.onstreamended = function(event) {
          var mediaElement = document.getElementById(event.streamid);
          if(mediaElement) {
              mediaElement.parentNode.removeChild(mediaElement);
          }
    };



    return (
      <div style={{ width: '100%', height: '100%' }}>

        <input type="text" id="id1" value="id1" />

        <input type="text" id="id2" value="id2" />

        <audio id="their-audio"></audio>
        <button id="btn-open-room">Open Room</button>
        <button id="btn-join-room">Join Room</button>
        <button onClick={chooseDest.bind(this)}>
          choose dest id
        </button>
        <input type="radio" name="switch" value="id1" />

        <input type="radio" name="switch" value="id2" />

        <div id="audios-container"></div>

        <a-scene firebase={ aframeConfig } inspector="url: https://aframe.io/releases/0.3.0/aframe-inspector.min.js">

         <a-assets>
            <a-asset-item id="marker-obj" src="Marker_.obj"></a-asset-item>
            <a-asset-item id="marker-mtl" src="Marker_.mtl"></a-asset-item>

          </a-assets>

          <a-camera>
            <a-cursor></a-cursor>
          </a-camera>

          <a-entity position="-0.2 2.0 0">
            <a-entity visible="false" id="remote" daydream-controller raycaster="objects: .selectable">
              <a-cone visible="false" id="ray" color={drawColor.color} position="0 0 -2" rotation="-90 0 0" radius-bottom="0.005" radius-top="0.001" height="4"></a-cone>
              <a-box id="position-guide" visible="false" position="0 0 -2"></a-box>
            </a-entity>
          </a-entity>

          <a-entity position="0 0 0.5">
            <a-entity id="marker" obj-model="obj: #marker-obj; mtl: #marker-mtl" rotation="0 270 0" scale=".25 .25 .25"></a-entity>
          </a-entity>

          <a-sky material="color: pink"></a-sky>

          <a-plane id="wBoard" canvas-material="width: 512; height: 512;color: white" height="10" width="20" class="selectable" position="0 0 -8" ></a-plane>

         <a-box id="undoButton" position="0 4 -3" color="orange" class="selectable"></a-box>
         <a-box id="colorBox" position="-4 4 -3" color={drawColor.color} class="selectable"></a-box>

        </a-scene>
      </div>
    );
  }
}
