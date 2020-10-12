/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/. */

import React from 'react';
import * as canvasDraw from "./CanvasDraw";
import {EdgeEndToString, LineColourToStringName, LineTypeToString} from "../DataStructures/ArrowProperties"

import { SketchPicker } from 'react-color';

// Icons
import iconVertex from "../Resources/vertex.svg";
import iconArrow from "../Resources/arrow.svg";
import iconContainment from "../Resources/containment_arrow.svg";
import iconSelect from "../Resources/select.svg"

import {deleteElement} from "./CanvasDraw";
import DropdownButton from "react-bootstrap/DropdownButton";

//Property Enums
export const LeftMenuType = {
    TreeView: "TreeView",
    Vertex: "Vertex",
    Arrow: "Arrow"
};

export const LeftMenuTypeToString = {};
LeftMenuTypeToString[LeftMenuType.TreeView] = "TreeView";
LeftMenuTypeToString[LeftMenuType.Vertex] = "Vertex";
LeftMenuTypeToString[LeftMenuType.Arrow] = "Arrow";

export const StringToLeftMenuType = {};
LeftMenuTypeToString["TreeView"] = LeftMenuType.TreeView;
LeftMenuTypeToString["Vertex"] = LeftMenuType.Vertex;
LeftMenuTypeToString["Arrow"] = LeftMenuType.Arrow;

export const Tool = {
    Select: "Select",
    Vertex: "Vertex",
    Visibility: "Visibility",
    Edge: "Edge",
    Specialisation: "Specialisation"
};

// class to display the left hand menu, where we will be showing
// object editing tools for now
export class LeftMenu extends React.Component{

    constructor(args) {
        super(args);
        this.state = {
            menu: LeftMenuType.TreeView,
            selectedObject: null,
            fileNames: []
        };
        this.setTitle = this.setTitle.bind(this);
        this.setContent = this.setContent.bind(this);

        this.formRef = null;

        this.setFormRef = element =>{
            this.formRef = element;
        };

        this.setIcons();

    }

    componentDidMount() {
        this.menu = this.props.mainState.menu;
        this.selectedItem = this.props.mainState.drawMode;
        this.props.setMode(this.selectedItem)
    }

    componentWillReceiveProps(nextProps,nextContext) {
        this.setState({menu:nextProps.mainState.menu});
        this.setState({selectedObject:nextProps.mainState.selectedObject});

    }

    componentDidUpdate(prevProps, prevState, snapshot) {
        let elem = document.getElementById("LeftTitle");
        if(elem !== null){
            elem.select();
            elem.click()
        }
        let leftmenu = document.getElementById("VertexMenu");
        if(leftmenu === null){
            leftmenu = document.getElementById("ArrowMenu");
        }
        if(leftmenu !== null){
            leftmenu.addEventListener("keypress", (e) => {
                if(e.key === "Enter")
                e.preventDefault();
            })
        }

    }

    setIcons() {
        fetch('http://localhost:8080/icons/list',{
            method:'GET',
            headers: {
                'Accept': '*/*',
            },
        })
            .then((res) => {return res.json()})
            .then((data) => {
                let fileNames = [];
                data.icons.forEach((icon) => {
                    fileNames.push(icon)
                });
                this.setState({fileNames:fileNames})
            })
    }

    //VERTEX SETTERS
    setTitle() {
        let newTitle = document.getElementById("LeftTitle").value;
        this.state.selectedObject.setTitle(newTitle);
        canvasDraw.drawAll()
    }

    setContent() {
        let newContent = document.getElementById("LeftContent").value;
        newContent = newContent.split("\n");
        this.state.selectedObject.setContent(newContent);
        canvasDraw.drawAll()
    }

    //ARROW SETTERS
    setLineType() {
        let newLineType = document.getElementById("LineType").value;
        this.state.selectedObject.setLineType(newLineType);
        canvasDraw.drawAll()
    }

