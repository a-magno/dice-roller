import React, { useState, useMemo, useEffect } from 'react';
import { Modal, Box, Typography, Button, Stack, Divider, Paper } from '@mui/material';
import ReplayIcon from '@mui/icons-material/Replay';
import { Property, Action, SubSheet } from '../types';
import { DiceRoller, VariableContext, RollOutcome } from '../lib';
import { processAction } from '../utils/actionProcessor';


declare const marked: { parseInline(markdown: string): string; };
const roller = new DiceRoller();

interface Props {
  open: boolean;
  onClose: () => void;
  property?: Property | null;
  action?: Action;
  subSheet?: SubSheet;
  context: VariableContext;
}

const style = { position: 'absolute' as 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', width: 400, bgcolor: 'background.paper', border: '2px solid #000', boxShadow: 24, p: 4, borderRadius: 2 };

export function RollerModal({ open, onClose, property, action, subSheet, context }: Props) {
  const [rollResult, setRollResult] = useState<RollOutcome | null>(null);
  const [processedExpression, setProcessedExpression] = useState('');
  const [modifications, setModifications] = useState<string[]>([]);

  const rollable = property || action;

  const handleRoll = () => {
      if (!rollable) return;
      
      let expressionToRoll = (rollable as Property).expression || (rollable as Action).rollExpression;
      let mods: string[] = [];

      if (action && subSheet) {
          const { finalExpression, modifications: actionMods } = processAction(action, subSheet.properties, context);
          expressionToRoll = finalExpression;
          mods = actionMods;
      }
      
      setProcessedExpression(expressionToRoll);
      setModifications(mods);
      setRollResult(roller.roll(expressionToRoll, { context }));
  };

  useEffect(() => {
    if (open && rollable) {
        handleRoll();
    }
  }, [open, rollable]);

  const renderedMarkdown = useMemo(() => {
    if (rollResult && 'formattedString' in rollResult && rollResult.formattedString) {
      return marked.parseInline(rollResult.formattedString);
    }
    return '';
  }, [rollResult]);

  if (!rollable) return null;

  return (
    <Modal open={open} onClose={onClose}>
      <Box sx={style}>
        <Typography variant="h6" component="h2" mb={2}>
          Rolling: {rollable.name}
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{mb: 2, fontStyle: 'italic'}}>
            Final Expression: <code>{processedExpression}</code>
        </Typography>
        {modifications.length > 0 && (
            <Typography variant="caption" color="text.secondary" sx={{mb: 2}}>
                Mods: {modifications.join(', ')}
            </Typography>
        )}
        <Divider sx={{mb: 2}}/>
        <Paper variant="outlined" sx={{p: 3, textAlign: 'center'}}>
            {rollResult && 'value' in rollResult ? (
                <>
                    <Typography variant="h2" component="div" fontWeight="bold" color="primary.main">
                        {rollResult.value}
                    </Typography>
                    {renderedMarkdown && (
                        <Typography variant="body1" color="text.secondary" dangerouslySetInnerHTML={{ __html: renderedMarkdown }} />
                    )}
                </>
            ) : (
                <Typography color="error">
                    {rollResult && 'errors' in rollResult ? rollResult.errors[0] : "Invalid Expression"}
                </Typography>
            )}
        </Paper>
        <Button
          fullWidth
          variant="contained"
          onClick={handleRoll}
          startIcon={<ReplayIcon />}
          sx={{ mt: 2 }}
        >
          Roll Again
        </Button>
      </Box>
    </Modal>
  );
}
