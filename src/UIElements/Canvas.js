import React from 'react';
import * as canvasDraw from "./CanvasDraw";

export class Canvas extends React.Component {
    constructor(props) {
        super(props);
        this.canvasRef = React.createRef();

        this.eventListenerHolder = null;

        this.state = {}
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
        let position = canvasDraw.getGraphXYFromMouseEvent(e);
        var x = position[0]; var y = position[1];
        let eventListenerHolder;
        this.setState({
            startX: x,
            startY: y
        });

        // If it was a left click
        if (e.button === 0) {
            canvasDraw.onLeftMousePress(canvas, x, y);
        }

        // If it was a middle click
        if (e.button === 1) {
            e.preventDefault();
            canvasDraw.onMiddleClick(canvas, x, y)
        }

        function rightClickDrag(e) {
            let newCoords = canvasDraw.getGraphXYFromMouseEvent(e);
            let x2 = newCoords[0];
            let y2 = newCoords[1];

            let dist = Math.hypot(x,y,x2,y2);

            if(dist > 7){
                canvasDraw.onMiddleClick(canvas,x,y);
                document.removeEventListener("mousemove",rightClickDrag)
            }
        }

        //If it was a right click
        if (e.button === 2){
            this.eventListenerHolder = document.addEventListener("mousemove", rightClickDrag)
        }
    };

    mouseUp = (e, canvas) =>{

        let position = canvasDraw.getGraphXYFromMouseEvent(e);
        let x = position[0]; var y = position[1];

        // If it was a left click
        if (e.button === 0) {
            canvasDraw.onLeftMouseRelease(canvas, x, y);
        }

        // if it was a right click
        if (e.button === 2) {

            if(this.eventListenerHolder !== null){
                canvasDraw.solidifyObject();
            }

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

    mouseLeave(e, canvas) {
        canvasDraw.onMouseLeave()
    }

    render() {
        return <canvas ref={this.canvasRef} id="drawCanvas" onContextMenu={(e) => this.ocm(e)} onMouseDown={(e) => this.mouseDown(e, this)} onMouseUp={(e) => this.mouseUp(e, this)} onMouseLeave={(e) => this.mouseLeave(e,this)}>
                <p> Canvas's are not supported by your browser</p>
            </canvas>
    }

}

window.addEventListener("resize",canvasDraw.resetMouseOrigin)
