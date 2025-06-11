import { TokenType, Precedence, precedences, type Token } from './types';
import { type Expression, NumberLiteral, Identifier, InfixExpression, PrefixExpression, ComparisonExpression, DiceExpression } from './ast';
import { Lexer } from './lexer';

type PrefixParseFn = () => Expression | null;
type InfixParseFn = (expression: Expression) => Expression | null;

export class Parser {
    private curToken!: Token; private peekToken!: Token;
    private errors: string[] = [];
    private prefixParseFns: Map<TokenType, PrefixParseFn> = new Map();
    private infixParseFns: Map<TokenType, InfixParseFn> = new Map();

    constructor(private lexer: Lexer) {
        this.registerPrefix(TokenType.IDENTIFIER, this.parseIdentifier);
        this.registerPrefix(TokenType.NUMBER, this.parseNumberLiteral);
        this.registerPrefix(TokenType.DICE, this.parseDiceAsPrefix);
        this.registerPrefix(TokenType.LPAREN, this.parseGroupedExpression);
        this.registerPrefix(TokenType.MINUS, this.parsePrefixExpression);

        // Register standard infix operators
        this.registerInfix(TokenType.PLUS, this.parseInfixExpression);
        this.registerInfix(TokenType.MINUS, this.parseInfixExpression);
        this.registerInfix(TokenType.MULTIPLY, this.parseInfixExpression);
        this.registerInfix(TokenType.DIVIDE, this.parseInfixExpression);
        this.registerInfix(TokenType.DICE, this.parseDiceAsInfix);

        // Reroll is a special modifier, not a standard infix operator
        this.registerInfix(TokenType.REROLL, this.parseDiceModifier);
        
        this.nextToken(); this.nextToken();
    }

    public getErrors = () => this.errors;
    private nextToken() { this.curToken = this.peekToken; this.peekToken = this.lexer.nextToken(); }
    private registerPrefix(tokenType: TokenType, fn: PrefixParseFn) { this.prefixParseFns.set(tokenType, fn.bind(this)); }
    private registerInfix(tokenType: TokenType, fn: InfixParseFn) { this.infixParseFns.set(tokenType, fn.bind(this)); }

    // CORRECTED: The main parsing loop is now smarter and handles the ambiguity.
    public parseExpression(precedence: Precedence): Expression | null {
        const prefix = this.prefixParseFns.get(this.curToken.type);
        if (!prefix) {
            this.errors.push(`Cannot parse "${this.curToken.literal}".`);
            return null;
        }
        let leftExp = prefix();

        while (leftExp && this.peekToken.type !== TokenType.EOF && precedence < this.peekPrecedence()) {
            const peekType = this.peekToken.type;
            
            // Check for standard infix operators first
            const infix = this.infixParseFns.get(peekType);
            if (infix) {
                this.nextToken();
                leftExp = infix(leftExp);
                continue;
            }

            // If no standard infix function was found, check for our special comparison case
            if ([TokenType.GREATER_THAN, TokenType.LESS_THAN, TokenType.GREATER_THAN_OR_EQUAL, TokenType.LESS_THAN_OR_EQUAL].includes(peekType)) {
                // CONTEXT CHECK: Is the thing on the left a dice roll that doesn't have a success condition yet?
                if (leftExp instanceof DiceExpression && !leftExp.success) {
                    // If so, treat it as a success counter (dice modifier).
                    this.nextToken();
                    leftExp = this.parseDiceModifier(leftExp);
                } else {
                    // Otherwise, treat it as a general comparison check.
                    this.nextToken();
                    leftExp = this.parseInfixExpression(leftExp);
                }
                continue;
            }

            // If we're here, there's no valid operator for the current precedence level.
            return leftExp;
        }
        return leftExp;
    }

    private parseIdentifier = (): Expression => new Identifier(this.curToken, this.curToken.literal);
    private parseNumberLiteral = (): Expression | null => { const val = parseInt(this.curToken.literal, 10); if (isNaN(val)) { this.errors.push(`Could not parse "${this.curToken.literal}" as int.`); return null; } return new NumberLiteral(this.curToken, val); };
    private parseDiceAsPrefix = (): Expression | null => { const token = this.curToken, count = new NumberLiteral({ type: TokenType.NUMBER, literal: "1" }, 1); this.nextToken(); const sides = this.parseExpression(Precedence.DICE); if (!sides) return null; return new DiceExpression(token, count, sides); };
    
    private parseInfixExpression = (left: Expression): Expression => {
        const token = this.curToken;
        const operator = this.curToken.literal;
        const precedence = this.curPrecedence();
        this.nextToken();
        const right = this.parseExpression(precedence);
        if (!right) {
            this.errors.push("Incomplete expression after operator " + operator);
            return left;
        }
        return new InfixExpression(token, operator, left, right);
    };

    private parseDiceAsInfix = (left: Expression): Expression | null => { const token = this.curToken; this.nextToken(); const sides = this.parseExpression(Precedence.DICE); if (!sides) return null; return new DiceExpression(token, left, sides); };
    private parsePrefixExpression = (): Expression | null => {
        const token = this.curToken;
        this.nextToken();
        const right = this.parseExpression(Precedence.PREFIX);
        if(!right) return null;
        return new PrefixExpression(token, token.literal, right);
    };
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