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

    private scanner: Scanner;
    private token: Token;

    constructor(s: string) {
        this.scanner = new Scanner(s);
        this.token = this.scanner.Scan();
    }

    public Parse(): ParseResult {
        let elements: Array<IDocumentElement>;
        let errors: Array<string>;
        let element: IDocumentElement | string;
        elements = [];
        errors = [];
        while (this.token.type != TokenType.EOF) {
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
        let s: string;
        let t: string;
        let startLine: number;
        let startColumn: number;
        let endLine: number;
        let endColumn: number;
        if (this.token.type == TokenType.TEXT) {
            s = this.scanner.Unescape(this.token.from, this.token.to);
            this.token = this.scanner.Scan();
            return new TextElement(s);
        } else if (this.token.type == TokenType.OPEN_BRACE) {
            startLine = this.scanner.line;
            startColumn = this.scanner.column;
            this.token = this.scanner.Scan();
            if (this.token.type == TokenType.ID) {
                s = this.scanner.Unescape(this.token.from, this.token.to);
                this.token = this.scanner.Scan();
                if (this.token.type == TokenType.COLON) {
                    this.token = this.scanner.Scan();
                    if (this.token.type == TokenType.TEXT) {
                        let bt = this.scanner.backTicks;
                        t = this.scanner.Unescape(this.token.from, this.token.to);
                        this.token = this.scanner.Scan();
                        if (this.token.type == TokenType.CLOSE_BRACE) {
                            endLine = this.scanner.line;
                            endColumn = this.scanner.column;
                            this.token = this.scanner.Scan();
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
                                return new CellElement(s, t, references, startLine, startColumn - 1, endLine, endColumn - 1);
                            }
                        } else {
                            let error = `} expected at line ${this.scanner.previousLine} column ${this.scanner.previousColumn}.`;
                            this.Panic();
                            return error;
                        }
                    } else {
                        let error = `Expression expected at line ${this.scanner.previousLine} column ${this.scanner.previousColumn}.`;
                        this.Panic();
                        return error;
                    }
                } else if (this.token.type == TokenType.CLOSE_BRACE) {
                    endLine = this.scanner.line;
                    endColumn = this.scanner.column;
                    this.token = this.scanner.Scan();
                    return new CellElement(s, "", [], startLine, startColumn - 1, endLine, endColumn - 1);
                } else {
                    let error = `} or : expected at line ${this.scanner.previousLine} column ${this.scanner.previousColumn}.`;
                    this.Panic();
                    return error;
                }
            } else {
                let error = `Cell identifier expected at line ${this.scanner.previousLine} column ${this.scanner.previousColumn}.`;
                this.Panic();
                return error;
            }
        } else {
            let error = `{ expected at line ${this.scanner.previousLine} column ${this.scanner.previousColumn}.`;
            this.token = this.scanner.Scan();
            return error;
        }
    }

    private Panic() {
        while (true) {
            this.token = this.scanner.Scan();
            if (this.token.type == TokenType.CLOSE_BRACE) {
                this.token = this.scanner.Scan();
                break;
            } else if (this.token.type == TokenType.EOF) {
                break;
            }
        }
    }
}