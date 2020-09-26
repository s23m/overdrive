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

// class to display the left hand menu, where we will be showing
// object editing tools for now
export class LeftMenu extends React.Component{

    constructor() {
        super();
        this.state = {
            menu: "Tools",
            selectedObject: null
        };
        this.setTitle = this.setTitle.bind(this);
        this.setContent = this.setContent.bind(this);

        this.formRef = null;

        this.setFormRef = element =>{
            this.formRef = element;
        }

    }

    componentDidMount() {
        this.menu = this.props.mainState.menu;
        this.selectedItem = this.props.mainState.selectedItem;
    }

    componentWillReceiveProps(nextProps) {
        this.setState({menu:nextProps.mainState.menu});
        this.setState({selectedObject:nextProps.mainState.selectedObject});

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

    setIcon() {
        var iconName = document.getElementById("IconSelector").value;
        this.state.selectedObject.setIcon(iconName);
        console.log(iconName);
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

                <label className="LeftLabel">Icon</label>
                {getS23MIconsSelector(this)}
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
                // todo: to/from caridnality, comment, 1..n represented as a dot
                    // require ability to select arbitrary number or no number n or * for cardinality
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

function getS23MIconsSelector(leftMenu) {
    var dropdownOptions = [<option value = "-No Icon">-No Icon</option>];
    var fileNames = ['Activity.png', 'Agent.png', 'BioSphere.png', 'Critical.png', 'Designed.png', 'Ecosystem.png', 'Error.png', 'Event.png', 'Grow_n.png', 'Human.png', 'listFileNames.py', 'Make_n.png', 'Move_n.png', 'Organic.png', 'Organisation.png', 'Play_n.png', 'Resource.png', 'SaaS_n.png', 'Social.png', 'Software.png', 'Sustain_n.png', 'Symbolic.png', 'Tacit Knowledge.png', 'Team.png', 'Trust.png', 'UI Device.png'];
    let name = "";
    fileNames.forEach(fileName => {

        if (fileName.slice(-6,-4) === "_n") {
            name = fileName.slice(0,-6);
                dropdownOptions.push(<option value = {name}>{name}</option>)
            } else {
            name = fileName.slice(0,-4);
                dropdownOptions.push(<option value = {name}>{name}</option>)
            }

    });

    return <select name="Icons" id="IconSelector" className="IconSelector" defaultValue={leftMenu.state.selectedObject.icon} onChange={() => leftMenu.setIcon()}> 
        {dropdownOptions}
    </select>;


}
