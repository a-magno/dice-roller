// ========================================================================
//
//          --- DATA-DRIVEN CHARACTER SHEET ENGINE ---
//
// This file contains a complete, self-contained, data-driven engine for
// creating and managing character sheets for complex TTRPGs or video games.
//
// It is designed to be:
// - Data-Driven: Characters and game rules are defined as plain data
//   (like JSON), making them easy to create, store, and share.
// - Modular: Abilities are "Properties" (stats, qualities, actions, etc.)
//   that can be nested and equipped into "Slots" on a character.
// - Dynamic: It features a powerful Point-Buy system for character
//   creation and advancement, and uses math.js for safe, on-the-fly
//   formula evaluation.
//
// ========================================================================


// --- TYPE DECLARATIONS & DATA INTERFACES ---

// This tells TypeScript that a 'math' object will be available globally,
// which is true when using the math.js CDN link.
declare const math: any;

/** Defines the optional behaviors of a property within the library UI. */
interface ILibraryBehaviors {
    searchable?: boolean;
    fillable?: boolean;
}

/** The foundational interface for all "pluggable" components in the system. */
interface IPropertyData {
    id: string;
    name: string;
    description?: string;
    tags?: string[];
    propertyType: 'statistic' | 'quality' | 'action' | 'effect' | 'slot' | 'trigger' | 'constant' | 'utility' | 'folder' | 'pointBuy';
    /** A list of child property IDs that are activated when this property is activated. */
    children?: string[];
    /** If true, this property should be hidden from standard UI views. */
    hidden?: boolean;
    libraryBehaviors?: ILibraryBehaviors;
    /** An array of formula strings that must all evaluate to true for this property to be equipped. */
    fillConditions?: string[];
}

/** Defines a modification to a statistic. */
interface IModifierData {
    statKey: string;
    value: string | number;
    type: 'additive' | 'multiplicative';
    source?: string;
    condition?: string;
}

/** Defines a temporary or permanent effect (e.g., a buff, debuff, or passive aura). */
interface IEffectData extends IPropertyData {
    condition: any;
    propertyType: 'effect';
    modifiers: IModifierData[];
    duration: number;
}

/** Defines an action a character can take. */
interface IActionData extends IPropertyData {
    propertyType: 'action';
    execute: (self: EntitySheet, target?: EntitySheet, scope?: any) => void;
}

/** Defines a character statistic. */
interface IStatisticData extends IPropertyData {
    propertyType: 'statistic';
    baseValue?: number;
    formula?: string;
}

/** Defines a "Point Buy" program for character creation or advancement. */
interface IPointBuyData extends IPropertyData {
    propertyType: 'pointBuy';
    budgetStat: string;
    targetStats: string[];
    costs: number[];
}

/** Defines a slot that can hold other properties. */
interface ISlotData extends IPropertyData {
    propertyType: 'slot';
    capacity: number;
    accepts: {
        propertyType?: string | string[];
        tags?: { all?: string[]; any?: string[]; none?: string[]; };
    };
    /** Note: `equipped` is a runtime state, not defined in the library data. */
    equipped?: string[];
}

/** Defines the "chassis" or base template for an entity. */
interface IEntityData {
    id: string;
    name: string;
    type: 'human' | 'digimon' | 'enemy';
    stats: IStatisticData[];
    slots: ISlotData[];
}


// --- CORE ENGINE CLASSES ---

/**
 * The Library holds all master copies of game components (Properties).
 * It acts as a central database from which characters draw their abilities.
 */
export class Library {
    private properties: Map<string, IPropertyData> = new Map();

    /**
     * @param data - The raw library data.
     * @param data.properties - An array of all properties in the library.
     */
    constructor(data: { properties: IPropertyData[] }) {
        data.properties.forEach(p => this.properties.set(p.id, p));
    }

    /**
     * Retrieves a property from the library by its unique ID.
     * @param id - The ID of the property to get.
     * @returns The property data or undefined if not found.
     */
    getProperty(id: string): IPropertyData | undefined {
        return this.properties.get(id);
    }
}

/**
 * Represents a single entity on the sheet and manages its stats, slots, and active properties.
 * In a larger application, this would be an abstract class extended by more specific types.
 */
export class EntitySheet {
    public id: string;
    public name: string;
    public type: string;
    public characterSheet: CharacterSheet;
    
