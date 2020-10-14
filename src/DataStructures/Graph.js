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
                if (this.rootVertices.has(arrow.destVertex)) {
                    let isAnotherRoot = false;

                    for (let vertex of this.rootVertices) {
                        if (vertex.semanticIdentity.UUID === arrow.destVertex.semanticIdentity.UUID) {
                            continue;
                        }

                        if (vertex.has(new Set(), arrow.destVertex)) {
                            isAnotherRoot = true;
                        }
                    }

                    if (isAnotherRoot) {
                        this.rootVertices.delete(arrow.destVertex);
                    }
                }
                
                //TODO: only remove from root IF it is visible down the tree from a different root vertex
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
            
            let traversedVertices = new Set();
            for (let vertex of this.rootVertices) {
                if (!traversedVertices.has(vertex)) {
                    traversedVertices.add(vertex);
                    isRemoved |= vertex.remove(traversedVertices, object);
                }
            }
            
            if (isRemoved) {
                //Remove the vertex from being the source or dest of any arrow
                for (let arrow of this.arrows) {
                    if (arrow.sourceVertex !== null && arrow.sourceVertex.semanticIdentity.UUID === object.semanticIdentity.UUID) {
                        arrow.sourceVertex = null;
                    }

                    if (arrow.destVertex !== null && arrow.destVertex.semanticIdentity.UUID === object.semanticIdentity.UUID) {
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

                    //Remove vertex from the root if removing this arrow has resolved a cycle
                    if (object.destVertex.has(new Set(), object.sourceVertex)) {
                        this.rootVertices.delete(object.sourceVertex);
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
            let traversedVertices = new Set();

            for (let child of this.rootVertices) {
                if (!traversedVertices.has(child)) {
                    traversedVertices.add(child);
                    if (child.has(traversedVertices, object)) {
                        return true;
                    }
                }
            }
        }

        return false;
    }

    flatten(verticesOnly = false) {
        var flattenedSet = new Set();

        let traversedVertices = new Set();

        for (let vertex of this.rootVertices) {
            if (!traversedVertices.has(vertex)) {
                traversedVertices.add(vertex);
                flattenedSet.add(vertex);

                if (vertex !== null) {
                    for (let child of vertex.flattenChildren(traversedVertices)) {
                        flattenedSet.add(child);
                    }
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