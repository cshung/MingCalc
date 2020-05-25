import { TokenType } from './TokenType'

export class Token {

    type: TokenType
    from: number;
    to: number;

    constructor(type: TokenType, from: number, to: number) {
        this.type = type;
        this.from = from;
        this.to = to;
    }
}
