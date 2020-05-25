import { CellElement } from "./CellElement";

export class Reference {
    public startLine: number;
    public startColumn: number;
    public startPosition: number;
    public endLine: number;
    public endColumn: number;
    public endPosition: number;
    public cell?: CellElement;

    constructor(startLine: number, startColumn: number, startPosition: number, endLine: number, endColumn: number, endPosition: number) {
        this.startLine = startLine;
        this.startColumn = startColumn;
        this.startPosition = startPosition;
        this.endLine = endLine;
        this.endColumn = endColumn;
        this.endPosition = endPosition;
    }
}