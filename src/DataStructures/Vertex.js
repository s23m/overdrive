/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/. */

import { getDistance } from "../UIElements/CanvasDraw";

export var padding = 5;
export var defaultColour = "#FFD5A9";

export class Vertex {

    constructor(UUID, title, content, x, y, width, height) {
        this.UUID = UUID;
        this.name = "Vertex";

        this.title = title;
        this.content = content;
        this.x = x;
        this.y = y;
        this.icon = "-No Icon";
        this.children = [];
        this.colour = defaultColour;
        this.selected = false;

        // Note these values often change in runtime
        this.width = width;
        this.height = height;

        // Translations
        this.translations = new Map();
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

    setIcon(name) {
        this.icon = name;
    }

    getBounds() {
        return [this.x,this.y,this.x+this.width,this.y+this.height];
    }

    expandSide(side, x, y) {
        var ex = 0;
        var ey = 0;

        switch (side) {
            case "topLeft":
                ey = this.y + this.height;
                this.y = y;
                this.height = ey-this.y;
                ex = this.x + this.width;
                this.x = x;
                this.width = ex-this.x;
                break;

            case "topRight":
                ey = this.y + this.height;
                this.y = y;
                this.height = ey-this.y;
                this.width = x-this.x;
                break;

            case "bottomLeft":
                this.height = y-this.y;
                ex = this.x + this.width;
                this.x = x;
                this.width = ex-this.x;
                break;

            case "bottomRight":
                this.height = y-this.y;
                this.width = x-this.x;
                break;

            case "left":
                ex = this.x + this.width;
                this.x = x;
                this.width = ex-this.x;
                break;

            case "right":
                this.width = x-this.x;
                break;

            case "top":
                ey = this.y + this.height;
                this.y = y;
                this.height = ey-this.y;
                break;

            case "bottom":
                this.height = y-this.y;
                break;

            default:
                break;
        }
    }

    draw(canvasContext) {
        // TODO fix automatically increasing width when text is too long
        // to do that the width / height value will have to be changed, which is fine and the program can already handle that

        if(this.selected){
            let r = Math.hypot(this.x +this.width-this.x,this.y + this.height-this.y);
            //canvasContext.setLineDash([1,dashLength]);
            let gradient = canvasContext.createRadialGradient(this.x+(this.width/2),this.y+(this.height/2),0,this.x + (this.width/2),this.y + (this.height/2),r);
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

        // Draw rect
        canvasContext.fillStyle = this.colour;
        canvasContext.fillRect(this.x, this.y, rectWidth, rectHeight);
        canvasContext.strokeRect(this.x, this.y, rectWidth, fontSize+padding+padding);
        canvasContext.strokeRect(this.x, this.y, rectWidth, rectHeight);

        // Reset color for text
        canvasContext.fillStyle = "#000000";

        // Draw Height for text that will be increased to draw downward
        var dy = padding+fontSize;

        // Disable shadows for text
        canvasContext.shadowOffsetX = 0.0; canvasContext.shadowOffsetY = 0.0;

        // Draw name
        canvasContext.fillText(this.title, this.x+padding, this.y+dy);
        dy += padding*2 + fontSize;

        // Draw text
        for (let i = 0; i < this.content.length; i++) {
            canvasContext.fillText(this.content[i], this.x+padding, this.y+dy);
            dy += fontSize + padding;
        }

        canvasContext.strokeStyle = "black"

    }

    // Checks if it intersects with point
    intersects(x, y) {
        if (x < this.x) return false;
        if (y < this.y) return false;
        if (x > this.x+this.width) return false;
        if (y > this.y+this.height) return false;
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
        // Create possibilities
        var sides = []

        // If can connect to top/bottom
        if (cursorX > this.x && cursorX < this.x+this.width) {
            var xPercentage = (cursorX-this.x)/this.width;

            sides.push([Math.abs(cursorY-(this.y)), xPercentage, 0]);
            sides.push([Math.abs(cursorY-(this.y+this.height)), xPercentage, 1]);
        }

        // If can connect to left/right
        else if (cursorY > this.y && cursorY < this.y+this.height) {
            var yPercentage = (cursorY-this.y)/this.height;

            sides.push([Math.abs(cursorX-(this.x)), 0, yPercentage]);
            sides.push([Math.abs(cursorX-(this.x+this.width)), 1, yPercentage]);
        }

        // Can't connect
        else {
            return null;
        }

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