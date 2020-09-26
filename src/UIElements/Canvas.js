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

    mouseDown = (e, canvas) => {
        var position = canvasDraw.getGraphXYFromMouseEvent(e);
        var x = position[0]; var y = position[1];

        // If it was a left click
        if (e.button === 0) {
            canvasDraw.onLeftMousePress(canvas, x, y);
        }

        // If it was a middle click
        if (e.button === 1) {
            e.preventDefault();
            canvasDraw.onMiddleClick(canvas, x, y)
        }
    };

    mouseUp = (e, canvas) =>{
        var position = canvasDraw.getGraphXYFromMouseEvent(e);
        var x = position[0]; var y = position[1];

        // If it was a left click
        if (e.button === 0) {
            canvasDraw.onLeftMouseRelease(canvas, x, y);
        }

        // if it was a right click
        if (e.button === 2) {
            // Check if currently drawing an arrow
            if (canvasDraw.arrowPath.length !== 0) {
                canvasDraw.onRightMouseRelease(canvas, x, y)
            } else {
                // Normal right click behaviour
                this.props.setLeftMenu(canvasDraw.findIntersected(x, y));
                canvasDraw.drawAll()
            }

        }

        if (e.button === 1) {
            canvasDraw.solidifyObject()
        }

    };

    mouseLeave(e, canvas){
        canvasDraw.onMouseLeave()
    }

    render() {
        return <canvas ref={this.canvasRef} id="drawCanvas" onContextMenu={(e) => this.ocm(e)} onMouseDown={(e) => this.mouseDown(e, this)} onMouseUp={(e) => this.mouseUp(e, this)} onMouseLeave={(e) => this.mouseLeave(e,this)}>
                <p> Canvas's are not supported by your browser</p>
            </canvas>
    }

}

window.addEventListener("resize",canvasDraw.resetMouseOrigin)
