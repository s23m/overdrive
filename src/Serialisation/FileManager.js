/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/. */

import {currentObjects, setCurrentObjects} from "../UIElements/CanvasDraw"
import {version} from "../UIElements/MainView"
import {translationColumns, setTranslationColumns} from "../UIElements/SemanticDomainEditor"

import {Vertex} from "../DataStructures/Vertex";
import {Arrow} from "../DataStructures/Arrow";

export function getSaveData() {

    let objectsToSave = currentObjects;

    // Combine into save data
    let saveData = {
        // The version is being saved in the savefile
        // this is so in future versions, if the serialisation changes
        // They can upgrade the the file to one compatibile with the newer version
        version: version,

        // Translations for semantic domain editor
        translationColumns: translationColumns,

        // The data here should all have uuids and should be convertible back into their objects.
        currentObjects: objectsToSave,
    };

    return saveData;
}

export function save() {
    let JSONdata = getSaveData();
    let dataStr = JSON.stringify(JSONdata);

    let DLelement = document.createElement("a");
    let dataFile = new Blob([dataStr], {type: 'text/json'});

    DLelement.href = URL.createObjectURL(dataFile);
    DLelement.download = document.getElementById("ModelName").value + ".json";
    document.body.appendChild(DLelement);
    DLelement.click();
}

export function open(jsonString) {
    console.log("Loading jsonString")

    if (jsonString == null) return;
    try {
        // TODO Add check to see if there is unsaved progress
        var loadedJSON = JSON.parse(jsonString);

        // Loaded objects ONLY with variables
        setTranslationColumns(loadedJSON.translationColumns);

        // Loaded objects ONLY with variables
        var loadedObjects = loadedJSON.currentObjects;

        // Loaded objects with variables and functions
        var newObjects = [];

        // Copy behaviour over (vertexs first)
        loadedObjects.forEach((item) => {
            if (item !== null) {
                switch (item.typeName) {
                    case "Vertex":
                        var newVertex = new Vertex(item.title, item.content, item.x, item.y, item.width, item.height, item.semanticIdentity);
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
                switch (item.typeName) {
                    case "Vertex":
                        break;
                    case "Arrow":
                        var newArrow = new Arrow(newObjects, item.pathData, null, item.semanticIdentity);
                        newObjects.push(newArrow);
                        break;
                    default:
                        console.error("Unknown object to deserialise ", item);
                        break;
                }
            }
        });

        setCurrentObjects(newObjects);
    } catch (e) {
        alert(e);
    }

}