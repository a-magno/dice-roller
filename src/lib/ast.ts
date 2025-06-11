import type { Token } from './types';

export interface ASTNode { tokenLiteral(): string; }
export interface Expression extends ASTNode {}

export class NumberLiteral implements Expression { constructor(public token: Token, public value: number) {} tokenLiteral = () => this.token.literal; }
export class InfixExpression implements Expression { constructor(public token: Token, public operator: string, public left: Expression, public right: Expression) {} tokenLiteral = () => this.token.literal; }
export class PrefixExpression implements Expression { constructor(public token: Token, public operator: string, public right: Expression) {} tokenLiteral = () => this.token.literal; }
export class ComparisonExpression implements Expression { constructor(public token: Token, public operator: string, public value: number) {} tokenLiteral = () => this.token.literal; }
export class DiceExpression implements Expression { constructor(public token: Token, public count: Expression, public sides: Expression, public reroll?: ComparisonExpression, public success?: ComparisonExpression) {} tokenLiteral = () => this.token.literal; }
