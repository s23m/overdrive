/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/. */

import {Vertex, padding} from "../DataStructures/Vertex";
import {Arrow} from "../DataStructures/Arrow";

// Core variables
var canvasElement;
var canvasContext;

// Mouse / Cursor
var mouseStartX;
var mouseStartY;

//todo: make this selectable by the user
const yRows = 35;

export var mouseOriginX;
export var mouseOriginY;

// Non zoomed in Width/Height (in pixels)
var canvasWidth;
var canvasHeight;

// Zoom and Pan
var zoom = 200.0;

// Renderable objects
export var currentObjects = [];

var resizing = false;

// Init
export function assignElement(elementID) {
    canvasElement = document.getElementById(elementID);
    canvasContext =  canvasElement.getContext("2d");

    resetMouseOrigin();

}

export function resetMouseOrigin(){
    try {
        var canvasRect = canvasElement.getBoundingClientRect();
        mouseOriginX = canvasRect.left;
        mouseOriginY = canvasRect.top;
        recalculateScale();
        clearCanvas();
    }catch{
        console.error("Failed to aquire canvas element");
    }
    drawAll()
}

function drawLine(x0,y0,x1,y1,color) {
    canvasContext.beginPath();
    canvasContext.strokeStyle = color;
    canvasContext.moveTo(x0,y0);
    canvasContext.lineTo(x1,y1);
    canvasContext.stroke();
    canvasContext.strokeStyle = "#000000"
}

// Core functions
export function drawAll() {
    clearCanvas();

    canvasContext.resetTransform();
    canvasContext.scale(getEffectiveZoom(), getEffectiveZoom());

    for(let i = 0; i < canvasHeight; i+= canvasHeight/yRows/2){
        let y1 = findNearestGridY(i,1);
        let y2 = findNearestGridY(i,0);
        drawLine(0,y1,canvasWidth,y1,"#D0D0D0");
        drawLine(0,y2,canvasWidth,y2,"#E0E0E0");
    }

    currentObjects.forEach((item) => {
        if (item !== undefined) {
            item.draw(canvasContext);
        }
    })
}

function setScroll(){
    var canvasContainerElement = document.getElementsByClassName("Canvas")[0];
}

// format co-ordinate so that the value aligns with a row
function findNearestGridY(y,top){

    // distance to topmost top rowLine
    let slotHeight = 25*zoom/100 * 200/zoom;

    // which row to put it in
    let slot = Math.floor(y/slotHeight);

    // y co-ordinate of that row (if bottom then go up by row gap)
    return slotHeight * slot + (slotHeight/2 * + top)
}

function checkResizeBounds(x,y){
    let vertex = null;
    let side = null;
    currentObjects.forEach((item) => {
        if(item.constructor.name === "Vertex") {
            let bounds = item.getBounds();
            let x1 = bounds[0];
            let y1 = bounds[1];
            let x2 = bounds[2];
            let y2 = bounds[3];

            let top = Math.abs(y1-y) < 10;
            let bottom = Math.abs(y2-y) < 10;
            let left = Math.abs(x1-x) < 10;
            let right = Math.abs(x2-x) < 10;
            let inYbounds = y > y1 && y < y2;
            let inXbounds = x > x1 && x < x2;

            if(top && left){
                vertex = item;
                side = "topLeft"
            }else if(top && right){
                vertex = item;
                side = "topRight";
            }else if(bottom && left){
                vertex = item;
                side = "bottomLeft"
            }else if(bottom && right){
                vertex = item;
                side = "bottomRight"
            }else if(left && inYbounds){
                vertex = item;
                side = "left"
            }else if(right && inYbounds){
                vertex = item;
                side = "right"
            }else if(top && inXbounds){
                vertex = item;
                side = "top"
            }else if(bottom && inXbounds){
                vertex = item;
                side = "bottom"
            }
        }
    });
    return [vertex,side];
}

function resizeObjectOnMouseMove(e,resizeVars) {
    let coOrds = getGraphXYFromMouseEvent(e);
    resizeVars[0].expandSide(resizeVars[1],coOrds[0],coOrds[1]);
}

