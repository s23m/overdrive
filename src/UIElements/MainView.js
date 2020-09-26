/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/. */

import React from 'react';
import '../App.css';
import * as canvasDraw from "./CanvasDraw";
import * as fileManager from '../Serialisation/FileManager';
import {DropdownButton,Dropdown} from "react-bootstrap";

import {Canvas} from './Canvas';
import {LeftMenu} from './LeftMenu';

// Semantic domain editor
import SemanticDomainEditor from "./SemanticDomainEditor";
import {resetRows} from "./SemanticDomainEditor";

const leftMenuTypes = ["Tools", "Vertex", "Arrow"];

// Simple incremental version
// 1->2->3->4
export const version = 1;

export class MainProgramClass extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
            zoomLevel: 200,
            drawMode: "Vertex",
            menu: "Tools",
            selectedObject: null,
        };

        this.setMode = this.setMode.bind(this);
        this.setLeftMenu = this.setLeftMenu.bind(this);
        this.semanticTableEnabled = false;
    }

    componentDidMount() {
        this.setMode("Vertex");
        console.log("Mounted")
    }

    componentDidUpdate(prevProps, prevState, snapshot) {
        if(this.state.menu === "Tools") {

            let div = document.getElementById(prevState.drawMode);

            if (div !== null) {
                div.style.backgroundColor = "#FFFFFF";
            }

            div = document.getElementById(this.state.drawMode);

            div.style.backgroundColor = "#CFFFFF";

            console.log("Mode set to: " + this.state.drawMode);
        }
    }

    zoom = (type) => {
        var cZoom = this.state.zoomLevel;
        if (type === "+") {
            if (this.state.zoomLevel < 500) {
                this.setState({zoomLevel:cZoom += 25});
                canvasDraw.setZoom(cZoom);
            }
        } else if (type === "-") {
            if (this.state.zoomLevel > 100) {
                this.setState({zoomLevel:cZoom -= 25});
                canvasDraw.setZoom(cZoom);
            }

        } else {
            console.log("Invalid Zoom Type")
        }
    };

    setMode(mode) {

        this.setState({drawMode: mode});

    };

    // chooses which left hand menu to display, based on the selected item
    setLeftMenu(nearestObject) {

        if(this.state.selectedObject !== null) {
            this.state.selectedObject.setSelected(false);
        }

        // check if the nearest object was too far away or didnt exist
        if (nearestObject === null) {
            this.setState({
                menu: "Tools",
                selectedObject: null,
            });

        }

        // if the selected object has a left menu,
        else if (leftMenuTypes.includes(nearestObject.constructor.name)) {
            this.setState({
                menu: nearestObject.constructor.name,
                selectedObject: nearestObject
            });
            nearestObject.setSelected(true);
        } else {
            if (this.state.selectedObject !== null) {
                canvasDraw.drawAll();
            }

            this.setState({
                menu: "Tools",
                selectedObject: null
            });
        }

    }

    searchFor = (e) => {
        var searchTerm = e.target.value;
        if (searchTerm === "") {
            return null;
        }
    };

    // Code for file uploading
    // If you know how to move it elsewhere to clean up this file
    // Please move it to src/DataStructures/FileManager.js or similar
    showFile = () => {
        if (window.File && window.FileReader && window.FileList && window.Blob) {
            var file = document.querySelector('input[type=file]').files[0];

            var reader = new FileReader();
            reader.readAsText(file);
            reader.onload=function() {fileManager.open(reader.result)}
        } else {
            alert("Your browser is too old to support HTML5 File API");
        }
    }

    // Used to enable/disable the semantic domain editor
    toggleSemanticDomainState = () => {
        if (this.semanticTableEnabled) {
            this.semanticTableEnabled = false;
            canvasDraw.drawAll();
            this.setState(this.state);
            console.log("Semantic Domain disabled");
        } else {
            this.semanticTableEnabled = true;
            resetRows();
            this.setState(this.state);
            console.log("Semantic Domain enabled");
        }
    }

    render() {
        var GUI =
            <div className="Program">
                <div className={this.semanticTableEnabled ? "SemanticDomain" : "hidden"}>
                    <SemanticDomainEditor/>
                </div>

                <div className= "TopMenus">

                    <DropdownButton variant = "Primary" id = "File-Menu" title = "File" size = "lg">

                        <Dropdown.Item>
                            <div className="TopBar">
                                <a id="downloader" onClick={() => canvasDraw.getDownload()} download="image.png">Export as .png</a>
                            </div>
                        </Dropdown.Item>


                        <div className="TopBar">
                            <input type="file" id="File-Select" onChange={this.showFile} />
                        </div>


                        <Dropdown.Item>
                            <div className="TopBar">
                                <button id="json-downloader" onClick={() => fileManager.save()} download="export.json">Export to JSON</button>
                            </div>
                        </Dropdown.Item>

                    </DropdownButton>

                    <div className="TopBar" onClick={() => this.toggleSemanticDomainState()}>
                        Semantic Editor
                    </div>

                    <input className="TopBarSearch" type = "text" name = "search" placeholder = "Search Here" onChange={(e) => this.searchFor(e)}/>

                    <div className="TopBarIcon">&nbsp;</div>
                    {/*The + and - are backwards on purpose here*/}
                    <div className="TopBarIcon" onClick={() => this.zoom('-')}> - </div>

                    <div className="TopBarLabel"> {this.state.zoomLevel}% </div>
                    <div className="TopBarIcon" onClick={() => this.zoom('+')}> + </div>

                    <div className="TopBarIdentifier">Rows:&nbsp;</div>
                    <input className="TopBarSelector" style={{"border-left": "0px"}} type="number" id = "canvasRows" defaultValue="70" min="0" max="105" onChange={() => canvasDraw.updateRows()}/>

                </div>

                <div className="LowerPanel">
                    <LeftMenu setMode = {this.setMode} mainState = {this.state} className = "LeftMenus"/>
                    <div className="Canvas">
                        <Canvas setLeftMenu = {this.setLeftMenu} mainState = {this.state}/>
                    </div>
                </div>
            </div>;
        return GUI
    }
}
