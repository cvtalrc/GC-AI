/* eslint-disable react/prop-types */
import { useEffect, useState } from 'react';
import { Autocomplete, TextField, Typography, Checkbox } from '@mui/material';
import CheckBoxOutlineBlankIcon from '@mui/icons-material/CheckBoxOutlineBlank';
import CheckBoxIcon from '@mui/icons-material/CheckBox';

const icon = <CheckBoxOutlineBlankIcon fontSize="small" />;
const checkedIcon = <CheckBoxIcon fontSize="small" />;

const Component = ({ components = [], prediction, onComponentsChange, helperText }) => {
  const [componentOptions, setComponentOptions] = useState([]);

  useEffect(() => {
    const options = prediction.flatMap(pred => {
      if (pred.id !== 'component-principal' && pred.name) {
        return pred.instance_id ? `${pred.name} [${pred.instance_id}]` : pred.name;
      }
      return [];
    });

    setComponentOptions(options);
  }, [prediction]);

  useEffect(() => {
    const validComponents = components.filter(comp => {
      const compString = comp.instance_id ? `${comp.name} [${comp.instance_id}]` : comp.name;
      return componentOptions.includes(compString);
    });

    if (validComponents.length !== components.length) {
      if (JSON.stringify(validComponents) !== JSON.stringify(components)) {
        onComponentsChange(validComponents);
      }
    }
  }, [prediction, componentOptions, components, onComponentsChange]);

  const handleComponentChange = (event, newValue) => {
    const newComponents = newValue.map(value => {
      const matches = value.match(/^(.*)\s\[(\d+)\]$/);
      if (matches) {
        return { name: matches[1], instance_id: parseInt(matches[2], 10) };
      } else {
        return { name: value, instance_id: "" };
      }
    });

    onComponentsChange(newComponents);
  };

  const autocompleteValue = components.map(comp =>
    comp.instance_id ? `${comp.name} [${comp.instance_id}]` : comp.name
  );

  return (
    <>
      <Typography sx={{ mt: 0.5, color: helperText ? '#d32f2f' : 'primary', mb: .5 }}>Components</Typography>
      <Typography sx={{ fontSize: '13px', color: 'primary.main', ml: .5, mb: 2 }}>Select one or more components.</Typography>
      <Autocomplete
        multiple
        options={componentOptions}
        value={autocompleteValue}
        disableCloseOnSelect
        onChange={handleComponentChange}
        getOptionLabel={(option) => option}
        isOptionEqualToValue={(option, value) => option === value}
        renderOption={(props, option, { selected }) => {
          return (
            <li {...props}>
              <Checkbox
                icon={icon}
                checkedIcon={checkedIcon}
                checked={selected}
                sx={{
                  mr: 1, '& .MuiSvgIcon-root': { color: 'primary.main' }
                }}
              />
              {option}
            </li>
          );
        }}
        renderInput={(params) => (
          <TextField
            {...params}
            label="Components"
            size="small"
            error={!!helperText}
            helperText={helperText}
            focused
          />
        )}
      />
    </>
  );
};

export default Component;