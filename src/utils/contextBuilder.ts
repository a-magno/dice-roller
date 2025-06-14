import { Sheet, Property } from '../types';
import { DiceRoller, VariableContext } from '../lib';

export function buildContext(sheet: Sheet): VariableContext {
    const context: VariableContext = {};
    const roller = new DiceRoller();

    // A list of all properties that still need their values calculated.
    const pendingProperties: { prop: Property; scope: string }[] = [
        ...sheet.globalProperties.map(p => ({ prop: p, scope: 'global' })),
        ...sheet.subSheets.flatMap(ss => ss.properties.map(p => ({ prop: p, scope: ss.id })))
    ];

    const maxPasses = 15;
    let passes = 0;

    // We'll loop until all properties are resolved or we hit the pass limit.
    while (pendingProperties.length > 0 && passes < maxPasses) {
        let resolvedThisPass = false;

        // Iterate backwards so we can safely remove resolved items from the list.
        for (let i = pendingProperties.length - 1; i >= 0; i--) {
            const { prop, scope } = pendingProperties[i];
            
            // Create a temporary context for this specific evaluation.
            // It includes all globally resolved values.
            const evalContext: VariableContext = { ...context };

            // If this property is on a sub-sheet, add all resolved properties
            // from that same sub-sheet as local aliases.
            if (scope !== 'global') {
                const subSheet = sheet.subSheets.find(s => s.id === scope);
                if (subSheet) {
                    subSheet.properties.forEach(siblingProp => {
                        const siblingKey = `${scope}.${siblingProp.id}`;
                        if (context[siblingKey] !== undefined) {
                            evalContext[siblingProp.id] = context[siblingKey];
                        }
                    });
                }
            }
            
            // Attempt to roll the expression with the current context.
            const result = roller.roll(prop.expression, { context: evalContext });

            // If the roll is successful, it means all dependencies were met.
            if (result && 'value' in result) {
                const contextKey = scope === 'global' ? prop.id : `${scope}.${prop.id}`;
                context[contextKey] = result.value;
                
                // Remove from pending list and mark progress.
                pendingProperties.splice(i, 1);
                resolvedThisPass = true;
            }
        }

        // If a full pass completes with no new resolved properties, we have a circular dependency.
        if (!resolvedThisPass && pendingProperties.length > 0) {
            console.warn("Could not resolve all properties. Check for circular dependencies.", pendingProperties.map(p => p.prop.name));
            break;
        }

        passes++;
    }

    // After resolving everything, create a final context for the active sheet
    const finalContext = { ...context };
    const activeSheet = sheet.subSheets.find(ss => ss.id === sheet.activeSubSheetId);
    if(activeSheet) {
        activeSheet.properties.forEach(p => {
            const key = `${activeSheet.id}.${p.id}`;
            if(finalContext[key] !== undefined) {
                finalContext[p.id] = finalContext[key]; // Create the final local alias
            }
        });
    }

    return finalContext;
}
