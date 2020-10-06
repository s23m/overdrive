/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/. */

export class SemanticIdentity {

    constructor(UUID, name, description, abbreviation, shortAbbreviation, translations){
        this.UUID = UUID;
        this.name = name;
        this.description = description;
        this.abbreviation = abbreviation;
        this.shortAbbreviation = shortAbbreviation;
        this.translations = translations;
    }
}