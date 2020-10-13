/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/. 
 */

import React from 'react';
import TreeView from 'react-simple-jstree';

export class ContainmentTree extends React.Component {
    constructor(props) {
        super();
        this.state = {
            data: {
                core: {
                    data: [
                        {
                            text: "Graph", children: [
                                {text: "Test Child", children: [
                                    {text: "TEST"},
                                    {text: "TEST2"}
                                ]},
                                {text: "Test Child 2"}
                            ]
                        }
                    ]
                }
            },
            selected: [],
        };
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