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

    const [generatedRows, setRowsRet] = useState([]);
    rows = generatedRows;
    setRows = setRowsRet;

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
                <EditingState onCommitChanges={commitChanges} />
                <Table cellComponent={FocusableCell} />
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
        object.translations.delete(value);
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
        row['id'] = object.UUID; // Just going to be based on UUID since it's easy and unique
        row['UUID'] = object.UUID;
        row['type'] = object.constructor.name;

        row['abbreviation'] = object.abbreviation;
        row['shortAbbreviation'] = object.shortAbbreviation;

        // Exceptions
        if (object.constructor.name === "Vertex") {
            row['name'] = object.title;
            row['description'] = object.content;
        } else {
            row['name'] = object.name;
            row['description'] = object.description;
        }

        // Translations
        for (let o = 0; o < object.translations.length; o++) {
            let translation = object.translations[o];

            row[translation[0]] = translation[1];
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
            if (row['UUID'] === currentObjects[i].UUID) {
                // Constants
                currentObjects[i].abbreviation = row['abbreviation'];
                currentObjects[i].shortAbbreviation = row['shortAbbreviation'];

                // Exceptions
                if (currentObjects[i].constructor.name === "Vertex") {
                    currentObjects[i].title = row['name'];
                    currentObjects[i].content = row['description'];
                } else {
                    currentObjects[i].name = row['name'];
                    currentObjects[i].description = row['description'];
                }

                // Translations
                for (let translation of translationColumns) {
                    // Find translation in list
                    var set = false;
                    for (let o = 0; o < currentObjects[i].translations.length; i++) {
                        if (currentObjects[i].translations[o][0] === translation) {
                            currentObjects[i].translations[o][1] = row[translation];
                            set = true;
                            break;
                        }
                    }

                    if (!set) {
                        currentObjects[i].translations.push([translation, row[translation]]);
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