    protected baseStats: Map<string, IStatisticData> = new Map();
    public slots: Map<string, ISlotData> = new Map();
    public activeProperties: Map<string, { property: IPropertyData, sourceId: string }> = new Map();
    public pointBuyModifiers: IModifierData[] = [];

    /**
     * @param data - The base "chassis" data for this entity.
     * @param parentSheet - A reference to the main character sheet.
     */
    constructor(data: IEntityData, parentSheet: CharacterSheet) {
        this.id = data.id;
        this.name = data.name;
        this.type = data.type;
        this.characterSheet = parentSheet;

        data.stats.forEach(s => this.activateProperty(s, s.id));
        data.slots.forEach(s => this.activateProperty(s, s.id));
    }

    /**
     * Equips a property from the library into a specified slot.
     * @param propertyId - The ID of the property to equip.
     * @param slotId - The ID of the slot to equip into.
     * @returns True if the operation was successful.
     */
    equip(propertyId: string, slotId: string): boolean {
        const property = this.characterSheet.library.getProperty(propertyId);
        if (!property) { console.error(`Property "${propertyId}" not in library.`); return false; }

        const slot = this.slots.get(slotId);
        if (!slot) { console.error(`Slot "${slotId}" not on ${this.name}.`); return false; }
        if (slot.equipped!.length >= slot.capacity) { console.error(`Slot "${slotId}" is full.`); return false; }
        
        slot.equipped!.push(property.id);
        this.activateProperty(property, property.id);
        console.log(`Equipped "${property.name}" to slot "${slotId}".`);
        return true;
    }

    /**
     * Unequips a property from a slot and deactivates it and its children.
     * @param propertyId - The ID of the property to unequip.
     * @param slotId - The ID of the slot it's in.
     * @returns True if the operation was successful.
     */
    unequip(propertyId: string, slotId: string): boolean {
        const slot = this.slots.get(slotId);
        if (!slot || !slot.equipped!.includes(propertyId)) { return false; }
        if (!this.canDeactivate(propertyId)) { return false; }
        this.deactivateProperty(propertyId);
        slot.equipped = slot.equipped!.filter(id => id !== propertyId);
        console.log(`Unequipped "${this.characterSheet.library.getProperty(propertyId)?.name}" from slot "${slotId}".`);
        return true;
    }

    /**
     * Recursively checks if a property and its children can be safely deactivated.
     * @param propertyId - The ID of the property to check.
     * @returns True if deactivation is safe.
     */
    canDeactivate(propertyId: string): boolean {
        const property = this.activeProperties.get(propertyId)?.property;
        if (!property) return true;
        if (property.children) {
            for (const childId of property.children) {
                if (!this.canDeactivate(childId)) return false;
            }
        }
        if (property.propertyType === 'slot') {
            const slot = this.slots.get(property.id);
            if (slot && slot.equipped!.length > 0) {
                console.error(`Cannot deactivate "${property.name}" because its provided slot is in use.`);
                return false;
            }
        }
        return true;
    }

    /**
     * Recursively activates a property and all of its children.
     * @param property - The property object to activate.
     * @param sourceId - The ID of the property that granted this one.
     */
    activateProperty(property: IPropertyData, sourceId: string): void {
        if (this.activeProperties.has(property.id)) return;
        this.activeProperties.set(property.id, { property, sourceId });
        
        if (property.propertyType === 'statistic') {
            this.baseStats.set(property.id, property as IStatisticData);
        } else if (property.propertyType === 'slot') {
            this.slots.set(property.id, { ...(property as ISlotData), equipped: [] });
        }
        
        property.children?.forEach(childId => {
            const childProp = this.characterSheet.library.getProperty(childId);
            if (childProp) this.activateProperty(childProp, property.id);
        });
    }
    
    /**
     * Recursively deactivates a property and all of its children.
     * @param propertyId - The ID of the property to deactivate.
     */
    deactivateProperty(propertyId: string): void {
        const property = this.activeProperties.get(propertyId)?.property;
        if (!property) return;
        property.children?.forEach(childId => this.deactivateProperty(childId));
        
        if (property.propertyType === 'statistic') {
            this.baseStats.delete(property.id);
        } else if (property.propertyType === 'slot') {
            this.slots.delete(property.id);
        }
        
        this.activeProperties.delete(propertyId);
    }