    setColour() {
        let newColour = document.getElementById("LineColour").value;
        this.state.selectedObject.setLineColour(newColour);
        canvasDraw.drawAll()
    }

    setStartLabel() {
        let newLabel = document.getElementById("SourceLabel").value;
        this.state.selectedObject.setStartLabel(newLabel);
        canvasDraw.drawAll();
    }

    setEndLabel() {
        let newLabel = document.getElementById("DestLabel").value;
        this.state.selectedObject.setEndLabel(newLabel);
        canvasDraw.drawAll();
    }

    updateCardinality() {
        let sourceLowerBound = document.getElementById("sourceFromCardindality").value;
        let sourceUpperBound = document.getElementById("sourceToCardindality").value;
        let currentSourceVisibility = this.state.selectedObject.getSourceCardinalityVisibility();
        let destLowerBound = document.getElementById("destFromCardindality").value;
        let destUpperBound = document.getElementById("destToCardindality").value;
        let currentDestVisibility = this.state.selectedObject.getDestCardinalityVisibility();

        this.state.selectedObject.updateSourceCardinality(sourceLowerBound, sourceUpperBound, currentSourceVisibility);
        this.state.selectedObject.updateDestCardinality(destLowerBound, destUpperBound, currentDestVisibility);

        canvasDraw.drawAll();
    }

    toggleSourceCardinalityVisibility() {
        this.state.selectedObject.toggleSourceCardinalityVisibility();
        canvasDraw.drawAll();
    }

    toggleDestCardinalityVisibility() {
        this.state.selectedObject.toggleDestCardinalityVisibility();
        canvasDraw.drawAll();
    }

    getS23MIconsSelector() {
        let dropdownOptions = [<div className="DropdownItem"><div className="dropdownLabel">Name</div><div className="checkBoxContainer">Text</div><div className="checkBoxContainer">Icon</div></div>];

        let name = "";
        this.state.fileNames.forEach(fileName => {
            if (fileName.slice(-6, -4) === "_n") {
                name = fileName.slice(0, -6);
                dropdownOptions.push(<div className="DropdownItem" ref={fileName}> <div className="dropdownLabel">{name}</div> <div className="checkBoxContainer"><input type='checkbox' disabled="disabled" /> </div>  <div className="checkBoxContainer"><input type='checkbox' defaultChecked={this.shouldIconBeSelected(fileName)} onClick={() => {this.setIcon(fileName)}}/></div> </div>)
            } else {
                name = fileName.slice(0, -4);
                dropdownOptions.push(<div className="DropdownItem" ref={fileName}> <div className="dropdownLabel">{name}</div> <div className="checkBoxContainer"><input type='checkbox' defaultChecked={this.shouldTextBeSelected(fileName)} onClick={() => {this.setText(fileName)}} /> </div>  <div className="checkBoxContainer"><input type='checkbox' defaultChecked={this.shouldIconBeSelected(fileName)} onClick={() => {this.setIcon(fileName)}}/></div> </div>)
            }
        });

        return <DropdownButton title="Category Selector" name="Icons" id="IconSelector" className="IconSelector">
            {dropdownOptions}
        </DropdownButton>;
    }

    getVertexColour = () => {
        return this.state.selectedObject.getColour()
    };

    setVertexColour = (colour) =>{
        this.state.selectedObject.setColour(colour.hex);
        canvasDraw.drawAll()
    };

    getColourPicker() {
        return <DropdownButton title = "Colour Selector" id = "ColourSelector">
        <SketchPicker
            color={this.getVertexColour}
            onChangeComplete={this.setVertexColour}
            presetColors = {["#FFD5A9","#F5B942","#FFFFFF"]}
        /></DropdownButton>
    }

    shouldTextBeSelected(fileName) {
        return this.state.selectedObject.isTextSet(fileName)
    }

    shouldIconBeSelected(fileName) {
        return this.state.selectedObject.isIconSet(fileName)
    }

