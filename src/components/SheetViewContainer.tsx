import React from 'react';
import { Sheet, Property, Action } from '../types';
import { VariableContext } from '../lib/types'
import { SubSheetTabs } from './SubsheetTabs';
import { SheetView } from './SheetView';

interface Props {
    sheet: Sheet;
    context: VariableContext;
    onSetActiveSubSheet: (id: string) => void;
    onAddSubSheetClick: () => void;
    onEditProperty: (property: Property, subSheetId?: string) => void;
    onDeleteProperty: (id: string, subSheetId?: string) => void;
    onModifyResource: (id: string, amount: number, subSheetId?: string) => void;
    onSetResource: (id: string, subSheetId?: string) => void;
    onRollProperty: (property: Property) => void;
    onRollAction: (action: Action, subSheet: Sheet['subSheets'][0]) => void;
    onAddActionClick: () => void;
    onEditAction: (action: Action, subSheetId: string) => void;
    onDeleteAction: (id: string, subSheetId: string) => void;
}

export function SheetViewContainer({ 
    sheet, 
    context, 
    onSetActiveSubSheet, 
    onAddSubSheetClick, 
    onEditProperty, 
    onDeleteProperty, 
    onModifyResource, 
    onSetResource, 
    onRollProperty,
    onRollAction,
    onAddActionClick,
    onEditAction,
    onDeleteAction
}: Props) {
    const activeSubSheet = sheet.subSheets.find(ss => ss.id === sheet.activeSubSheetId);

    return (
        <>
            <SubSheetTabs 
                subSheets={sheet.subSheets}
                activeId={sheet.activeSubSheetId}
                onTabChange={onSetActiveSubSheet}
                onAddClick={onAddSubSheetClick}
            />
            {activeSubSheet && (
                <SheetView
                    subSheet={activeSubSheet}
                    context={context}
                    onEdit={onEditProperty}
                    onDelete={onDeleteProperty}
                    onModifyResource={onModifyResource}
                    onSetResource={onSetResource}
                    onRoll={onRollProperty}
                    onRollAction={(action) => onRollAction(action, activeSubSheet)}
                    onAddActionClick={onAddActionClick}
                    onEditAction={onEditAction}
                    onDeleteAction={onDeleteAction}
                />
            )}
        </>
    );
}
