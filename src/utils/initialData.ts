import { Sheet, PropertyTemplate } from '../types';
export function getInitialSheet(): Sheet {
    return {
        globalProperties: [
            { id: 'level', name: 'Character Level', expression: '5', usage: 'Constant', tags: ['Core'] },
            { id: 'profBonus', name: 'Proficiency Bonus', expression: 'floor(level / 4) + 2', usage: 'Constant', tags: ['Core', 'Derived'] },
        ],
        subSheets: [
            {
                id: 'human',
                name: 'Human Form',
                properties: [
                    { id: 'str', name: 'Strength', expression: '16', usage: 'Attribute', tags: ['Core Stat'] },
                    { id: 'con', name: 'Constitution', expression: '14', usage: 'Attribute', tags: ['Core Stat'] },
                    { id: 'strMod', name: 'Strength Mod', expression: 'floor((str - 10) / 2)', usage: 'Constant', tags: ['Derived'] },
                    { id: 'conMod', name: 'Constitution Mod', expression: 'floor((con - 10) / 2)', usage: 'Constant', tags: ['Derived'] },
                    { id: 'athletics', name: 'Athletics', expression: 'd20 + strMod + profBonus', usage: 'Skill', tags: ['Strength Skill'] },
                    { 
                        id: 'fireMagic', name: 'Fire Magic', expression: '', usage: 'Quality', 
                        tags: ['Magic', 'Fire'], description: 'Grants the ability to wield fire. Adds its Rank to fire-based actions.'
                    },
                    { 
                        id: 'rank', name: 'Rank', expression: '3', usage: 'Constant',
                        tags: [], parentId: 'fireMagic'
                    },
                    { id: 'hp', name: 'Hit Points', expression: '10 + (level * 5) + (level * conMod)', usage: 'HealthResource', tags: ['Health'], currentValue: 45, priority: 1, foregroundColor: '#4caf50', backgroundColor: '#e0e0e0' },
                    { id: 'spellslots', name: '1st Level Spell Slots', expression: '4', usage: 'PointResource', tags: ['Magic'], currentValue: 2 },
                ],
                actions: [
                    { id: 'firebolt', name: 'Fire Bolt', description: 'Hurl a mote of fire.', type: 'Damage', range: 'Ranged', qualityTags: ['Fire'], effectTags: ['Fire Damage'], rollExpression: 'd10' }
                ]
            },
        ],
        activeSubSheetId: 'human',
    };
}

export function getInitialLibrary(): PropertyTemplate[] {
    // ... same as before
    return [
        { id: 'template.str', name: 'Strength', usage: 'Attribute', tags: ['Core Stat', 'Physical'], expression: '10' },
        { id: 'template.dex', name: 'Dexterity', usage: 'Attribute', tags: ['Core Stat', 'Physical'], expression: '10' },
        { id: 'template.con', name: 'Constitution', usage: 'Attribute', tags: ['Core Stat', 'Physical'], expression: '10' },
        { id: 'template.hitpoints', name: 'Hit Points', usage: 'HealthResource', tags: ['Health'], expression: '' },
        { id: 'template.manapoints', name: 'Mana Points', usage: 'PointResource', tags: ['Magic'], expression: '10 + wisMod' },
    ];
}
