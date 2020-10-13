/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/. */

export class Graph {
    constructor(rootObjects) {
        if (rootObjects !== undefined) {
            this.rootObjects = rootObjects;
        } else {
            this.rootObjects = new Set();
        }
    }

    add(objects) {
        if (!Array.isArray(objects)) {
            objects = [objects];
        }

        for (let i = 0; i < objects.length; i++) {
            let object = objects[i];

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
        this.rootObjects.add(vertex);
    }

    addArrow(arrow) {
        if (arrow.destVertex !== null && arrow.sourceVertex !== null) {
            arrow.sourceVertex.add(arrow);
            arrow.sourceVertex.add(arrow.destVertex);
            this.rootObjects.delete(arrow.destVertex);

        } else if (arrow.destVertex !== null) {
            this.rootObjects.add(arrow);

        } else if (arrow.sourceVertex !== null) {
            arrow.sourceVertex.add(arrow);

        } else {
            this.rootObjects.add(arrow);
        }
    }

    //Removes and object while moving it's children up to it's place in the tree
    remove(object) {
        //If the given object is a root object at this node, delete it and add it's direct children to the root of this node
        if (this.rootObjects.has(object)) {
            this.rootObjects.delete(object);

            if (object.constructor.name === "Vertex") {
                //Set the sourceVertex properties of any arrow starting at the removed vertex to null
                for (let i = 0; i < object.children.length; i++) {
                    let currentChild = object.children[i];

                    if (currentChild.constructor.name === "Arrow") {
                        currentChild.sourceVertex = null;
                    }
                }

                //Set the destVertex properties of any arrow ending at the removed vertex to null
                for (let i = 0; i < this.rootObjects.length; i++) {
                    let currentChild = this.rootObjects[i];

                    if (currentChild.constructor.name === "Arrow" && currentChild.destVertex.semanticIdentity.UUID === object.semanticIdentity.UUID) {
                        currentChild.destVertex = null;
                    }
                }

                this.add(object.children);
            }

            return true;

        //Otherwise, continue to traverse down the tree starting at the current root node to find the object
        } else {
            for (let child of this.rootObjects) {
                if (child.typeName === "Vertex" && child.remove(object)) {
                    return true;
                }
            }
        }

        return false;
    }

    removeWithChildren(object) {
        //If the given object is a root object at this node, delete it
        if (this.rootObjects.has(object)) {
            this.rootObjects.delete(object);
            return true;

        //Otherwise, continue to traverse down the tree starting at the current root node to find the object
        } else {
            for (let child of this.rootObjects) {
                if (child.typeName === "Vertex" && child.removeWithChildren(object)) {
                    return true;
                }
            }
        }

        return false;
    }

    has(object) {
        if (this.rootObjects.has(object)) {
            return true;

        } else {
            for (let child of this.rootObjects) {
                if (child.typeName === "Vertex" && child.has(object)) {
                    return true;
                }
            }
        }

        return false;
    }

    flatten() {
        var flattenedSet = new Set();

        this.rootObjects.forEach((currentObject) => {
            flattenedSet.add(currentObject);
            if (currentObject !== null && currentObject.typeName === "Vertex") {
                for (let child of currentObject.flattenChildren()) {
                    flattenedSet.add(child);
                }
            }
        });

        return Array.from(flattenedSet);
    }
}