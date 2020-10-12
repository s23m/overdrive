/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/. */

import { SemanticIdentity } from "./SemanticIdentity";
import {drawMarker, getDistance} from "../UIElements/CanvasDraw";
import * as ArrowProps from "./ArrowProperties";
import { EdgeEnd } from "./EdgeEnd";
import {pathFindTo} from "../Utils/PathFinder";
import {Cardinality} from "./Cardinality";
import {Tool} from "../UIElements/LeftMenu";

export class Arrow {
    // Connects an arrow fromVertex to toVertex
    // pathData is an array of objects that can either be a:
    //      0) Vertex Data
    //         [0, UUID, xPercentage, yPercentage]
    //         The Percentage data is the relative percentage
    //              e.g. 0,0 represents top left, 1,1 bottom right etc
    //      1) Array containing an x and y element
    //         [1, x, y]
    constructor(objectsList, pathData, type, semanticIdentity) {
        this.typeName = "Arrow";

        if (semanticIdentity !== undefined){
            this.semanticIdentity = semanticIdentity;
        } else {
            if(objectsList.length > 1) {
                this.semanticIdentity = new SemanticIdentity("Arrow from " + objectsList[0].semanticIdentity.UUID + " to " + objectsList[1].semanticIdentity.UUID, "", "", "", undefined, []);
            }else if (objectsList.length === 1){
                this.semanticIdentity = new SemanticIdentity("Arrow connecting " + objectsList[0].semanticIdentity.UUID, "", "", "", undefined, []);
            }else{
                this.semanticIdentity = new SemanticIdentity("Arrow connecting 1 or less vertices", "", "", "", undefined, []);
            }
        }

        this.sourceEdgeEnd = new EdgeEnd(this.semanticIdentity.UUID);
        this.destEdgeEnd = new EdgeEnd(this.semanticIdentity.UUID);

        // Ensure there are at least 2 points
        if (pathData.length === 1) pathData.push(pathData[0]);
        // Save pathData for later
        this.pathData = pathData;

        // Construct Path
        this.rebuildPath(objectsList);

        // Type

        this.lineColour = ArrowProps.LineColour.BLACK;
        this.lineType = ArrowProps.LineType.SOLID;

        if (type === Tool.Edge || type === Tool.Specialisation || type === Tool.Visibility) {
            this.sourceEdgeEnd.type = ArrowProps.EdgeEnd.NONE
        }else{
            console.log("Failed to find correct tool")
            this.sourceEdgeEnd.type = ArrowProps.EdgeEnd.NONE
        }

        if (type === Tool.Edge) {
            this.destEdgeEnd.type = ArrowProps.EdgeEnd.NONE
        }else if (type === Tool.Specialisation){
            this.destEdgeEnd.type = ArrowProps.EdgeEnd.TRIANGLE
        }else if (type === Tool.Visibility){
            this.destEdgeEnd.type = ArrowProps.EdgeEnd.ARROW;
            this.lineType = ArrowProps.LineType.DASHED
        }else{
            console.log("Failed to find correct tool")
            this.destEdgeEnd.type = ArrowProps.EdgeEnd.NONE
        }

        this.edgeType = type

        this.selected = false;

        this.sourceCardinality = new Cardinality();
        this.destCardinality = new Cardinality();
    }

