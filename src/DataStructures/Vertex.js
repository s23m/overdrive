/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/. */

import { drawMarker, getDistance } from "../UIElements/CanvasDraw";
import { SemanticIdentity } from "./SemanticIdentity";
import {Icon} from "@material-ui/core";
import React from "react";

export var padding = 5;
export var defaultColour = "#FFD5A9";
export var defaultMinimumSize = 30;

export class Vertex {

    constructor(title, content, x, y, width, height, semanticIdentity) {
        this.typeName = "Vertex";

        if (semanticIdentity !== null){
            this.semanticIdentity = semanticIdentity;
        } else {
            this.semanticIdentity = new SemanticIdentity(title);
        }

        this.title = title;
        this.content = content;
        this.x = x;
        this.y = y;
        this.icons = [[],[],[]];
        this.children = [];
        this.colour = defaultColour;
        this.selected = false;
        this.imageElements = {};

        // Note these values often change in runtime
        this.width = width;
        this.height = height;

        this.realHeight = height;

        // Make sure width and height meet a reasonable minimum
        this.width = Math.min(width, defaultMinimumSize)
        this.height = Math.min(height, defaultMinimumSize)
    }

    setSelected(selected) {
        this.selected = selected;
    }

    getColour(){
        return this.colour
    }

    setColour(colour){
        this.colour = colour;
    }

    addChild(child) {
        this.children.push(child)
        if (this.width < this.children.length * 60) {
            this.width = this.children.length * 60
        }
    }

    setTitle(title) {
        this.title = title;
        this.semanticIdentity.name = title;
    }

