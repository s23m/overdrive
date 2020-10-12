/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/. */

// React imports
import React, { useState } from 'react';
import Paper from '@material-ui/core/Paper';
import OutlinedInput from '@material-ui/core/OutlinedInput';
import Select from '@material-ui/core/Select';
import MenuItem from '@material-ui/core/MenuItem';
import Typography from '@material-ui/core/Typography';
import GridMUI from '@material-ui/core/Grid';
import Checkbox from '@material-ui/core/Checkbox';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import { withStyles } from '@material-ui/core/styles';
import { EditingState } from '@devexpress/dx-react-grid';

import InputGroup from 'react-bootstrap/InputGroup'
import FormControl from 'react-bootstrap/FormControl'
import Button from 'react-bootstrap/Button'

import {
    Grid,
    Table,
    TableHeaderRow,
    TableInlineCellEditing,
    Toolbar,
} from '@devexpress/dx-react-grid-material-ui';

import {
    Plugin,
    Template,
    TemplatePlaceholder,
} from '@devexpress/dx-react-core';

// In program imports
import {currentObjects} from "./CanvasDraw";

// Globals
var rows;
var setRows = null;
var setColumns = null;
var textInput = React.createRef();
export var translationColumns = [];

const getRowId = row => row.id;

const styles = () => ({
    input: {
        fontSize: '14px',
        width: '90px',
    },
    label: {
        fontSize: '14px',
    },
    container: {
        maxWidth: '18em',
    },
    selector: {
        height: '32px',
    },
});

// #FOLD_BLOCK
const StartEditActionSelectorBase = (props) => {
    const { defaultAction, changeAction, classes } = props;
    return (
        <GridMUI
            container
            alignItems="center"
            className={classes.container}
        >
            <Typography
                className={classes.label}
            >
                Start Edit Action:
                &nbsp;
            </Typography>
            <Select
                onChange={e => changeAction(e.target.value)}
                value={defaultAction}
                className={classes.selector}
                input={(
                    <OutlinedInput
                        classes={{ input: classes.input }}
                        labelWidth={0}
                        margin="dense"
                    />
                )}
            >
                <MenuItem value="click">Click</MenuItem>
                <MenuItem value="doubleClick">Double Click</MenuItem>
            </Select>
        </GridMUI>
    );
};
const StartEditActionSelector = withStyles(styles, { name: 'StartEditActionSelector' })(StartEditActionSelectorBase);

// #FOLD_BLOCK
const SelectTextCheckerBase = (props) => {
    const { isSelectText, changeSelectText, classes } = props;
    return (
        <FormControlLabel
            control={(
                <Checkbox
                    checked={isSelectText}
                    onChange={e => changeSelectText(e.target.checked)}
                    color="primary"
                />
            )}
            classes={{ label: classes.label }}
            label="Select Text On Focus"
        />
    );
};
const SelectTextChecker = withStyles(styles, { name: 'SelectTextChecker' })(SelectTextCheckerBase);

const EditPropsPanel = props => (
    <Plugin name="EditPropsPanel">
        <Template name="toolbarContent">
            <SelectTextChecker {...props} />
            <TemplatePlaceholder />
            <StartEditActionSelector {...props} />
        </Template>
    </Plugin>
);

const FocusableCell = ({ onClick, ...restProps }) => (
    <Table.Cell {...restProps} tabIndex={0} onFocus={onClick} />
);

export default () => {
    var [columns, setColumnsRet] = useState(createColumns());
    setColumns = setColumnsRet;

    const [editingStateColumnExtensions] = useState([
        { columnName: 'UUID', editingEnabled: false },
        { columnName: 'type', editingEnabled: false },
    ]);

    const [generatedRows, setRowsRet] = useState([]);
    rows = generatedRows;
    setRows = setRowsRet;

    const [tableColumnExtensions] = useState([
        { columnName: 'UUID', wordWrapEnabled: true },
        { columnName: 'type', wordWrapEnabled: true },
        { columnName: 'name', wordWrapEnabled: true },
        { columnName: 'description', wordWrapEnabled: true },
        { columnName: 'abbreviation', wordWrapEnabled: true },
        { columnName: 'shortAbbreviation', wordWrapEnabled: true },
    ]);

    const [startEditAction, setStartEditAction] = useState('click');
    const [selectTextOnEditStart, setSelectTextOnEditStart] = useState(true);

    const commitChanges = ({ added, changed, deleted}) => {
        let changedRows;
        if (added) {
            const startingAddedId = rows.length > 0 ? rows[rows.length - 1].id + 1 : 0;
            changedRows = [
                ...rows,
                ...added.map((row, index) => ({
                    id: startingAddedId + index,
                    ...row,
                })),
            ];
        }
        if (changed) {
            changedRows = rows.map(row => (changed[row.id] ? { ...row, ...changed[row.id] } : row));
            updateChangedObject(changedRows);
        }
        if (deleted) {
            const deletedSet = new Set(deleted);
            changedRows = rows.filter(row => !deletedSet.has(row.id));
        }

        setRows(changedRows);
    };

    return (
        <Paper>
            <InputGroup>
                <FormControl
                    ref={textInput}
                    placeholder="Column name"
                    aria-label="Column name"
                    aria-describedby="basic-addon2"
                />
                <InputGroup.Append>
                    <Button variant="outline-secondary" onClick={() => addColumn()}>Add</Button>
                    <Button variant="outline-secondary" onClick={() => removeColumn()}>Remove</Button>
                </InputGroup.Append>
            </InputGroup>
            <Grid
                rows={rows}
                columns={columns}
                getRowId={getRowId}
            >
                <EditingState
                    onCommitChanges={commitChanges}
                    columnExtensions={editingStateColumnExtensions}
                />
                <Table cellComponent={FocusableCell} columnExtensions={tableColumnExtensions} />
                <TableHeaderRow />
                <Toolbar />
                <EditPropsPanel
                    defaultAction={startEditAction}
                    changeAction={setStartEditAction}
                    isSelectText={selectTextOnEditStart}
                    changeSelectText={setSelectTextOnEditStart}
                />
                <TableInlineCellEditing
                    startEditAction={startEditAction}
                    selectTextOnEditStart={selectTextOnEditStart}
                />
            </Grid>
        </Paper>
    );
};

