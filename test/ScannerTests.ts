import { Scanner } from '../src/Scanner'
import { Token } from 'Token';
import { TokenType } from '../src/TokenType'
import assert from 'assert'

describe('Scanner', function () {

    function TestScanner(document: string, tokenTypes: Array<TokenType>, tokenValues: Array<string>) {
        let scanner: Scanner;
        let token: Token;
        let i: number;
        scanner = new Scanner(document);
        i = 0;
        while (true) {
            token = scanner.Scan();
            if (token.type == TokenType.EOF) {
                break;
            } else {
                assert(token.type == tokenTypes[i]);
                if (tokenValues[i] != null) {
                    assert(scanner.Unescape(token.from, token.to) == tokenValues[i]);
                }
                i = i + 1;
            }
        }
        assert(i == tokenTypes.length);
    }

    it('Empty String', function () {
        TestScanner("", [], []);
    });
    it('Simple Text', function () {
        TestScanner("Hello World", [TokenType.TEXT], ["Hello World"]);
    });
    it('Open Brace', function () {
        TestScanner("{", [TokenType.OPEN_BRACE], ["{"]);
    });
    it('Colon', function () {
        TestScanner(":", [TokenType.COLON], [":"]);
    });
    it('Close Brace', function () {
        TestScanner("}", [TokenType.CLOSE_BRACE], ["}"]);
    });
    it('Escaped Open Brace', function () {
        TestScanner("{{", [TokenType.TEXT], ["{"]);
    });
    it('Escaped Colon', function () {
        TestScanner("::", [TokenType.TEXT], [":"]);
    });
    it('Escaped Close Brace', function () {
        TestScanner("}}", [TokenType.TEXT], ["}"]);
    });
    it('Identifier', function () {
        TestScanner("{a12", [TokenType.OPEN_BRACE, TokenType.ID], ["{", "a12"]);
    });
    it('Expression', function () {
        TestScanner("{a12:hello + world}", [TokenType.OPEN_BRACE, TokenType.ID, TokenType.COLON, TokenType.TEXT, TokenType.CLOSE_BRACE], ["{", "a12",":","hello + world", "}"]);
    });
    it('Ends with an ID', function () {
        TestScanner("{aaaa", [TokenType.OPEN_BRACE, TokenType.ID], ["{", "aaaa"]);
    });
});
