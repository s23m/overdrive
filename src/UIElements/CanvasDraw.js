/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/. */

import {Vertex, padding} from "../datastructures/Vertex";
import {Arrow} from "../datastructures/Arrow";

// Core variables
var canvasElement;
var canvasContext;

// Mouse / Cursor
var mouseStartX;
var mouseStartY;

var scrollX = 0;
var scrollY = 0;

export var mouseOriginX;
export var mouseOriginY;

// Non zoomed in Width/Height (in pixels)
var canvasWidth;
var canvasHeight;

// Zoom and Pan
var zoom = 200.0;

// Renderable objects
var currentObjects = [];

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

// Core functions
export function drawAll() {
    clearCanvas();

    canvasContext.resetTransform();
    canvasContext.scale(getEffectiveZoom(), getEffectiveZoom());

    currentObjects.forEach((item) => {
        if (item !== undefined) {
            item.draw(canvasContext);
        }
    })
}

function setScroll(){
    var canvasContainerElement = document.getElementsByClassName("Canvas")[0];
    scrollX = canvasContainerElement.scrollLeft;
    scrollY = canvasContainerElement.scrollTop;
}

// Event based functions
export function onMousePress(canvas, x, y) {
    setScroll();
    mouseStartX = x;
    mouseStartY = y;

    // Enable example draw while user is deciding shape
    canvasElement.onmousemove = function(e) {onMouseMove(e, canvas)}
}

export function onMouseRelease(canvas, x, y) {
    setScroll();
    var newObject = createObject(canvas, mouseStartX, mouseStartY, x, y)

    currentObjects.push(newObject);

    // Disable example draw
    canvasElement.onmousemove = null;

    drawAll(currentObjects);
}

function onMouseMove(e, canvas) {
    setScroll();
    var position = getGraphXYFromMouseEvent(e);
    var x = position[0]; var y = position[1];

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


//returns the object with the nearest cardinal side to the given coordinates,
// and returns that object + side if a vertex was closest
function findNearestObjectAndSide(x, y, verticesOnly) {

    const edges = ["north","south","east","west"];

    var nearestItem;
    var lowestDistance = Number.MAX_VALUE;
    var nearestEdge;

    currentObjects.forEach((item) => {

        if(item !== undefined) {

            if (item.constructor.name === "Vertex") {
                edges.forEach((edge) => {

                    var coOrds = getXYFromSide(item, edge);
                    //todo: make this solution much cleaner
                    var dist = Math.hypot(coOrds[0] - x * (verticesOnly ? 1 : zoom/400), coOrds[1] - y * (verticesOnly ? 1 : zoom/400));
                    if (dist < lowestDistance) {
                        lowestDistance = dist;
                        nearestItem = item;
                        nearestEdge = edge;
                    }
                })
            } else if (item.constructor.name === "Arrow") {
                if (!verticesOnly) {
                    // find centre of the line and check distance
                    var v1 = item.fromVertex;
                    var s1 = item.fromSide;
                    var v2 = item.toVertex;
                    var s2 = item.toSide;

                    var c1 = getXYFromSide(v1, s1);
                    var c2 = getXYFromSide(v2, s2);

                    var cX = (c1[0] + c2[0])/2;
                    var cY = (c1[1] + c2[1])/2;

                    //todo: make this solution much cleaner
                    var dist = Math.hypot(cX - x*zoom/400, cY - y*zoom/400);
                    console.log("VD" + lowestDistance + " ED" + dist)
                    console.log(cX,cY,x,y)
                    if (dist < lowestDistance) {
                        lowestDistance = dist;
                        nearestItem = item;
                        nearestEdge = null;
                    }
                }
            }
        }
    });
  
    if (nearestItem === undefined || lowestDistance >= 200) {
        return null
    } else {
        return [nearestItem, nearestEdge];
    }
}

// Finds the object that is intersected with the cursor, returns null if no objects are intersected
export function findIntersected(x, y) {
    var selectedItem = null;
    currentObjects.forEach((item) => {
        if(item !== undefined) {
            if (item.intersects(x, y)) {
                console.log("Intersection detected");
                console.log(item.constructor.name);
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
            return new Vertex("","",[""], pos[0], pos[1], pos[2], pos[3]);
        case "Arrow":
            var fromNode = findConnectable(x1, y1);
            var toNode   = findConnectable(x2, y2);

            if (fromNode !== null && toNode !== null) {
                getDownload();
                return new Arrow("", fromNode[3], fromNode[2], toNode[3], toNode[2]);
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

// Gets the effective (decimal) zoom from the current zoom
function getEffectiveZoom() {
    return zoom/100;
}

// This should be used whenever the window itself resizes
function recalculateScale() {
    // Adjusts the aspect ratio so it is 1:1 instead of matching the windows.
    // Also removes blurry rendering
    let dpi = window.devicePixelRatio;
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
