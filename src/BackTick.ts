export class BackTick {
    public line: number;
    public column: number;
    public position: number;

    constructor(line: number, column: number, position: number)
    {
        this.line = line;
        this.column = column;
        this.position = position;
    }
}