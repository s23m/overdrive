/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/. */

import { Cardinality } from "./Cardinality";
import {currentObjects, drawMarker, getDistance} from "../UIElements/CanvasDraw";


const EdgeEnd = {
    NONE: 1,
    ARROW: 2,
    TRIANGLE: 3,
    FILLED_TRIANGLE: 4,
    DIAMOND: 5,
    FILLED_DIAMOND: 6
}

const LineColour = {
    BLACK: 1,
    RED: 2,
    BLUE: 3,
    GREEN: 4
}

const LineType = {
    SOLID: 1,
    DASHED: 2
}

export class Arrow {
    // Connects an arrow fromVertex to toVertex
    // if the UUID parameter is null:
    //      x, y are treated as coordinates
    // if the UUID is set:
    //      are treated as vertex relative 0->1 percentages
    //      0,0 represents top left, 0.5,0.5 represents middle etc

    constructor(UUID, objectsList, fromVertexUUID, fromX, fromY, toVertexUUID, toX, toY) {
        //fromVertexUUID, fromX, fromY, toVertexUUID, toX, toY
        this.UUID = UUID;
        this.name = "Arrow";

        // From Connection
        this.fromVertexUUID = fromVertexUUID;
        if (this.fromVertexUUID !== null) {
            this.fromVertex = this.getObjectFromUUID(objectsList, fromVertexUUID);
        } else {
            this.fromVertex = null;
        }
        this.fromX = fromX;
        this.fromY = fromY;

        // To Connection
        this.toVertexUUID = toVertexUUID;
        if (this.toVertexUUID !== null) {
            this.toVertex = this.getObjectFromUUID(objectsList, toVertexUUID);
        } else {
            this.toVertex = null;
        }
        this.toX = toX;
        this.toY = toY;

        // Type
        this.startType = EdgeEnd.NONE;
        this.endType = EdgeEnd.ARROW;
        this.lineColour = LineColour.BLACK;
        this.LineType = LineType.SOLID;

        this.cardinality = null;
    }


    // Gets the object (hopefully a vertex) from UUID
    getObjectFromUUID(objects, uuid) {
        for (var i=0; i < objects.length; i++) {
            if (objects[i] !== null) {
                if (objects[i].UUID === uuid) {
                    return objects[i];
                }
            }
        }

        console.error("Could not find vertex to connect for uuid", uuid);
        return null;
    }

    addCardinality(lowerBound, upperBound) {
        this.cardinality = new Cardinality(lowerBound, upperBound);
    }

    setStartType(startType) {
        switch(startType) {
            case "-No Icon":
                this.startType = EdgeEnd.NONE;
                break;
            case "->":
                this.startType = EdgeEnd.ARROW;
                break;
            case "-▷":
                this.startType = EdgeEnd.TRIANGLE;
                break;
            case "-◆":
                this.startType = EdgeEnd.DIAMOND;
                break;
            default:
                break;
        }
    }

    setEndType(endType) {
        switch(endType) {
            case "-No Icon":
                this.endType = EdgeEnd.NONE;
                break;
            case "->":
                this.endType = EdgeEnd.ARROW;
                break;
            case "-▷":
                this.endType = EdgeEnd.TRIANGLE;
                break;
            case "-◆":
                this.endType = EdgeEnd.DIAMOND;
                break;
            default:
                break;
        }
        console.log(this.endType);
    }

    setLineColour(lineColour) {
        switch(lineColour) {
            case "Black":
                this.lineColour = LineColour.BLACK;
                break;
            case "Red":
                this.lineColour = LineColour.RED;
                break;
            case "Blue":
                this.lineColour = LineColour.BLUE;
                break;
            case "Green":
                this.lineColour = LineColour.GREEN;
                break;
            default:
                break;
        }
    }

    setLineType(lineType) {
        switch(lineType) {
            case "Solid":
                this.lineType = LineType.SOLID;
                break;
            case "Dashed":
                this.lineType = LineType.DASHED;
                break;
            default:
                break;
        }
    }

    draw(canvasContext) {
        // Preinitalise
        var fromX = this.fromX;
        var fromY = this.fromY;
        var toX = this.toX;
        var toY = this.toY;

        // Update if connecting to nodes
        if (this.fromVertex !== null) {
            fromX = fromX*this.fromVertex.width + this.fromVertex.sx;
            fromY = fromY*this.fromVertex.height + this.fromVertex.sy;
        }
        if (this.toVertex !== null) {
            toX = toX*this.toVertex.width + this.toVertex.sx;
            toY = toY*this.toVertex.height + this.toVertex.sy;
        }

        // Draw
        canvasContext.beginPath();
        canvasContext.moveTo(fromX, fromY);
        canvasContext.lineTo(toX, toY);
        canvasContext.stroke();

        // Arrow types
        if (this.endType === EdgeEnd.ARROW) {
            // TODO arrow types
        }
    }

    // Checks if it intersects with point
    intersects(x, y) {
        var fromNode = this.fromVertex.getNodeByVertexNode(this.fromVertexNode);
        var toNode = this.toVertex.getNodeByVertexNode(this.toVertexNode);

        var m = getDistance(x, y, fromNode[0], fromNode[1]);
        var n = getDistance(x, y, toNode[0], toNode[1]);
        var l = getDistance(fromNode[0], fromNode[1], toNode[0], toNode[1]);

        var threshold = 5;

        return (m+n-threshold < l);
    }
}