/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/. */

import {Cardinality} from "./Cardinality";
import {getDistance} from "../UIElements/CanvasDraw";

const EdgeEnd = {
    NONE: 1,
    ARROW: 2,
    TRIANGLE: 3,
    FILLED_TRIANGLE: 4,
    DIAMOND: 5,
    FILLED_DIAMOND: 6
};

const LineColour = {
    BLACK: "#000000",
    RED: "#FF0000",
    BLUE: "#0000FF",
    GREEN: "#00FF00"
}

const LineType = {
    SOLID: 1,
    DASHED: 2
};

export class Arrow {
    // Connects an arrow fromVertex to toVertex
    // if the UUID parameter is null:
    //      x, y are treated as coordinates
    // if the UUID is set:
    //      are treated as vertex relative 0->1 percentages
    //      0,0 represents top left, 0.5,0.5 represents middle etc

    constructor(UUID, objectsList, fromX, fromY, toX, toY) {
        //fromVertexUUID, fromX, fromY, toVertexUUID, toX, toY
        this.UUID = UUID;
        this.name = "Arrow";

        // From Connection
        this.fromX = fromX;
        this.fromY = fromY;

        // To Connection
        this.toX = toX;
        this.toY = toY;

        // Type
        this.startType = EdgeEnd.NONE;
        this.endType = EdgeEnd.ARROW;
        this.lineColour = LineColour.BLACK;
        this.LineType = LineType.SOLID;

        this.sourceCardinality = new Cardinality(1, 1);
        this.destCardinality = new Cardinality(1, 1);

        this.startLabel = "";
        this.endLabel = "";

        this.selected = false;
    }

    setSelected(selected){
        this.selected = selected;
    }

    updateSourceCardinality(lowerBound, upperBound, visibility) {
        this.sourceCardinality = new Cardinality(lowerBound, upperBound, visibility);
    }

    updateDestCardinality(lowerBound, upperBound, visibility) {
        this.destCardinality = new Cardinality(lowerBound, upperBound, visibility);
    }

    setStartLabel(label) {
        this.startLabel = label;
    }

    setEndLabel(label) {
        this.endLabel = label;
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

    draw(canvasContext) {
        var dashLength = 5;

        switch (this.lineType) {
            case LineType.SOLID:
                canvasContext.setLineDash([]);
                break;
            case LineType.DASHED:
                canvasContext.setLineDash([dashLength, dashLength]);
                break;
            default:
                canvasContext.setLineDash([]);
        }

        // Draw
        canvasContext.strokeStyle = this.lineColour;

        if(this.selected){
            let r = Math.hypot(this.toX-this.fromX, this.toY-this.fromY);
            let midX = (this.fromX+this.toX)/2;
            let midY = (this.fromY+this.toY)/2;
            //canvasContext.setLineDash([1,dashLength]);
            let gradient = canvasContext.createRadialGradient(midX,midY,0,midX,midY,r);
            gradient.addColorStop(0,this.lineColour);
            gradient.addColorStop(0.4,"orange");
            gradient.addColorStop(0.5,"yellow");
            gradient.addColorStop(0.6,"orange");
            gradient.addColorStop(1,this.lineColour);
            canvasContext.strokeStyle = gradient;
        }

        canvasContext.beginPath();
        canvasContext.moveTo(this.fromX, this.fromY);
        canvasContext.lineTo(this.toX, this.toY);
        canvasContext.stroke();

        canvasContext.strokeStyle = "#000000";
        canvasContext.setLineDash([]);

        // Arrow types
        if (this.endType === EdgeEnd.ARROW) {
            // TODO arrow types
        }

    }

    // Checks if it intersects with point
    intersects(cx, cy) {
        var m = getDistance(cx, cy, this.fromX, this.fromY);
        var n = getDistance(cx, cy, this.toX, this.toY);
        var l = getDistance(this.fromX, this.fromY, this.toX, this.toY);

        var threshold = 1;

        return (m+n-threshold < l);
    }
}