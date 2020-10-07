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
 
 export class Toolbar extends React.Component {
 
     constructor() {
         super();
         this.formRef = null;
 
         this.setFormRef = element =>{
             this.formRef = element;
         };
     };
 
     getToolbar = () => {
             return <form ref={this.setFormRef} className={this.props.className}>
                 <div id = "Select" className="LeftBar" onClick={() => this.props.setMode('Select')}><p>SELECT</p></div>
                 <div id = "Vertex" className="LeftBar" onClick={() => this.props.setMode('Vertex')}><img src={iconVertex} alt ="Vertex"/></div>
                 <div id = "Arrow" className="LeftBar" onClick={() => this.props.setMode('Arrow')}><img src={iconArrow} alt ="Arrow"/></div>
                 <div id = "Containment" className="LeftBar" onClick={() => this.props.setMode('Containment')}><img src={iconDiamond} alt ="Containment"/></div>
                </form>;
         }
 
     };
 
     render() {
         let toolbar = this.getToolbar();
         if (this.formRef !== null) {
             this.formRef.reset();
         }
         return toolbar;
     };
 
 }
 