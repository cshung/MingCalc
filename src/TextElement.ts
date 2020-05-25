import { IDocumentElement } from "./IDocumentElement";

export class TextElement implements IDocumentElement {

    s: string;

    constructor(s: string) {
        this.s = s;
    }

    public Dummy() : void
    {
    }
}