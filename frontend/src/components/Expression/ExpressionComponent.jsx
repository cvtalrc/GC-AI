/* eslint-disable react/prop-types */

import { Accordion, AccordionSummary, AccordionDetails, Typography, IconButton, TextField, Box, Divider } from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import CheckIcon from '@mui/icons-material/Check';
import { useState } from 'react';
import Component from './Component';
import Union from './Union';
import Constitutive from './Constitutive';

const ExpressionComponent = ({ expression, expressionIndex, expressions, setExpressions, prediction, error, helperText, setErrors }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [tempName, setTempName] = useState(expression.name || '');

  const handleExpressionChange = (field, value) => {
    const updatedExpressions = [...expressions];
    updatedExpressions[expressionIndex] = {
      ...updatedExpressions[expressionIndex],
      [field]: value,
    };
    setExpressions(updatedExpressions);
  };

  const handleRemoveExpression = () => {
    const updatedExpressions = [...expressions];
    updatedExpressions.splice(expressionIndex, 1);
    setExpressions(updatedExpressions);

    setErrors((prevErrors) => {
      const updatedErrors = { ...prevErrors };
      if (expressions[expressionIndex]?.id) {
        delete updatedErrors[expressions[expressionIndex].id];
      }
      return updatedErrors;
    });

  };

  const handleEditClick = () => {
    setIsEditing(true);
  };

  const handleSaveClick = () => {
    handleExpressionChange('name', tempName);
    setIsEditing(false);
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', boxShadow: helperText ? '1px 1px 3px 3px rgba(169, 39, 39, 1)' : '1px 1px 3px 3px #1b4a3b', borderRadius: 1.5 }}>
      <Accordion>
        <AccordionSummary
          expandIcon={<ExpandMoreIcon />}
          aria-controls={`panel${expressionIndex}-content`}
          id={`panel${expressionIndex}-header`}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', flexGrow: 1, mr: 2 }}>
            {isEditing ? (
              <>
                <TextField
                  value={tempName}
                  onChange={(e) => setTempName(e.target.value)}
                  variant="outlined"
                  size="small"
                  fullWidth
                  sx={{ marginRight: 2 }}
                />
                <IconButton onClick={handleSaveClick} color="primary">
                  <CheckIcon />
                </IconButton>
              </>
            ) : (
              <>
                <Typography sx={{ flexGrow: 1 }}>
                  {expression.name || `Output ${expressionIndex + 1}`}
                </Typography>
                <IconButton onClick={handleEditClick} color="primary">
                  <EditIcon />
                </IconButton>
              </>
            )}
          </Box>
        </AccordionSummary>
        <AccordionDetails>

          <Component
            components={expression.components}
            prediction={prediction}
            onComponentsChange={(newValue) => handleExpressionChange('components', newValue)}
            helperText={helperText?.components}
            error={error?.components}
          />

          <Divider sx={{ mt: 2, mb: 2 }} />

          <Union
            unions={expression.unions}
            components={expression.components}
            onUnionChange={(newValue) => handleExpressionChange('unions', newValue)}
            helperText={helperText?.unions}
            error={error?.unions}
            setErrors={setErrors}
          />

          <Divider sx={{ mt: 2, mb: 2 }} />

          <Constitutive
            constitutive={expression.constitutive}
            onConstitutiveChange={(newValue) => handleExpressionChange('constitutive', newValue)}
          />
          <Divider sx={{ mt: 2 }} />

        </AccordionDetails>
        <Box sx={{ display: 'flex', justifyContent: 'right' }}>
          <IconButton
            onClick={handleRemoveExpression}
            sx={{ mb: 2, mr: 2 }}
            color='primary'
          >
            <DeleteIcon />
          </IconButton>
        </Box>
      </Accordion>
    </Box>
  );
};

export default ExpressionComponent;
