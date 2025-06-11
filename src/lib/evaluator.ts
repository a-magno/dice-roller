import { type ASTNode, NumberLiteral, DiceExpression, InfixExpression, PrefixExpression } from './ast';
import type { DieRoll } from './types';

export class Evaluator {
    // This now holds the detailed results for the entire evaluation
    public detailedRolls: DieRoll[] = [];

    public evaluate(node: ASTNode | null): number | null {
        if (!node) return null;
        this.detailedRolls = []; // Reset for each new evaluation
        return this.evalNode(node);
    }

    private evalNode(node: ASTNode): number {
        if (node instanceof NumberLiteral) return node.value;
        if (node instanceof DiceExpression) return this.evalDiceExpression(node);
        if (node instanceof InfixExpression) return this.evalInfixExpression(node.operator, this.evalNode(node.left), this.evalNode(node.right));
        if (node instanceof PrefixExpression) return this.evalPrefixExpression(node.operator, this.evalNode(node.right));
        return 0;
    }
    
    private evalPrefixExpression = (op: string, r: number) => (op === "-") ? -r : 0;
    private evalInfixExpression(op: string, l: number, r: number): number {
        switch (op) { case '+': return l + r; case '-': return l - r; case '*': return Math.floor(l * r); case '/': return Math.floor(l / r); default: return 0; }
    }

    private evalDiceExpression(node: DiceExpression): number {
        const count = this.evalNode(node.count);
        const sides = this.evalNode(node.sides);
        if (sides <= 0) return 0;

        let currentDetailedRolls: DieRoll[] = [];
        let successCount = 0;

        for (let i = 0; i < count; i++) {
            const initialValue = Math.floor(Math.random() * sides) + 1;
            let finalValue = initialValue;
            let wasRerolled = false;

            // Handle rerolls
            if (node.reroll) {
                while (this.checkCondition(finalValue, node.reroll.operator, node.reroll.value)) {
                    wasRerolled = true;
                    finalValue = Math.floor(Math.random() * sides) + 1;
                }
            }

            // Handle success counting
            let isSuccess: boolean | undefined = undefined;
            if (node.success) {
                isSuccess = this.checkCondition(finalValue, node.success.operator, node.success.value);
                if (isSuccess) {
                    successCount++;
                }
            }

            currentDetailedRolls.push({ initialValue, finalValue, wasRerolled, isSuccess });
        }

        // Add this batch of rolls to the main list
        this.detailedRolls.push(...currentDetailedRolls);

        // Return either the sum of final values or the number of successes
        return node.success ? successCount : currentDetailedRolls.reduce((sum, roll) => sum + roll.finalValue, 0);
    }

    private checkCondition(roll: number, op: string, val: number): boolean {
        switch (op) { case '>': return roll > val; case '<': return roll < val; case '>=': return roll >= val; case '<=': return roll <= val; default: return false; }
    }
}