// Sets the objects uuid and adds it to the currentObjects
function addObject(object) {
    currentObjects.push(object);
}

// Sets the currentObjects value to a new one. WARNING it will override the current value without any checks
export function setCurrentObjects(newObjects) {
    currentObjects = newObjects;
    drawAll();
}

// Event based functions
export function onMousePress(canvas, x, y) {

    let resizeVars = checkResizeBounds(x,y);

    if(canvas.tool === "Vertex") {

        if (resizeVars[0] !== null) {
            resizing = true;
            canvasElement.onmousemove = function (e) {
                resizeObjectOnMouseMove(e, resizeVars)
            };
            return
        }
    }


    setScroll();
    mouseStartX = x;
    mouseStartY = findNearestGridY(y,1);

    // Enable example draw while user is deciding shape
    canvasElement.onmousemove = function(e) {onMouseMove(e, canvas)}
}

export function onMouseRelease(canvas, x, y) {

    if(resizing === true){
        resizing = false;
        canvasElement.onmousemove = null;
        return
    }

    setScroll();
    var newObject = createObject(canvas, mouseStartX, mouseStartY, x, findNearestGridY(y,0))

    addObject(newObject);

    if(newObject.constructor.name === "Arrow"){
        newObject.bindNodes()
    }

    // Disable example draw
    canvasElement.onmousemove = null;

    drawAll(currentObjects);
}

function onMouseMove(e, canvas) {
    setScroll();
    var position = getGraphXYFromMouseEvent(e);
    var x = position[0]; var y = findNearestGridY(position[1],0);

    var newObject = createObject(canvas, mouseStartX, mouseStartY, x, y);

    // Redraw Existing Objects
    drawAll(currentObjects);

    // Draw the new object
    canvasContext.globalAlpha = 0.75;
    if(newObject !== undefined) {
        newObject.draw(canvasContext);
    }
    canvasContext.globalAlpha = 1.0;
}

export function onMiddleClick(canvas, x, y) {
    console.log("Moving Object");
    let selectedObject = findIntersected(x,y);
    canvasElement.onmousemove = function(e) {moveObject(e, selectedObject)}
}

function moveObject(e, object) {
    if(object != null) {
        if (object.constructor.name === "Vertex") {

            var position = getGraphXYFromMouseEvent(e);
            var x = position[0];
            var y = findNearestGridY(position[1], 0);

            object.setSX(x);

            object.setSY(findNearestGridY(y, 1))
        }
    }
}

export function solidifyObject(){
    canvasElement.onmousemove = null;
}

// Zoom and pan
export function setZoom(newZoom) {
    zoom = newZoom;

    resetMouseOrigin();
    setScroll();

    drawAll();
}

// returns the x,y coordinates of the supplied side for the supplied vertex
export function getXYFromSide(vertex, side) {
    var x;
    var y;


    if (side === "north") {
        x = vertex.sx + (vertex.width/2)+(padding);
        y = vertex.sy;
    } else if (side === "east") {
        x = vertex.sx + vertex.width;
        y = vertex.sy + (vertex.height/2);
    } else if (side === "south") {
        x = vertex.sx + (vertex.width/2)+(padding);
        y = vertex.sy + vertex.height;
    } else if (side === "west") {
        x = vertex.sx - (padding * 2);
        y = vertex.sy + (vertex.height/2);
    }

    return [x,y]
}

// Checks all nodes and finds the nearest node within some threshold distance
// If no nodes are found returns null
function findConnectable(x, y) {
    // The maximum distance allowed for a node to be considered connectable
    var thesholdDistance = 100;

    // Get nodes from all items
    // Note: All drawable objects should include the getNodes function even if it simply returns null
    // It should return a list, with each item formated as follows
    // [x, y, ...]
    var nodes = [];
    currentObjects.forEach((item) => {
        if (item !== undefined) {
            var itemNodes = item.getNodes();
            if (itemNodes != null) {
                nodes = nodes.concat(itemNodes);
            }
        }
    });

    // If empty (because there are no nodes) return null
    if (nodes.length === 0) {
        return null;
    }

    // Find closest node
    var closestNode = nodes[0];
    var closestDistance = getDistance(x, y, closestNode[0], closestNode[1]);
    for (var i = 1; i < nodes.length; i++) {
        var distance = getDistance(x, y, nodes[i][0], nodes[i][1]);
        if (distance < closestDistance) {
            closestNode = nodes[i];
            closestDistance = distance;
        }
    }

    // Check if within threshold
    if (closestDistance < thesholdDistance) {
        return closestNode;
    }

    // Exceeds threshold return null
    return null;
}