    /**
     * Handles the logic for spending currency from a Point-Buy program.
     * @param pointBuyId - The ID of the active PointBuy property.
     * @param targetStatId - The ID of the stat to improve.
     * @returns True if the purchase was successful.
     */
    purchaseStatPoint(pointBuyId: string, targetStatId: string): boolean {
        const pointBuyProp = this.activeProperties.get(pointBuyId)?.property as IPointBuyData | undefined;
        if (!pointBuyProp || pointBuyProp.propertyType !== 'pointBuy') return false;
        if (!pointBuyProp.targetStats.includes(targetStatId)) return false;

        const budgetStatData = this.baseStats.get(pointBuyProp.budgetStat);
        if (!budgetStatData) return false;
        let budget = this.getStatisticValue(pointBuyProp.budgetStat);

        const sourceId = `pointbuy-${pointBuyId}-${targetStatId}`;
        const existingModifier = this.pointBuyModifiers.find(m => m.source === sourceId);
        const currentRank = existingModifier ? (existingModifier.value as number) : 0;

        if (currentRank >= pointBuyProp.costs.length) return false;
        const cost = pointBuyProp.costs[currentRank];
        if (budget < cost) return false;

        const costModifier: IEffectData = {
            id: `cost-${sourceId}-${currentRank + 1}`, propertyType: 'effect', name: `Cost: Rank ${currentRank + 1}`, duration: Infinity, modifiers: [{ statKey: pointBuyProp.budgetStat, value: -cost, type: 'additive', source: 'PointBuyCost' }],
            condition: undefined
        };
        this.activateProperty(costModifier, costModifier.id);

        if (existingModifier) {
            (existingModifier.value as number)++;
        } else {
            this.pointBuyModifiers.push({ statKey: targetStatId, value: 1, type: 'additive', source: sourceId });
        }
        return true;
    }
    
    /**
     * Calculates the final, modified value of a statistic.
     * @param statId - The ID of the stat to calculate.
     * @param calculationCache - Internal cache to prevent infinite recursion.
     * @returns The final calculated value.
     */
    getStatisticValue(statId: string, calculationCache = new Map<string, number>()): number {
        if (calculationCache.has(statId)) return calculationCache.get(statId)!;
        const statData = this.baseStats.get(statId);
        if (!statData) return 0;

        const scope: any = {};
        this.baseStats.forEach(stat => {
            Object.defineProperty(scope, stat.id, { get: () => this.getStatisticValue(stat.id, calculationCache), enumerable: true, configurable: true });
        });

        let value = statData.baseValue || 0;
        if (statData.formula) value = this._evaluate(statData.formula, scope);
        
        const allModifiers = this.getActiveModifiers(scope).concat(this.pointBuyModifiers);
        const additiveTotal = allModifiers
            .filter(m => m.statKey === statId && m.type === 'additive')
            .reduce((sum, mod) => sum + this._evaluate(mod.value, scope), 0);
        value += additiveTotal;

        const finalValue = Math.floor(value);
        calculationCache.set(statId, finalValue);
        return finalValue;
    }

    /**
     * Gathers all modifiers from currently active effects.
     * @param scope - The evaluation scope for checking modifier conditions.
     * @returns An array of active modifiers.
     */
    getActiveModifiers(scope: any): IModifierData[] {
        const modifiers: IModifierData[] = [];
        this.activeProperties.forEach(({property}) => {
            if (property.propertyType === 'effect') {
                 const p = property as IEffectData;
                 const conditionMet = !p.condition || this._evaluate(p.condition, scope);
                 if (conditionMet) modifiers.push(...p.modifiers);
            }
        });
        return modifiers;
    }

     // NEW: Public method to safely get all base statistics
    public getAllStatistics(): IStatisticData[] {
        return Array.from(this.baseStats.values());
    }

    /**
     * Safely evaluates a formula string using math.js.
     * @param formula - The formula to evaluate.
     * @param scope - The context for the evaluation.
     * @returns The result of the calculation.
     */
    _evaluate(formula: string | number, scope: any): any {
        if (typeof formula === 'number') return formula;
        try { return math.evaluate(formula, scope); } catch (e) { return 0; }
    }
}

/**
 * The top-level container for the entire character sheet, holding all entities.
 */
export class CharacterSheet {
    public entities: Map<string, EntitySheet> = new Map();
    public library: Library;

