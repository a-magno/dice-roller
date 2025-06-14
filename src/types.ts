export type PropertyUsage = 'Attribute' | 'Skill' | 'HealthResource' | 'PointResource' | 'Constant' | 'Quality';

export interface Property {
  id: string;
  name: string;
  expression: string;
  usage: PropertyUsage;
  tags: string[];
  description?: string; // NEW: Field for descriptions, primarily for Qualities
  currentValue?: number;
  
  priority?: number;
  foregroundColor?: string;
  backgroundColor?: string;

  parentId?: string;
}

export interface SubSheet {
  id: string;
  name: string;
  properties: Property[];
  actions: Action[];
}

export interface Sheet {
  globalProperties: Property[];
  subSheets: SubSheet[];
  activeSubSheetId: string;
}

export type ActionType = 'Damage' | 'Support';
export type ActionRange = 'Melee' | 'Ranged';

export interface Action {
    id: string;
    name: string;
    description: string;
    type: ActionType;
    range: ActionRange;
    qualityTags: string[]; 
    effectTags: string[];
    rollExpression: string;
}

export interface PropertyTemplate {
    id: string;
    name: string;
    description?: string;
    usage: PropertyUsage;
    tags: string[];
    expression?: string;
}
