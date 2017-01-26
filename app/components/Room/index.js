import React, { Component } from 'react';
import 'aframe-firebase-component';
import '../aframe/components/canvasMaterial.js';
import config from '../../db/config.js';

//////////////////////////////////////////////
// EventEmitter - not sure if we need this with firebase now - relic from whiteboard
//////////////////////////////////////////////
window.EventEmitter = class EventEmitter {
  constructor () {
    this.subscribers = {};
  }

  on (eventName, eventListener) {
    if (!this.subscribers[eventName]) {
      this.subscribers[eventName] = [];
    }

    // Push the given listener function into the array
    // located on the instance's subscribers object.
    this.subscribers[eventName].push(eventListener);
  }

  emit (eventName, ...args) {
    if (!this.subscribers[eventName]) {
      return;
    }

    // For each subscriber, call it with our arguments.
    this.subscribers[eventName].forEach(listener => listener(...args));
  }
};

window.whiteboard = new window.EventEmitter();

// Used to send logs to the server in case we don't have remote mobile console setup
function netLog(...input){
  // console.log("here")
  let joinedInput = input.join(' , ')
  // console.log(joinedInput)
  // axios.post('/api/logs', {message: joinedInput } )
}

let isVR = false;


// Copy the config.js object from the slack channel
let aframeConfig = AFRAME.utils.styleParser.stringify(config);

export default class Room extends Component {
  componentDidMount() {
    let eventTimeout

    function eventThrottler (e, fn) {

      if (!eventTimeout) {
        eventTimeout = setTimeout(function(){
          eventTimeout = null
          fn(e)
        }, 2)
      }
    }

    const wBoard = document.getElementById('wBoard')  // whiteboard
    // const box2 = document.getElementById('box2')
    const scene = document.querySelector('a-scene')
    const remote = document.getElementById('remote')

    document.addEventListener("loaded", () => {
      const component = document.getElementById("wBoard").components["canvas-material"];
      const ctx = component.getContext("2d");

      //The firebase object
      // const firebase = document.querySelector('a-scene').systems.firebase.firebase
      // const db = firebase.database();

      ctx.lineWidth = 5;
      ctx.lineJoin = 'bevel';
      ctx.lineCap = 'round';


      const currentRayPosition = { x: 0, y: 0 };
      const lastRayPosition = { x: 0, y: 0 };

      let drawing = false;

      let position;

      remote.addEventListener('buttondown', function (e) {
          drawing = true;
          netLog("buttown down canvas event at e", e)
          let proj = toBoardPosition(position, scene.camera)
          currentRayPosition.x = proj.x //- this.offsetLeft;
          currentRayPosition.y = proj.y //- this.offsetTop;
      });

      remote.addEventListener('buttonup', function (e) {
          netLog("buttown up canvas event at e", e)
          drawing = false;
      });

      //converts 3D point to 2d space
      function toBoardPosition(obj, camera, objCasted) {
          // netLog(obj, camera)
          var vector = new THREE.Vector3();
          vector.x = obj.x
          vector.y = obj.y
          vector.z = obj.z
          // netLog("vector", vector)
          var widthHalf = 0.5*component.data.width;
          var heightHalf = 0.5*component.data.height;
          // netLog("widthHalf", widthHalf, "heightHalf", heightHalf)
          // obj.updateMatrixWorld();
          // netLog("OBJ.MATRIXWORLD", JSON.stringify(obj.matrixWorld));
          // vector.setFromMatrixPosition(objCasted.matrixWorld);
          vector.project(camera);
          // console.log(vector.x)
          // console.log(vector.y)
          vector.x = ( vector.x * widthHalf ) + widthHalf;
          vector.y = -( vector.y * heightHalf ) + heightHalf;

          return {
              x: vector.x,
              y: vector.y
          };
      }

      function raycasterEventHandler (e) {
             // netLog(e.detail)
             // netLog("raycaster canvas event at e", JSON.stringify(e.detail.intersection.point));
             // netLog("here before proj")
             position = e.detail.intersection.point
             if (!drawing) return;
             // netLog("here about to proj")
             // netLog("here about to proj-sceneCamera", wBoard.sceneEl.cameraEl)
             // netLog("scene", scene)
             // netLog("scene-camera", scene.camera)

             let proj = toBoardPosition(position, scene.camera, wBoard)
             lastRayPosition.x = currentRayPosition.x;
             lastRayPosition.y = currentRayPosition.y;

             currentRayPosition.x = proj.x //- this.offsetLeft;
             currentRayPosition.y = proj.y //- this.offsetTop;
             whiteboard.draw = function (start, end, strokeColor = 'black', shouldBroadcast) {

               // Draw the line between the start and end positions
               // that is colored with the given color.
               ctx.beginPath();
               ctx.strokeStyle = strokeColor;
               ctx.moveTo(start.x, start.y);
               ctx.lineTo(end.x, end.y);
               ctx.closePath();
               ctx.stroke();


               if (shouldBroadcast) {
                   whiteboard.emit('draw', start, end, strokeColor);
               }
             };

             whiteboard.draw(lastRayPosition, currentRayPosition, 'black', true);
             component.updateTexture();
      }

      wBoard.addEventListener('raycaster-intersected',
        (e) => { eventThrottler(e, raycasterEventHandler) }
      );
    });
  }


  render() {
    return (
      <div style={{ width: '100%', height: '100%' }}>

        <a-scene firebase={aframeConfig}>

          {/*<a-assets>
            <img id="fsPano" src="/IMG_3941.JPG" />
          </a-assets>*/}

          <a-entity position="-0.2 2.0 0">
            <a-entity id="remote" daydream-controller raycaster="objects: .selectable">
              <a-cone id="ray" color="cyan" position="0 0 -2" rotation="-90 0 0" radius-bottom="0.005" radius-top="0.001" height="4"></a-cone>
              <a-box id="position-guide" visible="false" position="0 0 -2"></a-box>
            </a-entity>
          </a-entity>

          <a-sky material="color: pink"></a-sky>
          <a-plane id="wBoard"  canvas-material="width: 500; height: 500" scale="10 4 4" class="selectable" position="0 2 -4" ></a-plane>
          {/*<a-box id="box2" class="selectable" scale="10 4 4" material="color: green; shader: flat" position="0 2 10"></a-box>*/}

        </a-scene>
      </div>
    );
  }
}

