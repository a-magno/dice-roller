export enum TokenType {
    ILLEGAL = "ILLEGAL", EOF = "EOF", NUMBER = "NUMBER", PLUS = "+", MINUS = "-",
    MULTIPLY = "*", DIVIDE = "/", DICE = "d", REROLL = "r", GREATER_THAN = ">",
    LESS_THAN = "<", GREATER_THAN_OR_EQUAL = ">=", LESS_THAN_OR_EQUAL = "<=",
    LPAREN = "(", RPAREN = ")",
}

export interface Token { type: TokenType; literal: string; }

export const enum Precedence { LOWEST = 1, SUM = 2, PRODUCT = 3, DICE = 4, PREFIX = 5 }

export const precedences: { [key in TokenType]?: Precedence } = {
    [TokenType.PLUS]: Precedence.SUM, [TokenType.MINUS]: Precedence.SUM,
    [TokenType.MULTIPLY]: Precedence.PRODUCT, [TokenType.DIVIDE]: Precedence.PRODUCT,
    [TokenType.DICE]: Precedence.DICE, [TokenType.REROLL]: Precedence.DICE,
    [TokenType.GREATER_THAN]: Precedence.DICE, [TokenType.LESS_THAN]: Precedence.DICE,
    [TokenType.GREATER_THAN_OR_EQUAL]: Precedence.DICE, [TokenType.LESS_THAN_OR_EQUAL]: Precedence.DICE,
};

// NEW: Holds the details of a single die's roll
export interface DieRoll {
    initialValue: number;
    finalValue: number;
    isSuccess?: boolean;
    wasRerolled: boolean;
}

// NEW: Configuration for the output format
export interface DiceFormatConfig {
    default?: string;     // e.g., "{n}"
    success?: string;     // e.g., "**{n}**"
    failure?: string;     // e.g., "_{n}_"
    reroll?: string;      // e.g., "~~{n}~~ → {m}"
    separator?: string;   // e.g., " + "
}

// UPDATED: The final result object is now richer
export interface RollResult {
    title?: string;
    expression: string;
    value: number;
    successes?: number;
    rolls: number[]; // Final numeric values of each die
    rerolled: number[]; // Initial values of any dice that were rerolled
    detailedRolls: DieRoll[]; // The full data for each die
    formattedString?: string; // The final markdown-friendly string
}

// MOVED HERE: This union type now lives with all other related types.
export type RollOutcome = RollResult | { errors: string[] };