    constructor(library: Library, entityData: IEntityData[]) {
        this.library = library;
        entityData.forEach(data => {
            const entity = new EntitySheet(data, this);
            this.entities.set(data.id, entity);
        });
    }
    getEntity(id: string): EntitySheet | undefined { return this.entities.get(id); }
}

/**
 * A test function to demonstrate the engine's capabilities.
 */
// function runTest() {
//     console.log("--- Initializing Engine with Hina & Dracomon ---");

//     const gameLibrary = new Library({
//         properties: [
//             { id: "human-creation-buy", propertyType: "pointBuy", name: "Human Creation Point Buy", budgetStat: "creationPoints", targetStats: ["agility", "body", "charisma", "intelligence", "willpower", "dodge", "fight", "stealth", "athletics", "endurance", "featsOfStrength", "manipulate", "perform", "persuasion", "computer", "survival", "knowledge", "perception", "decipherIntent", "bravery"], costs: [1, 1, 1, 1, 2, 2, 2, 3, 3, 4] },
//             { id: "dodge", propertyType: "statistic", name: "- Dodge", baseValue: 0 },
//             { id: "fight", propertyType: "statistic", name: "- Fight", baseValue: 0 },
//             { id: "stealth", propertyType: "statistic", name: "- Stealth", baseValue: 0 },
//             { id: "athletics", propertyType: "statistic", name: "- Athletics", baseValue: 0 },
//             { id: "endurance", propertyType: "statistic", name: "- Endurance", baseValue: 0 },
//             { id: "featsOfStrength", propertyType: "statistic", name: "- Feats of Strength", baseValue: 0 },
//             { id: "manipulate", propertyType: "statistic", name: "- Manipulate", baseValue: 0 },
//             { id: "perform", propertyType: "statistic", name: "- Perform", baseValue: 0 },
//             { id: "persuasion", propertyType: "statistic", name: "- Persuasion", baseValue: 0 },
//             { id: "computer", propertyType: "statistic", name: "- Computer", baseValue: 0 },
//             { id: "survival", propertyType: "statistic", name: "- Survival", baseValue: 0 },
//             { id: "knowledge", propertyType: "statistic", name: "- Knowledge", baseValue: 0 },
//             { id: "perception", propertyType: "statistic", name: "- Perception", baseValue: 0 },
//             { id: "decipherIntent", propertyType: "statistic", name: "- Decipher Intent", baseValue: 0 },
//             { id: "bravery", propertyType: "statistic", name: "- Bravery", baseValue: 0 },
//             { id: "woundBoxCount", propertyType: "statistic", name: "Wound Box Count", formula: "body" },
//             { id: "speed", propertyType: "statistic", name: "Speed/Movement", formula: "agility + 2" },
//             { id: "armor", propertyType: "statistic", name: "Armor", formula: "body + endurance" },
//         ]
//     });

//     const characterData: IEntityData[] = [{
//         id: "hina", name: "Hina", type: "human",
//         stats: [
//             { id: "creationPoints", propertyType: "statistic", name: "Creation Points", baseValue: 28 },
//             { id: "agility", propertyType: "statistic", name: "Agility", baseValue: 0, children: ["dodge", "fight", "stealth"] },
//             { id: "body", propertyType: "statistic", name: "Body", baseValue: 0, children: ["athletics", "endurance", "featsOfStrength"] },
//             { id: "charisma", propertyType: "statistic", name: "Charisma", baseValue: 0, children: ["manipulate", "perform", "persuasion"] },
//             { id: "intelligence", propertyType: "statistic", name: "Intelligence", baseValue: 0, children: ["computer", "survival", "knowledge"] },
//             { id: "willpower", propertyType: "statistic", name: "Willpower", baseValue: 0, children: ["perception", "decipherIntent", "bravery"] }
//         ],
//         slots: []
//     }];

//     const playerSheet = new CharacterSheet(gameLibrary, characterData);
//     const hina = playerSheet.getEntity('hina');
//     if (!hina) return;

//     hina.activateProperty(gameLibrary.getProperty('human-creation-buy')!, 'human-creation-buy');
//     for(let i=0; i<4; i++) hina.purchaseStatPoint('human-creation-buy', 'agility');
//     // ... more purchases
    
//     console.log(hina.getStatisticValue('agility')); // Expected: 4
//     console.log(hina.getStatisticValue('speed')); // Expected: 6
// }

// To run the test, you would call runTest() in an environment where math.js is loaded.
// runTest();