    setContent(content) {
        this.content = content;
        this.semanticIdentity.description = content;
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

    setIcon(fileName) {
        let fileNames = this.icons[0];
        let Icons = this.icons[1];
        let Text = this.icons[2];
        let Elements = this.icons[3];

        let index = fileNames.indexOf(fileName);

        //icon not part of this vertex yet
        if (index === -1) {
            fileNames.push(fileName);
            Icons.push(true);
            Text.push(false);

        } else {
            Icons[index] = !Icons[index]
        }

        if (Text[index] === false && Icons[index] === false) {
            Icons.splice(index,1);
            Text.splice(index,1);
            fileNames.splice(index,1);
        }

    }

    setText(fileName) {
        let fileNames = this.icons[0];
        let icons = this.icons[1];
        let text = this.icons[2];
        let elements = this.icons[3]; // For completion sake

        let index = fileNames.indexOf(fileName);

        //icon not part of this vertex yet
        if (index === -1) {
            fileNames.push(fileName);
            icons.push(false);
            text.push(true);

        } else {
            text[index] = !text[index]
        }

        if (text[index] === false && icons[index] === false) {
            icons.splice(index,1);
            text.splice(index,1);
            fileNames.splice(index,1);
        }

    }

    isIconSet(fileName) {
        let index = this.icons[0].indexOf(fileName)
        if (index === -1) {
            return false;
        }
        return this.icons[1][index];
    }

    isTextSet(fileName) {
            let index = this.icons[0].indexOf(fileName)
            if (index === -1) {
                return false;
            } else {
                return this.icons[2][index];
            }
    }

    getBounds() {
        return [this.x, this.y, this.x+this.width, this.y+this.realHeight];
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

    increaseWidthIfNecessary(canvasContext, possibleWidth) {
        if (possibleWidth > this.width) {
            this.width = possibleWidth;
             setTimeout(() => {this.draw(canvasContext)},50)
        }

    }

    draw(canvasContext) {
        // Font size
        var fontSize = 12;
        padding = 5;
        // Set font settings
        canvasContext.font = fontSize+"px Arial";
        canvasContext.fontSize = fontSize;

        // Find the maximum width of text and size the class accordingly
        var measuredNameText = canvasContext.measureText(this.title).width;
        var maxWidth = Math.max(measuredNameText + padding*2, this.width);
        var textHeight = 0;

        // Iterate over all content text lines
        for (let i = 0; i < this.content.length; i++) {
            var measuredText = canvasContext.measureText(this.content[i]);
            maxWidth = Math.max(maxWidth, measuredText.width, measuredNameText);
            textHeight += fontSize+padding;
        }

        if (maxWidth > this.width) {
            this.width = maxWidth
        }

        // Configure drawing for shadows
        // And generally make it look nice
        canvasContext.shadowOffsetX = 2.0; canvasContext.shadowOffsetY = 2.0;

        // Icon height in px
        let iconHeight = 20;
        let iconPadding = 2;
        let iconListLen = this.icons[0].length;

        let iconAreaHeight = (iconHeight + (iconPadding * 2)) * iconListLen;

        // Update rect height
        // Use this to force text to fit
        if (this.content[0] !== "") {
            this.height = padding * 4 + fontSize + iconAreaHeight + textHeight;
        }else{
            this.height = padding * 2 + fontSize + iconAreaHeight
        }

        // Draw rect
        canvasContext.fillStyle = this.colour;
        canvasContext.fillRect(this.x, this.y, this.width, this.height);
        canvasContext.strokeRect(this.x, this.y, this.width, this.height);
        this.realHeight = this.height;

        if (this.content[0] !== "") {
            this.realHeight = this.height-textHeight-padding*2;
            canvasContext.strokeRect(this.x, this.y, this.width, this.realHeight);
        }

        // Draw selected markers if rect is selected
        if (this.selected) {
            canvasContext.fillStyle = "#000000";
            drawMarker(this.x, this.y);
            drawMarker(this.x+this.width, this.y);
            drawMarker(this.x, this.y+this.height);
            drawMarker(this.x+this.width, this.y+this.height);
        }

        // Draw Icons by filename
        var yPos = this.y + iconPadding;
        var xPos = this.x + this.width + iconPadding;

        for (let i = 0; i < this.icons[0].length; i++) {

            if (this.icons[1][i] === true) {
                if (this.icons[2][i] === true) {
                    this.increaseWidthIfNecessary(canvasContext, iconHeight + canvasContext.measureText("<< " + this.icons[0][i] + " >>").width);
                }

                let element = this.imageElements[this.icons[0][i]];

                if (element === undefined) {

                    let imageElement = new Image();
                    imageElement.src = "http://localhost:8080/icons/" + this.icons[0][i];

                    imageElement.onload = () => {
                        let sh = imageElement.height;
                        let sw = imageElement.width;
                        let scale = iconHeight / sh;
                        canvasContext.drawImage(imageElement, xPos-(iconPadding*2)-(sw*scale), yPos, sw * scale, sh * scale);
                        yPos += iconHeight + (iconPadding * 2); // What's the point of this line? yPos should be out of scope when this method is run
                        this.imageElements[this.icons[0][i]] = imageElement
                    };
                } else {
                    let sh = element.height;
                    let sw = element.width;
                    let scale = iconHeight / sh;
                    canvasContext.drawImage(element, xPos-(iconPadding*2)-(sw*scale), yPos, sw * scale, sh * scale);
                    yPos += iconHeight + (iconPadding * 2);
                }
            } else {
                yPos += iconHeight + (iconPadding * 2);
            }
        }

        // Reset color for text
        canvasContext.fillStyle = "#000000";

        // Draw Height for text that will be increased to draw downward
        var dy = padding+fontSize;

        // Disable shadows for text
        canvasContext.shadowOffsetX = 0.0; canvasContext.shadowOffsetY = 0.0;

        // TODO draw text for icons

        let txPos = this.x + iconPadding;
        let tyPos = this.y + iconHeight;

        for (let i = 0; i < this.icons[0].length; i++) {
            if (this.icons[2][i] === true) {
                if (this.icons[1][i] !== true) {
                    this.increaseWidthIfNecessary(canvasContext, canvasContext.measureText("<< " + this.icons[0][i] + " >>").width);
                }

                let name = "<< " + this.icons[0][i].slice(0, -4) + " >>";
                if (this.icons[0][i].slice(-6, -4) === "_n") {
                    name = "";
                }

                canvasContext.fillText(name, txPos, tyPos);
            }
            tyPos += iconHeight + (iconPadding * 2);
        }

        // Draw name
        this.increaseWidthIfNecessary(canvasContext, canvasContext.measureText(this.title).width);
        canvasContext.fillText(this.title, this.x+padding, this.y+dy+iconAreaHeight);
        dy += padding*2 + fontSize;

        // Draw text
        for (let i = 0; i < this.content.length; i++) {
            this.increaseWidthIfNecessary(canvasContext, canvasContext.measureText(this.content[i]).width + padding*2);
            canvasContext.fillText(this.content[i], this.x+padding, this.y+dy+iconAreaHeight);
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
    getNearestSideFrom(cursorX, cursorY, lastX, lastY) {
        // If can connect to top/bottom
        if (lastX > this.x && lastX < this.x+this.width) {
            return this.getNearestSide(lastX, cursorY);
        }

        // If can connect to left/right
        else if (lastY > this.y && lastY < this.y+this.height) {
            return this.getNearestSide(cursorX, lastY);
        }

        // Else
        return this.getNearestSide(cursorX, cursorY);
    }

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