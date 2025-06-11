import { TokenType, Precedence, precedences, type Token } from './types';
import { type Expression, NumberLiteral, InfixExpression, PrefixExpression, ComparisonExpression, DiceExpression } from './ast';
import { Lexer } from './lexer';

type PrefixParseFn = () => Expression | null;
type InfixParseFn = (expression: Expression) => Expression | null;

export class Parser {
    private curToken!: Token; private peekToken!: Token;
    private errors: string[] = [];
    private prefixParseFns: Map<TokenType, PrefixParseFn> = new Map();
    private infixParseFns: Map<TokenType, InfixParseFn> = new Map();

    constructor(private lexer: Lexer) {
        this.registerPrefix(TokenType.NUMBER, this.parseNumberLiteral);
        this.registerPrefix(TokenType.DICE, this.parseDiceAsPrefix);
        this.registerPrefix(TokenType.LPAREN, this.parseGroupedExpression);
        this.registerPrefix(TokenType.MINUS, this.parsePrefixExpression);
        this.registerInfix(TokenType.PLUS, this.parseInfixExpression);
        this.registerInfix(TokenType.MINUS, this.parseInfixExpression);
        this.registerInfix(TokenType.MULTIPLY, this.parseInfixExpression);
        this.registerInfix(TokenType.DIVIDE, this.parseInfixExpression);
        this.registerInfix(TokenType.DICE, this.parseDiceAsInfix);
        this.registerInfix(TokenType.REROLL, this.parseDiceModifier);
        this.registerInfix(TokenType.GREATER_THAN, this.parseDiceModifier);
        this.registerInfix(TokenType.LESS_THAN, this.parseDiceModifier);
        this.registerInfix(TokenType.GREATER_THAN_OR_EQUAL, this.parseDiceModifier);
        this.registerInfix(TokenType.LESS_THAN_OR_EQUAL, this.parseDiceModifier);
        this.nextToken(); this.nextToken();
    }

    public getErrors = () => this.errors;
    private nextToken() { this.curToken = this.peekToken; this.peekToken = this.lexer.nextToken(); }
    private registerPrefix(tokenType: TokenType, fn: PrefixParseFn) { this.prefixParseFns.set(tokenType, fn.bind(this)); }
    private registerInfix(tokenType: TokenType, fn: InfixParseFn) { this.infixParseFns.set(tokenType, fn.bind(this)); }

    public parseExpression(precedence: Precedence): Expression | null {
        const prefix = this.prefixParseFns.get(this.curToken.type);
        if (!prefix) { this.errors.push(`No prefix parse function for ${this.curToken.type} found.`); return null; }
        let leftExp = prefix();
        while (leftExp && this.peekToken.type !== TokenType.EOF && precedence < this.peekPrecedence()) {
            const infix = this.infixParseFns.get(this.peekToken.type); if (!infix) return leftExp;
            this.nextToken(); leftExp = infix(leftExp);
        } return leftExp;
    }
    private parseNumberLiteral = (): Expression | null => { const val = parseInt(this.curToken.literal, 10); if (isNaN(val)) { this.errors.push(`Could not parse "${this.curToken.literal}" as int.`); return null; } return new NumberLiteral(this.curToken, val); };
    private parseDiceAsPrefix = (): Expression | null => { const token = this.curToken, count = new NumberLiteral({ type: TokenType.NUMBER, literal: "1" }, 1); this.nextToken(); const sides = this.parseExpression(Precedence.DICE); if (!sides) return null; return new DiceExpression(token, count, sides); };
    private parseInfixExpression = (left: Expression): Expression => new InfixExpression(this.curToken, this.curToken.literal, left, this.parseExpression(this.curPrecedence())!);
    private parseDiceAsInfix = (left: Expression): Expression | null => { const token = this.curToken; this.nextToken(); const sides = this.parseExpression(Precedence.DICE); if (!sides) return null; return new DiceExpression(token, left, sides); };
    private parsePrefixExpression = (): Expression | null => new PrefixExpression(this.curToken, this.curToken.literal, this.parseExpression(Precedence.PREFIX)!);
    private parseGroupedExpression = (): Expression | null => { this.nextToken(); const exp = this.parseExpression(Precedence.LOWEST); if (this.peekToken.type !== TokenType.RPAREN) { this.errors.push(`Expected ')' but got ${this.peekToken.type}`); return null; } this.nextToken(); return exp; };
    private parseDiceModifier = (left: Expression): Expression | null => {
        if (!(left instanceof DiceExpression)) { this.errors.push(`Modifier '${this.curToken.literal}' can only apply to dice.`); return null; }
        const modifierToken = this.curToken, isReroll = modifierToken.type === TokenType.REROLL;
        if (isReroll) { if (![TokenType.LESS_THAN, TokenType.GREATER_THAN, TokenType.LESS_THAN_OR_EQUAL, TokenType.GREATER_THAN_OR_EQUAL].includes(this.peekToken.type)) { this.errors.push(`Reroll 'r' needs a comparison like r<3.`); return null; } this.nextToken(); }
        const compToken = this.curToken; this.nextToken(); const valNode = this.parseExpression(Precedence.DICE);
        if (!(valNode instanceof NumberLiteral)) { this.errors.push("Comparison must be against a number."); return null; }
        const comparison = new ComparisonExpression(compToken, compToken.literal, valNode.value);
        if (isReroll) left.reroll = comparison; else left.success = comparison;
        return left;
    };
    private peekPrecedence = (): Precedence => precedences[this.peekToken.type] || Precedence.LOWEST;
    private curPrecedence = (): Precedence => precedences[this.curToken.type] || Precedence.LOWEST;
}