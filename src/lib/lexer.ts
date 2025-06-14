import { TokenType, type Token } from './types';

export class Lexer {
    private position: number = 0;
    private readPosition: number = 0;
    private ch: string = '';

    constructor(private input: string) { this.readChar(); }

    private readChar() { this.ch = this.readPosition >= this.input.length ? '' : this.input[this.readPosition]; this.position = this.readPosition; this.readPosition += 1; }
    private peekChar() { return this.readPosition >= this.input.length ? '' : this.input[this.readPosition]; }
    private skipWhitespace() { while (/\s/.test(this.ch)) this.readChar(); }

    private isLetter(char: string): boolean { return ('a' <= char && char <= 'z') || ('A' <= char && char <= 'Z') || char === '_'; }
    // UPDATED: Now includes '.' to allow for 'sheet.property' syntax
    private isIdentifierChar(char: string): boolean { return this.isLetter(char) || /\d/.test(char) || char === '.';}
    
    private readIdentifier(): string { const start = this.position; while (this.isIdentifierChar(this.ch)) { this.readChar(); } return this.input.substring(start, this.position); }
    private readNumber(): string { const start = this.position; while (/\d/.test(this.ch)) { this.readChar(); } return this.input.substring(start, this.position); }

    public nextToken(): Token {
        this.skipWhitespace(); let token: Token;
        switch (this.ch) {
            case '+': token = { type: TokenType.PLUS, literal: this.ch }; break;
            case '-': token = { type: TokenType.MINUS, literal: this.ch }; break;
            case '*': token = { type: TokenType.MULTIPLY, literal: this.ch }; break;
            case '/': token = { type: TokenType.DIVIDE, literal: this.ch }; break;
            case 'd': case 'D': token = { type: TokenType.DICE, literal: 'd' }; break;
            case 'r': case 'R': token = { type: TokenType.REROLL, literal: 'r' }; break;
            case '(': token = { type: TokenType.LPAREN, literal: this.ch }; break;
            case ')': token = { type: TokenType.RPAREN, literal: this.ch }; break;
            case '>': token = this.peekChar() === '=' ? (this.readChar(), { type: TokenType.GREATER_THAN_OR_EQUAL, literal: '>=' }) : { type: TokenType.GREATER_THAN, literal: '>' }; break;
            case '<': token = this.peekChar() === '=' ? (this.readChar(), { type: TokenType.LESS_THAN_OR_EQUAL, literal: '<=' }) : { type: TokenType.LESS_THAN, literal: '<' }; break;
            case '': token = { type: TokenType.EOF, literal: "" }; break;
            default:
                if (this.isLetter(this.ch)) { return { type: TokenType.IDENTIFIER, literal: this.readIdentifier() }; }
                if (/\d/.test(this.ch)) { return { type: TokenType.NUMBER, literal: this.readNumber() }; }
                token = { type: TokenType.ILLEGAL, literal: this.ch };
        }
        this.readChar(); return token;
    }
}