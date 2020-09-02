import React from 'react';
import './App.css';
import * as canvasDraw from "./UIElements/CanvasDraw";

import {Canvas} from './UIElements/Canvas';
import {LeftMenu} from './UIElements/LeftMenu';

//todo: add other types of tools
const leftMenuTypes = ["Tools","Vertex","Arrow"];

export class MainProgramClass extends React.Component{

    constructor(props) {
        super(props);
        this.state = {
            zoomLevel: 200,
            drawMode: "Vertex",
            menu: "Tools",
            selectedObject: null
        };

        this.setMode = this.setMode.bind(this);
        this.setLeftMenu = this.setLeftMenu.bind(this);
    }

    componentDidMount() {
        console.log("Mounted")
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

    setMode(mode){
        this.setState({drawMode: mode});
        console.log("Mode set to: " + mode)
    };

    // chooses which left hand menu to display, based on the selected item
    setLeftMenu(nearestObject){
        // todo: remove statement directly below this
        // temporary way to show item has been de-selected

        console.log("Set selected object to " + nearestObject);
        /*
        if(this.state.selectedObject !== null){
            this.state.selectedObject.setTitle("Not Selected Anymore");
            canvasDraw.drawAll();
        }
        */
        // check if the nearest object was too far away or didnt exist
        if(nearestObject === null){
            this.setState({
                menu: "Tools",
                selectedObject: null
            });

        }

        // if the selected object has a left menu,
        else if(leftMenuTypes.includes(nearestObject.constructor.name)) {
            this.setState({
                menu: nearestObject.constructor.name,
                selectedObject: nearestObject
            });
        }else{
            // todo: remove statement directly below this
            // temporary way to show item has been de-selected
            if(this.state.selectedObject !== null){
                //this.state.selectedObject.setTitle("Not Selected Anymore");
                canvasDraw.drawAll();
            }

            //todo: do not remove this in the todo above, then remove this todo
            this.setState({
                menu: "Tools",
                selectedObject: null
            });
        }

    }

    searchFor = (e) => {
        var searchTerm = e.target.value;
        if(searchTerm === ""){
            return null
        }
    };

    render() {

        var GUI =
            <div className="Program">
                <div className= "TopMenus">
                    <div className="TopBarFile"> &nbsp;File </div>
                    <div className="TopBar"> 1 </div>
                    <div className="TopBar"> 2 </div>
                    <div className="TopBar"> 3 </div>
                    <div className="TopBarIcon"> S </div>
                    <input className="TopBarSearch" type = "text" name = "search" placeholder = "Search Here" onChange={(e) => this.searchFor(e)}/>
                    <div className="TopBarIcon">&nbsp;</div>
                    {/*The + and - are backwards on purpose here*/}
                    <div className="TopBarIcon" onClick={() => this.zoom('-')}> - </div>
                    <div className="TopBarLabel"> {this.state.zoomLevel}% </div>
                    <div className="TopBarIcon" onClick={() => this.zoom('+')}> + </div>

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
