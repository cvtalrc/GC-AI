/* eslint-disable react/prop-types */
import { FormControlLabel, Checkbox, Typography } from '@mui/material';

const Constitutive = ({ constitutive, onConstitutiveChange }) => {
  return (
    <>
      <FormControlLabel
        control={
          <Checkbox
            checked={constitutive}
            onChange={(event) => onConstitutiveChange(event.target.checked)}
            size='small'
            sx={{
              '& .MuiSvgIcon-root': {
                color: 'primary.main'
              }
            }}
          />
        }
        label="Constitutive"
      />
      <Typography sx={{ fontSize: '13px', color: 'primary.main', ml: .5, mb: 1 }}>Check if the operon is constitutive.</Typography>
    </>
  );
};

export default Constitutive;
