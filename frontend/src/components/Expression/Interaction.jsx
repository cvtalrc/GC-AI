/* eslint-disable react/prop-types */
import { useState, useEffect } from 'react';
import { Box, Autocomplete, TextField, IconButton, Typography, Divider } from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';

const interactionTypeOptions = ['Inhibition', 'Stimulation', 'Biochemical Reaction', 'Non-Covalent Binding', 'Degradation', 'Control', 'Genetic Production'];

const Interaction = ({ interactions, setInteractions, interactionIndex, interaction = {}, eds, prediction, helperText, setErrors, participantRoles, setParticipantRoles, API_BASE_URL, showModal }) => {
  const [componentOptions, setComponentOptions] = useState([]);

  const handleInteractionRolesChange = (roles, interactionId) => {
    setParticipantRoles((prevRoles) => ({
      ...prevRoles,
      [interactionId]: Array.isArray(roles) ? roles : [],
    }));
  };

  useEffect(() => {
    const transformedEds = (eds || [])
      .filter((ed) => ed.name && ed.name.trim() !== '')
      .map((ed) => ({
        label: ed.name.trim(),
        value: ed.uri ? ed.uri.trim() : '',
        isEd: true,
      }));

    const transformedPrincipalComponents = (prediction || [])
      .filter(subComponent => subComponent.id !== 'component-principal' && subComponent.name)
      .map((subComponent) => ({
        label: subComponent.instance_id ? `${subComponent.name} [${subComponent.instance_id}]` : subComponent.name,
        value: subComponent.instance_id ? `${subComponent.name} [${subComponent.instance_id}]` : subComponent.name,
        isEd: false,
      }));

    setComponentOptions([...transformedEds, ...transformedPrincipalComponents]);
  }, [eds, prediction]);

  useEffect(() => {
    const fetchParticipantRoles = async () => {
      if (!interaction?.type) return;

      try {
        const response = await fetch(
          `${API_BASE_URL}/component/interactions?interaction_type=${interaction.type}`
        );
        const roles = await response.json();
        handleInteractionRolesChange(roles, interaction.id);

        const updatedInteractions = [...interactions];
        updatedInteractions[interactionIndex] = {
          ...updatedInteractions[interactionIndex],
          participants: roles.reduce((acc, role) => {
            acc[role] = updatedInteractions[interactionIndex]?.participants?.[role] || [{ id: crypto.randomUUID(), name: "", instance_id: "" }];
            return acc;
          }, {}),
        };
        setInteractions(updatedInteractions);
      } catch (error) {
        handleRemoveInteraction(interactionIndex)
        showModal("Error", "An error occurred while fetching participant roles. Please try again later.", "error");

      }
    };

    fetchParticipantRoles();
  }, [interaction?.type]);

  const handleInteractionChange = (interactionIndex, field, value) => {
    const updatedInteractions = [...interactions];
    updatedInteractions[interactionIndex] = {
      ...updatedInteractions[interactionIndex],
      [field]: value,
    };
    setInteractions(updatedInteractions);
  };

  const handleParticipantChange = (interactionIndex, role, participantIndex, selectedOption) => {
    const updatedInteractions = [...interactions];
    const roleParticipants = updatedInteractions[interactionIndex].participants[role] || [];
    const matches = selectedOption.value.match(/^(.*)\s\[(.*)\]$/);
    const updatedParticipant = matches
      ? {
        ...roleParticipants[participantIndex],
        name: matches[1],
        instance_id: matches[2],
      }
      : {
        ...roleParticipants[participantIndex],
        name: selectedOption.label,
        instance_id: "",
      };

    if (!updatedParticipant.id) {
      updatedParticipant.id = crypto.randomUUID();
    }

    roleParticipants[participantIndex] = updatedParticipant;
    updatedInteractions[interactionIndex].participants[role] = roleParticipants;

    setInteractions(updatedInteractions);
  };

  const handleAddParticipant = (interactionIndex, role) => {
    const updatedInteractions = [...interactions];
    const interaction = updatedInteractions[interactionIndex];

    if (!interaction.participants[role]) {
      interaction.participants[role] = [];
    }

    const newParticipant = { id: crypto.randomUUID(), name: "", instance_id: "" };
    interaction.participants[role].push(newParticipant);

    setInteractions(updatedInteractions);

    setErrors((prevErrors) => {
      const updatedErrors = { ...prevErrors };
      if (updatedErrors[interaction.id]?.participants?.[role]) {
        updatedErrors[interaction.id].participants[role][newParticipant.id] = null;
      }
      return updatedErrors;
    });
  };

  const handleRemoveInteraction = (interactionIndex) => {

    const updatedInteractions = [...interactions];
    updatedInteractions.splice(interactionIndex, 1);
    setInteractions(updatedInteractions);

    setErrors((prevErrors) => {
      const updatedErrors = { ...prevErrors };
      if (interactions[interactionIndex]?.id) {
        delete updatedErrors[interactions[interactionIndex].id];
      }
      return updatedErrors;
    })

    setParticipantRoles((prevRoles) => {
      const updatedRoles = { ...prevRoles };
      if (interactions[interactionIndex].id) {
        delete updatedRoles[interactions[interactionIndex].id];
      }
      return updatedRoles;
    });

  };

  const handleRemoveParticipant = (interactionIndex, role, participantId) => {
    const updatedInteractions = [...interactions];
    const interaction = updatedInteractions[interactionIndex];

    if (interaction.participants[role]) {
      interaction.participants[role] = interaction.participants[role].filter(
        (participant) => participant.id !== participantId
      );

      setInteractions(updatedInteractions);

      setErrors((prevErrors) => {
        const updatedErrors = { ...prevErrors };
        if (updatedErrors[interaction.id]?.participants?.[role]) {
          delete updatedErrors[interaction.id].participants[role][participantId];
        }
        return updatedErrors;
      });
    }
  };

  return (
    <Box>
      <Box
        key={interactionIndex}
      >
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          <Autocomplete
            options={interactionTypeOptions}
            value={interaction?.type || null}
            onChange={(event, newValue) =>
              handleInteractionChange(interactionIndex, 'type', newValue)
            }
            renderInput={(params) => (
              <TextField
                {...params}
                label="Interaction Type"
                size="small"
                error={helperText?.type ? true : false}
                helperText={helperText?.type}
                focused
              />
            )}
            sx={{ pt: 2 }}
          />
          {Array.isArray(participantRoles) && participantRoles.map((role, idx) => (
            <Box key={idx} sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              <Box sx={{ display: 'flex', flexDirection: 'row', alignItems: 'center' }}>
                <Typography>{role}</Typography>
                <IconButton
                  onClick={() => handleAddParticipant(interactionIndex, role)}
                  color="primary"
                  size="small"
                >
                  <AddCircleOutlineIcon />
                </IconButton>
              </Box>
              {(interaction?.participants?.[role] || []).map((participant, pIdx) => (

                <Box key={pIdx} sx={{ display: 'flex', flexDirection: 'row', alignItems: 'center' }}>
                  <Autocomplete
                    options={componentOptions}
                    value={
                      componentOptions.find(option => {
                        const expectedLabel = participant.instance_id
                          ? `${participant.name} [${participant.instance_id}]`
                          : participant.name;

                        return option.label === expectedLabel;
                      }) || null
                    }

                    getOptionLabel={(option) =>
                      option.instance_id ? `${option.label} [${option.instance_id}]` : option.label
                    }
                    isOptionEqualToValue={(option, value) =>
                      option.label === value.label && option.instance_id === value.instance_id
                    }
                    onChange={(event, newValue) =>
                      handleParticipantChange(interactionIndex, role, pIdx, newValue)
                    }
                    renderInput={(params) => (
                      <TextField
                        {...params}
                        label={role}
                        size="small"
                        error={helperText?.participants?.[role]?.[participant.id]?.name ? true : false}
                        helperText={helperText?.participants?.[role]?.[participant.id]?.name}

                        focused
                      />
                    )}
                    fullWidth
                  />
                  {pIdx > 0 && (
                    <IconButton
                      onClick={() => handleRemoveParticipant(interactionIndex, role, participant.id)}
                      color="primary"
                      size="small"
                      sx={{ ml: 1 }}
                    >
                      <DeleteIcon />
                    </IconButton>
                  )}
                </Box>
              ))}

            </Box>
          ))}

          <Divider />
          <Box sx={{ display: 'flex', justifyContent: 'right' }}>
            <IconButton
              onClick={() => handleRemoveInteraction(interactionIndex)}
              color="primary"
            >
              <DeleteIcon />
            </IconButton>
          </Box>
        </Box>
      </Box>
    </Box>
  );
};

export default Interaction;
