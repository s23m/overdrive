/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/. */

import {Vertex, padding} from "../DataStructures/Vertex";
import {Arrow} from "../DataStructures/Arrow";
import {useState} from "react";

// Core variables
var canvasElement;
var canvasContext;

// Mouse / Cursor
var mouseStartX;
var mouseStartY;

var yRows = 70;

export var mouseOriginX;
export var mouseOriginY;

// Non zoomed in Width/Height (in pixels)
var canvasWidth;
var canvasHeight;

// Zoom and Pan
var zoom = 200.0;

// Renderable objects
export var currentObjects = [];

// Arrow Path
export var arrowPath = [];
var lastX = 0;
var lastY = 0;

// Resize status
var resizing = false;

var firstArrowJoint = true;

// Init
export function assignElement(elementID) {
    canvasElement = document.getElementById(elementID);
    canvasContext =  canvasElement.getContext("2d");

    resetMouseOrigin();

}

export function resetMouseOrigin() {
    try {
        var canvasRect = canvasElement.getBoundingClientRect();
        mouseOriginX = canvasRect.left;
        mouseOriginY = canvasRect.top;
        recalculateScale();
        clearCanvas();
    } catch {
        console.error("Failed to aquire canvas element");
    }
    drawAll()
}

function drawLine(x0, y0, x1, y1, color) {
    canvasContext.beginPath();
    canvasContext.strokeStyle = color;
    canvasContext.moveTo(x0, y0);
    canvasContext.lineTo(x1, y1);
    canvasContext.stroke();
    canvasContext.strokeStyle = "#000000"
}

// Core functions
export function drawAll() {
    clearCanvas();

    canvasContext.resetTransform();
    canvasContext.scale(getEffectiveZoom(), getEffectiveZoom());

    for (let i = 0; i < canvasHeight; i+= (canvasHeight/yRows*zoom/100 * 200/zoom)/2) {
        let y1 = findNearestGridY(i,1);
        let y2 = findNearestGridY(i,0);
        drawLine(0,y1,canvasWidth,y1,"#D0D0D0");
        drawLine(0,y2,canvasWidth,y2,"#E0E0E0");
    }

    currentObjects.forEach((item) => {
        if (item !== null) {
            item.draw(canvasContext);
        }
    });

}

export function deleteElement(element) {
    currentObjects.forEach((item,index,object) => {
        if (item !== null) {
            if (item.UUID === element.UUID) {
                object.splice(index,1)
            }
        }
    });
    drawAll()
}

export function updateRows() {
    yRows = document.getElementById("canvasRows").value;
    drawAll()
}

// Format co-ordinate so that the value aligns with a row
function findNearestGridY(y,top) {

    // distance to topmost top rowLine
    let slotHeight = canvasHeight/yRows*zoom/100 * 200/zoom;

    // which row to put it in
    let slot = Math.floor(y/slotHeight);

    // y co-ordinate of that row (if bottom then go up by row gap)
    return slotHeight * slot + (slotHeight/2 * + top)
}

// Checks to see which side it should resize on
function checkResizeBounds(x, y) {
    // Iterate through all objects and only check vertex's
    currentObjects.forEach((item) => {
        if (item.constructor.name === "Vertex") {
            // Get vertex bounds
            // x1 y1 are the lower coordinates
            // x2 y2 are the upper coordinates
            // Note: x2 y2 are not width/height values
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

            if (top && left) {
                return [item, "topLeft"];
            } else if (top && right) {
                return [item, "topRight"];
            } else if (bottom && left) {
                return [item, "bottomLeft"];
            } else if (bottom && right) {
                return [item, "bottomRight"];
            } else if (left && inYbounds) {
                return [item, "left"];
            } else if (right && inYbounds) {
                return [item, "right"];
            } else if (top && inXbounds) {
                return [item, "top"];
            } else if (bottom && inXbounds) {
                return [item, "bottom"];
            }
        }
    });

    // All else fails
    return [null, null];
}