    // Rebuilds path from cached pathData
    rebuildPath(objects) {
        // X, Y data for path
        this.path = [];

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
                if (objects[i].semanticIdentity.UUID === pathItem[1]) {
                    var x = pathItem[2]*objects[i].width + objects[i].x;
                    var y = pathItem[3]*objects[i].height + objects[i].y;
                    return [x, y]
                }
            }
        }

        console.error("Could not find vertex to connect for pathItem", pathItem);
        return null;
    }

    setSelected(selected) {
        this.selected = selected;
    }

    updateSourceCardinality(lowerBound, upperBound, visibility) {
        this.sourceEdgeEnd.updateCardinality(lowerBound, upperBound, visibility);
    }

    getSourceCardinalityVisibility() {
        return this.sourceEdgeEnd.cardinality.isVisible;
    }

    toggleSourceCardinalityVisibility() {
        this.sourceEdgeEnd.cardinality.toggleVisibility();
    }

    getSourceCardinalityLowerBound() {
        return this.sourceEdgeEnd.cardinality.lowerBound;
    }

    getSourceCardinalityUpperBound() {
        return this.sourceEdgeEnd.cardinality.upperBound;
    }

    updateDestCardinality(lowerBound, upperBound, visibility) {
        this.destEdgeEnd.updateCardinality(lowerBound, upperBound, visibility);
    }

    getDestCardinalityVisibility() {
        return this.destEdgeEnd.cardinality.isVisible;
    }

    toggleDestCardinalityVisibility() {
        this.destEdgeEnd.cardinality.toggleVisibility();
    }

    getDestCardinalityLowerBound() {
        return this.destEdgeEnd.cardinality.lowerBound;
    }

    getDestCardinalityUpperBound() {
        return this.destEdgeEnd.cardinality.upperBound;
    }

    setStartLabel(label) {
        this.sourceEdgeEnd.label = label;
    }

    setEndLabel(label) {
        this.destEdgeEnd.label = label;
    }

    setStartType(startType) {
        var val = ArrowProps.StringToEdgeEnd[startType];
        if (val !== undefined) {
            this.sourceEdgeEnd.type = val;
        } else {
            console.log("Attempted to assign invalid startType: %s", startType);
        }
    }

    setEndType(endType) {
        var val = ArrowProps.StringToEdgeEnd[endType];
        if (val !== undefined) {
            this.destEdgeEnd.type = val;
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
        vertexNodes.push([topLeft,     vertex.x-d,              vertex.y+vertex.height+d, [left, top]]);               // Top    Left
        vertexNodes.push([top,         vertex.x+vertex.width/2, vertex.y+vertex.height+d, [topLeft, topRight]]);       // Top
        vertexNodes.push([topRight,    vertex.x+vertex.width+d, vertex.y+vertex.height+d, [top, right]]);              // Top    Right
        vertexNodes.push([right,       vertex.x+vertex.width+d, vertex.y+vertex.height/2, [topRight, bottomRight]]);   //        Right
        vertexNodes.push([bottomRight, vertex.x+vertex.width+d, vertex.y-d,               [right, bottom]]);           // Bottom Right
        vertexNodes.push([bottom,      vertex.x+vertex.width/2, vertex.y-d,               [bottomRight, bottomLeft]]); // Bottom
        vertexNodes.push([bottomLeft,  vertex.x-d,              vertex.y-d,               [bottomRight, left]]);       // Bottom Left
        vertexNodes.push([left,        vertex.x-d,              vertex.y+vertex.height/2, [bottomLeft, topLeft]]);     //        Left
        return [nodeIndex, vertexNodes];
    }

    drawStartHead(canvasContext) {
        var lineAngle = Math.atan2(this.getSY() - this.getNSY(), this.getSX() - this.getNSX());
        this.sourceEdgeEnd.draw(canvasContext, this.getSX(), this.getSY(), lineAngle, this.lineColour);
    }

    drawEndHead(canvasContext) {
        var lineAngle = Math.atan2(this.getEY() - this.getNEY(), this.getEX() - this.getNEX());
        this.destEdgeEnd.draw(canvasContext, this.getEX(), this.getEY(), lineAngle, this.lineColour);
    }

    getTextOffsets(canvasContext, sourceText, destText, sourceCtext, destCtext) {
        let sourceTextWidth = canvasContext.measureText(sourceText).width;
        let destTextWidth = canvasContext.measureText(destText).width;
        let sourceCtextWidth = canvasContext.measureText(sourceCtext).width;
        let destCtextWidth = canvasContext.measureText(destCtext).width;
        let textHeight = 15;
        // 'M' is the widest possible character
        let charWidth = canvasContext.measureText("M").width;

        let sxOffset = 0;
        let syOffset = 0;
        let exOffset = 0;
        let eyOffset = 0;

        let sxOffsetc = 0;
        let syOffsetc = 0;
        let exOffsetc = 0;
        let eyOffsetc = 0;

        let xFlip = true;
        let yFlip = true;

        // true if arrow is landscape, false if arrow is portrait;
        let LRArrow = Math.abs(this.getSX()-this.getEX()) > Math.abs(this.getSY()-this.getEY())

        if (LRArrow) {
            if (this.getSX() > this.getEX()) {
                xFlip = !xFlip;
            }
        } else {
            if (this.getSY() > this.getEY()) {
                yFlip = !yFlip;
            }
        }


        if (xFlip) {
            sxOffset = charWidth/2;
            if (LRArrow) {
                sxOffsetc = charWidth/2;
            } else {
                sxOffsetc = -1*(sourceCtextWidth+charWidth/2)
            }
        } else {
            sxOffset = -1*(sourceTextWidth+charWidth/2)
            if (LRArrow) {
                sxOffsetc = -1*(sourceCtextWidth+charWidth/2)
            } else {
                sxOffsetc = charWidth/2;
            }
        }
        

        if (yFlip) {
            syOffset = textHeight;
            if (LRArrow) {
                syOffsetc = -1*(textHeight/2)
            } else {
                syOffsetc = syOffset = textHeight;
            }
        } else {
            syOffset = -1*(textHeight/2);
            if (LRArrow) {
                syOffsetc = syOffset = textHeight;
            } else {
                syOffsetc = -1*(textHeight/2)
            }
        }


        //if true arrow moves more in x than in y
        xFlip = !xFlip;
        yFlip = !yFlip;

        if (xFlip) {
            exOffset = charWidth/2;
            if (LRArrow) {
                exOffsetc = charWidth/2;
            } else {
                exOffsetc = -1*(destCtextWidth+charWidth/2)
            }
        } else {
            exOffset = -1*(destTextWidth+charWidth/2)
            if (LRArrow) {
                exOffsetc = -1*(destCtextWidth+charWidth/2)
            } else {
                exOffsetc = charWidth/2;
            }
        }


        if (yFlip) {
            eyOffset = textHeight
            if (LRArrow) {
                eyOffsetc = -1*(textHeight/2)
            } else {
                eyOffsetc = eyOffset = textHeight;
            }
        } else {
            eyOffset = -1*(textHeight/2)
            if (LRArrow) {
                eyOffsetc = eyOffset = textHeight;
            } else {
                eyOffsetc = -1*(textHeight/2)
            }
        }


        return [sxOffset,syOffset,exOffset,eyOffset,sxOffsetc,syOffsetc,exOffsetc,eyOffsetc]
    }



    drawLabelsAndCardinalities(canvasContext) {
        let sourceCardText = this.sourceEdgeEnd.cardinality.toString();
        let destCardText = this.destEdgeEnd.cardinality.toString();
        let Offsets = this.getTextOffsets(canvasContext,this.sourceEdgeEnd.label,this.destEdgeEnd.label,sourceCardText,destCardText);

        //draw source text
        canvasContext.fillText(this.sourceEdgeEnd.label, this.getSX() + Offsets[0], this.getSY() + Offsets[1]);

        //draw destination text
        canvasContext.fillText(this.destEdgeEnd.label, this.getEX() + Offsets[2], this.getEY() + Offsets[3]);

        //draw source cardinality
        if (this.sourceEdgeEnd.cardinality.isVisible) {
            canvasContext.fillText(sourceCardText, this.getSX() + Offsets[4], this.getSY() + Offsets[5]);
        }

        //draw destination cardinality
        if (this.destEdgeEnd.cardinality.isVisible) {
            canvasContext.fillText(destCardText, this.getEX() + Offsets[6], this.getEY() + Offsets[7]);
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

        // Draw Lines
        for (let i = 0; i < this.path.length-1; i++) {
            let from = this.path[i];
            let to = this.path[i+1];

            canvasContext.beginPath();
            canvasContext.moveTo(from[0], from[1]);
            canvasContext.lineTo(to[0], to[1]);
            canvasContext.stroke();
        }

        canvasContext.strokeStyle = "#000";
        canvasContext.setLineDash([]);

        this.drawStartHead(canvasContext);
        this.drawEndHead(canvasContext);
        //store which labels were flipped and in which direction (x/y)
        this.drawLabelsAndCardinalities(canvasContext);

        if (this.selected) {
            for (let i = 0; i < this.path.length; i++) {
                let pos = this.path[i];
                drawMarker(pos[0], pos[1]);
            }
        }
    }

    intersects(cx, cy) {
        for (let i = 0; i < this.path.length-1; i++) {
            let from = this.path[i];
            let to = this.path[i+1];

            if (this.intersectsSegment(cx, cy, from, to)) return true;
        }
        return false;
    }

    // Checks if it intersects with one of the line segments
    intersectsSegment(cx, cy, from, to) {
        var m = getDistance(cx, cy, from[0], from[1]);
        var n = getDistance(cx, cy, to[0], to[1]);
        var l = getDistance(from[0], from[1], to[0], to[1]);

        var threshold = 1;

        return (m+n-threshold < l);
    }

    // Get first x/y
    getSX() {
        return this.path[0][0];
    }
    getSY() {
        return this.path[0][1];
    }

    // Get second x/y
    getNSX() {
        return this.path[1][0];
    }
    getNSY() {
        return this.path[1][1];
    }

    // Get second last x/y
    getNEX() {
        var index = this.path.length-2;
        if (index < 0) index = 0;
        return this.path[index][0];
    }
    getNEY() {
        var index = this.path.length-2;
        if (index < 0) index = 0;
        return this.path[index][1];
    }

    // Get last x/y
    getEX() {
        return this.path[this.path.length-1][0];
    }
    getEY() {
        return this.path[this.path.length-1][1];
    }
}