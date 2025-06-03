
/* eslint-disable react/prop-types */
import { Box, Typography, IconButton, Accordion, AccordionSummary, AccordionDetails } from '@mui/material';
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';
import ExpressionComponent from '../../components/Expression/ExpressionComponent';
import Interaction from '../Expression/Interaction';
import ExternallyDefined from '../Expression/ExternallyDefined';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';

export default function FunctionalSystem({ expressions, setExpressions, interactions, setInteractions, eds, setEds, prediction, error, helperText, participantRoles, setErrors, setParticipantRoles, setErrorBack, API_BASE_URL, showModal }) {
  const generateId = () => crypto.randomUUID();
  const handleAddExpression = () => {
    const newExpression = {
      id: generateId(),
      name: `Operon ${expressions.length + 1}`,
      components: [],
      unions: [],
      constitutive: false,
    };

    setExpressions((prevExpressions) => [...prevExpressions, newExpression]);
  };

  const handleAddInteraction = () => {
    const newInteraction = {
      id: generateId(),
      type: '',
      participants: {},
    };

    setInteractions((prevInteractions) => [...prevInteractions, newInteraction]);

  };

  const handleAddEd = () => {
    const newEd = {
      id: generateId(),
      type: '',
      uri: '',
      name: ''
    }

    setEds((prevEds) => [...prevEds, newEd]);

  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', mt: 1 }}>
      <Typography sx={{ fontWeight: 600, mb: 1 }}>Functional System</Typography>
      <Typography sx={{ textAlign: 'justify', mb: 2 }}>The functional part defines one or more circuit outputs, represented across different operons. These outputs enable the assignment of functions to the selected components.
      </Typography>
      <Box sx={{ display: 'flex', flexDirection: 'row', mb: 2 }}>
        <Typography sx={{ mt: .5 }}>Operons</Typography>
        <IconButton
          onClick={handleAddExpression}
          color="primary"
          size='small'
        >
          <AddCircleOutlineIcon />
        </IconButton>
      </Box>
      <Box display="flex" flexDirection="column" gap={2} sx={{ mb: 2 }}>
        {expressions && expressions.map((expression, expressionIndex) => (
          <ExpressionComponent
            key={expressionIndex}
            expression={expression}
            expressionIndex={expressionIndex}
            expressions={expressions}
            setExpressions={setExpressions}
            prediction={prediction}
            error={error.expressions?.[expression.id]}
            helperText={helperText.expressions?.[expression.id]}
            setErrors={setErrors}
          />
        ))}
      </Box>
      {expressions.length > 0 ? (
        <>
          <Box sx={{ display: 'flex', flexDirection: 'row' }}>
            <Typography sx={{ mt: .5 }}>Externally Defined</Typography>
            <IconButton
              onClick={handleAddEd}
              color="primary"
              size='small'
            >
              <AddCircleOutlineIcon />
            </IconButton>
          </Box>
          <Typography sx={{ fontSize: '13px', color: 'primary.main', ml: .5 }}>The externally defined components are available throughout the entire functional system, allowing them to interact with any component within it.</Typography>

          <Box display="flex" flexDirection="column" sx={{ gap: 2, pt: eds.length > 0 ? 2 : 0, pb: eds.length > 0 ? 2 : 1 }}>
            {eds && eds.map((ed, edIndex) => (
              <Accordion key={edIndex} sx={{ display: 'flex', flexDirection: 'column', boxShadow: helperText.eds?.[ed.id] ? '1px 1px 3px 3px rgba(169, 39, 39, 1)' : '1px 1px 3px 3px #1b4a3b', borderRadius: 1.5 }}>
                <AccordionSummary
                  expandIcon={<ExpandMoreIcon />}
                  aria-controls={`panel${edIndex}-content`}
                  id={`panel${edIndex}-header`}
                >
                  <Typography>Externally Defined {eds && eds[edIndex].name ? `(${eds[edIndex].name})` : ''}</Typography>
                </AccordionSummary>
                <AccordionDetails>
                  <ExternallyDefined
                    key={edIndex}
                    ed={ed}
                    edIndex={edIndex}
                    eds={eds}
                    setEds={setEds}
                    prediction={prediction}
                    error={error.eds?.[ed.id]}
                    helperText={helperText.eds?.[ed.id]}
                    setErrors={setErrors}
                  />
                </AccordionDetails>
              </Accordion>

            ))}
          </Box>
          <Box sx={{ display: 'flex', flexDirection: 'row' }}>
            <Typography sx={{ mt: .5 }}>Interactions</Typography>
            <IconButton
              onClick={handleAddInteraction}
              color="primary"
              size='small'
            >
              <AddCircleOutlineIcon />
            </IconButton>
          </Box>
          <Typography sx={{ fontSize: '13px', color: 'primary.main', ml: .5, mb: 2 }}>Defines the interactions between the components present in the system.</Typography>
          <Box display="flex" flexDirection="column" sx={{ gap: 2, mb: interactions.length > 0 ? 2 : 0 }}>
            {interactions && interactions.map((interaction, interactionIndex) => (
              <Accordion key={interactionIndex} sx={{ display: 'flex', flexDirection: 'column', boxShadow: helperText.interactions?.[interaction.id] ? '1px 1px 3px 3px rgba(169, 39, 39, 1)' : '1px 1px 3px 3px #1b4a3b', borderRadius: 1.5 }}>
                <AccordionSummary
                  expandIcon={<ExpandMoreIcon />}
                  aria-controls={`panel${interactionIndex}-content`}
                  id={`panel${interactionIndex}-header`}
                >
                  <Typography>Interaction {interactions && interactions[interactionIndex].type ? `(${interactions[interactionIndex].type})` : ''}</Typography>
                </AccordionSummary>
                <AccordionDetails>
                  <Interaction
                    key={interactionIndex}
                    interaction={interaction}
                    interactionIndex={interactionIndex}
                    interactions={interactions}
                    setInteractions={setInteractions}
                    prediction={prediction}
                    eds={eds}
                    participantRoles={participantRoles[interaction.id] || []}
                    setParticipantRoles={setParticipantRoles}
                    error={error.interactions?.[interaction.id]}
                    helperText={helperText.interactions?.[interaction.id]}
                    setErrors={setErrors}
                    setErrorBack={setErrorBack}
                    showModal={showModal}
                    API_BASE_URL={API_BASE_URL}
                  />

                </AccordionDetails>
              </Accordion>
            ))}
          </Box>

        </>
      ) : ''}

    </Box>
  );
}
