/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/. */

import { getDistance } from "../UIElements/CanvasDraw";

export var padding = 5;
export var defaultColour = "#FFD5A9";

// TODO change sx, sy to x, y
export class Vertex {

    constructor(UUID, title, content, sx, sy, width, height) {
        this.UUID = UUID;
        this.name = "Vertex";

        this.title = title;
        this.content = content;
        this.sx = sx;
        this.sy = sy;
        this.icon = "-No Icon";
        this.children = [];
        this.colour = defaultColour;
        this.selected = false;

        // Note these values often change in runtime
        this.width = width;
        this.height = height;
    }

    setSelected(selected){
        this.selected = selected;
    }

    addChild(child) {
        this.children.push(child)
        if (this.width < this.children.length * 60) {
            this.width = this.children.length * 60
        }
    }

    setTitle(title) {
        this.title = title;
    }

    setContent(content) {
        this.content = content;
    }

    getContentAsString() {
        if (this.content !== null) {
            var mergedContent = "";
            
            for (let i = 0; i < this.content.length; i++) {
                mergedContent = mergedContent.concat(this.content[i]);
                if (i < this.content.length - 1) {
                    mergedContent = mergedContent.concat("\n");
                }
            }
            
            return mergedContent;

        } else {
            return "";
        }
    }

    //TODO: Check if there's a better way to store icon
    setIcon(name) {
        this.icon = name;
    }

    setSX(x) {
        this.sx = x
    }

    setSY(y) {
        this.sy = y
    }

    getBounds() {
        return [this.sx,this.sy,this.sx+this.width,this.sy+this.height];
    }

    expandSide(side, x, y) {
        var ex = 0;
        var ey = 0;
        switch (side) {

            case "topLeft":
                ey = this.sy + this.height;
                this.sy = y;
                this.height = ey-this.sy;
                ex = this.sx + this.width;
                this.sx = x;
                this.width = ex-this.sx;
                break;

            case "topRight":
                ey = this.sy + this.height;
                this.sy = y;
                this.height = ey-this.sy;
                this.width = x-this.sx;
                break;

            case "bottomLeft":
                this.height = y-this.sy;
                ex = this.sx + this.width;
                this.sx = x;
                this.width = ex-this.sx;
                break;

            case "bottomRight":
                this.height = y-this.sy;
                this.width = x-this.sx;
                break;

            case "left":
                ex = this.sx + this.width;
                this.sx = x;
                this.width = ex-this.sx;

                break;
            case "right":
                this.width = x-this.sx;
                break;

            case "top":
                ey = this.sy + this.height;
                this.sy = y;
                this.height = ey-this.sy;
                break;

            case "bottom":
                this.height = y-this.sy;
                break;

            default:break;
        }
    }

