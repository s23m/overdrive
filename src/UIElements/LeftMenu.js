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
    Arrow: "Arrow",
    Containment: "Containment"
};

// class to display the left hand menu, where we will be showing
// object editing tools for now
export class LeftMenu extends React.Component{

    constructor() {
        super();
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

    componentWillReceiveProps(nextProps) {
        this.setState({menu:nextProps.mainState.menu});
        this.setState({selectedObject:nextProps.mainState.selectedObject});

    }

    componentDidUpdate(prevProps, prevState, snapshot) {
        let elem = document.getElementById("LeftTitle")
        if(elem !== null){
            elem.select();
            elem.click()
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
        var newTitle = document.getElementById("LeftTitle").value;
        this.state.selectedObject.setTitle(newTitle);
        canvasDraw.drawAll()
    }

    setContent() {
        var newContent = document.getElementById("LeftContent").value;
        newContent = newContent.split("\n");
        this.state.selectedObject.setContent(newContent);
        canvasDraw.drawAll()
    }

    //ARROW SETTERS
    setFromNodeHead() {
        var newFromHead = document.getElementById("ArrowHeadFrom").value;
        this.state.selectedObject.setStartType(newFromHead);
        canvasDraw.drawAll()
    }

    setToNodeHead() {
        var newToHead = document.getElementById("ArrowHeadTo").value;
        this.state.selectedObject.setEndType(newToHead);
        canvasDraw.drawAll()
    }

    setLineType() {
        var newLineType = document.getElementById("LineType").value;
        this.state.selectedObject.setLineType(newLineType);
        canvasDraw.drawAll()
    }

    setColour() {
        var newColour = document.getElementById("LineColour").value;
        this.state.selectedObject.setLineColour(newColour);
        canvasDraw.drawAll()
    }

    setStartLabel() {
        var newLabel = document.getElementById("SourceLabel").value;
        this.state.selectedObject.setStartLabel(newLabel);
        canvasDraw.drawAll();
    }

    setEndLabel() {
        var newLabel = document.getElementById("DestLabel").value;
        this.state.selectedObject.setEndLabel(newLabel);
        canvasDraw.drawAll();
    }

    updateCardinality() {
        var sourceLowerBound = document.getElementById("sourceFromCardindality").value;
        var sourceUpperBound = document.getElementById("sourceToCardindality").value;
        var currentSourceVisibility = this.state.selectedObject.getSourceCardinalityVisibility();
        var destLowerBound = document.getElementById("destFromCardindality").value;
        var destUpperBound = document.getElementById("destToCardindality").value;
        var currentDestVisibility = this.state.selectedObject.getDestCardinalityVisibility();

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
        this.state.selectedObject.setColour(colour.hex)
        canvasDraw.drawAll()
    };

    getColourPicker() {
        let reference = this;
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


// return the correct menu based on the selected item
    getMenu = () =>{
        var leftMenuContents;

        var toolbar = <div id = "Toolbar" className = "Toolbar">
            <div id = "Select" className="ToolbarItem" onClick={() => this.props.setMode(Tool.Select)}><img src={iconSelect} alt ="Select"/></div>
            <div id = "Vertex" className="ToolbarItem" onClick={() => this.props.setMode(Tool.Vertex)}><img src={iconVertex} alt ="Vertex"/></div>
            <div id = "Arrow" className="ToolbarItem" onClick={() => this.props.setMode(Tool.Arrow)}><img src={iconArrow} alt ="Arrow"/></div>
            <div id = "Containment" className="ToolbarItem" onClick={() => this.props.setMode(Tool.Containment)}><img src={iconContainment} alt ="Containment"/></div>
        </div>;

        if (this.state.menu === LeftMenuType.TreeView) {
            //TODO: Containment tree display

        } else if (this.state.menu === LeftMenuType.Vertex) {
            canvasDraw.drawAll();

            leftMenuContents = <div id = "VertexMenu">
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

                <button className="LeftLabel" onClick={(e) => {deleteElement(this.state.selectedObject);this.setState({menu:"TreeView"})}} placeholder="NoTabIndex">Remove</button>
            </div>;

        } else if (this.state.menu === LeftMenuType.Arrow) {
            console.log("Arrow Selected");
            
            leftMenuContents = <div id = "ArrowMenu">
                <div className="LeftHeader">Edge Properties</div>

                <label className="LeftLabel">From Node Head</label>
                <select name="ArrowHeadFrom" id="ArrowHeadFrom" className="LeftSelector" defaultValue={EdgeEndToString[this.state.selectedObject.sourceEdgeEnd.type]} onChange={() => this.setFromNodeHead()}>
                    <option value = "None">-No Icon</option>
                    <option value = "Arrow">-></option>
                    <option value = "Triangle">-▷</option>
                    <option value = "FilledDiamond">-◆</option>
                </select>
                <label className="LeftSpacer">&nbsp;</label>

                <label className="LeftLabel">To Node Head</label>
                <select name="ArrowHeadTo" id="ArrowHeadTo" className="LeftSelector" defaultValue={EdgeEndToString[this.state.selectedObject.destEdgeEnd.type]} onChange={() => this.setToNodeHead()}>
                    <option value = "None">-No Icon</option>
                    <option value = "Arrow">-></option>
                    <option value = "Triangle">-▷</option>
                    <option value = "FilledDiamond">-◆</option>
                </select>
                <label className="LeftSpacer">&nbsp;</label>

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
                <button className="RemoveButton" onClick={() => {deleteElement(this.state.selectedObject);this.setState({menu:"Tools"})}}>Remove</button>

            </div>
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