function addColumn() {
    const value = textInput.current.value

    // Add column
    translationColumns.push(value);
    updateColumns();
}

function removeColumn() {
    const value = textInput.current.value

    // Delete from currentObjects
    for (let object of currentObjects) {
        object.semanticIdentity.translations.delete(value);
    }

    // Delete column
    translationColumns.splice(translationColumns.indexOf(value), 1);
    updateColumns();
}

function updateColumns() {
    setColumns(createColumns());
}

export function resetRows() {
    var newRows = []

    for (let i = 0; i < currentObjects.length; i++) {
        const row = {};
        let object = currentObjects[i];

        // Constants
        row['id'] = object.semanticIdentity.UUID; // Just going to be based on UUID since it's easy and unique
        row['UUID'] = object.semanticIdentity.UUID;
        row['type'] = object.constructor.name;
        row['name'] = object.semanticIdentity.name;
        row['description'] = object.semanticIdentity.description;
        row['abbreviation'] = object.semanticIdentity.abbreviation;
        row['shortAbbreviation'] = object.semanticIdentity.shortAbbreviation;

        // Translations
        for (let o = 0; o < object.semanticIdentity.translations.length; o++) {
            let translation = object.semanticIdentity.translations[o];

            row[translation[0]] = translation[1];
        }

        // Add Arrow Ends
        if (object.constructor.name === "Arrow") {
            // Add source edge end
            const edgeEndRow = {};
            let edgeEndObject = object.sourceEdgeEnd;
            edgeEndRow['id'] = object.semanticIdentity.UUID+"edgeEnd";
            edgeEndRow['UUID'] = object.semanticIdentity.UUID;
            edgeEndRow['type'] = edgeEndObject.constructor.name;
            edgeEndRow['name'] = "";
            edgeEndRow['description'] = "";
            edgeEndRow['abbreviation'] = "";
            edgeEndRow['shortAbbreviation'] = "";
            newRows.push(edgeEndRow);

            // Add dest edge end
            const edgeDestRow = {};
            let destEdgeEndObject = object.destEdgeEnd;
            edgeDestRow['id'] = object.semanticIdentity.UUID+"edgeDest";
            edgeDestRow['UUID'] = object.semanticIdentity.UUID;
            edgeDestRow['type'] = destEdgeEndObject.constructor.name;
            edgeDestRow['name'] = "";
            edgeDestRow['description'] = "";
            edgeDestRow['abbreviation'] = "";
            edgeDestRow['shortAbbreviation'] = "";
            newRows.push(edgeDestRow);
        }

        newRows.push(row);
    }

    if (setRows === null) {
        console.error("Cannot set rows");
        return;
    }

    setRows(newRows);
}

function createColumns() {
    // Create default columns
    var columnNames = [
        { name: 'UUID', title: 'UUID' },
        { name: 'type', title: 'Type' },
        { name: 'name', title: 'Name' },
        { name: 'description', title: 'Description' },
        { name: 'abbreviation', title: 'Abbreviation' },
        { name: 'shortAbbreviation', title: 'Short Abbreviation' },
    ];

    // Add translation columns
    for (let translation of translationColumns) {
        columnNames.push({name: translation, title: translation});
    }

    return columnNames;
}

function updateChangedObject(rows) {
    for (let i = 0; i < rows.length; i++) {
        var row = rows[i];

        // Find object
        for (let o = 0; o < currentObjects.length; o++) {
            // If should update
            if (row['UUID'] === currentObjects[i].semanticIdentity.UUID) {
                // Constants
                currentObjects[i].semanticIdentity.abbreviation = row['abbreviation'];
                currentObjects[i].semanticIdentity.shortAbbreviation = row['shortAbbreviation'];
                currentObjects[i].semanticIdentity.name = row['name'];
                currentObjects[i].semanticIdentity.description = row['description'];

                // Translations
                for (let translation of translationColumns) {
                    // Find translation in list
                    var set = false;
                    for (let o = 0; o < currentObjects[i].semanticIdentity.translations.length; i++) {
                        if (currentObjects[i].semanticIdentity.translations[o][0] === translation) {
                            currentObjects[i].semanticIdentity.translations[o][1] = row[translation];
                            set = true;
                            break;
                        }
                    }

                    if (!set) {
                        currentObjects[i].semanticIdentity.translations.push([translation, row[translation]]);
                    }
                }
            }
        }
    }
}

export function setTranslationColumns(newColumns) {
    translationColumns = newColumns;
    updateColumns();
}