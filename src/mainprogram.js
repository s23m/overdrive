import React from 'react';
import './App.css';
import * as canvasDraw from "./canvasDraw";

export class Canvas extends React.Component {
    constructor(props) {
        super(props);
        this.canvasRef = React.createRef();
    }

    componentWillReceiveProps(nextProps) {
        this.zoom = nextProps.mainState.zoomLevel;
        this.tool = nextProps.mainState.drawMode;

    }

    componentDidMount() {
        this.zoom = this.props.mainState.zoomLevel;
        this.tool = this.props.mainState.drawMode;

    }

    // prevent context (right-click) menu from appearing
    ocm = (e) => {
        e.preventDefault();
    };

    //todo: add canvas method for mouse out, to prevent drawing bug when starting draw and then leaving the canvas

    mouseDown = (e, canvas) => {
        var position = canvasDraw.getGraphXYFromMouseEvent(e);
        var x = position[0]; var y = position[1];

        // If it was a left click
        if(e.button === 0) {
            canvasDraw.onMousePress(canvas, x, y);
        }
        // if it was a right click
        if(e.button === 2) {
            this.props.setLeftMenu(canvasDraw.findIntersected(x, y));
        }
    };

    mouseUp = (e, canvas) =>{
        var position = canvasDraw.getGraphXYFromMouseEvent(e);
        var x = position[0]; var y = position[1];

        // If it was a left click
        if(e.button === 0) {
            canvasDraw.onMouseRelease(canvas, x, y);
        }

    }

    render() {
        return <canvas ref={this.canvasRef} id="drawCanvas" onContextMenu={(e) => this.ocm(e)} onMouseDown={(e) => this.mouseDown(e, this)} onMouseUp={(e) => this.mouseUp(e, this)}>
                <p> Canvas's are not supported by your browser</p>
            </canvas>

    }

}

//todo: add other types of tools
const leftMenuTypes = ["Tools","Vertex","Arrow"];


window.addEventListener("resize",canvasDraw.resetMouseOrigin)

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

    setTitle(){
        var titleInput =  document.getElementsByClassName("LeftTitle")[0];
        this.state.selectedObject.setTitle(titleInput.value);
        canvasDraw.drawAll()
    }

    setContent(){
        var contentInput = document.getElementsByClassName("LeftContent")[0];
        var newContent = contentInput.value;
        newContent = newContent.split("\n");
        this.state.selectedObject.setContent(newContent);
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
                <select name="ArrowHeads" className="ArrowHeads">
                    <option key = "-No Head">-No Icon</option>
                    <option key = "->">-></option>
                    <option key = "-▷">-▷</option>
                    <option key = "-◆">-◆</option>
                </select>
                <label className="LeftSpacer">&nbsp;</label>

                <label className="LeftLabel">To Node Head</label>
                <select name="ArrowHeads" className="ArrowHeads">
                    <option key = "-No Head">-No Icon</option>
                    <option key = "->">-></option>
                    <option key = "-▷">-▷</option>
                    <option key = "-◆">-◆</option>
                </select>
                <label className="LeftSpacer">&nbsp;</label>

                <label className="LeftLabel">Colour</label>
                <select name="ArrowHeads" className="ArrowHeads">
                    <option key = "Black">Black</option>
                    <option key = "Red">Red</option>
                    <option key = "Blue">Blue</option>
                    <option key = "Green">Green</option>
                </select>
                <label className="LeftSpacer">&nbsp;</label>

                // -1 represents n or *
                <label className="LeftLabel">Souce Carindality</label>
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

                <button className="LeftLabel">Remove</button>


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

        console.log("Set selected object to " + this.state.selectedObject);
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
                this.state.selectedObject.setTitle("Not Selected Anymore");
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