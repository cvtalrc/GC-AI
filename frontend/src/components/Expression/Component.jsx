/* eslint-disable react/prop-types */
import { useEffect, useState } from 'react';
import { Autocomplete, TextField, Typography } from '@mui/material';

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
    const validComponents = components.filter(comp => 
      componentOptions.includes(comp.instance_id ? `${comp.name} [${comp.instance_id}]` : comp.name)
    );

    if (validComponents.length !== components.length) {
      onComponentsChange(validComponents);
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
  return (
    <>
    <Typography sx={{ mt: 0.5, color: helperText ? '#d32f2f' : 'primary', mb:.5 }}>Components</Typography>
    <Typography sx={{fontSize: '13px', color: 'primary.main', ml: .5, mb: 2}}>Select one or more components.</Typography>
    <Autocomplete
      multiple
      options={componentOptions}
      value={components.map(comp => comp.instance_id ? `${comp.name} [${comp.instance_id}]` : comp.name)}
      onChange={handleComponentChange}
      getOptionLabel={(option) => option} 
      isOptionEqualToValue={(option, value) => option === value}
      renderInput={(params) => (
        <TextField {...params} label="Components" size="small" error={helperText ? true : false} helperText={helperText} focused/>
      )}
    />
    </>
    
  );
};

export default Component;

