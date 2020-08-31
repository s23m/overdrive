/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/. */

import { Cardinality } from "./Cardinality";
import {getDistance} from "../canvasDraw";


const EdgeEnd = {
    NONE: 1,
    ARROW: 2,
    TRIANGLE: 3,
    FILLED_TRIANGLE: 4,
    DIAMOND: 5,
    FILLED_DIAMOND: 6
}

export class Arrow {
    constructor(UUID, fromVertex, fromVertexNode, toVertex, toVertexNode, zoom) {
        this.UUID = UUID;

        // Connections
        this.fromVertex = fromVertex;
        this.fromVertexNode = fromVertexNode;

        this.toVertex = toVertex;
        this.toVertexNode = toVertexNode;

        // Type
        this.startType = EdgeEnd.NONE;
        this.endType = EdgeEnd.ARROW;

        this.cardinality = null;
    }

    add_cardinality(lowerBound, upperBound) {
        this.cardinality = new Cardinality(lowerBound, upperBound);
    }

    draw(canvasContext) {
        var fromNode = this.fromVertex.getNodeByVertexNode(this.fromVertexNode);
        var toNode = this.toVertex.getNodeByVertexNode(this.toVertexNode);

        canvasContext.beginPath();
        canvasContext.moveTo(fromNode[0], fromNode[1]);
        canvasContext.lineTo(toNode[0], toNode[1]);
        canvasContext.stroke();

        // Arrow types
        if (this.endType === EdgeEnd.ARROW) {
            // TODO arrow types
        }
    }

    // Returns all nodes for this object
    getNodes() {
        return null;
    }

    // Checks if it intersects with point
    intersects(x, y) {
        var fromNode = this.fromVertex.getNodeByVertexNode(this.fromVertexNode);
        var toNode = this.toVertex.getNodeByVertexNode(this.toVertexNode);

        var m = getDistance(x, y, fromNode[0], fromNode[1]);
        var n = getDistance(x, y, toNode[0], toNode[1]);
        var l = getDistance(fromNode[0], fromNode[1], toNode[0], toNode[1]);

        var threshold = 5;

        return (m+n-threshold < l);
    }
}