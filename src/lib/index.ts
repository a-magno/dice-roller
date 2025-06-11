import { Lexer } from './lexer';
import { Parser } from './parser';
import { Evaluator } from './evaluator';
import { type ASTNode, DiceExpression, InfixExpression, NumberLiteral, PrefixExpression, Identifier } from './ast';
import { Precedence, type DieRoll, type DiceFormatConfig, type RollOutcome, type RollResult, type VariableContext } from './types';

const DEFAULT_FORMAT_CONFIG: Required<DiceFormatConfig> = { default: '{n}', success: '**{n}**', failure: '{n}', reroll: '~~{n}~~ → {m}', separator: ' + ', };

export interface RollOptions {
    formatConfig?: DiceFormatConfig;
    context?: VariableContext;
}

export class DiceRoller {
    public roll(expression: string, options?: RollOptions): RollOutcome | null {
        let cleanExpression = expression.trim(); let title;
        const colonIndex = expression.indexOf(':');
        if (colonIndex > -1) { title = expression.substring(0, colonIndex).trim(); cleanExpression = expression.substring(colonIndex + 1).trim(); }

        const parser = new Parser(new Lexer(cleanExpression));
        const program = parser.parseExpression(Precedence.LOWEST);
        let errors = parser.getErrors();
        if (errors.length > 0) { return { errors }; }
        if (!program) { return { errors: ['Failed to parse the expression.'] }; }

        const evaluator = new Evaluator();
        const context = options?.context ?? {};
        const value = evaluator.evaluate(program, context);
        errors = errors.concat(evaluator.getErrors());
        if (errors.length > 0) { return { errors }; }
        if (value === null) { return { errors: ['Evaluation failed'] }; }
        
        // The detailed rolls are now treated as a "queue" we can pull from during formatting
        const detailedRollsQueue = [...evaluator.detailedRolls];
        const formattedString = this._buildFormattedString(program, detailedRollsQueue, context, options?.formatConfig);

        const finalResult: RollResult = {
            title, expression: cleanExpression, value,
            rolls: evaluator.detailedRolls.map(r => r.finalValue),
            rerolled: evaluator.detailedRolls.filter(r => r.wasRerolled).map(r => r.initialValue),
            detailedRolls: evaluator.detailedRolls, formattedString,
        };
        
        if (program instanceof DiceExpression && program.success) { finalResult.successes = value; }
        return finalResult;
    }

    // FIXED: This new recursive function builds a complete breakdown of the entire expression tree.
    private _buildFormattedString(node: ASTNode, detailedRolls: DieRoll[], context: VariableContext, config?: DiceFormatConfig): string {
        const format: Required<DiceFormatConfig> = { ...DEFAULT_FORMAT_CONFIG, ...config };

        if (node instanceof NumberLiteral) {
            return String(node.value);
        }
        if (node instanceof Identifier) {
            return String(context[node.value] ?? `(undefined ${node.value})`);
        }
        if (node instanceof PrefixExpression) {
            return `${node.operator}${this._buildFormattedString(node.right, detailedRolls, context, config)}`;
        }
        if (node instanceof InfixExpression) {
            const left = this._buildFormattedString(node.left, detailedRolls, context, config);
            const right = this._buildFormattedString(node.right, detailedRolls, context, config);
            return `(${left} ${node.operator} ${right})`;
        }
        if (node instanceof DiceExpression) {
            // This is the key: we determine how many dice this node represents
            // For simplicity, we re-evaluate just the "count" part of the AST.
            const countEvaluator = new Evaluator();
            const count = countEvaluator.evaluate(node.count, context) ?? 1;
            
            // Then we pull that many dice from the front of our results queue
            const diceForThisNode = detailedRolls.splice(0, count);

            const formattedParts = diceForThisNode.map(roll => {
                if (roll.wasRerolled) { return format.reroll.replace('{n}', String(roll.initialValue)).replace('{m}', String(roll.finalValue)); }
                if (roll.isSuccess === true) { return format.success.replace('{n}', String(roll.finalValue)); }
                if (roll.isSuccess === false) { return format.failure.replace('{n}', String(roll.finalValue)); }
                return format.default.replace('{n}', String(roll.finalValue));
            });

            if (formattedParts.length === 0) return '(No dice rolled)';
            
            return `(${formattedParts.join(format.separator)})`;
        }

        return '';
    }
}

export * from './types';