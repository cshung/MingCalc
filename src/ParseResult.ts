import { IDocumentElement } from "./IDocumentElement";

export class ParseResult {

    elements: Array<IDocumentElement>;
    errors: Array<string>;

    constructor (elements: Array<IDocumentElement>, errors: Array<string>)
    {
        this.elements = elements;
        this.errors = errors;
    }
}