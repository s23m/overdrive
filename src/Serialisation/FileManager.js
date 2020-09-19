/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/. */

import {currentObjects, setCurrentObjects} from "../UIElements/CanvasDraw"
import {version} from "../UIElements/MainView"

import {Vertex} from "../DataStructures/Vertex";
import {Arrow} from "../DataStructures/Arrow";

export function getSaveData() {

    let objectsToSave = currentObjects;
    // Process objects to save
    objectsToSave.forEach((item) => {
        if (item !== null) {
            switch (item.name) {
                case "Arrow":
                    // Prevent cyclic loop
                    item.fromVertex = null;
                    item.toVertex = null;
                    break;
                default:
                    // Do nothing
                    break;
            }
        }
    });

    // Combine into save data
    let saveData = {
        // The version is being saved in the savefile
        // this is so in future versions, if the serialisation changes
        // They can upgrade the the file to one compatibile with the newer version
        version: version,

        // The data here should all have uuids and should be convertible back into their objects.
        currentObjects: objectsToSave,
    };

    return saveData;
}

export function save() {

    let JSONdata = getSaveData();
    let dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(JSONdata));

    var downloadElem = document.getElementById('json-downloader');
    downloadElem.setAttribute("href",     dataStr     );
    downloadElem.setAttribute("download", "export.json");
}

export function open(jsonString) {
    if (jsonString == null) return;
    try {
        // TODO Add check to see if there is unsaved progress
        var loadedJSON = JSON.parse(jsonString);

        // Loaded objects ONLY with variables
        var loadedObjects = loadedJSON.currentObjects;

        // Loaded objects with variables and functions
        var newObjects = [];

        // Copy behaviour over (vertexs first)
        loadedObjects.forEach((item) => {
            if (item !== null) {
                switch (item.name) {
                    case "Vertex":
                        var newVertex = new Vertex(item.UUID, item.title, item.content, item.sx, item.sy, item.width, item.height);
                        newObjects.push(newVertex);
                        break;
                    default:
                        break;
                }
            }
        });

        // Copy behaviour over (everything else)
        loadedObjects.forEach((item) => {
            if (item !== null) {
                switch (item.name) {
                    case "Vertex":
                        break;
                    case "Arrow":
                        var newArrow = new Arrow(item.UUID, newObjects, item.fromVertexUUID, item.fromVertexNode, item.toVertexUUID, item.toVertexNode);
                        newObjects.push(newArrow);
                        break;
                    default:
                        console.error("Unknown object to deserialise ", item);
                        break;
                }
            }
        });
        
        console.log("Deserialised with value of ", newObjects);
        setCurrentObjects(newObjects);
    } catch (e) {
        alert(e);
    }

}