// Gets the distance between x1, y1 and x2, y2
export function getDistance(x1, y1, x2, y2) {
    return Math.sqrt(Math.pow(x2-x1, 2) + Math.pow(y2-y1, 2));
}

// Finds the object that is intersected with the cursor, returns null if no objects are intersected
export function findIntersected(x, y) {
    var selectedItem = null;
    currentObjects.forEach((item) => {
        if(item !== undefined) {
            if (item.intersects(x, y)) {
                console.log("Intersection detected with ",item.constructor.name);
                selectedItem = item;
            }
        }
    });
    return selectedItem;
}

function createObject(canvas, x1, y1, x2, y2) {
    switch(canvas.tool) {
        case "Vertex":
            var pos = orderCoordinates(x1, y1, x2, y2);
            return new Vertex(createUUID(),"",[""], pos[0], pos[1], pos[2]-pos[0], pos[3]-pos[1]);
        case "Arrow":
            var fromNode = findConnectable(x1, y1);
            var toNode   = findConnectable(x2, y2);

            if (fromNode !== null && toNode !== null) {
                return new Arrow(createUUID(), currentObjects, fromNode[3].UUID, fromNode[2], toNode[3].UUID, toNode[2]);
            } else {
                return undefined;
            }
        case "Diamond":
        case "Circle":
        case "Speech":
        case "SpecBox":
        case "Triangle":
        default:
    }
}

export function getGraphXYFromMouseEvent(e) {
    resetMouseOrigin();
    setScroll();

    var x = (e.clientX-mouseOriginX)/getEffectiveZoom();
    var y = (e.clientY-mouseOriginY)/getEffectiveZoom();

    return [x, y];
}

function exportImage() {
    getDownload();
}

export function getDownload() {
    document.getElementById("downloader").download = "image.png";
    document.getElementById("downloader").href = canvasElement.toDataURL("image/png").replace(/^data:image\/[^;]/, 'data:application/octet-stream');
}

function orderCoordinates(sx, sy, ex, ey) {
    // This code also ensures x1 < x2 and y1 < y2
    var x1 = Math.min(sx, ex);
    var y1 = Math.min(sy, ey);
    var x2 = Math.max(sx, ex);
    var y2 = Math.max(sy, ey);

    return [x1, y1, x2, y2];
}

// Gets the effective (percentage) zoom from the current zoom
function getEffectiveZoom() {
    return zoom/100;
}

// This should be used whenever the window itself resizes
function recalculateScale() {
    // Adjusts the aspect ratio so it is 1:1 instead of matching the windows.
    // Also removes blurry rendering
    //let dpi = window.devicePixelRatio;
    let canvasContainer = document.getElementsByClassName("Canvas")[0]
    let styleHeight = +getComputedStyle(canvasContainer).getPropertyValue("height").slice(0, -2);
    let styleWidth = +getComputedStyle(canvasContainer).getPropertyValue("width").slice(0, -2);

    canvasElement.setAttribute('height', styleHeight * getEffectiveZoom());
    canvasElement.setAttribute('width', styleWidth * getEffectiveZoom());

    // Configurable
    canvasWidth = canvasElement.width;
    canvasHeight = canvasElement.height;
}

function clearCanvas() {
     // Fill base canvas
    canvasContext.fillStyle = "#ffffff";
    canvasContext.fillRect(0, 0, canvasWidth, canvasHeight);
}

function createUUID() {
    return ([1e7]+-1e3+-4e3+-8e3+-1e11).replace(/[018]/g, c =>
        (c ^ crypto.getRandomValues(new Uint8Array(1))[0] & 15 >> c / 4).toString(16)
    );
}