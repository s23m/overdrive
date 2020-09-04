/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/. */

import { Cardinality } from "./Cardinality";
import { getDistance } from "../UIElements/CanvasDraw";


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
    constructor(UUID, objectsList, fromVertexUUID, fromVertexNode, toVertexUUID, toVertexNode) {
        this.UUID = UUID;
        this.name = "Arrow";

        // Connections
        this.fromVertexNode = fromVertexNode;
        this.fromVertexUUID = fromVertexUUID;
        this.fromVertex = this.getObjectFromUUID(objectsList, fromVertexUUID);

        this.toVertexNode = toVertexNode;
        this.toVertexUUID = toVertexUUID;
        this.toVertex = this.getObjectFromUUID(objectsList, toVertexUUID);

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

    bindNodes(){
        this.fromVertex.addChild(this.toVertex);
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
        var fromNode = this.fromVertex.getNodeByVertexNode(this.fromVertexNode);
        var toNode = this.toVertex.getNodeByVertexNode(this.toVertexNode);

        canvasContext.beginPath();
        canvasContext.moveTo(fromNode[0], fromNode[1]);
        canvasContext.lineTo(toNode[0], toNode[1]);
        canvasContext.stroke();

        // Arrow types
        if (this.endType === EdgeEnd.ARROW) {
            // TODO arrow types
        }
    }

    // Returns all nodes for this object
    getNodes() {
        return null;
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
