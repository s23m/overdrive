/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/. */

import {Cardinality} from "./Cardinality";
import {getDistance} from "../UIElements/CanvasDraw";
import * as ArrowProps from "./ArrowProperties";
import {pathFindTo} from "../Utils/PathFinder";

export class Arrow {
    // Connects an arrow fromVertex to toVertex
    // pathData is an array of objects that can either be a:
    //      0) Vertex Data
    //         [0, UUID, xPercentage, yPercentage]
    //         The Percentage data is the relative percentage
    //              e.g. 0,0 represents top left, 1,1 bottom right etc
    //      1) Array containing an x and y element
    //         [1, x, y]
    constructor(UUID, objectsList, pathData) {
        //fromVertexUUID, fromX, fromY, toVertexUUID, toX, toY
        this.UUID = UUID;
        this.name = "Arrow";

        // Save pathData for later
        this.pathData = pathData;

        // Construct Path
        this.rebuildPath(objectsList)

        // Type
        this.startType = ArrowProps.EdgeEnd.NONE;
        this.endType = ArrowProps.EdgeEnd.ARROW;
        this.lineColour = ArrowProps.LineColour.BLACK;
        this.lineType = ArrowProps.LineType.SOLID;

        this.sourceCardinality = new Cardinality(1, 1);
        this.destCardinality = new Cardinality(1, 1);

        this.sourceLabel = "";
        this.destLabel = "";

        this.selected = false;
    }

    // Rebuilds path from cached pathData
    rebuildPath(objects) {
        // X, Y data for path
        this.path = []

        for (let i = 0; i < this.pathData.length; i++) {
            // Check if its case 0 or 1
            let pathItem = this.pathData[i];

            if (pathItem[0] === 0) {
                this.path.push(this.getZerothCasePathItem(objects, pathItem));
            }
            else if (pathItem[0] === 1) {
                this.path.push([pathItem[1], pathItem[2]]);
            } else {
                console.error("Invalid PathData case, full pathData", this.pathData);
            }
        }
    }

    // Gets pathItem from object (hopefully a vertex) based on UUID
    getZerothCasePathItem(objects, pathItem) {
        for (let i = 0; i < objects.length; i++) {
            if (objects[i] !== null) {
                if (objects[i].UUID === pathItem[1]) {
                    var x = pathItem[2]*objects[i].width + objects[i].sx;
                    var y = pathItem[3]*objects[i].height + objects[i].sy;
                    return [x, y]
                }
            }
        }

        console.error("Could not find vertex to connect for pathItem", pathItem);
        return null;
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
        this.sourceLabel = label;
    }

    setEndLabel(label) {
        this.destLabel = label;
    }

    setStartType(startType) {
        var val = ArrowProps.StringToEdgeEnd[startType];
        if (val !== undefined) {
            this.startType = val;
        } else {
            console.log("Attempted to assign invalid startType: %s", startType);
        }
    }

    setEndType(endType) {
        var val = ArrowProps.StringToEdgeEnd[endType];
        if (val !== undefined) {
            this.endType = val;
        } else {
            console.log("Attempted to assign invalid endType: %s", endType);
        }
    }

    setLineColour(lineColour) {
        var val = ArrowProps.StringNameToLineColour[lineColour];
        if (val !== undefined) {
            this.lineColour = val;
        } else {
            console.log("Attempted to assign invalid lineColour: %s", lineColour);
        }
    }

    setLineType(lineType) {
        var val = ArrowProps.StringToLineType[lineType];
        if (val !== undefined) {
            this.lineType = val;
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
            case ArrowProps.EdgeEnd.FILLED_TRIANGLE:
                this.drawTriangleEnd(canvasContext, this.fromX, this.fromY, lineAngle, this.lineColour);
                break;
            case ArrowProps.EdgeEnd.DIAMOND:
                this.drawDiamondEnd(canvasContext, this.fromX, this.fromY, lineAngle);
                break;
            case ArrowProps.EdgeEnd.FILLED_DIAMOND:
                this.drawDiamondEnd(canvasContext, this.fromX, this.fromY, lineAngle, this.lineColour);
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
            case ArrowProps.EdgeEnd.FILLED_TRIANGLE:
                this.drawTriangleEnd(canvasContext, this.toX, this.toY, lineAngle, this.lineColour);
                break;
            case ArrowProps.EdgeEnd.DIAMOND:
                this.drawDiamondEnd(canvasContext, this.toX, this.toY, lineAngle);
                break;
            case ArrowProps.EdgeEnd.FILLED_DIAMOND:
                this.drawDiamondEnd(canvasContext, this.toX, this.toY, lineAngle, this.lineColour);
                break;
            default:
                console.log("Arrow had unexpected endType: %s", this.endType);
        }
    }

