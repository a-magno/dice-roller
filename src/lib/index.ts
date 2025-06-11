import { Lexer } from './lexer';
import { Parser } from './parser';
import { Evaluator } from './evaluator';
import { DiceExpression } from './ast';
import { Precedence, type DieRoll, type DiceFormatConfig, type RollOutcome, type RollResult } from './types';

const DEFAULT_FORMAT_CONFIG: Required<DiceFormatConfig> = {
    default: '{n}',
    success: '**{n}**',
    failure: '{n}',
    reroll: '~~{n}~~ → {m}',
    separator: ', ',
};

export class DiceRoller {
    public roll(expression: string, formatConfig?: DiceFormatConfig): RollOutcome | null {
        let cleanExpression = expression.trim();
        let title;
        const colonIndex = expression.indexOf(':');
        if (colonIndex > -1) {
            title = expression.substring(0, colonIndex).trim();
            cleanExpression = expression.substring(colonIndex + 1).trim();
        }

        const parser = new Parser(new Lexer(cleanExpression));
        const program = parser.parseExpression(Precedence.LOWEST);
        const errors = parser.getErrors();
        if (errors.length > 0) {
            return { errors };
        }

        if (!program) {
            return { errors: ['Failed to parse the expression.'] };
        }

        const evaluator = new Evaluator();
        const value = evaluator.evaluate(program);

        if (value === null) {
            return { errors: ['Evaluation failed'] };
        }
        
        const detailedRolls = evaluator.detailedRolls;
        const formattedString = this._formatResult(detailedRolls, formatConfig);

        const finalResult: RollResult = {
            title,
            expression: cleanExpression,
            value,
            rolls: detailedRolls.map(r => r.finalValue),
            rerolled: detailedRolls.filter(r => r.wasRerolled).map(r => r.initialValue),
            detailedRolls,
            formattedString,
        };
        
        if (program instanceof DiceExpression && program.success) {
            finalResult.successes = value;
        }

        return finalResult;
    }

    private _formatResult(detailedRolls: DieRoll[], config?: DiceFormatConfig): string {
        const format: Required<DiceFormatConfig> = { ...DEFAULT_FORMAT_CONFIG, ...config };

        if (detailedRolls.length === 0) return '';

        const formattedParts = detailedRolls.map(roll => {
            if (roll.wasRerolled) {
                return format.reroll
                    .replace('{n}', String(roll.initialValue))
                    .replace('{m}', String(roll.finalValue));
            }
            if (roll.isSuccess === true) {
                return format.success.replace('{n}', String(roll.finalValue));
            }
            if (roll.isSuccess === false) {
                return format.failure.replace('{n}', String(roll.finalValue));
            }
            return format.default.replace('{n}', String(roll.finalValue));
        });

        return formattedParts.join(format.separator);
    }
}

// Re-export all types from the central types file
export * from './types';
