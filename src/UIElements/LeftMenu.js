/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/. */

import React from 'react';
import * as canvasDraw from "./CanvasDraw";
import {EdgeEndToString, LineColourToStringName, LineTypeToString} from "../DataStructures/ArrowProperties"

// Icons
import iconVertex from "../Resources/vertex.svg";
import iconArrow from "../Resources/arrow.svg";
import iconDiamond from "../Resources/diamond.svg";
import iconCircle from "../Resources/circle.svg";
import iconSpeech from "../Resources/speech.svg";
import iconSpecBox from "../Resources/specbox.svg";
import iconTriangle from "../Resources/triangle.svg";
import {deleteElement} from "./CanvasDraw";
import DropdownButton from "react-bootstrap/DropdownButton";

// class to display the left hand menu, where we will be showing
// object editing tools for now
export class LeftMenu extends React.Component{

    constructor() {
        super();
        this.state = {
            menu: "Tools",
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
        if(this.menu === "Tools") {
            this.props.setMode(this.selectedItem)
        }
    }

    componentWillReceiveProps(nextProps) {
        this.setState({menu:nextProps.mainState.menu});
        this.setState({selectedObject:nextProps.mainState.selectedObject});

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

    /*setIcon() {
        var iconName = document.getElementById("IconSelector").value;
        this.state.selectedObject.setIcons([iconName],[true],[true]);
        console.log(iconName);
        canvasDraw.drawAll()
    }
    */

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
        var currentSourceVisibility = this.state.selectedObject.sourceCardinality.isVisible;
        var destLowerBound = document.getElementById("destFromCardindality").value;
        var destUpperBound = document.getElementById("destToCardindality").value;
        var currentDestVisibility = this.state.selectedObject.destCardinality.isVisible;

        this.state.selectedObject.updateSourceCardinality(sourceLowerBound, sourceUpperBound, currentSourceVisibility);
        this.state.selectedObject.updateDestCardinality(destLowerBound, destUpperBound, currentDestVisibility);

        canvasDraw.drawAll()
    }

    toggleSourceCardinalityVisibility() {
        this.state.selectedObject.sourceCardinality.toggleVisibility();
    }

    toggleDestCardinalityVisibility() {
        this.state.selectedObject.destCardinality.toggleVisibility();
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

        return <DropdownButton title="Icon selector" name="Icons" id="IconSelector" className="IconSelector">
            {dropdownOptions}
        </DropdownButton>;
    }

    shouldTextBeSelected(fileName){
        return this.state.selectedObject.isTextSet(fileName)
    }

    shouldIconBeSelected(fileName){
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
        if (this.state.menu === "Tools") {
            return <form ref={this.setFormRef} className={this.props.className}>
                <div id = "Vertex" className="LeftBar" onClick={() => this.props.setMode('Vertex')}><img src={iconVertex} alt ="Vertex"/></div>
                <div id = "Arrow" className="LeftBar" onClick={() => this.props.setMode('Arrow')}><img src={iconArrow} alt ="Arrow"/></div>
                <div id = "Diamond" className="LeftBar" onClick={() => this.props.setMode('Diamond')}><img src={iconDiamond} alt ="Diamond"/></div>
                <div id = "Circle" className="LeftBar" onClick={() => this.props.setMode('Circle')}><img src={iconCircle} alt ="Circle"/></div>
                <div id = "Speech" className="LeftBar" onClick={() => this.props.setMode('Speech')}><img src={iconSpeech} alt ="Speech"/></div>
                <div id = "SpecBox" className="LeftBar" onClick={() => this.props.setMode('SpecBox')}><img src={iconSpecBox} alt ="SpecBox"/></div>
                <div id = "Triangle" className="LeftBar" onClick={() => this.props.setMode('Triangle')}><img src={iconTriangle} alt ="Triangle"/></div>
            </form>;

        } else if (this.state.menu === "Vertex") {
            console.log("Vertex Selected",this.state.selectedObject);

            canvasDraw.drawAll();

            return <form ref={this.setFormRef} className={this.props.className}>
                <div className="LeftBar">Vertex Properties</div>

                <label className="LeftLabel">Title</label>
                <input id="LeftTitle" className="LeftTitle" defaultValue={this.state.selectedObject.title} onKeyUp={() => this.setTitle()}/>
                <label className="LeftSpacer">&nbsp;</label>

                <label className="LeftLabel">Content</label>
                <textarea id="LeftContent" className ="LeftContent" defaultValue={this.state.selectedObject.getContentAsString()} onKeyUp={() => this.setContent()}/>
                <label className="LeftSpacer">&nbsp;</label>

                {this.getS23MIconsSelector()}
                <label className="LeftSpacer">&nbsp;</label>

                <button className="LeftLabel" onClick={() => {deleteElement(this.state.selectedObject);this.setState({menu:"Tools"})}}>Remove</button>
            </form>;

        } else if (this.state.menu === "Arrow") {
            console.log("Arrow Selected");
            console.log(this.state.selectedObject)
            return <form ref={this.setFormRef} className={this.props.className}>
                <div className="LeftBar">Arrow Properties</div>

                <label className="LeftLabel">From Node Head</label>
                <select name="ArrowHeadFrom" id="ArrowHeadFrom" className="ArrowHeadFrom" defaultValue={EdgeEndToString[this.state.selectedObject.startType]} onChange={() => this.setFromNodeHead()}>
                    <option value = "None">-No Icon</option>
                    <option value = "Arrow">-></option>
                    <option value = "Triangle">-▷</option>
                    <option value = "FilledDiamond">-◆</option>
                </select>
                <label className="LeftSpacer">&nbsp;</label>

                <label className="LeftLabel">To Node Head</label>
                <select name="ArrowHeadTo" id="ArrowHeadTo" className="ArrowHeadTo" defaultValue={EdgeEndToString[this.state.selectedObject.endType]} onChange={() => this.setToNodeHead()}>
                    <option value = "None">-No Icon</option>
                    <option value = "Arrow">-></option>
                    <option value = "Triangle">-▷</option>
                    <option value = "FilledDiamond">-◆</option>
                </select>
                <label className="LeftSpacer">&nbsp;</label>

                <label className="LeftLabel">Line Type</label>
                <select name="LineType" id="LineType" className="LineType" defaultValue={LineTypeToString[this.state.selectedObject.lineType]} onChange={() => this.setLineType()}>
                    <option value = "Solid">Solid</option>
                    <option value = "Dashed">Dashed</option>
                </select>
                <label className="LeftSpacer">&nbsp;</label>

                <label className="LeftLabel">Line Colour</label>
                <select name="LineColour" id="LineColour" className="LineColour" defaultValue={LineColourToStringName[this.state.selectedObject.lineColour]} onChange={() => this.setColour()}>
                    <option value = "Black">Black</option>
                    <option value = "Red">Red</option>
                    <option value = "Blue">Blue</option>
                    <option value = "Green">Green</option>
                </select>
                <label className="LeftSpacer">&nbsp;</label>

                {/* -1 represents n or *  */}
                <label className="LeftLabel">Source Cardinality</label>
                    Visible: <input type="checkbox" id = "sourceCardinalityShown" defaultChecked={this.state.selectedObject.sourceCardinality.isVisible} onChange={() => this.toggleSourceCardinalityVisibility()}/>
                    <input type="number" id = "sourceFromCardindality" defaultValue={this.state.selectedObject.sourceCardinality.lowerBound} min="-1" max="25" onChange={() => this.updateCardinality()}/>
                    <label>..</label>
                    <input type="number" id = "sourceToCardindality" defaultValue={this.state.selectedObject.sourceCardinality.upperBound} min="-1" max="25" onChange={() => this.updateCardinality()}/>

                <label className="LeftLabel">Destination Cardinality</label>
                    Visible: <input type="checkbox" id = "destCardinalityShown" defaultChecked={this.state.selectedObject.destCardinality.isVisible} onChange={() => this.toggleDestCardinalityVisibility()}/>
                    <input type="number" id = "destFromCardindality" defaultValue={this.state.selectedObject.destCardinality.lowerBound} min="-1" max="25" onChange={() => this.updateCardinality()}/>
                    <label>..</label>
                    <input type="number" id = "destToCardindality" defaultValue={this.state.selectedObject.destCardinality.upperBound} min="-1" max="25" onChange={() => this.updateCardinality()}/>

                <label className="LeftLabel">Source Label</label>
                    <input id="SourceLabel" className="SourceLabel" defaultValue={this.state.selectedObject.sourceLabel} onKeyUp={() => this.setStartLabel()}/>
                <label className="LeftSpacer">&nbsp;</label>

                <label className="LeftLabel">Destination Label</label>
                    <input id="DestLabel" className="DestLabel" defaultValue={this.state.selectedObject.destLabel} onKeyUp={() => this.setEndLabel()}/>
                <label className="LeftSpacer">&nbsp;</label>
                {
                }
                <button className="RemoveButton" onClick={() => {deleteElement(this.state.selectedObject);this.setState({menu:"Tools"})}}>Remove</button>


            </form>;
        }

    };

    render() {
        let menu = this.getMenu();
        if(this.formRef !== null) {
            this.formRef.reset();
        }
        return menu;
    }


}
