/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/. */

import { Vertex } from "./Vertex";
import { Arrow } from "./Arrow";

export function createUUID() {
    return ([1e7]+-1e3+-4e3+-8e3+-1e11).replace(/[018]/g, c =>
        // eslint-disable-next-line
        (c ^ crypto.getRandomValues(new Uint8Array(1))[0] & 15 >> c / 4).toString(16)
    );
}

export class SemanticDomain {
    constructor() {
        this.elements = {};
    }

    add_element() {
        var UUID = createUUID();
        this.vertices[UUID] = new Vertex(UUID);

        return UUID;
    }

    add_arrow(startVertexUUID, endVertexUUID) {
        var UUID = createUUID();
        this.arrows[UUID] = new Arrow(UUID, startVertexUUID, endVertexUUID);

        return UUID;
    }
}