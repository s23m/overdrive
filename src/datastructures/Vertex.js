/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/. */

export var padding = 5;

const VertexNodes = {
    TOP_LEFT: 1,
    TOP: 2,
    TOP_RIGHT: 3,
    RIGHT: 4,
    BOTTOM_RIGHT: 5,
    BOTTOM: 6,
    BOTTOM_LEFT: 7,
    LEFT: 8,
}

export class Vertex {

    UUID;
    sx;
    sy;
    width;
    height;
    name;
    content;
    title;

    constructor(UUID, title, content, sx, sy, ex, ey){
        this.UUID = UUID;
        this.title = title;
        this.content = content;
        this.sx = sx;
        this.sy = sy;
        this.width = ex-sx;
        this.height = ey-sy;
    }

    setTitle(title){
        this.title = title;
    }

    setContent(content){
        this.content = content;
    }

    drawNode(canvasContext, x, y) {
        canvasContext.beginPath();
        canvasContext.arc(x, y, 3, 0, Math.PI*2, false);
        canvasContext.fill();
        canvasContext.closePath();
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

        if(maxWidth > this.width) {
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

        // Prepare to Draw nodes
        canvasContext.fillStyle = "#000000";
        canvasContext.globalAlpha = 0.6;

        this.drawNode(canvasContext, this.sx, this.sy); // Top Left
        this.drawNode(canvasContext, this.sx+rectWidth/2, this.sy); // Top
        this.drawNode(canvasContext, this.sx+rectWidth, this.sy); // Top Right
        this.drawNode(canvasContext, this.sx+rectWidth, this.sy+rectHeight/2); // Right
        this.drawNode(canvasContext, this.sx+rectWidth, this.sy+rectHeight); // Bottom Right
        this.drawNode(canvasContext, this.sx+rectWidth/2, this.sy+rectHeight); // Bottom
        this.drawNode(canvasContext, this.sx, this.sy+rectHeight); // Bottom Left
        this.drawNode(canvasContext, this.sx, this.sy+rectHeight/2); // Left

        // Finish drawing nodes
        canvasContext.globalAlpha = 1.0;

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

    getNodeByVertexNode(vertexNode) {
        switch (vertexNode) {
            case VertexNodes.TOP_LEFT:
                return [this.sx,              this.sy,               VertexNodes.TOP_LEFT,     this];
            case VertexNodes.TOP:
                return [this.sx+this.width/2, this.sy,               VertexNodes.TOP,          this];
            case VertexNodes.TOP_RIGHT:
                return [this.sx+this.width,   this.sy,               VertexNodes.TOP_RIGHT,    this];
            case VertexNodes.RIGHT:
                return [this.sx+this.width,   this.sy+this.height/2, VertexNodes.RIGHT,        this];
            case VertexNodes.BOTTOM_RIGHT:
                return [this.sx+this.width,   this.sy+this.height,   VertexNodes.BOTTOM_RIGHT, this];
            case VertexNodes.BOTTOM:
                return [this.sx+this.width/2, this.sy+this.height,   VertexNodes.BOTTOM,       this];
            case VertexNodes.BOTTOM_LEFT:
                return [this.sx,              this.sy+this.height,   VertexNodes.BOTTOM_LEFT,  this];
            case VertexNodes.LEFT:
                return [this.sx,              this.sy+this.height/2, VertexNodes.LEFT,         this];
        }
    }

    // Returns all nodes for this object
    getNodes() {
        var nodes = [];
        nodes.push(this.getNodeByVertexNode(VertexNodes.TOP_LEFT));
        nodes.push(this.getNodeByVertexNode(VertexNodes.TOP));
        nodes.push(this.getNodeByVertexNode(VertexNodes.TOP_RIGHT));
        nodes.push(this.getNodeByVertexNode(VertexNodes.RIGHT));
        nodes.push(this.getNodeByVertexNode(VertexNodes.BOTTOM_RIGHT));
        nodes.push(this.getNodeByVertexNode(VertexNodes.BOTTOM));
        nodes.push(this.getNodeByVertexNode(VertexNodes.BOTTOM_LEFT));
        nodes.push(this.getNodeByVertexNode(VertexNodes.LEFT));
        return nodes;
    }

    // Checks if it intersects with point
    intersects(x, y) {
        if (x < this.sx) return false;
        if (y < this.sy) return false;
        if (x > this.sx+this.width) return false;
        if (y > this.sy+this.height) return false;
        return true;
    }
}