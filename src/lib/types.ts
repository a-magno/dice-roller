export enum TokenType {
    ILLEGAL = "ILLEGAL", EOF = "EOF", NUMBER = "NUMBER", IDENTIFIER = "IDENTIFIER",
    PLUS = "+", MINUS = "-", MULTIPLY = "*", DIVIDE = "/",
    DICE = "d", REROLL = "r",
    GREATER_THAN = ">", LESS_THAN = "<", GREATER_THAN_OR_EQUAL = ">=", LESS_THAN_OR_EQUAL = "<=",
    LPAREN = "(", RPAREN = ")",
}

export interface Token { type: TokenType; literal: string; }
// ADDED: A new precedence level for comparisons
export const enum Precedence { LOWEST = 1, COMPARE = 2, SUM = 3, PRODUCT = 4, DICE = 5, PREFIX = 6, CALL = 7 }

// UPDATED: Precedences for comparison and arithmetic operators adjusted
export const precedences: { [key in TokenType]?: Precedence } = {
    [TokenType.GREATER_THAN]: Precedence.COMPARE,
    [TokenType.LESS_THAN]: Precedence.COMPARE,
    [TokenType.GREATER_THAN_OR_EQUAL]: Precedence.COMPARE,
    [TokenType.LESS_THAN_OR_EQUAL]: Precedence.COMPARE,
    [TokenType.PLUS]: Precedence.SUM,
    [TokenType.MINUS]: Precedence.SUM,
    [TokenType.MULTIPLY]: Precedence.PRODUCT,
    [TokenType.DIVIDE]: Precedence.PRODUCT,
    [TokenType.DICE]: Precedence.DICE,
    [TokenType.REROLL]: Precedence.DICE, // Reroll still modifies dice directly
};

export type VariableContext = { [key: string]: number };
export interface DieRoll { initialValue: number; finalValue: number; isSuccess?: boolean; wasRerolled: boolean; }
export interface DiceFormatConfig { default?: string; success?: string; failure?: string; reroll?: string; separator?: string; }
export interface RollResult { title?: string; expression: string; value: number; successes?: number; rolls: number[]; rerolled: number[]; detailedRolls: DieRoll[]; formattedString?: string; }
export type RollOutcome = RollResult | { errors: string[] };