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

    add(objects) {
        if (!Array.isArray(objects)) {
            objects = [objects];
        }

        for (let i = 0; i < objects.length; i++) {
            let object = objects[i];
            
            if (object === null) {
                console.warning("Attempted to add null object to Graph, skipping");
                continue;
            }

            switch (object.constructor.name) {
                case "Vertex":
                    this.addVertex(object);
                    break;
                case "Arrow":
                    this.addArrow(object);
                    break;
                default:
                    console.error("Attempted to add object to unknown type %s to Graph", object.constructor.name)
                    break;
            }
        }

        console.log(this);
    }

    addVertex(vertex) {
        this.rootObjects.push(vertex);
    }

    addArrow(arrow) {
        if (arrow.destVertex !== null && arrow.sourceVertex !== null) {
            arrow.sourceVertex.addToChildren(arrow);
            if (!this.removeWithChildren(arrow.destVertex)) {
                console.error("Failed to delete vertex with UUID %s", arrow.destVertex.semanticIdentity.UUID);
            }
            arrow.sourceVertex.addToChildren(arrow.destVertex);

        } else if (arrow.destVertex !== null) {
            this.rootObjects.push(arrow);

        } else if (arrow.sourceVertex !== null) {
            arrow.sourceVertex.addToChildren(arrow);

        } else {
            this.rootObjects.push(arrow);
        }
    }

    //Removes and object while moving it's children up to it's place in the tree
    remove(object) {
        this.rootObjects.forEach((currentObject, index, arr) => {
            if (currentObject !== null) {
                //If the given object is a root object, delete it and add it's direct children to the root
                if (currentObject.semanticIdentity.UUID === object.semanticIdentity.UUID) {
                    arr.splice(index, 1);
                    this.addToRoot(currentObject.children);
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

    removeWithChildren(object) {
        this.rootObjects.forEach((currentObject, index, arr) => {
            if (currentObject !== null) {
                //If the given object is a root object, delete it
                if (currentObject.semanticIdentity.UUID === object.semanticIdentity.UUID) {
                    arr.splice(index, 1);
                    return true;
                
                //Otherwise, continue to traverse down the tree starting at the current root node to find the object
                } else {
                    if (currentObject.typeName === "Vertex" && currentObject.removeFromChildrenWithChildren(object)) {
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