// Find connectable for arrow within a threshold distance
function getConnectionDataForArrow(cursorX, cursorY) {
    const distanceThreshold = 15;
    const angleThreshold = 8;

    var nearest = null;
    var nearestDistance = 0;

    // Find nearest connectable
    currentObjects.forEach((item) => {
        if (item !== null) {
            if (item.constructor.name === "Vertex") {
                let sideData = item.getNearestSideFrom(cursorX, cursorY, lastX, lastY);

                // Only check if valid
                if (sideData !== null && sideData[0] < distanceThreshold) {
                    // Compare dist
                    if (nearest === null || sideData[0] < nearestDistance) {
                        nearest = [0, item.UUID, sideData[1], sideData[2]];
                        nearestDistance = sideData[0];
                    }
                }
            }
        }
    });

    // Set coordinates
    var coordinate = nearest;
    if (nearest === null) {
        coordinate = [1, cursorX, cursorY];
    }

    // If can't snap to right angles
    if (arrowPath.length < 1 || coordinate[0] === 0) return coordinate;

    // Get angle
    var lastPathX = arrowPath[arrowPath.length-1][1];
    var lastPathY = arrowPath[arrowPath.length-1][2];
    var x = coordinate[1]-lastPathX;
    var y = coordinate[2]-lastPathY;

    // must be y,x check documentation if you dont believe me
    var angle = Math.atan2(y, x) * (180/Math.PI);
    // Make positive
    angle = (angle + 360) % 360;
    // Get relative
    var relAngle = angle % 90;

    // Check if it should snap to right angles
    if (relAngle > 90-angleThreshold || relAngle < angleThreshold) {
        // Get length
        var l = getDistance(0, 0, x, y);

        // Choose angle
        var angles = [0, 90, 180, 270, 360];
        var nearestAngle = angles[0];
        for (let i = 1; i < angles.length; i++) {
            if (Math.abs(angles[i]-angle) < Math.abs(nearestAngle-angle)) {
                nearestAngle = angles[i];
            }
        }
        var nearestRad = nearestAngle * (Math.PI/180)

        // Create vector
        var xv = l * Math.cos(nearestRad);
        var yv = l * Math.sin(nearestRad);

        // Create point (not vector sitting on 0,0)
        coordinate = [coordinate[0], lastPathX+xv, lastPathY+yv];
    }

    return coordinate;
}

