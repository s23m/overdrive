/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/. */

import { getDistance } from "../UIElements/CanvasDraw";

export var padding = 5;

// TODO change sx, sy to x, y
export class Vertex {

    constructor(UUID, title, content, sx, sy, width, height) {
        this.UUID = UUID;
        this.name = "Vertex";

        this.title = title;
        this.content = content;
        this.sx = sx;
        this.sy = sy;
        this.icon = "";
        this.children = [];

        // Note these values often change in runtime
        this.width = width;
        this.height = height;
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
        switch (side) {

            case "topLeft":
                var ey = this.sy + this.height;
                this.sy = y;
                this.height = ey-this.sy;
                var ex = this.sx + this.width;
                this.sx = x;
                this.width = ex-this.sx;
                break;

            case "topRight":
                var ey = this.sy + this.height;
                this.sy = y;
                this.height = ey-this.sy;
                this.width = x-this.sx;
                break;

            case "bottomLeft":
                this.height = y-this.sy;
                var ex = this.sx + this.width;
                this.sx = x;
                this.width = ex-this.sx;
                break;

            case "bottomRight":
                this.height = y-this.sy;
                this.width = x-this.sx;
                break;

            case "left":
                var ex = this.sx + this.width;
                this.sx = x;
                this.width = ex-this.sx;

                break;
            case "right":
                this.width = x-this.sx;
                break;

            case "top":
                var ey = this.sy + this.height;
                this.sy = y;
                this.height = ey-this.sy;
                break;

            case "bottom":
                this.height = y-this.sy;
                break;
        }
    }

    draw(canvasContext) {
        //todo: fix automatically increasing width when text is too long

        // Font size
        var fontSize = 12;
        padding = 5
        // Set font settings
        canvasContext.font = fontSize+"px Arial";
        canvasContext.fontSize = fontSize;

        // Find the maximum width of text and size the class accordingly
        var measuredNameText = canvasContext.measureText(this.title)*2;
        var maxWidth = Math.max(measuredNameText.width, this.width);
        var textHeight = padding*2+fontSize*2;

        // Iterate over all content text lines
        for (var i = 0; i < this.content.length; i++) {
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
        var grd = canvasContext.createLinearGradient(this.sx, this.sy, this.sx+rectWidth, this.sy+rectHeight);
        grd.addColorStop(0, "#e3895f");
        grd.addColorStop(1, "#e66229");

        // Draw rect
        canvasContext.fillStyle = grd;
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
        for (var i = 0; i < this.content.length; i++) {
            canvasContext.fillText(this.content[i], this.sx+padding, this.sy+dy);
            dy += fontSize + padding;
        }
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

        // First, since it can either lock on to the vertex horizontally or vertically
        // Find which one it is or if it's neither
        if (cursorX > this.sx && cursorX < this.sx+this.width) { // X case
            // Get threshold distance
            var topDist = topLeftDist+topRightDist;
            var botDist = botLeftDist+botRightDist;

            // Get x percentage
            var xPercentage = (cursorX-this.sx)/this.width;

            // Decide between top or bot
            if (topDist < botDist) { // top
                return [topDist, xPercentage, 0];
            } else { // bot
                return [botDist, xPercentage, 1];
            }
        } else if (cursorY > this.sy && cursorY < this.sy+this.height) { // Y case
            // Get threshold distance
            var leftDist = topLeftDist+botLeftDist;
            var rightDist = topRightDist+botRightDist;

            // Get y percentage
            var yPercentage = (cursorY-this.sy)/this.height;

            // Decide between left or right
            if (leftDist < rightDist) { // left
                return [leftDist, 0, yPercentage];
            } else { // right
                return [rightDist, 1, yPercentage];
            }
        } else { // Cursor can't connect
            return [-1, cursorX, cursorY];
        }
    }
}