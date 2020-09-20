/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/. */

import {Cardinality} from "./Cardinality";
import {getDistance} from "../UIElements/CanvasDraw";
import * as ArrowProps from "./ArrowProperties";

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
        this.startType = ArrowProps.EdgeEnd.NONE;
        this.endType = ArrowProps.EdgeEnd.ARROW;
        this.lineColour = ArrowProps.LineColour.BLACK;
        this.LineType = ArrowProps.LineType.SOLID;

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
        if (ArrowProps.StringToEdgeEnd[startType] !== undefined) {
            this.startType = ArrowProps.StringToEdgeEnd[startType];
        } else {
            console.log("Attempted to assign invalid startType: %s", startType);
        }
    }

    setEndType(endType) {
        if (ArrowProps.StringToEdgeEnd[endType] !== undefined) {
            this.endType = ArrowProps.StringToEdgeEnd[endType];
        } else {
            console.log("Attempted to assign invalid endType: %s", endType);
        }
    }

    setLineColour(lineColour) {
        if (ArrowProps.StringNameToLineColour[lineColour] !== undefined) {
            this.lineColour = ArrowProps.StringNameToLineColour[lineColour];
        } else {
            console.log("Attempted to assign invalid lineColour: %s", lineColour);
        }
    }

    setLineType(lineType) {
        if (ArrowProps.StringToLineType[lineType] !== undefined) {
            this.lineType = ArrowProps.StringToLineType[lineType];
        } else {
            console.log("Attempted to assign invalid lineType: %s", lineType);
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

    drawLines(canvasContext, points, strokeColour, fillColour) {
        canvasContext.strokeStyle = strokeColour;
        if (fillColour !== undefined) {
            canvasContext.fillStyle = fillColour;
        }

        canvasContext.beginPath();
        canvasContext.moveTo(points[0].X, points[0].Y);
        for (let i = 1; i < points.length; i++) {
            canvasContext.lineTo(points[i].X, points[i].Y)
        }
        
        if (fillColour !== undefined) {
            canvasContext.closePath();
            canvasContext.fill();
        }
        canvasContext.stroke();

        canvasContext.fillStyle = "#000"
        canvasContext.strokeStyle = "#000";
    }

    drawArrowEnd(canvasContext, x, y, angle) {
        //Constants
        const strokeLength = 7;
        const angleFromLine = Math.PI/6;
        const angleInverted = angle + Math.PI;

        //Generate points for the arrowhead
        var arrowPoints = [];
        arrowPoints.push({
            X: x + strokeLength * Math.cos(angleInverted - angleFromLine),
            Y: y + strokeLength * Math.sin(angleInverted - angleFromLine)
        });
        arrowPoints.push({
            X: x,
            Y: y
        });
        arrowPoints.push({
            X: x + strokeLength * Math.cos(angleInverted + angleFromLine),
            Y: y + strokeLength * Math.sin(angleInverted + angleFromLine)
        });

        //Arrowhead drawing
        this.drawLines(canvasContext, arrowPoints, this.lineColour)
    }

    drawTriangleEnd(canvasContext, x, y, angle, fillColour = "#FFF") {
        //Constants
        const sideLength = 7;
        const deg30 = Math.PI / 6;
        const angleInverted = angle + Math.PI;

        //Generate points for the triangle
        var trianglePoints = [];
        trianglePoints.push({
            X: x,
            Y: y
        });
        trianglePoints.push({
            X: x + sideLength * Math.cos(angleInverted - deg30),
            Y: y + sideLength * Math.sin(angleInverted - deg30)
        });
        trianglePoints.push({
            X: x + sideLength * Math.cos(angleInverted + deg30),
            Y: y + sideLength * Math.sin(angleInverted + deg30)
        });
        trianglePoints.push({
            X: x,
            Y: y
        });

        //Triangle drawing
        this.drawLines(canvasContext, trianglePoints, this.lineColour, fillColour);
    }

    drawDiamondEnd(canvasContext, x, y, angle, fillColour = "#FFF") {
        //Constants
        const sideLength = 7;
        const deg45 = Math.PI / 4;
        const angleInverted = angle + Math.PI;

        //Generate points for the diamond
        var diamondPoints = [];
        diamondPoints.push({
            X: x,
            Y: y
        });
        diamondPoints.push({
            X: x + sideLength * Math.cos(angleInverted - deg45),
            Y: y + sideLength * Math.sin(angleInverted - deg45)
        });
        diamondPoints.push({
            X: x + sideLength * Math.SQRT2 * Math.cos(angleInverted),
            Y: y + sideLength * Math.SQRT2 * Math.sin(angleInverted)
        });
        diamondPoints.push({
            X: x + sideLength * Math.cos(angleInverted + deg45),
            Y: y + sideLength * Math.sin(angleInverted + deg45)
        });
        diamondPoints.push({
            X: x,
            Y: y
        });

        //Diamond drawing
        this.drawLines(canvasContext, diamondPoints, this.lineColour, fillColour);
    }

    drawStartHead(canvasContext) {
        var lineAngle = Math.atan2(this.fromY - this.toY, this.fromX - this.toX);

        switch (this.startType) {
            case ArrowProps.EdgeEnd.NONE:
                break;
            case ArrowProps.EdgeEnd.ARROW:
                this.drawArrowEnd(canvasContext, this.fromX, this.fromY, lineAngle);
                break;
            case ArrowProps.EdgeEnd.TRIANGLE:
                this.drawTriangleEnd(canvasContext, this.fromX, this.fromY, lineAngle);
                break;
            case ArrowProps.EdgeEnd.DIAMOND:
                this.drawDiamondEnd(canvasContext, this.fromX, this.fromY, lineAngle);
                break;
            default:
                console.log("Arrow had unexpected startType: %s", this.startType);
        }
    }

    drawEndHead(canvasContext) {
        var lineAngle = Math.atan2(this.toY - this.fromY, this.toX - this.fromX);

        switch (this.endType) {
            case ArrowProps.EdgeEnd.NONE:
                break;
            case ArrowProps.EdgeEnd.ARROW:
                this.drawArrowEnd(canvasContext, this.toX, this.toY, lineAngle);
                break;
            case ArrowProps.EdgeEnd.TRIANGLE:
                this.drawTriangleEnd(canvasContext, this.toX, this.toY, lineAngle);
                break;
            case ArrowProps.EdgeEnd.DIAMOND:
                this.drawDiamondEnd(canvasContext, this.toX, this.toY, lineAngle);
                break;
            default:
                console.log("Arrow had unexpected endType: %s", this.endType);
        }
    }

    draw(canvasContext) {
        var dashLength = 5;

        switch (this.lineType) {
            case ArrowProps.LineType.SOLID:
                canvasContext.setLineDash([]);
                break;
            case ArrowProps.LineType.DASHED:
                canvasContext.setLineDash([dashLength, dashLength]);
                break;
            default:
                console.log("Arrow had invalid lineType: %s", this.lineType);
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

        this.drawStartHead(canvasContext);
        this.drawEndHead(canvasContext);
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