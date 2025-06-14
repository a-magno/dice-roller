import { Action, Property } from '../types';
import { VariableContext } from '../lib/types'

/**
 * Prepares an action for rolling by modifying its expression based on active qualities.
 * @param action The action to be performed.
 * @param allProperties The list of all properties on the character sheet to search for qualities.
 * @param context The fully resolved variable context.
 * @returns An object with the final, modified expression and a description of modifications.
 */
export function processAction(
    action: Action, 
    allProperties: Property[], 
    context: VariableContext
): { finalExpression: string; modifications: string[] } {
    
    let finalExpression = action.rollExpression;
    const modifications: string[] = [];

    // Find all active "Quality" properties
    const qualities = allProperties.filter(p => p.usage === 'Quality');

    // Check if any of the action's required quality tags are met by the character's qualities
    action.qualityTags.forEach(requiredTag => {
        qualities.forEach(quality => {
            if (quality.tags.includes(requiredTag)) {
                // A quality matches! Get its rank (value).
                const qualityRank = context[quality.id]; // Qualities are simple, non-compound properties

                if (typeof qualityRank === 'number' && qualityRank !== 0) {
                    // Modify the expression. For now, we'll just append it.
                    const modification = `+ ${quality.id}`;
                    finalExpression += ` ${modification}`;
                    modifications.push(`Used '${quality.name}' Quality (Rank ${qualityRank})`);
                }
            }
        });
    });

    return { finalExpression, modifications };
}
