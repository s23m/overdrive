/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/. */

import { v4 as uuidv4 } from 'uuid';

import { Vertex } from "./Vertex";
import { Arrow } from "./Arrow";

export class Graph {
    constructor(){
        this.vertices = {};
        this.arrows = {};
    }

    add_vertex(){
        var UUID = uuidv4();
        this.vertices[UUID] = new Vertex(UUID);

        return UUID;
    }

    add_arrow(startVertexUUID, endVertexUUID){
        var UUID = uuidv4();
        this.arrows[UUID] = new Arrow(UUID, startVertexUUID, endVertexUUID);

        return UUID;
    }
}