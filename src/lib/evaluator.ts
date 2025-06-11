import { type ASTNode, NumberLiteral, Identifier, DiceExpression, InfixExpression, PrefixExpression } from './ast';
import type { DieRoll, VariableContext } from './types';

export class Evaluator {
    public detailedRolls: DieRoll[] = [];
    private errors: string[] = [];

    public getErrors = () => this.errors;

    public evaluate(node: ASTNode | null, context: VariableContext): number | null {
        if (!node) return null;
        this.detailedRolls = [];
        this.errors = [];
        return this.evalNode(node, context);
    }

    private evalNode(node: ASTNode, context: VariableContext): number {
        if (node instanceof NumberLiteral) return node.value;
        if (node instanceof Identifier) return this.evalIdentifier(node, context);
        if (node instanceof DiceExpression) return this.evalDiceExpression(node, context);
        if (node instanceof InfixExpression) return this.evalInfixExpression(node.operator, this.evalNode(node.left, context), this.evalNode(node.right, context));
        if (node instanceof PrefixExpression) return this.evalPrefixExpression(node.operator, this.evalNode(node.right, context));
        return 0;
    }
    
    private evalIdentifier(node: Identifier, context: VariableContext): number {
        const value = context[node.value];
        if (value === undefined) {
            this.errors.push(`Undefined variable: ${node.value}`);
            return 0;
        }
        return value;
    }

    private evalPrefixExpression = (op: string, r: number) => (op === "-") ? -r : 0;
    
    // UPDATED: Added cases for the new comparison operators.
    private evalInfixExpression(op: string, l: number, r: number): number {
        switch (op) {
            case '+': return l + r;
            case '-': return l - r;
            case '*': return Math.floor(l * r);
            case '/': return Math.floor(l / r);
            case '>': return l > r ? 1 : 0;
            case '<': return l < r ? 1 : 0;
            case '>=': return l >= r ? 1 : 0;
            case '<=': return l <= r ? 1 : 0;
            default: return 0;
        }
    }

    private evalDiceExpression(node: DiceExpression, context: VariableContext): number {
        const count = this.evalNode(node.count, context);
        const sides = this.evalNode(node.sides, context);
        if (sides <= 0) return 0;
        let currentDetailedRolls: DieRoll[] = [];
        let successCount = 0;

        for (let i = 0; i < count; i++) {
            const initialValue = Math.floor(Math.random() * sides) + 1;
            let finalValue = initialValue;
            let wasRerolled = false;
            if (node.reroll) {
                while (this.checkCondition(finalValue, node.reroll.operator, node.reroll.value)) {
                    wasRerolled = true;
                    finalValue = Math.floor(Math.random() * sides) + 1;
                }
            }
            let isSuccess: boolean | undefined = undefined;
            if (node.success) {
                isSuccess = this.checkCondition(finalValue, node.success.operator, node.success.value);
                if (isSuccess) successCount++;
            }
            currentDetailedRolls.push({ initialValue, finalValue, wasRerolled, isSuccess });
        }
        this.detailedRolls.push(...currentDetailedRolls);
        return node.success ? successCount : currentDetailedRolls.reduce((sum, roll) => sum + roll.finalValue, 0);
    }

    private checkCondition(roll: number, op: string, val: number): boolean {
        switch (op) { case '>': return roll > val; case '<': return roll < val; case '>=': return roll >= val; case '<=': return roll <= val; default: return false; }
    }
}
