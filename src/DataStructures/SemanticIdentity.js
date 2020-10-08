/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/. */

 import { createUUID } from "./SemanticDomain";

export class SemanticIdentity {

    constructor(name, description, abbreviation, shortAbbreviation, UUID, translations){
        if (UUID !== undefined){
            this.UUID = UUID;
        } else {
            this.UUID = createUUID();
        }

        this.name = name;
        this.description = description;
        this.abbreviation = abbreviation;
        this.shortAbbreviation = shortAbbreviation;

        if (translations !== undefined){
            this.translations = translations;
        } else {
            this.translations = [];
        }
    }
}