/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/. 
 */

import React from 'react';
import TreeView from 'react-simple-jstree';

import { currentObjects } from "./CanvasDraw";

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
            }
        }
    }

    render() {
        const data = this.state.data;

        return (
            <div>
                <TreeView treeData={data} />
            </div>
        )
    }
}