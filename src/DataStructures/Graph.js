/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/. */

class ArrowEdge {
    constructor(verticesArray, arrow) {
        this.arrow = arrow;
        this.updateVertices(verticesArray);
    }

    updateVertices(verticesArray) {
        this.sourceVertexObject = null;
        this.destVertexObject = null;

        if (this.arrow !== null) {
            let isSourceFound = this.arrow.sourceVertexUUID === null;
            let isDestFound = this.arrow.destVertexUUID === null;

            for (let vertex of verticesArray) {
                if (isSourceFound && isDestFound) {
                    break;
                }

                if (vertex !== null) {
                    if (vertex.semanticIdentity.UUID === this.arrow.sourceVertexUUID) {
                        this.sourceVertexObject = vertex;
                        isSourceFound = true;

                    } else if (vertex.semanticIdentity.UUID === this.arrow.destVertexUUID) {
                        this.destVertexObject = vertex;
                        isDestFound = true;
                    }
                }
            }
        
        }
    }

    set sourceVertex(vertex) {
        this.sourceVertexObject = vertex;

        if (vertex !== null) {
            this.arrow.sourceVertexUUID = vertex.semanticIdentity.UUID;
        } else {
            this.arrow.sourceVertexUUID = null;
        }
    }

    get sourceVertex() {
        return this.sourceVertexObject;
    }

    set destVertex(vertex) {
        this.destVertexObject = vertex;

        if (vertex !== null) {
            this.arrow.destVertexUUID = vertex.semanticIdentity.UUID;
        } else {
            this.arrow.destVertexUUID = null;
        }
    }

    get destVertex() {
        return this.destVertexObject;
    }
}

//Supply with an array/set of Vertex objects or Arrow objects (NOT ArrowEdge objects)
export class Graph {
    constructor(rootVertices, arrows) {
        if (rootVertices !== undefined) {
            for (let vertex of rootVertices) {
                this.add(vertex);
            }

        } else {
            this.rootVertices = new Set();
        }

        if (arrows !== undefined) {
            for (let arrow of arrows) {
                this.add(arrow);
            }

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
    }

    addVertex(vertex) {
        if (!this.rootVertices.has(vertex)) {
            this.rootVertices.add(vertex);
        } else {
            console.error("Attempted to add duplicate vertex");
        }
    }

    //NOTE: Graph direction is inverted, flowing from the dest to source of arrows
    //This is intentional behaviour of the modelling spec
    addArrow(arrow) {
        arrow = new ArrowEdge(this.flattenVertices(), arrow);

        if (!this.arrows.has(arrow)) {
            this.arrows.add(arrow);

            if (arrow.destVertex !== null && arrow.sourceVertex !== null) {
                arrow.destVertex.add(arrow.sourceVertex);

                //If the destination of the arrow is currently a root vertex,
                //search for if the destination has any other possible roots,
                //and remove from the root ONLY IF another root is found
                //This retains an entry point for the graph even if there is a cycle back to root
                if (this.rootVertices.has(arrow.sourceVertex)) {
                    let isAnotherRoot = false;

                    for (let vertex of this.rootVertices) {
                        if (vertex.semanticIdentity.UUID === arrow.sourceVertex.semanticIdentity.UUID) {
                            continue;
                        }

                        if (vertex.has(new Set(), arrow.sourceVertex)) {
                            isAnotherRoot = true;
                        }
                    }

                    if (isAnotherRoot) {
                        this.rootVertices.delete(arrow.sourceVertex);
                    }
                }
            }

        } else {
            console.error("Attempted to add duplicate arrow");
        }
    }

    //Removes and object while shifting it's children's position in the tree
    remove(object) {
        if (object.constructor.name === "Vertex") {
            let isRemoved = this.rootVertices.has(object);

            //Remove from the root
            this.rootVertices.delete(object);
            for (let child of object.children) {
                this.rootVertices.add(child);
            }
            
            //Remove from anywhere deeper in the tree
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
            object = this.getArrowEdge(object);

            if (this.arrows.has(object)) {
                this.arrows.delete(object);
                //IF arrow has a sourceVertex AND destVertex
                if (object.sourceVertex !== null && object.destVertex !== null) {
                    //IF there is no other arrow from sourceVertex to destVertex, remove the sourceVertex from the children of destVertex
                    //AND move the sourceVertex to root, if there is no other arrow with the same sourceVertex
                    let isEquivalentArrow = false;
                    let isArrowWithSameSource = false;
                    
                    for (let arrow of this.arrows) {

                        let isEquivalentSource = arrow.sourceVertex !== null && arrow.sourceVertex.semanticIdentity.UUID === object.sourceVertex.semanticIdentity.UUID;
                        let isEquivalentDest = arrow.destVertex !== null && arrow.destVertex.semanticIdentity.UUID === object.destVertex.semanticIdentity.UUID;
                        
                        if (isEquivalentSource && isEquivalentDest) {
                            isEquivalentArrow = true;
                        }
                        if (isEquivalentSource) {
                            isArrowWithSameSource = true;
                        }
                    }
                    
                    if (!isEquivalentArrow) {
                        object.sourceVertex.removeFromChildren(object.destVertex);
                    }
                    if (!isArrowWithSameSource) {
                        this.add(object.sourceVertex);
                    }

                    //Remove vertex from the root if removing this arrow has resolved a cycle
                    if (object.sourceVertex.has(new Set(), object.destVertex)) {
                        this.rootVertices.delete(object.destVertex);
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
        //Search for object in root vertices
        if (this.rootVertices.has(object)) {
            return true;

        } else {
            let traversedVertices = new Set();

            //Search for object in children of root vertices
            for (let vertex of this.rootVertices) {
                if (!traversedVertices.has(vertex)) {
                    traversedVertices.add(vertex);
                    if (vertex.has(traversedVertices, object)) {
                        return true;
                    }
                }
            }
        }

        return false;
    }

    getArrowEdge(arrow) {
        for (let arrowEdge of this.arrows) {
            if (arrowEdge.arrow.semanticIdentity.UUID === arrow.semanticIdentity.UUID) {
                return arrowEdge;
            }
        }

        return null;
    }

    flatten() {
        let verticesSet = new Set();
        let arrowsSet = new Set();

        let traversedVertices = new Set();

        for (let vertex of this.rootVertices) {
            if (!traversedVertices.has(vertex)) {
                traversedVertices.add(vertex);
                verticesSet.add(vertex);

                if (vertex !== null) {
                    for (let child of vertex.flattenChildren(traversedVertices)) {
                        verticesSet.add(child);
                    }
                }
            }
        }

        for (let arrowEdge of this.arrows) {
            arrowsSet.add(arrowEdge.arrow);
        }

        let flattenedArray = Array.from(verticesSet);
        return flattenedArray.concat(Array.from(arrowsSet));
    }

    flattenVertices() {
        var verticesSet = new Set();
        let traversedVertices = new Set();

        for (let vertex of this.rootVertices) {
            if (!traversedVertices.has(vertex)) {
                traversedVertices.add(vertex);
                verticesSet.add(vertex);

                if (vertex !== null) {
                    for (let child of vertex.flattenChildren(traversedVertices)) {
                        verticesSet.add(child);
                    }
                }
            }
        }

        return Array.from(verticesSet);
    }
}