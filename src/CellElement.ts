import { IDocumentElement } from './IDocumentElement'
import { Reference } from './Reference'

export class CellElement implements IDocumentElement {

    name: string;
    value: string;
    startLine?: number;
    startColumn?: number;
    endLine?: number;
    endColumn?: number;
    references: Array<Reference>;
    referencedBy: Array<CellElement>;

    constructor(name: string, value: string, references: Array<Reference>, startLine?: number, startColumn?: number, endLine?: number, endColumn?: number) {
        this.name = name;
        this.value = value;
        this.startLine = startLine;
        this.startColumn = startColumn;
        this.endLine = endLine;
        this.endColumn = endColumn;
        this.references = references;
        this.referencedBy = [];
    }

    public Dummy(): void {
    }
}