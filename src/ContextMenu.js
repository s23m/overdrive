import React from 'react';

class ContextMenu extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            visible: false,
            x: 0,
            y: 0
        };
    }

    componentDidMount() {
        var self = this;

        document.addEventListener('contextmenu', function(event) {
            event.preventDefault();

            const mouseX = event.clientX;
            const mouseY = event.clientY;

            self.setState({
                visible: true,
                x: mouseX,
                y: mouseY
            });
        });
    }

    returnMenu(items) {
        var style = {
            'position': 'absolute',
            'top': `${this.state.y}px`,
            'left': `${this.state.x}px`
        }

        return <div className='ContextMenu' id='ContextMenu' style={style}>
            {items.map((item, index, arr) => {
                if (arr.length - 1 === index) {
                    return <div key={index} className='ContextMenuItemLast'>{item.label}</div>
                } else {
                    return <div key={index} className='ContextMenuItem'>{item.label}</div>
                }
            })}
            </div>;
    }
}