function resizeObjectOnMouseMove(e,resizeVars) {
    let coords = getGraphXYFromMouseEvent(e);
    resizeVars[0].expandSide(resizeVars[1], coords[0], coords[1]);
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
export function onLeftMousePress(canvas, x, y) {
    let resizeVars = checkResizeBounds(x,y);

    if (canvas.tool === "Vertex") {

        if (resizeVars[0] !== null) {
            resizing = true;
            canvasElement.onmousemove = function (e) {
                resizeObjectOnMouseMove(e, resizeVars);
            };
            return;
        }
    }

    mouseStartX = x;
    mouseStartY = y;

    // Enable example draw while user is deciding shape
    canvasElement.onmousemove = function(e) { onMouseMove(e, canvas) }
}

export function onRightMouseRelease(canvas, x, y) {
    if (canvas.tool === "Arrow" || canvas.tool === "Containment") {
        // Create
        var newObject = createObject(canvas, mouseStartX, mouseStartY, x, y);
        // Reset path
        arrowPath = [];

        addObject(newObject);

        // Disable example draw
        canvasElement.onmousemove = null;

        drawAll(currentObjects);

        firstArrowJoint = true;
    }
}

export function onLeftMouseRelease(canvas, x, y) {
    if (resizing === true) {
        resizing = false;
        canvasElement.onmousemove = null;
        return
    }

    // Disable example draw
    canvasElement.onmousemove = null;


    if (canvas.tool === "Arrow" || canvas.tool === "Containment") {
        arrowPath.push(getConnectionDataForArrow(x, y));
        lastX = x;
        lastY = y;
        canvasElement.onmousemove = function (e) {
            onMouseMove(e, canvas)
        };

    }

    if ((!firstArrowJoint && (canvas.tool === "Arrow" || canvas.tool === "Containment")) || (canvas.tool !== "Arrow" && canvas.tool !== "Containment")) {
        var newObject = createObject(canvas, mouseStartX, mouseStartY, x, y);
        addObject(newObject);

        canvas.props.setLeftMenu(newObject);
    }
    drawAll(currentObjects);
}

function onMouseMove(e, canvas) {
    var position = getGraphXYFromMouseEvent(e);

    // Redraw Existing Objects
    drawAll(currentObjects);

    // Draw the new object
    var newObject = createObject(canvas, mouseStartX, mouseStartY, position[0], position[1]);

    canvasContext.globalAlpha = 0.75;
    if (newObject !== null) {
        newObject.draw(canvasContext);
    }
    canvasContext.globalAlpha = 1.0;
}

export function onMiddleClick(canvas, x, y) {
    let selectedObject = findIntersected(x,y);
    canvasElement.onmousemove = function(e) {moveObject(e, selectedObject)}
}

export function onMouseLeave() {
    canvasElement.onmousemove = {}
    drawAll()
}

function moveObject(e, object) {
    if (object != null) {
        if (object.constructor.name === "Vertex") {

            var position = getGraphXYFromMouseEvent(e);
            var x = position[0];
            var y = position[1];

            object.x = x;
            object.y = y;

            updateArrows();
        }
    }
}
function updateArrows() {
    currentObjects.forEach((item) => {
        if (item !== null) {
            if (item.constructor.name === "Arrow") {
                item.rebuildPath(currentObjects);
            }
        }
    });
}

export function solidifyObject() {
    canvasElement.onmousemove = null;
}

// Zoom and pan
export function setZoom(newZoom) {
    zoom = newZoom;

    resetMouseOrigin();

    drawAll();
}

// Useful for debugging
export function drawMarker(xpos, ypos) {
    canvasContext.globalAlpha = 1.0;
    canvasContext.beginPath();
    canvasContext.arc(xpos, ypos, 3, 0, Math.PI*2, false);
    canvasContext.fill();
    canvasContext.closePath();
}

// Setting colors indirectly
export function setFillStyle(color) {
    canvasContext.fillStyle = color;
}

// Gets the distance between x1, y1 and x2, y2
export function getDistance(x1, y1, x2, y2) {
    return Math.sqrt(Math.pow(x2-x1, 2) + Math.pow(y2-y1, 2));
}

// Finds the object that is intersected with the cursor, returns null if no objects are intersected
export function findIntersected(x, y) {
    var selectedItem = null;
    currentObjects.forEach((item) => {
        if (item !== null) {
            if (item.intersects(x, y)) {
                console.log("Intersection detected with ", item.constructor.name);
                selectedItem = item;
            }
        }
    });
    return selectedItem;
}

function createObject(canvas, x1, y1, x2, y2) {
    let newPath;
    switch(canvas.tool) {
        case "Vertex":
            var pos = orderCoordinates(x1, y1, x2, y2);
            let vy1 = findNearestGridY(pos[1],0);
            let vy2 = findNearestGridY(pos[3],0);
            return new Vertex(createUUID(),"",[""], pos[0], findNearestGridY(y1,1) , pos[2]-pos[0], vy2-vy1);
        case "Arrow":
            newPath = arrowPath.concat([getConnectionDataForArrow(x2, y2)]);

            return new Arrow(createUUID(), currentObjects, newPath,0);
        case "Containment":
            newPath = arrowPath.concat([getConnectionDataForArrow(x2, y2)]);

            return  new Arrow(createUUID(),currentObjects,newPath,1);

        default:
    }
    return null;
}

export function getGraphXYFromMouseEvent(e) {
    resetMouseOrigin();

    var x = (e.clientX-mouseOriginX)/getEffectiveZoom();
    var y = (e.clientY-mouseOriginY)/getEffectiveZoom();

    return [x, y];
}

export function getDownload() {

    let DLelement = document.createElement("a");
    DLelement.href = canvasElement.toDataURL("image/png").replace(/^data:image\/[^;]/, 'data:application/octet-stream')
    DLelement.download = "Graph.png";
    document.body.appendChild(DLelement);
    DLelement.click();

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
        // eslint-disable-next-line
        (c ^ crypto.getRandomValues(new Uint8Array(1))[0] & 15 >> c / 4).toString(16)
    );
}