/* eslint-disable react/prop-types */

import { Box, Autocomplete, TextField, IconButton, Divider } from '@mui/material';

import DeleteIcon from '@mui/icons-material/Delete';

const edTypeOptions = ['Simple Chemical', 'Protein', 'Restriction Enzyme'];

const ExternallyDefined = ({ eds, setEds, ed, edIndex, helperText, setErrors }) => {

  const handleEdChange = (edIndex, field, value) => {
    const updatedEds = [...eds];
    updatedEds[edIndex] = {
      ...updatedEds[edIndex],
      [field]: value,
    };
    setEds(updatedEds);
  };

  const handleRemoveEd = (edIndex) => {
    const updatedEds = [...eds];
    updatedEds.splice(edIndex, 1);
    setEds(updatedEds);

    setErrors((prevErrors) => {
      const updatedErrors = { ...prevErrors };
      if (eds[edIndex]?.id) {
        delete updatedErrors[eds[edIndex].id];
      }
      return updatedErrors;
    });

  };

  return (
    <Box>
      <Box key={edIndex} >
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          <Autocomplete
            options={edTypeOptions}
            value={ed.type}
            onChange={(event, newValue) => handleEdChange(edIndex, 'type', newValue)}
            renderInput={(params) => <TextField {...params} label="Type" size="small" error={helperText?.type ? true : false}
              helperText={helperText?.type} focused />}
          />
          <TextField
            label="URI"
            value={ed.uri}
            error={helperText?.uri ? true : false}
            helperText={helperText?.uri}
            onChange={(event) => handleEdChange(edIndex, 'uri', event.target.value)}
            size="small"
            focused
          />
          <TextField
            label="Name"
            value={ed.name}
            error={helperText?.name ? true : false}
            helperText={helperText?.name}
            onChange={(event) => handleEdChange(edIndex, 'name', event.target.value)}
            size="small"
            focused
          />
          <Divider sx={{ mt: 2 }} />
          <Box sx={{ display: 'flex', justifyContent: 'right' }}>
            <IconButton onClick={() => handleRemoveEd(edIndex)} color="primary">
              <DeleteIcon />
            </IconButton>
          </Box>
        </Box>

      </Box>
    </Box>
  );
};

export default ExternallyDefined;
