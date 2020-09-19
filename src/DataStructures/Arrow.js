/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/. */

import { Cardinality } from "./Cardinality";
import {currentObjects, drawMarker, getDistance, setFillStyle} from "../UIElements/CanvasDraw";
import {pathFindTo, getDistanceFromNodes} from "../Utils/PathFinder";

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

    // Creates nodes for an algorithmn to path find around a vertex
    createPathNodesForVertex(vertex, nodeIndex, d) {
        // Set ids
        let topLeft     = nodeIndex++;
        let top         = nodeIndex++;
        let topRight    = nodeIndex++;
        let right       = nodeIndex++;
        let bottomRight = nodeIndex++;
        let bottom      = nodeIndex++;
        let bottomLeft  = nodeIndex++;
        let left        = nodeIndex++;

        // Create nodes for: fromVertex
        var vertexNodes = [];
        vertexNodes.push([topLeft,     vertex.sx-d,              vertex.sy+vertex.height+d, [left, top]]);               // Top    Left
        vertexNodes.push([top,         vertex.sx+vertex.width/2, vertex.sy+vertex.height+d, [topLeft, topRight]]);       // Top
        vertexNodes.push([topRight,    vertex.sx+vertex.width+d, vertex.sy+vertex.height+d, [top, right]]);              // Top    Right
        vertexNodes.push([right,       vertex.sx+vertex.width+d, vertex.sy+vertex.height/2, [topRight, bottomRight]]);   //        Right
        vertexNodes.push([bottomRight, vertex.sx+vertex.width+d, vertex.sy-d,               [right, bottom]]);           // Bottom Right
        vertexNodes.push([bottom,      vertex.sx+vertex.width/2, vertex.sy-d,               [bottomRight, bottomLeft]]); // Bottom
        vertexNodes.push([bottomLeft,  vertex.sx-d,              vertex.sy-d,               [bottomRight, left]]);       // Bottom Left
        vertexNodes.push([left,        vertex.sx-d,              vertex.sy+vertex.height/2, [bottomLeft, topLeft]]);     //        Left
        return [nodeIndex, vertexNodes];
    }

    // Creates a path for the arrow to travel on
    createPath() {
        var fromX = this.fromX;
        var fromY = this.fromY;
        var toX = this.toX;
        var toY = this.toY;

        // Check if its NOT a node to node connection
        if (this.fromVertex === null || this.toVertex === null) {
            // Return a basic path

            return [[fromX, fromY], [toX, toY]];
        }

        // Update since it's connecting to nodes
        fromX = fromX*this.fromVertex.width + this.fromVertex.sx;
        fromY = fromY*this.fromVertex.height + this.fromVertex.sy;
        toX = toX*this.toVertex.width + this.toVertex.sx;
        toY = toY*this.toVertex.height + this.toVertex.sy;

        // TODO TEMP
        // Disables the pathing feature
        return [[fromX, fromY], [toX, toY]];

        // Create nodes
        var nodeIndex = 0;
        let d = 10; // buffer distance

        // Create from vertex nodes
        let fromRet = this.createPathNodesForVertex(this.fromVertex, nodeIndex, d);
        nodeIndex = fromRet[0];
        var fromVertexNodes = fromRet[1];

        // Create to vertex nodes
        let toRet = this.createPathNodesForVertex(this.toVertex, nodeIndex, d);
        nodeIndex = toRet[0];
        var toVertexNodes = toRet[1];

        // Find starting nodes
        var startingNode = fromVertexNodes[0];
        var closestStartingNodeDistance = getDistance(fromX, fromY, startingNode[1], startingNode[2]);
        for (let i = 1; i < fromVertexNodes.length; i++) {
            let checkNode = fromVertexNodes[i];
            let checkDistance = getDistance(fromX, fromY, checkNode[1], checkNode[2]);
            if (checkDistance < closestStartingNodeDistance) {
                startingNode = checkNode;
                closestStartingNodeDistance = checkDistance;
            }
        }

        var destinationNode = toVertexNodes[0];
        var closestDestinationNodeDistance = getDistance(toX, toY, destinationNode[1], destinationNode[2]);
        for (let i = 1; i < toVertexNodes.length; i++) {
            let checkNode = toVertexNodes[i];
            let checkDistance = getDistance(toX, toY, checkNode[1], checkNode[2]);
            if (checkDistance < closestDestinationNodeDistance) {
                destinationNode = checkNode;
                closestDestinationNodeDistance = checkDistance;
            }
        }

        // Find nearest 2 Nodes in fromVertex and toVertex
        var closestFromNode = fromVertexNodes[0];
        var closestToNode = toVertexNodes[0];
        var closestDistance = getDistanceFromNodes(closestFromNode, closestToNode);

        for (let i = 0; i < fromVertexNodes.length; i++) {
            for (let o = 0; o < toVertexNodes.length; o++) {
                var checkFromNode = fromVertexNodes[i];
                var checkToNode = toVertexNodes[o];
                var checkDistance = getDistanceFromNodes(checkFromNode, checkToNode);

                if (checkDistance < closestDistance) {
                    closestFromNode = checkFromNode;
                    closestToNode = checkToNode;
                    closestDistance = checkDistance;
                }
            }
        }

        // Path find
        var fromVertexPath = pathFindTo(fromVertexNodes, startingNode[0], closestFromNode[0]);
        var toVertexPath = pathFindTo(toVertexNodes, destinationNode[0], closestToNode[0]);

        // Create path
        var path = [];

        // Start
        path.push([fromX, fromY]);

        // From Vertex Path (normal order)
        for (let i = 0; i < fromVertexPath.length; i++) {
            let pathNode = fromVertexPath[i];
            path.push([pathNode[1], pathNode[2]]);
        }

        // To Vertex path (reverse order)
        for (let i = toVertexPath.length-1; i >= 0; i--) {
            let pathNode = toVertexPath[i];
            path.push([pathNode[1], pathNode[2]]);
        }

        // Dest
        path.push([toX, toY]);

        return path;
    }

    draw(canvasContext) {
        switch (this.lineType) {
            case LineType.SOLID:
                canvasContext.setLineDash([]);
                break;
            case LineType.DASHED:
                canvasContext.setLineDash([10, 10]);
                break;
            default:
                canvasContext.setLineDash([]);
                break;
        }

        // Get path
        var path = this.createPath();

        // Draw
        for (var i = 0; i < path.length-1; i++) {
            let from = path[i];
            let to = path[i+1];
            canvasContext.beginPath();
            canvasContext.moveTo(from[0], from[1]);
            canvasContext.lineTo(to[0], to[1]);
            canvasContext.stroke();
        }

        // Arrow types
        if (this.endType === EdgeEnd.ARROW) {
            // TODO arrow types
        }
    }

    // Checks if it intersects with point
    intersects(x, y) {
        // Get path
        var path = this.createPath();

        // Draw
        for (var i = 0; i < path.length-1; i++) {
            let from = path[i];
            let to = path[i+1];
            if (this.intersectsSegment(x, y, from[0], from[1], to[0], to[1])) {
                return true;
            }
        }

        return false;
    }

    intersectsSegment(cx, cy, x1, y1, x2, y2) {
        var m = getDistance(cx, cy, x1, y1);
        var n = getDistance(cx, cy, x2, y2);
        var l = getDistance(x1, y1, x2, y2);

        var threshold = 5;

        return (m+n-threshold < l);
    }
}