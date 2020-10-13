/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/. */

export class Graph {
    constructor(rootObjects) {
        if (rootObjects !== undefined) {
            this.rootObjects = rootObjects;
        } else {
            this.rootObjects = [];
        }
    }

    addToRoot(object) {
        if (Array.isArray(object)) {
            this.rootObjects.push(...object);
        } else {
            this.rootObjects.push(object);
        }
    }

    remove(object) {
        this.rootObjects.forEach((currentObject, index, arr) => {
            if (currentObject !== null) {
                //If the given object is a root object, delete it and add it's direct children to the root
                if (currentObject.semanticIdentity.UUID === object.semanticIdentity.UUID) {
                    this.addToRoot(currentObject.children);
                    arr.splice(index, 1);
                    return true;
                
                //Otherwise, continue to traverse down the tree starting at the current root node to find the object
                } else {
                    if (currentObject.typeName === "Vertex" && currentObject.removeFromChildren(object)) {
                        return true;
                    }
                }
            }
        });

        return false;
    }

    flatten() {
        var flattenedArray = [];

        this.rootObjects.forEach((currentObject, index, arr) => {
            flattenedArray.push(currentObject);
            if (currentObject !== null && currentObject.typeName === "Vertex") {
                flattenedArray.push(...currentObject.flattenChildren());
            }
        });

        return flattenedArray;
    }
}