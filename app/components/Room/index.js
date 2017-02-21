/******************************************************************************
*******************************************************************************/
import React, { Component } from 'react';
/******************************************************************************
We don't actually use this below, but it's supposed to simplify the firebase
process.  I think what Danni did works well though.
*******************************************************************************/
import 'aframe-firebase-component';
import '../aframe/components/canvasMaterial.js';
import db from '../../db';


/******************************************************************************
This line below converts a JSON config file to the attribute/css like system
aframe uses.  There are other utility methods that are handy like this one.
let aframeConfig = AFRAME.utils.styleParser.stringify(config);
*******************************************************************************/



/******************************************************************************
Setting up a global drawColor for us to reference to help with saving the
different color strokes used
*******************************************************************************/
const drawColor = {
    index:0,
    color:'black'
}

/******************************************************************************
The audio is possible using RTCMultiConnection
http://www.rtcmulticonnection.org/docs/
*******************************************************************************/
var connection = new RTCMultiConnection();
/******************************************************************************
Global variable to create the remote marker that shows up in the other chat.
*******************************************************************************/
let remoteMarker;

export default class Room extends Component {

  componentDidMount() {

    /******************************************************************************
    The reason everything underneath is listed under a loaded event is because the
    canvas-material component needs to make it loads before we fetch from the element
    from the dom
    *******************************************************************************/
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

      /******************************************************************************
      These are the stroke settings for the brush
      ******************************************************************************/
      ctx.lineWidth = 2;
      ctx.lineJoin = 'bevel';
      ctx.lineCap = 'round';

      /******************************************************************************
      Globalish draw settings and variable inits
      ******************************************************************************/
      const currentRayPosition = { x: 0, y: 0 };
      const lastRayPosition = { x: 0, y: 0 };

      let drawing = false;

      let position;

      let history = [];
      let currentStroke = [];

      /******************************************************************************
      This is a function that checks to see if a given entityId intersects
      with the raycaster.
      ******************************************************************************/
      function intersectsWithRaycaster(entityId){
        const intersectedEls = remote.components.raycaster.intersectedEls;
        return intersectedEls.some(item => item.id === entityId);
      }

      /******************************************************************************
      ColorChange is a function that is an event handler for whenever someone
      gazes at the color change box
      ******************************************************************************/
      const colorChange = () => {
        drawColor.index++;
        if (drawColor.index >= possibleColors.length) drawColor.index = 0;
        drawColor.color = possibleColors[drawColor.index];
        colorBox.setAttribute('color', drawColor.color);
        ray.setAttribute('color', drawColor.color);
      }

      /******************************************************************************
      whenever the button down button is pressed on the daydream controller,
      here is where different events are handled depending on what the raycaster
      was intersecting with
      ******************************************************************************/
      remote.addEventListener('buttondown', function (e) {
          if (intersectsWithRaycaster('colorBox')) return colorChange();
          if (intersectsWithRaycaster('undoButton')) return undo();

          drawing = true;
          /******************************************************************************
          toBoardPosistion returns back an object of x and y
          that takes the position of where the raycaster intersected in the global space
          and translates it to to an x and y in 2d-space on the canvas
          ******************************************************************************/
          let proj = toBoardPosition(position, wBoard);


          currentRayPosition.x = proj.x
          currentRayPosition.y = proj.y
      });
      /******************************************************************************
      When the button is released, then the current stroke get's pushed to the history
      array

      The currentStroke is also being sent to the firebase room
      ******************************************************************************/
      remote.addEventListener('buttonup', function (e) {
          if (currentStroke.length) {
            history.push(currentStroke);
            const newOuterIdx = history.length - 1;

            // update fb db
            currentStroke.forEach((substroke, i) => {
              db.ref(`room1/${newOuterIdx}/${i}`).set({
                startX: substroke.start.x,
                startY: substroke.start.y,
                endX: substroke.end.x,
                endY: substroke.end.y,
                strokeColor: substroke.strokeColor
              });
            });
            currentStroke = [];
          }

          drawing = false;
      });

      /* db format:
        i: {  // key by outerIdx from history array
          j: {  // innerIdx
            startX: 1,
            startY: 4,
            endX: 6,
            endY: 9,
            strokeColor: red
          }
        }
      */

      /******************************************************************************
      This function takes 3d point and translates it to a 2d point.
      the second argument is in case you decide to add other boards
      ******************************************************************************/
      function toBoardPosition(pointPosition, wBoard) {
          const canvasMat = wBoard.components["canvas-material"];
          const canWidth = canvasMat.data.width;
          const canHeight = canvasMat.data.height;

          const wBoardHeight = wBoard.getAttribute('height')
          const wBoardWidth = wBoard.getAttribute('width')
          const x = (wBoardWidth/2 + pointPosition.x)*(canWidth/wBoardWidth)
          const y = (wBoardHeight/2 - pointPosition.y)*(canHeight/wBoardHeight)

          return { x, y }
      }


      /******************************************************************************
      This is the main draw function that takes a start point, end point, stroke color, and should it be recorded Bool

      it then takes the substroke and pushes them to the current stroke, which is recorded
      as long as the button is being held down

      ctx is the whiteboard canvas context and how the lines are drawn.
      Begin path is the start of a stroke path,
      moveTo means lift up and move to that point
      lineTo means mean a straight line from the last point
      and stroke gives that path an actual shape.

      the component canvas-material has a method which 3JS needs in order to update the
      texture(material) used for the mesh(a shape with Geomotry and a material for texture)
      this must be run whenever you want to update the texture
      ******************************************************************************/
      const draw = function(start, end, strokeColor = drawColor.color, shouldRecord = true) {
        if (shouldRecord) {
          //deep copy of subStroke as to not close over and overwrite
          const subStroke = {
            start: Object.assign({}, start),  // ie: {x: 3, y: 4}
            end: Object.assign({}, end),
            start:Object.assign({}, start),
            end:Object.assign({},end),
            strokeColor
          }
          currentStroke.push(subStroke);
        }

        // Draw the line between the start and end positions
        // that is colored with the given color.
        ctx.beginPath()
        ctx.strokeStyle = strokeColor;
        ctx.moveTo(start.x, start.y);
        ctx.lineTo(end.x, end.y);
        ctx.stroke();

        component.updateTexture();
      };

      /******************************************************************************
      the undo function just pops out the last pushed stroke to history and then redraws
      each line up to that point.  It's attached as the click handler for the undo box
      ******************************************************************************/
      const undo = function() {
        if (!history.length) return;
        const idxToRemove = history.length - 1;
        history.pop();
        component.clearContext();
        history.forEach(stroke =>
          stroke.forEach(subStroke =>
            draw(subStroke.start, subStroke.end, subStroke.strokeColor, false)
          )
        )
        // UPDATE FB FROM HERE!!!
        db.ref(`room1/${idxToRemove}`).remove();
      }

      /******************************************************************************
      this  is the handler that gets called when the raycasater emits
      an intersection Event
      ******************************************************************************/
      function raycasterEventHandler (e) {
          //for raycaster-intersected, access intersection.point
          /******************************************************************************
          This sets up the global position to be updated when the raycaster intersects
          so that other function can use
          ******************************************************************************/
          position = e.detail.intersections[0].point
          /******************************************************************************
          this updates the position of the marker model to be at the end of the raycaster
          event

          fyi - when you change an attribute like below on a component is when it's
          update() method is called
          ******************************************************************************/
          marker.setAttribute('position', position)
          /******************************************************************************
          if drawing isn't true from the button being pressed down, then return out of this
          function
          ******************************************************************************/
          if (!drawing) return;

          /******************************************************************************
          get's the latest 2d position and draws the line
          ******************************************************************************/
          let proj = toBoardPosition(position, wBoard)
          lastRayPosition.x = currentRayPosition.x;
          lastRayPosition.y = currentRayPosition.y;

          currentRayPosition.x = proj.x //- this.offsetLeft;
          currentRayPosition.y = proj.y //- this.offsetTop;

          draw(lastRayPosition, currentRayPosition, drawColor.color);
      }

      // set up fb listener for drawing
      db.ref(`room1`).on('child_changed', snapshot => {
        console.log('CHILD WAS ADDED')
        console.log('HISTORY', history);
        if (!snapshot.val()) return;
        const substrokes = snapshot.val();    // array of strokes
        console.log('SNAPSHOT VAL', substrokes)

        const outerIdx = snapshot.ref.key;

        Object.keys(substrokes).forEach(innerIdx => {
          const currSubstroke = substrokes[innerIdx];
          const start = {
            x: currSubstroke.startX,
            y: currSubstroke.startY
          };
          const end = {
            x: currSubstroke.endX,
            y: currSubstroke.endY
          };
          const strokeColor = substrokes[innerIdx].strokeColor;

          // if (!remoteMarker){
          //   var entityMain = document.createElement('a-entity');
          //   var entitySub = document.createElement('a-entity');
          //   entityMain.setAttribute('position', '0 0 0.5');
          //   entitySub.setAttribute('id', 'marker2');
          //   entitySub.setAttribute('obj-model', "obj: #marker-obj; mtl: #marker-mtl");
          //   entitySub.setAttribute('rotation', "0 270 0");
          //   entitySub.setAttribute('scale', ".25 .25 .25");
          //   entityMain.appendChild(entitySub);
          //   document.querySelector('a-scene').appendchild(entityMain);
          //   // remoteMarker =

          // } else {

          // }

          draw(start, end, strokeColor);

          // update history object across clients
          if (!history[outerIdx] || !history[outerIdx][innerIdx]) {
            history[outerIdx] = history[outerIdx] || [];
            history[outerIdx].push({ start, end, strokeColor });
          }
        });
      });

      // set up fb listener for undo
      db.ref(`room1`).on('child_removed', snapshot => {
        console.log('CHILD WAS REMOVED')
        console.log('HISTORY', history);
        undo();
      });


      /******************************************************************************
      Event Throttler, works by toggling the eventTimeout variable by a set time

      /*****************************************************************************/
      let eventTimeout;

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
        drawColor.index++;
        if (drawColor.index >= possibleColors.length) drawColor.index = 0;
        drawColor.color = possibleColors[drawColor.index];
        colorBox.setAttribute('color', drawColor.color);
        ray.setAttribute('color', drawColor.color);
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
    /******************************************************************************
    Right now we are using a RTC test socket server.  This will have to be changed
    to a personal one, but the instructions of how to do it are on the RTCMulticonnection
    site
    ******************************************************************************/
    connection.socketURL = 'https://rtcmulticonnection.herokuapp.com:443/';
    connection.socketMessageEvent = 'audio-conference';
    /******************************************************************************
    This is where you set what rtc settings you want to send over.
    *****************************************************************************/
    connection.session = {
        audio: true
    };
    connection.sdpConstraints.mandatory = {
        OfferToReceiveAudio: true,
        OfferToReceiveVideo: false
    };

    connection.mediaConstraints.video = false;
    /******************************************************************************
    When they got on, open or join the same firebase room id
    *****************************************************************************/
    connection.openOrJoin("room1");
    /******************************************************************************
    when the stream of audio begins here how it is handled
    getMediaElement is from a script tag that just helps handle media elements
    in this case, it is just used to play the stream.
    /*****************************************************************************/
    connection.onstream = function(event) {
      console.log("ONSTREAM, event")
      var mediaElement = getMediaElement(event.mediaElement, {
        title: event.userid,
        buttons: ['full-screen'],
        showOnMouseEnter: false
      });
      setTimeout(function() {
          console.log("this is playing")
          mediaElement.media.play();
        }, 5000);

      mediaElement.id = event.streamid;
    };

    return (
      <div style={{ width: '100%', height: '100%' }}>

        <a-scene inspector="url: https://aframe.io/releases/0.3.0/aframe-inspector.min.js">

        {/*
        Assets are a way for entities to use preloaded material that can just be called
        with the id marker

        */}
         <a-assets>


            <a-asset-item id="marker-obj" src="Marker_.obj"></a-asset-item>
            <a-asset-item id="marker-mtl" src="Marker_.mtl"></a-asset-item>
            <img id="classroom" src="classroom.jpg"></img>

          </a-assets>

          <a-camera>
            <a-cursor></a-cursor>
          </a-camera>

          {/*
          Daydream controller setup.
          The outside entity is to help adjust the position

          */}
          <a-entity position="-0.2 2.0 0">
            <a-entity visible="false" id="remote" daydream-controller raycaster="objects: .selectable">
              <a-cone visible="false" id="ray" color={drawColor.color} position="0 0 -2" rotation="-90 0 0" radius-bottom="0.005" radius-top="0.001" height="4"></a-cone>
              <a-box id="position-guide" visible="false" position="0 0 -2"></a-box>
            </a-entity>
          </a-entity>

          {/*
          The Marker model used for the end of the raycaster

          */}
          <a-entity position="0 0 0.5">
            <a-entity id="marker" obj-model="obj: #marker-obj; mtl: #marker-mtl" rotation="0 270 0" scale=".25 .25 .25"></a-entity>
          </a-entity>

          {/*
          The panarama picture that wraps around the scene using the sky tag

          */}
          <a-sky src="#classroom"></a-sky>

        {/*
        Our whiteboard made from a plane

        */}
         <a-plane id="wBoard" canvas-material="width: 512; height: 512; color: white" height="10" width="20" class="selectable" position="0 0 -8" ></a-plane>
         <a-box id="undoButton" position="0 4 -3" color="orange" class="selectable"></a-box>
         <a-box id="colorBox" position="-4 4 -3" color={drawColor.color} class="selectable"></a-box>

        </a-scene>
      </div>
    );
  }
}
