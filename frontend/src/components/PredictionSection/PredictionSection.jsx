/* eslint-disable react/prop-types */
import { Box, Button, Typography } from '@mui/material';
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';
import PredictionAccordion from '../../components/PredictionAccordion/PredictionAccordion';

export default function PredictionSection({ prediction, setPrediction, error, helperText, setErrors, API_BASE_URL, showModal }) {
  const generateId = () => crypto.randomUUID();
  const handleAddComponent = (index) => {
    setPrediction((prevPrediction) => {
      const newPrediction = [...prevPrediction];

      newPrediction.splice(index + 1, 0, {
        id: generateId(),
        uri: 'https://parts.igem.org/',
        new: false,
        identifier: '',
        name: '',
        description: '',
        role: '',
        sequence: '',
        sequence_length: '',
        availableNames: [],
      });

      return newPrediction;
    });
  };
  return (
    <>
      <Typography sx={{ fontWeight: 600, textAlign: 'justify' }}>Principal Component and Subcomponents</Typography>
      <Typography sx={{ textAlign: 'justify' }}>Add the general information about the circuit and select the predicted parts based on their identified roles. You can also replace, add, or remove components, and your changes will be reflected in the visual representation.
      </Typography>
      <Typography sx={{ fontWeight: 600, fontSize: '13px', mt: 1, mb: 4, textAlign: 'justify' }}>
        * The default parts are extracted from the iGEM repository.
      </Typography>
      {prediction.map((item, index) => (
        <div key={item.id}>
          <PredictionAccordion
            item={item}
            index={index}
            setPrediction={setPrediction}
            prediction={prediction}
            setErrors={setErrors}
            error={error?.[item.id]}
            helperText={helperText?.[item.id]}
            showModal={showModal}
            API_BASE_URL={API_BASE_URL}
          />

          <Box sx={{ display: 'flex', justifyContent: 'right' }}>
            <Button
              variant="text"
              onClick={() => handleAddComponent(index)}
              sx={{ mt: 1, mb: 1, textTransform: 'none', color: 'primary.main', backgroundColor: '#fff' }}
              size='small'
              startIcon={<AddCircleOutlineIcon />}>
              Add Component Here
            </Button>
          </Box>
        </div>
      ))}
    </>
  );
}
