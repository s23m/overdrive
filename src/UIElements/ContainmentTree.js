/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/. 
 */

import React from 'react';
import TreeView from 'react-simple-jstree';

import { currentObjects } from "./CanvasDraw";
import { rebuildObject } from "../Serialisation/FileManager";

export class ContainmentTree extends React.Component {
    constructor(props) {
        super();

        let treeData = [];
        for (let vertex of currentObjects.rootVertices) {
            treeData.push(vertex.toTreeViewElement(new Set()));
        }

        this.state = {
            data: {
                core: {
                    data: [
                        { text: "Graph", children: treeData }
                    ]
                }
            },
            selectedVertex: null
        }
    }

    handleElementSelect(e, data) {
        if (data.selected.length === 1 && data.node.data !== null) {
            this.setState({
                selectedVertex: rebuildObject(data.node.data)
            });
            this.props.setLeftMenu(this.state.selectedVertex);
            
        } else {
            this.setState({
                selectedVertex: null
            });
        }
    }

    render() {
        const data = this.state.data;

        return (
            <div>
                <TreeView treeData={data} onChange={(e, data) => this.handleElementSelect(e, data)} />
            </div>
        )
    }
}