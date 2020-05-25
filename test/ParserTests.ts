import { CellElement } from '../src/CellElement';
import { IDocumentElement } from '../src/IDocumentElement';
import { Parser } from '../src/Parser'
import { ParseResult } from '../src/ParseResult';
import { TextElement } from '../src/TextElement';
import assert from 'assert'

describe('Parser', function () {

    function TestParser(document: string, elements: Array<IDocumentElement>, errors: Array<string>) {
        let parser: Parser;
        let actual: ParseResult;
        let i: number;
        parser = new Parser(document);
        actual = parser.Parse();
        assert(actual.elements.length == elements.length);
        for (i = 0; i < actual.elements.length; i++) {
            assert(Equals(actual.elements[i], elements[i]));
        }
        assert(actual.errors.length == errors.length);
        for (i = 0; i < actual.errors.length; i++) {
            assert(actual.errors[i] == errors[i]);
        }
    }

    function Equals(left: IDocumentElement, right: IDocumentElement): boolean {
        if ((left instanceof TextElement) && (right instanceof TextElement)) {
            return (left as TextElement).s == (right as TextElement).s;
        } else if ((left instanceof CellElement) && (right instanceof CellElement)) {
            return ((left as CellElement).name == (right as CellElement).name) && ((left as CellElement).value == (right as CellElement).value);
        }
        return false;
    }

    it('Empty String', function () {
        TestParser("", [], []);
    });
    it('Simple Text', function () {
        TestParser("Hello World", [new TextElement("Hello World")], []);
    });
    it('Simple Cell', function () {
        TestParser("{a}", [new CellElement("a", "", [])], []);
    });
    it('Complex Cell', function () {
        TestParser("{a:1}", [new CellElement("a", "1", [])], []);
    });
    it('Unclosed Reference', function () {
        TestParser("{cell:`a}", [], ["Reference starting at (1, 7) is not closed."]);
    });
    it('Example', function () {
        TestParser("The sum of {a} and {b} is {c:a+b}", [
            new TextElement("The sum of "),
            new CellElement("a", "", []),
            new TextElement(" and "),
            new CellElement("b", "", []),
            new TextElement(" is "),
            new CellElement("c", "a+b", [])
        ], []);
    });
    it('Close brace unexpected', function () {
        TestParser("Hello World\n}Cruel World", [new TextElement("Hello World\n"), new TextElement("Cruel World")], ["} unexpected at line 2 column 1."]);
    });
    it('Colon unexpected', function () {
        TestParser("Hello World\n:Cruel World", [new TextElement("Hello World\n"), new TextElement("Cruel World")], [": unexpected at line 2 column 1."]);
    });
    it('Missing ID', function () {
        TestParser("Hello {:} World", [new TextElement("Hello "), new TextElement(" World")], ["Cell identifier expected at 1 column 8."]);
    });
    it('Unexpected EOF', function () {
        TestParser("{a", [], ["EOF unexpected at line 1 column 2."]);
    });
    it('Unexpected Open Brace', function () {
        TestParser("{a{", [], ["{ unexpected at line 1 column 3."]);
    });
});
