import React from 'react';
import * as canvasDraw from "./CanvasDraw";

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
        if(e.button === 0){
            canvasDraw.onMousePress(canvas, x, y);
        }
        // if it was a right click
        if(e.button === 2){
            this.props.setLeftMenu(canvasDraw.findIntersected(x, y));
        }
        // If it was a middle click
        if(e.button === 1){
            e.preventDefault();
            canvasDraw.onMiddleClick(canvas, x, y)
        }
    };

    mouseUp = (e, canvas) =>{
        var position = canvasDraw.getGraphXYFromMouseEvent(e);
        var x = position[0]; var y = position[1];

        // If it was a left click
        if(e.button === 0) {
            canvasDraw.onMouseRelease(canvas, x, y);
        }

        if(e.button === 1){
            canvasDraw.solidifyObject()
        }

    };

    render() {
        return <canvas ref={this.canvasRef} id="drawCanvas" onContextMenu={(e) => this.ocm(e)} onMouseDown={(e) => this.mouseDown(e, this)} onMouseUp={(e) => this.mouseUp(e, this)}>
                <p> Canvas's are not supported by your browser</p>
            </canvas>

    }

}

window.addEventListener("resize",canvasDraw.resetMouseOrigin)
