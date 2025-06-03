/* eslint-disable react/prop-types */
import React, { forwardRef, useContext, useEffect, useRef, useState } from 'react';
import { Accordion, AccordionSummary, AccordionDetails, Autocomplete, Typography, TextField, Box, Checkbox, FormControlLabel, IconButton, Divider } from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import NameContext from '../../context/NameContext';
import DeleteIcon from '@mui/icons-material/Delete';
import { FixedSizeList } from 'react-window';

const PredictionAccordion = ({ item, index, setPrediction, prediction, helperText, setErrors, API_BASE_URL, showModal }) => {
  const { namesCache, roles } = useContext(NameContext);
  const [checkedAddComponent, setCheckedAddComponent] = useState(false);
  const prevNamesCache = useRef(namesCache);
  const prevItemRole = useRef(item.role);

  useEffect(() => {
    if (!item.role) return;

    const newData = [...prediction];
    newData[index] = {
      ...newData[index],
      availableNames: namesCache[item.role] || []
    };

    setPrediction(newData);

    prevNamesCache.current = { ...namesCache };
    prevItemRole.current = item.role;
  }, [namesCache, item.role]);

  if (item.availableNames.length === 0) {
    const newAvailableNames = namesCache[item.role] || [];

    if (JSON.stringify(item.availableNames) !== JSON.stringify(newAvailableNames)) {
      const newData = [...prediction];
      newData[index] = { ...newData[index], availableNames: newAvailableNames, name: '' };

      setPrediction(newData);
    }
  }
  
  const handleRoleChange = (event, newValue) => {
    const newData = [...prediction];
    newData[index] = { ...newData[index], role: newValue, availableNames: namesCache[newValue] || [], name: '' };
    setPrediction(newData);
  };

  const handleNameChange = async (event, newValue) => {
    const newData = [...prediction];

    newData[index].name = newValue;

    const nameMap = {};

    newData.forEach((component) => {
      if (component.name && component.name !== "") {
        if (!nameMap[component.name]) {
          nameMap[component.name] = [];
        }
        nameMap[component.name].push(component);
      }
    });

    Object.keys(nameMap).forEach((name) => {
      const components = nameMap[name];

      if (components.length > 1) {
        let instanceCounter = 1;

        components.forEach((component) => {
          if (components.every((comp) => comp.role === component.role)) {
            component.instance_id = instanceCounter++;
          } else {
            delete component.instance_id;
          }
        });
      } else {
        delete components[0].instance_id;
      }
    });

    try {
      if (newValue === null) return;
      const response = await fetch(`${API_BASE_URL}/component/details?component_name=${newValue}&role=${item.role}`);
      if (response.ok) {
        const componentDetails = await response.json();

        newData[index] = { ...newData[index], ...componentDetails, role: componentDetails.role };

        setPrediction(newData);
      } else {
        showModal("Error", "An error occurred while fetching component details. Please try again later.", "error");
      }
    } catch (error) {
      showModal("Error", "Database connection error. Please try again later.", "error");
    }
  };

  const handleCheckedAddComponenteChange = (event) => {
    const updatedPrediction = [...prediction];

    const newValue = event.target.checked ? true : false;
    const uriValue = event.target.checked ? '' : 'http://parts.igem.org/';

    updatedPrediction[index] = {
      ...updatedPrediction[index],
      uri: uriValue,
      identifier: '',
      name: '',
      description: '',
      sequence: '',
      sequence_length: '',
      new: newValue
    };

    setPrediction(updatedPrediction);
    setCheckedAddComponent(event.target.checked);
  };

  const handleTexfieldChange = (event) => {
    const { name, value } = event.target;
    const updatedPrediction = [...prediction];
    updatedPrediction[index] = {
      ...updatedPrediction[index],
      [name]: value
    };

    if (name === 'sequence') {
      updatedPrediction[index].sequence_length = value.length;
    }

    if (name === 'name') {
      const nameMap = {};

      updatedPrediction.forEach((component) => {
        if (component.name && component.name !== "") {
          if (!nameMap[component.name]) {
            nameMap[component.name] = [];
          }
          nameMap[component.name].push(component);
        }
      });

      Object.keys(nameMap).forEach((name) => {
        const components = nameMap[name];

        if (components.length > 1) {
          let instanceCounter = 1;

          components.forEach((component) => {
            if (components.every((comp) => comp.role === component.role)) {
              component.instance_id = instanceCounter++;
            } else {
              delete component.instance_id;
            }
          });
        } else {
          delete components[0].instance_id;
        }
      });
    }
    setPrediction(updatedPrediction);
  };

  const handleRemove = () => {
    const updatedPrediction = prediction.filter((_, i) => i !== index);

    const nameMap = {};

    updatedPrediction.forEach((component) => {
      if (component.name && component.name !== "") {
        if (!nameMap[component.name]) {
          nameMap[component.name] = [];
        }
        nameMap[component.name].push(component);
      }
    });

    Object.keys(nameMap).forEach((name) => {
      const components = nameMap[name];
      if (components.length > 1) {
        components.forEach((component, idx) => {
          component.instance_id = idx + 1;
        });
      } else {
        delete components[0].instance_id;
      }
    });

    setPrediction(updatedPrediction);

    setErrors((prevErrors) => {
      const updatedErrors = { ...prevErrors };
      if (prediction[index]?.id) {
        delete updatedErrors[prediction[index].id];
      }
      return updatedErrors;
    });

  };

  const ListboxComponent = forwardRef(function ListboxComponent(props, ref) {
    const { children, ...other } = props;
    const itemData = React.Children.toArray(children);
    const itemCount = itemData.length;

    const renderRow = ({ index, style }) => (
      <div style={style}>{itemData[index]}</div>
    );

    return (
      <div ref={ref} {...other}>
        <FixedSizeList
          height={300}
          width="100%"
          itemSize={36}
          itemCount={itemCount}
          itemData={itemData}
        >
          {renderRow}
        </FixedSizeList>
      </div>
    );
  });

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', boxShadow: helperText ? '1px 1px 3px 3px rgba(169, 39, 39, 1)' : '1px 1px 3px 3px #1b4a3b', borderRadius: 1.5 }}>
      <Accordion>
        <AccordionSummary
          expandIcon={<ExpandMoreIcon />}
          aria-controls={`panel${index}-content`}
          id={`panel${index}-header`}
        >
          <Typography variant='text'>
            {item.id === 'component-principal' ? "Circuit Information" : (
              <>
                {item.role || "New SubComponent"}
                {item.name && item.name !== "" && ` (${item.name})`}
                {item.instance_id && ` [${item.instance_id}]`}
              </>
            )}
          </Typography>
        </AccordionSummary>
        <AccordionDetails sx={{ pl: 2, pr: 2 }}>
          <FormControlLabel
            label="Add Custom Component (Use this option to include a component that is not available in the iGEM repository)."
            control={
              <Checkbox
                inputProps={{ 'aria-label': 'controlled' }}
                checked={checkedAddComponent}
                onChange={handleCheckedAddComponenteChange}
                sx={{
                  '& .MuiSvgIcon-root': {
                    fontSize: 18,
                    ml: .5,
                    color: 'primary.main'
                  },
                }}
              />
            }
            sx={{
              '& .MuiFormControlLabel-label': {
                textTransform: 'none',
                fontSize: '13px',
                color: 'primary.main'
              },
              mb: 1
            }}
          />

          <Box>
            <TextField
              focused
              size='small'
              placeholder="https://example.com/"
              label="URI"
              name="uri"
              value={item.uri}
              fullWidth
              margin="normal"
              onChange={handleTexfieldChange}
              disabled={!checkedAddComponent}
              error={helperText?.uri ? true : false}
              helperText={helperText?.uri}
            />

            <TextField
              focused
              size='small'
              label="Identifier"
              name="identifier"
              value={item.identifier}
              fullWidth
              margin="normal"
              placeholder='BBa_'
              onChange={handleTexfieldChange}
              disabled={!checkedAddComponent}
              error={helperText?.identifier ? true : false}
              helperText={helperText?.identifier}
            />
            <Autocomplete
              options={roles}
              name="role"
              value={item.role !== null ? item.role : ""}
              onChange={handleRoleChange}
              isOptionEqualToValue={(option, value) => option === value}
              renderInput={(params) => (
                <TextField
                  {...params}
                  label="Role"
                  size='small'
                  margin="normal"
                  focused
                  error={helperText?.role ? true : false}
                  helperText={helperText?.role}
                />
              )}
              fullWidth
            />
            {checkedAddComponent ? (
              <>
                <TextField
                  size='small'
                  focused
                  label="Name"
                  placeholder='BBa_'
                  name="name"
                  value={item.name}
                  fullWidth
                  margin="normal"
                  onChange={handleTexfieldChange}
                  error={helperText?.name ? true : false}
                  helperText={helperText?.name}
                />
              </>
            ) : (
              <Autocomplete
                options={item.availableNames}
                name="name"
                value={item.availableNames.includes(item.name) ? item.name : ""}
                onChange={handleNameChange}
                ListboxComponent={ListboxComponent}
                isOptionEqualToValue={(option, value) => option === value}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    label="Name"
                    margin="normal"
                    size='small'
                    focused
                    error={helperText?.name ? true : false}
                    helperText={helperText?.name}
                  />
                )}
                fullWidth
                disabled={!item.role}
              />
            )}
            <TextField
              size='small'
              focused
              label="Description"
              name="description"
              value={item.description}
              fullWidth
              placeholder='Optional'
              margin="normal"
              onChange={handleTexfieldChange}
              disabled={!checkedAddComponent}
            />
            {item.id !== 'component-principal' && (
              <>
                <TextField
                  size='small'
                  focused
                  label="Sequence"
                  name="sequence"
                  value={item.sequence}
                  fullWidth
                  margin="normal"
                  placeholder='agactcttgctcgtactagagtgtctgc'
                  onChange={handleTexfieldChange}
                  disabled={!checkedAddComponent}
                  error={helperText?.sequence ? true : false}
                  helperText={helperText?.sequence}
                />
                <TextField
                  size='small'
                  focused
                  label="Sequence Length"
                  name="sequence_length"
                  value={item.sequence_length}
                  fullWidth
                  margin="normal"
                  onChange={handleTexfieldChange}
                  disabled
                  error={helperText?.sequence_length ? true : false}
                  helperText={helperText?.sequence_length}
                />
              </>
            )}
          </Box>
          <Divider sx={{ mt: 2 }} />
        </AccordionDetails>

        {item.id !== 'component-principal' && (
          <Box sx={{ display: 'flex', justifyContent: 'right' }}>
            <IconButton
              onClick={handleRemove}
              sx={{ mb: 2, mr: 2 }}
              color='primary'
            >
              <DeleteIcon />
            </IconButton>

          </Box>

        )}

      </Accordion>
    </Box>
  );
};

export default PredictionAccordion;
