import { BackTick } from "./BackTick";
import { CellElement } from "./CellElement";
import { IDocumentElement } from "./IDocumentElement";
import { ParseResult } from "./ParseResult";
import { Scanner } from "./Scanner";
import { TextElement } from "./TextElement";
import { Token } from "./Token";
import { TokenType } from "./TokenType";
import { Reference } from "./Reference";

export class Parser {

    private s: Scanner;
    private t: Token;

    constructor(s: string) {
        this.s = new Scanner(s);
        this.t = this.s.Scan();
    }

    public Parse(): ParseResult {
        let elements: Array<IDocumentElement>;
        let errors: Array<string>;
        let element: IDocumentElement | string;
        elements = [];
        errors = [];
        while (this.t.type != TokenType.EOF) {
            element = this.ParseElement();
            if (typeof element == "string") {
                errors.push(element as string);
            }
            else {
                elements.push(element as IDocumentElement);
            }
        }
        return new ParseResult(elements, errors);
    }

    private ParseElement(): IDocumentElement | string {
        // TODO: Complete unit tests for error cases
        // TODO: Make sure line numbers associated with the error is accurate
        let s: string;
        let t: string;
        let sl: number;
        let sc: number;
        let el: number;
        let ec: number;
        if (this.t.type == TokenType.TEXT) {
            s = this.s.Unescape(this.t.from, this.t.to);
            this.t = this.s.Scan();
            return new TextElement(s);
        } else if (this.t.type == TokenType.OPEN_BRACE) {
            sl = this.s.l;
            sc = this.s.c;
            this.t = this.s.Scan();
            if (this.t.type == TokenType.ID) {
                s = this.s.Unescape(this.t.from, this.t.to);
                this.t = this.s.Scan();
                if (this.t.type == TokenType.COLON) {
                    this.t = this.s.Scan();
                    if (this.t.type == TokenType.TEXT) {
                        let bt = this.s.backTicks;
                        t = this.s.Unescape(this.t.from, this.t.to);
                        this.t = this.s.Scan();
                        if (this.t.type == TokenType.CLOSE_BRACE) {
                            el = this.s.l;
                            ec = this.s.c;
                            this.t = this.s.Scan();
                            if (bt.length % 2 == 1) {
                                let orphan: BackTick = bt[bt.length - 1];
                                return `Reference starting at (${orphan.line}, ${orphan.column}) is not closed.`;
                            } else {
                                let references: Array<Reference> = [];
                                for (let i: number = 0; i < bt.length; i += 2) {
                                    let start: BackTick = bt[i];
                                    let end: BackTick = bt[i + 1];
                                    let reference: Reference = new Reference(start.line, start.column, start.position, end.line, end.column, end.position);
                                    references.push(reference);
                                }
                                return new CellElement(s, t, references, sl, sc - 1, el, ec - 1);
                            }
                        } else {
                            let error = `} expected at ${sl} column ${sc}.`;
                            this.Panic();
                            return error;
                        }
                    } else {
                        let error = `expression expected at ${sl} column ${sc}.`;
                        this.Panic();
                        return error;
                    }
                } else if (this.t.type == TokenType.CLOSE_BRACE) {
                    el = this.s.l;
                    ec = this.s.c;
                    this.t = this.s.Scan();
                    return new CellElement(s, "", [], sl, sc - 1, el, ec - 1);
                } else {
                    sl = this.s.pl;
                    sc = this.s.pc;
                    let error: string;
                    if (this.t.type == TokenType.EOF) {
                        error = `EOF unexpected at line ${sl} column ${sc}.`;
                    } else if (this.t.type == TokenType.OPEN_BRACE) {
                        error = `{ unexpected at line ${sl} column ${sc}.`;
                    } else {
                        throw "Unexpected";
                    }
                    this.Panic();
                    return error;
                }
            } else {
                let error = `Cell identifier expected at ${sl} column ${sc}.`;
                this.Panic();
                return error;
            }
        } else {
            sl = this.s.pl;
            sc = this.s.pc;
            let error: string;
            if (this.t.type == TokenType.CLOSE_BRACE) {
                error = `} unexpected at line ${sl} column ${sc}.`;
            } else if (this.t.type == TokenType.COLON) {
                error = `: unexpected at line ${sl} column ${sc}.`;
            } else {
                throw "Unexpected";
            }
            this.t = this.s.Scan();
            return error;
        }
    }

    private Panic() {
        while (true) {
            this.t = this.s.Scan();
            if (this.t.type == TokenType.CLOSE_BRACE) {
                this.t = this.s.Scan();
                break;
            } else if (this.t.type == TokenType.EOF) {
                break;
            }
        }
    }
}