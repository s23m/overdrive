/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/. */

export class Graph {
    constructor(rootVertices, arrows) {
        if (rootVertices !== undefined) {
            this.rootVertices = rootVertices;
        } else {
            this.rootVertices = new Set();
        }

        if (arrows !== undefined) {
            this.arrows = arrows;
        } else {
            this.arrows = new Set();
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
        if (!this.rootVertices.has(vertex)) {
            this.rootVertices.add(vertex);
        } else {
            console.error("Attempted to add duplicate vertex");
        }
    }

    addArrow(arrow) {
        if (!this.arrows.has(arrow)) {
            this.arrows.add(arrow);

            if (arrow.destVertex !== null && arrow.sourceVertex !== null) {
                arrow.sourceVertex.add(arrow.destVertex);
                this.rootVertices.delete(arrow.destVertex);
            }

        } else {
            console.error("Attempted to add duplicate arrow");
        }
    }

    //Removes and object while moving it's children up to it's place in the tree
    remove(object) {
        if (object.constructor.name === "Vertex") {
            let isRemoved = this.rootVertices.has(object);

            this.rootVertices.delete(object);
            for (let child of object.children) {
                this.rootVertices.add(child);
            }
            
            for (let vertex of this.rootVertices) {
                isRemoved |= vertex.remove(object);
            }

            if (isRemoved) {
                //Remove the vertex from being the source or dest of any arrow
                for (let arrow of this.arrows) {
                    if (arrow.sourceVertex !== null && arrow.sourceVertex.semanticIdentity.UUID === object.semanticIdentity.UUID) {
                        arrow.sourceVertex = null;
                    }

                    if (arrow.sourceVertex !== null && arrow.destVertex.semanticIdentity.UUID === object.semanticIdentity.UUID) {
                        arrow.destVertex = null;
                    }
                }
            }

            return isRemoved;

        } else if (object.constructor.name === "Arrow") {
            if (this.arrows.has(object)) {
                this.arrows.delete(object);
                //IF arrow has a sourceVertex AND destVertex
                if (object.sourceVertex !== null && object.destVertex !== null) {
                    //IF there is no other arrow from sourceVertex to destVertex, remove the destVertex from the children of sourceVertex
                    //AND move the destVertex to root, if there is no other arrow with the same destVertex
                    let isEquivalentArrow = false;
                    let isArrowWithSameDest = false;
                    
                    for (let arrow of this.arrows) {

                        let isEquivalentSource = arrow.sourceVertex !== null && arrow.sourceVertex.semanticIdentity.UUID === object.sourceVertex.semanticIdentity.UUID;
                        let isEquivalentDest = arrow.destVertex !== null && arrow.destVertex.semanticIdentity.UUID === object.destVertex.semanticIdentity.UUID;
                        
                        if (isEquivalentSource && isEquivalentDest) {
                            isEquivalentArrow = true;
                        }
                        if (isEquivalentDest) {
                            isArrowWithSameDest = true;
                        }
                    }
                    
                    if (!isEquivalentArrow) {
                        object.sourceVertex.removeFromChildren(object.destVertex);
                    }
                    if (!isArrowWithSameDest) {
                        this.add(object.destVertex);
                    }
                }

                return true;
            }

        } else {
            if (object !== null) {
                console.error("Attempted to remove object of invalid type %s to Graph", object.constructor.name);
            } else {
                console.error("Attempted to remove null from Graph");
            }
        }

        return false;
    }

    has(object) {
        if (this.rootVertices.has(object)) {
            return true;

        } else {
            for (let child of this.rootVertices) {
                if (child.has(object)) {
                    return true;
                }
            }
        }

        return false;
    }

    flatten(verticesOnly = false) {
        var flattenedSet = new Set();

        for (let vertex of this.rootVertices) {
            flattenedSet.add(vertex);
            if (vertex !== null) {
                for (let child of vertex.flattenChildren()) {
                    flattenedSet.add(child);
                }
            }
        }

        if (verticesOnly) {
            return Array.from(flattenedSet);
        } else {
            let flattenedArray = Array.from(flattenedSet);
            flattenedArray.push(...Array.from(this.arrows));
            return flattenedArray;
        }
    }
}