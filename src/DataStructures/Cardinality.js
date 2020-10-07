/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/. */

import {drawAll} from "../UIElements/CanvasDraw";
import { SemanticIdentity } from "./SemanticIdentity";

export class Cardinality {
    constructor(lowerBound, upperBound, attachedToUUID, isVisible = false, semanticIdentity) {
        this.lowerBound = lowerBound;
        this.upperBound = upperBound;
        this.attachedToUUID = attachedToUUID;
        this.isVisible = isVisible;

        if (semanticIdentity !== null){
            this.semanticIdentity = semanticIdentity;
        } else {
            this.semanticIdentity = new SemanticIdentity(this.toString(), this.getDescription())
        }
    }

    toggleVisibility() {
        this.isVisible = !this.isVisible;
        drawAll()
    }

    toString() {
        var lower;
        var upper;

        if (this.lowerBound === '-1') {
            lower = 'n'
        } else {
            lower = this.lowerBound;
        }

        if (this.upperBound === '-1') {
            upper = 'n'
        } else {
            upper = this.upperBound;
        }

        if (lower === upper) {
            return lower;
        } else {
            return lower + " .. " + upper
        }
    }

    getDescription(){
        return `Cardinality of Edge End ${this.attachedToUUID}`;
    }
}