import React from 'react';
import * as canvasDraw from "./CanvasDraw";

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
    setTitle(){
        var newTitle =  document.getElementsByClassName("LeftTitle")[0].value;
        this.state.selectedObject.setTitle(newTitle);
        canvasDraw.drawAll()
    }

    setContent(){
        var newContent = document.getElementsByClassName("LeftContent")[0].value;
        newContent = newContent.split("\n");
        this.state.selectedObject.setContent(newContent);
        canvasDraw.drawAll()
    }

    setIcon(){
        var iconName = document.getElementsByClassName("IconSelector")[0].value;
        this.state.selectedObject.setIcon(iconName);
        canvasDraw.drawAll()
    }

    //ARROW SETTERS
    setFromNodeHead(){
        var newFromHead = document.getElementsByClassName("ArrowHeadFrom")[0].value;
        this.state.selectedObject.setStartType(newFromHead);
        canvasDraw.drawAll()
    }

    setToNodeHead(){
        var newToHead = document.getElementsByClassName("ArrowHeadTo")[0].value;
        this.state.selectedObject.setEndType(newToHead);
        canvasDraw.drawAll()
    }

    setLineType(){
        var newLineType = document.getElementsByClassName("ArrowType")[0].value;
        this.state.selectedObject.setLineType(newLineType);
        canvasDraw.drawAll()
    }

    setColour(){
        var newColour = document.getElementsByClassName("ArrowHeadColour")[0].value;
        this.state.selectedObject.setLineType(newColour);
        canvasDraw.drawAll()
    }

// return the correct menu based on the selected item
    getMenu = () =>{
        if(this.state.menu === "Tools"){
            return <div className={this.props.className}>
                <div className="LeftBar" onClick={() => this.props.setMode('Vertex')}>Vertex</div>
                <div className="LeftBar" onClick={() => this.props.setMode('Arrow')}>Arrow</div>
                <div className="LeftBar" onClick={() => this.props.setMode('Diamond')}>Diamond</div>
                <div className="LeftBar" onClick={() => this.props.setMode('Circle')}>Circle</div>
                <div className="LeftBar" onClick={() => this.props.setMode('Speech')}>Speech</div>
                <div className="LeftBar" onClick={() => this.props.setMode('SpecBox')}>SpecBox</div>
                <div className="LeftBar" onClick={() => this.props.setMode('Triangle')}>Triangle</div>
            </div>;

        }else if (this.state.menu === "Vertex"){
            console.log("Vertex Selected");

            // todo: remove statement directly below this
            // temporary way to show a vertex is selected
            this.state.selectedObject.setTitle("Selected");
            canvasDraw.drawAll();

            //todo: do not remove this in the todo above, then remove this todo
            return <div className={this.props.className}>
                <div className="LeftBar">Vertex Properties</div>

                <label className="LeftLabel">Title</label>
                <input id="LeftTitle" className="LeftTitle" onKeyUp={() => this.setTitle()}/>
                <label className="LeftSpacer">&nbsp;</label>

                <label className="LeftLabel">Content</label>
                <textarea className ="LeftContent" onKeyUp={() => this.setContent()}/>
                <label className="LeftSpacer">&nbsp;</label>

                <label className="LeftLabel">Icon</label>
                {getS23MIconsSelector()}
                <label className="LeftSpacer">&nbsp;</label>

                <button className="LeftLabel">Remove</button>
            </div>;

        }else if (this.state.menu === "Arrow"){
            console.log("Arrow Selected");
            return <div className={this.props.className}>
                <div className="LeftBar">Arrow Properties</div>

                <label className="LeftLabel">From Node Head</label>
                <select name="ArrowHeadFrom" className="ArrowHeadFrom" onChange={() => this.setFromNodeHead()}>
                    <option key = "-No Head">-No Icon</option>
                    <option key = "->">-></option>
                    <option key = "-▷">-▷</option>
                    <option key = "-◆">-◆</option>
                </select>
                <label className="LeftSpacer">&nbsp;</label>

                <label className="LeftLabel">To Node Head</label>
                <select name="ArrowHeadTo" className="ArrowHeadTo" onChange={() => this.setToNodeHead()}>
                    <option key = "-No Head">-No Icon</option>
                    <option key = "->">-></option>
                    <option key = "-▷">-▷</option>
                    <option key = "-◆">-◆</option>
                </select>
                <label className="LeftSpacer">&nbsp;</label>

                <label className="LeftLabel">Line Type</label>
                <select name="ArrowType" className="ArrowType" onChange={() => this.setLineType()}>
                    <option key = "Solid">Solid</option>
                    <option key = "Red">Dashed</option>
                </select>
                <label className="LeftSpacer">&nbsp;</label>

                <label className="LeftLabel">Line Colour</label>
                <select name="ArrowHeadColour" className="ArrowHeadColour" onChange={() => this.setColour()}>
                    <option key = "Black">Black</option>
                    <option key = "Red">Red</option>
                    <option key = "Blue">Blue</option>
                    <option key = "Green">Green</option>
                </select>
                <label className="LeftSpacer">&nbsp;</label>

                // -1 represents n or *
                <label className="LeftLabel">Source Carindality</label>
                    Visible: <input type="checkbox" id = "sourceCardinalityShown"/>
                    <input type="number" id = "sourceFromCardindality" min="-1" max="25"/>
                    <label>..</label>
                    <input type="number" id = "sourceToCardindality" min="-1" max="25"/>

                <label className="LeftLabel">Destination Carindality</label>
                    Visible: <input type="checkbox" id = "destCardinalityShown"/>
                    <input type="number" id = "destFromCardindality" min="-1" max="25"/>
                    <label>..</label>
                    <input type="number" id = "destToCardindality" min="-1" max="25"/>

                <label className="LeftLabel">Source Label</label>
                    <input id="SourceLabel" className="LeftTitle"/>
                <label className="LeftSpacer">&nbsp;</label>

                <label className="LeftLabel">Destination Label</label>
                    <input id="DestLabel" className="LeftTitle"/>
                <label className="LeftSpacer">&nbsp;</label>

                // todo: to/from caridnality, comment, 1..n represented as a dot
                // require ability to select arbitrary number or no number n or * for cardinality

                <button className="RemoveButton">Remove</button>


            </div>;
        }

    };

    render() {

            return this.getMenu()
        }


    }

function getS23MIconsSelector() {

    var dropdownOptions = [<option key = "-No Icon">-No Icon</option>];
    var fileNames = ['Activity.png', 'Agent.png', 'BioSphere.png', 'Critical.png', 'Designed.png', 'Ecosystem.png', 'Error.png', 'Event.png', 'Grow_n.png', 'Human.png', 'listFileNames.py', 'Make_n.png', 'Move_n.png', 'Organic.png', 'Organisation.png', 'Play_n.png', 'Resource.png', 'SaaS_n.png', 'Social.png', 'Software.png', 'Sustain_n.png', 'Symbolic.png', 'Tacit Knowledge.png', 'Team.png', 'Trust.png', 'UI Device.png']
    let name = "";
    fileNames.forEach(fileName => {

        if(fileName.slice(-6,-4) === "_n"){
            name = fileName.slice(0,-6);
                dropdownOptions.push(<option key = {name}>{name}</option>)
            }else{
            name = fileName.slice(0,-4);
                dropdownOptions.push(<option key = {name}>{name}</option>)
            }

    });

    return <select name="Icons" className="IconSelector"> 
        {dropdownOptions}
    </select>;


}
