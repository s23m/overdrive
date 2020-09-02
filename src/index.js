/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/. */

import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import App from './App';
import * as ServiceWorker from './ServiceWorker';
import {MainProgramClass} from './MainProgram';
import {Canvas} from './UIElements/Canvas';
import {assignElement, canvasDraw} from "./UIElements/CanvasDraw";


ReactDOM.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
  document.getElementById('root')
);

ReactDOM.render(<MainProgramClass />,document.getElementById("program"));
assignElement("drawCanvas");

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://bit.ly/CRA-PWA
ServiceWorker.unregister();
