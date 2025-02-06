/* eslint-disable no-unused-vars */
/* eslint-disable react/prop-types */
import { Box, Autocomplete, TextField, IconButton, Typography } from '@mui/material';
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';
import DeleteIcon from '@mui/icons-material/Delete';
import { useEffect, useState } from 'react';

const Union = ({ unions, components, onUnionChange, helperText, setErrors, expressionIndex }) => {
  const [componentOptions, setComponentOptions] = useState([]);
  const unionTypeOptions = ["Order", "Regulate"];
  useEffect(() => {
    const options = components.flatMap((component) => {
      return component.instance_id ? `${component.name} [${component.instance_id}]` : component.name;
    });

    setComponentOptions(options);
  }, [components]);

  useEffect(() => {
    const updatedUnions = unions.map(union => {
      const fromExists = componentOptions.includes(
        union.from.instance_id ? `${union.from.name} [${union.from.instance_id}]` : union.from.name
      );
      const toExists = componentOptions.includes(
        union.to.instance_id ? `${union.to.name} [${union.to.instance_id}]` : union.to.name
      );

      return {
        ...union,
        from: fromExists ? union.from : { name: '', instance_id: '' },
        to: toExists ? union.to : { name: '', instance_id: '' },
      };
    });

    if (JSON.stringify(updatedUnions) !== JSON.stringify(unions)) {
      onUnionChange(updatedUnions);
    }
  }, [components, componentOptions, unions, onUnionChange]);

  const handleAddUnion = () => {
    const newUnion = {
      id: crypto.randomUUID(), 
      from: { name: '', instance_id: '' },
      to: { name: '', instance_id: '' },
      type: '',
    };
    
    const updatedUnions = [...unions, newUnion];
    onUnionChange(updatedUnions);

    setErrors((prevErrors) => {
      const updatedErrors = { ...prevErrors };

      if (updatedErrors[expressionIndex]?.unions) {
        updatedErrors[expressionIndex].unions = [
          ...updatedErrors[expressionIndex].unions,
          null, 
        ];
      }

      return updatedErrors;
    });

  };

  const handleUnionChange = (unionIndex, field, value) => {
    const updatedUnions = [...unions];

    if (field === 'from' || field === 'to') {
      const matches = value.match(/^(.*)\s\[(\d+)\]$/);
      const newValue = matches ? { name: matches[1], instance_id: parseInt(matches[2], 10) } : { name: value, instance_id: '' };
      updatedUnions[unionIndex] = {
        ...updatedUnions[unionIndex],
        [field]: newValue,
      };
    } else if (field === 'type') {
      updatedUnions[unionIndex] = {
        ...updatedUnions[unionIndex],
        [field]: value || '',
      };
    }

    onUnionChange(updatedUnions);
  };

  const handleRemoveUnion = (unionId) => {
    const updatedUnions = unions.filter((union) => union.id !== unionId);
    onUnionChange(updatedUnions);

    setErrors((prevErrors) => {
      const updatedErrors = { ...prevErrors };

      if (updatedErrors[expressionIndex]?.unions) {
        const unionErrors = [...updatedErrors[expressionIndex].unions];
        const unionIndex = unions.findIndex((union) => union.id === unionId);
        if (unionIndex !== -1) {
          unionErrors.splice(unionIndex, 1); 
        }
        updatedErrors[expressionIndex].unions = unionErrors;
      }

      return updatedErrors;
    });
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', flexDirection: 'row', mb: .5 }}>
        <Typography sx={{ mt: 0.5, color: helperText ? '#d32f2f' : 'primary' }}>Unions</Typography>
        <IconButton onClick={handleAddUnion} color="primary" sx={{ color: helperText ? '#d32f2f' : 'primary' }} size='small'>
          <AddCircleOutlineIcon />
        </IconButton>
      </Box>
      {helperText && typeof helperText == 'string' && (
        <Typography sx={{ fontSize: '12px', color: '#d32f2f', ml: 0.5, mb: 2 }}>
          {helperText}
        </Typography>
      )}
      <Typography sx={{ fontSize: '13px', color: 'primary.main', ml: .5, mb: 2 }}>Add the unions for each component (consider all selected components).</Typography>
      {unions.map((union, unionIndex) => (
        <Box key={unionIndex} sx={{ border: 0.5, mb: 2, borderRadius: 1, borderColor: 'gray' }}>
          <Box sx={{ p: 2, display: 'flex', flexDirection: 'column', gap: 2 }}>
            {
              union.from ? (
                <Autocomplete
                  options={componentOptions}
                  value={union.from.instance_id ? `${union.from.name} [${union.from.instance_id}]` : union.from.name}
                  onChange={(event, newValue) => handleUnionChange(unionIndex, 'from', newValue)}
                  renderInput={(params) => <TextField {...params} label="From" size="small" sx={{ mr: 1 }} error={helperText?.[union.id]?.from ? true : false}
                    helperText={helperText?.[union.id]?.from || ''} focused/>}
                />
              ) : null
            }

            {
              union?.to ? (
                <Autocomplete
                  options={componentOptions}
                  value={union.to.instance_id ? `${union.to.name} [${union.to.instance_id}]` : union.to.name}
                  onChange={(event, newValue) => handleUnionChange(unionIndex, 'to', newValue)}
                  renderInput={(params) => <TextField {...params} label="To" size="small" sx={{ mr: 1 }} error={helperText?.[union.id]?.to ? true : false}
                    helperText={helperText?.[union.id]?.to || ''} focused/>}
                />
              ) : null
            }
            <Autocomplete
              options={unionTypeOptions}
              value={union.type || ''}
              onChange={(event, newValue) => handleUnionChange(unionIndex, 'type', newValue)}
              renderInput={(params) => <TextField {...params} label="Type" size="small" error={helperText?.[union.id]?.type ? true : false}
                helperText={helperText?.[union.id]?.type} focused/>}
            />
            <Box sx={{ display: 'flex', justifyContent: 'right' }}>
              <IconButton onClick={() => handleRemoveUnion(union.id)} color="primary">
                <DeleteIcon />
              </IconButton>
            </Box>
          </Box>
        </Box>
      ))}
    </Box>
  );
};

export default Union;