    setText(fileName) {
        this.state.selectedObject.setText(fileName);
        canvasDraw.drawAll();
    }

    setIcon(fileName) {
        this.state.selectedObject.setIcon(fileName);
        canvasDraw.drawAll();
    }

    setNavigable(){
        if(this.state.selectedObject.getAggregation()){
            this.state.selectedObject.toggleAggregation();
        }
        document.getElementById("IsAggregation").checked = false;
        this.state.selectedObject.toggleNavigable();
        canvasDraw.drawAll()
    }

    setAggregation(){
        if(this.state.selectedObject.getNavigable()){
            this.state.selectedObject.toggleNavigable();
        }
        document.getElementById("IsNavigable").checked = false;
        this.state.selectedObject.toggleAggregation();
        canvasDraw.drawAll()
    }

// return the correct menu based on the selected item
    getMenu = () =>{
        let leftMenuContents;

        let toolbar = <div id = "Toolbar" className = "Toolbar">
            <div id = "Select" className="ToolbarItem" onClick={() => this.props.setMode(Tool.Select)}><img src={iconSelect} alt ="Select"/></div>
            <div id = "Vertex" className="ToolbarItem" onClick={() => this.props.setMode(Tool.Vertex)}><img src={iconVertex} alt ="Vertex"/></div>
            <div id = "Edge" className="ToolbarItem" onClick={() => this.props.setMode(Tool.Edge)}><img src={iconArrow} alt ="Edge"/></div>
            <div id = "Specialisation" className="ToolbarItem" onClick={() => this.props.setMode(Tool.Specialisation)}><img src={iconContainment} alt ="Specialisation"/></div>
            <div id = "Visibility" className="ToolbarItem" onClick={() => this.props.setMode(Tool.Visibility)}><img src={null} alt ="Visibility"/></div>
        </div>;

        if (this.state.menu === LeftMenuType.TreeView) {
            //TODO: Containment tree display
            console.log("TreeView")

        } else if (this.state.menu === LeftMenuType.Vertex) {
            canvasDraw.drawAll();

            leftMenuContents = <form id = "VertexMenu">
                <div className="LeftHeader">Vertex Properties</div>
                <label className="LeftLabel">Title</label>
                <input id="LeftTitle" className="LeftTitle" defaultValue={this.state.selectedObject.title} onKeyUp={() => this.setTitle()}/>
                <label className="LeftSpacer">&nbsp;</label>

                <label className="LeftLabel">Content</label>
                <textarea id="LeftContent" className ="LeftContent" defaultValue={this.state.selectedObject.getContentAsString()} onKeyUp={() => this.setContent()}/>
                <label className="LeftSpacer">&nbsp;</label>

                {this.getS23MIconsSelector()}
                <label className="LeftSpacer">&nbsp;</label>

                {this.getColourPicker()}
                <label className="LeftSpacer">&nbsp;</label>

                <button className="LeftLabel" onClick={() => {deleteElement(this.state.selectedObject);this.setState({menu:"TreeView"})}} placeholder="NoTabIndex">Remove</button>
            </form>;

        } else if (this.state.menu === LeftMenuType.Arrow) {
            console.log("Arrow Selected");

            if(this.state.selectedObject.edgeType === Tool.Edge){

            leftMenuContents = <form id = "ArrowMenu">
                <div className="LeftHeader">Edge Properties</div>

                <label className="LeftLabel">Is Navigable?</label>
                <input type="checkbox" id="IsNavigable" className="LeftCheckbox" defaultChecked={this.state.selectedObject.getNavigable()} onClick={() => this.setNavigable()}/>

                <label className="LeftLabel">Is Aggregation?</label>
                <input type="checkbox" id="IsAggregation" className="LeftCheckbox" defaultChecked={this.state.selectedObject.getAggregation()} onClick={() => this.setAggregation()}/>

                <label className="LeftLabel">Line Type</label>
                <select name="LineType" id="LineType" className="LeftSelector" defaultValue={LineTypeToString[this.state.selectedObject.lineType]} onChange={() => this.setLineType()}>
                    <option value = "Solid">Solid</option>
                    <option value = "Dashed">Dashed</option>
                </select>
                <label className="LeftSpacer">&nbsp;</label>

                <label className="LeftLabel">Line Colour</label>
                <select name="LineColour" id="LineColour" className="LeftSelector" defaultValue={LineColourToStringName[this.state.selectedObject.lineColour]} onChange={() => this.setColour()}>
                    <option value = "Black">Black</option>
                    <option value = "Red">Red</option>
                    <option value = "Blue">Blue</option>
                    <option value = "Green">Green</option>
                </select>
                <label className="LeftSpacer">&nbsp;</label>

                {/* -1 represents n or *  */}
                <label className="LeftLabel">Source Cardinality</label>
                <div className="CardinalityArea"> <div className="LeftCheckboxLabel"> Visible: </div> <input type="checkbox" id = "sourceCardinalityShown" className="LeftCheckbox" defaultChecked={this.state.selectedObject.getSourceCardinalityVisibility()} onChange={() => this.toggleSourceCardinalityVisibility()}/>
                    <input type="number" id = "sourceFromCardindality" className="CardinalityBox" defaultValue={this.state.selectedObject.getSourceCardinalityLowerBound()} min="0" max="25" onChange={() => this.updateCardinality()}/>
                    <label>..</label>
                    <input type="number" id = "sourceToCardindality" className="CardinalityBox" defaultValue={this.state.selectedObject.getSourceCardinalityUpperBound()} min="-1" max="25" onChange={() => this.updateCardinality()}/>
                </div>


                <label className="LeftLabel">Destination Cardinality</label>
                <div className="CardinalityArea"> <div className="LeftCheckboxLabel">Visible:</div> <input type="checkbox" id = "destCardinalityShown" className="LeftCheckbox" defaultChecked={this.state.selectedObject.getDestCardinalityVisibility()} onChange={() => this.toggleDestCardinalityVisibility()}/>
                    <input type="number" id = "destFromCardindality" className="CardinalityBox" defaultValue={this.state.selectedObject.getDestCardinalityLowerBound()} min="0" max="25" onChange={() => this.updateCardinality()}/>
                    <label>..</label>
                    <input type="number" id = "destToCardindality" className="CardinalityBox" defaultValue={this.state.selectedObject.getDestCardinalityUpperBound()} min="-1" max="25" onChange={() => this.updateCardinality()}/>
                </div>

                <label className="LeftLabel">Source Label</label>
                    <input id="SourceLabel" className="LeftTitle" defaultValue={this.state.selectedObject.sourceEdgeEnd.label} onKeyUp={() => this.setStartLabel()}/>
                <label className="LeftSpacer">&nbsp;</label>

                <label className="LeftLabel">Destination Label</label>
                    <input id="DestLabel" className="LeftTitle" defaultValue={this.state.selectedObject.destEdgeEnd.label} onKeyUp={() => this.setEndLabel()}/>
                <label className="LeftSpacer">&nbsp;</label>
                {
                }
                <button className="RemoveButton" onClick={() => {deleteElement(this.state.selectedObject);this.setState({menu:LeftMenuType.TreeView,selectedObject:null})}}>Remove</button>

            </form>
            }else{
                leftMenuContents = <form id = "ArrowMenu">
                    <div className="LeftHeader">Selected Edge</div>
                    <button className="RemoveButton" onClick={() => {deleteElement(this.state.selectedObject);this.setState({menu:LeftMenuType.TreeView,selectedObject:null})}}>Remove</button>

                    </form>
            }
        }

        return <div>{toolbar}<form ref={this.setFormRef} className={this.props.className}>
            {leftMenuContents}
            </form></div>;
    };

    render() {
        let menu = this.getMenu();
        if (this.formRef !== null) {
            this.formRef.reset();
        }
        return menu;
    }


}