    getTextOffset(canvasContext,text,source){
        let textWidth = canvasContext.measureText(text).width;
        let textHeight = 5;
        // 'M' is the widest possible character
        let charWidth = canvasContext.measureText("M").width;
        let charHeight = 15;
        let xOffset = 0;
        let yOffset = 0;

        //left to right arrow
        if(this.toX > this.fromX){
            //left hand side
            if(source) {
                //if the text takes up less than half the space
                if (this.toX - this.fromX > (textWidth * 2) + 15) {
                    xOffset += charWidth;
                }else{
                    //todo: better solution
                    xOffset -= textWidth + charWidth
                }
            //right hand side
            }else{
                //if the text takes up less than half the space
                if (this.toX - this.fromX > (textWidth * 2) + 15){
                    xOffset -= textWidth + charWidth
                }else{
                    //todo: better solution
                    xOffset += charWidth;
                }
            }
        //right to left arrow
        }else {
            //right hand side
            if (!source) {
                //if the text takes up less than half the space
                if (this.toX - this.fromX > (textWidth * 2) + 15) {
                    xOffset += charWidth;
                }else{
                    //todo: better solution
                    xOffset -= textWidth + charWidth;
                }
                //left hand side
            } else {
                //if the text takes up less than half the space
                if (this.toX - this.fromX > (textWidth * 2) + 15) {
                    xOffset -= textWidth + charWidth
                }else{
                    //todo: better solution
                    xOffset += charWidth;
                }

            }
        }


        //top to bottom arrow
        if(this.toY > this.fromY){
            //top side
            if(source){
                //if the text takes up less than half the space
                if(this.toY > this.fromY + (textHeight*2) + 15){
                    yOffset += textHeight + charHeight/2
                }else{
                    //todo: better solution
                    yOffset -= textHeight
                }
            //bottom side
            }else{
                //if the text takes up less than half the space
                if(this.toY > this.fromY + (textHeight*2) + 15) {
                    yOffset -= textHeight
                }else{
                    //todo: better solution
                    yOffset += textHeight + charHeight/2
                }
            }
        //bottom to top arrow
        }else{
            //top side
            if(!source){
                //if the text takes up less than half the space
                if(this.toY > this.fromY + (textHeight*2) + 15){
                    yOffset += charHeight/2
                }else{
                    //todo: better solution
                    yOffset -= textHeight
                }
                //bottom side
            }else{
                //if the text takes up less than half the space
                if(this.toY > this.fromY + (textHeight*2) + 15) {
                    yOffset -= textHeight
                }else{
                    //todo: better solution
                    yOffset += charHeight/2
                }
            }
        }


        return [xOffset,yOffset]
    }

    drawLabels(canvasContext) {
        let sourceOffset = this.getTextOffset(canvasContext,this.sourceLabel, 1);
        let destOffset = this.getTextOffset(canvasContext,this.destLabel, 0);

        //draw source text
        canvasContext.fillText(this.sourceLabel, this.fromX + sourceOffset[0], this.fromY + sourceOffset[1]);

        //draw destination text
        canvasContext.fillText(this.destLabel, this.toX + destOffset[0], this.toY + destOffset[1]);
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

        // Draw Lines
        for (var i = 0; i < this.path.length-1; i++) {
            let from = this.path[i];
            let to = this.path[i+1];
            canvasContext.beginPath();
            canvasContext.moveTo(from[0], from[1]);
            canvasContext.lineTo(to[0], to[1]);
            canvasContext.stroke();
        }

        canvasContext.strokeStyle = "#000000";
        canvasContext.setLineDash([]);

        this.drawStartHead(canvasContext);
        this.drawEndHead(canvasContext);
        this.drawLabels(canvasContext);
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