    draw(canvasContext) {
        //todo: fix automatically increasing width when text is too long

        if(this.selected){
            let r = Math.hypot(this.sx +this.width-this.sx,this.sy + this.height-this.sy);
            //canvasContext.setLineDash([1,dashLength]);
            let gradient = canvasContext.createRadialGradient(this.sx+(this.width/2),this.sy+(this.height/2),0,this.sx + (this.width/2),this.sy + (this.height/2),r);
            gradient.addColorStop(0.5,"black");
            gradient.addColorStop(0.6,"orange");
            gradient.addColorStop(0,"yellow");
            gradient.addColorStop(0.4,"orange");
            gradient.addColorStop(1,"yellow");
            canvasContext.strokeStyle = gradient;
        }

        // Font size
        var fontSize = 12;
        padding = 5;
        // Set font settings
        canvasContext.font = fontSize+"px Arial";
        canvasContext.fontSize = fontSize;

        // Find the maximum width of text and size the class accordingly
        var measuredNameText = canvasContext.measureText(this.title)*2;
        var maxWidth = Math.max(measuredNameText.width, this.width);
        var textHeight = padding*2+fontSize*2;

        // Iterate over all content text lines
        for (let i = 0; i < this.content.length; i++) {
            var measuredText = canvasContext.measureText(this.content[i]);
            maxWidth = Math.max(maxWidth, measuredText.width);
            textHeight += fontSize+padding;
        }

        if (maxWidth > this.width) {
            this.width = maxWidth
        }


        // Configure drawing for shadows
        // And generally make it look nice
        canvasContext.shadowOffsetX = 2.0; canvasContext.shadowOffsetY = 2.0;

        // Decide rect width and height
        var rectWidth = this.width;
        var rectHeight = Math.max(this.height, textHeight);

        // Setup gradient fill
        //var grd = canvasContext.createLinearGradient(this.sx, this.sy, this.sx+rectWidth, this.sy+rectHeight);
        //grd.addColorStop(0, "#e3895f");
        //grd.addColorStop(1, "#e66229");

        // Draw rect
        canvasContext.fillStyle = this.colour;
        canvasContext.fillRect(this.sx, this.sy, rectWidth, rectHeight);
        canvasContext.strokeRect(this.sx, this.sy, rectWidth, fontSize+padding+padding);
        canvasContext.strokeRect(this.sx, this.sy, rectWidth, rectHeight);

        // Reset color for text
        canvasContext.fillStyle = "#000000";

        // Draw Height for text that will be increased to draw downward
        var dy = padding+fontSize;

        // Disable shadows for text
        canvasContext.shadowOffsetX = 0.0; canvasContext.shadowOffsetY = 0.0;

        // Draw name
        canvasContext.fillText(this.title, this.sx+padding, this.sy+dy);
        dy += padding*2 + fontSize;

        // Draw text
        for (let i = 0; i < this.content.length; i++) {
            canvasContext.fillText(this.content[i], this.sx+padding, this.sy+dy);
            dy += fontSize + padding;
        }

        canvasContext.strokeStyle = "black"

    }

    // Checks if it intersects with point
    intersects(x, y) {
        if (x < this.sx) return false;
        if (y < this.sy) return false;
        if (x > this.sx+this.width) return false;
        if (y > this.sy+this.height) return false;
        return true;
    }

    // Gets the nearest side, in Arrow compatible x,y percentage values
    // Also returns a threshold distance
    // Parameters are the cursor X and Y coordinates
    // Return value:
    //      [threshold, xRel, yRel]
    //
    // If threshold is -1, xRel and yRel are equal to cursorX, cursorY
    // This only happens when cursor shouldn't connect to vertex
    getNearestSide(cursorX, cursorY) {
        // Get basic distances
        var topLeftDist = getDistance(cursorX, cursorY, this.sx, this.sy);
        var botLeftDist = getDistance(cursorX, cursorY, this.sx, this.sy+this.height);
        var topRightDist = getDistance(cursorX, cursorY, this.sx+this.width, this.sy);
        var botRightDist = getDistance(cursorX, cursorY, this.sx+this.width, this.sy+this.height);

        // Check if it can connect at all
        var canConnectX = (cursorX > this.sx && cursorX < this.sx+this.width);
        var canConnectY = (cursorY > this.sy && cursorY < this.sy+this.height);
        if (!canConnectX && !canConnectY) {
            // Can't connect
            return null;
        }

        // Set percentages
        var xPercentage = (cursorX-this.sx)/this.width;
        var yPercentage = (cursorY-this.sy)/this.height;

        // Create possibilities
        var sides = []

        sides.push([topLeftDist+topRightDist-this.width, xPercentage, 0]);
        sides.push([botLeftDist+botRightDist-this.width, xPercentage, 1]);
        sides.push([topLeftDist+botLeftDist-this.height, 0, yPercentage]);
        sides.push([topRightDist+botRightDist-this.height, 1, yPercentage]);

        // Return side with shortest distance
        var shortest = sides[0];
        for (let i = 1; i < sides.length; i++) {
            if (sides[i][0] < shortest[0]) {
                shortest = sides[i];
            }
        }
        return shortest;
    }
}