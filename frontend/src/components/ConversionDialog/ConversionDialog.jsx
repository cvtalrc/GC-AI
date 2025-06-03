/* eslint-disable react/prop-types */
import { useState } from 'react';
import { Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle, Button, Checkbox, FormControlLabel, FormGroup, Box } from '@mui/material';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';

const ConversionDialog = ({ open, handleClose, handleConvert }) => {
  const [selectedFormats, setSelectedFormats] = useState({
    fasta: false,
    genbank: false,
  });

  const handleCheckboxChange = (event) => {
    setSelectedFormats({
      ...selectedFormats,
      [event.target.name]: event.target.checked,
    });
  };

  const handleConfirm = () => {
    handleConvert(selectedFormats);
  };

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      aria-labelledby="conversion-dialog-title"
      ria-describedbya="conversion-dialog-description"
    >
      <Box sx={{ display: 'flex', flexDirection: 'row', mt: 2 }}>
        <CheckCircleOutlineIcon sx={{ fontSize: 35, color: 'primary.main', ml: 2.5, mt: 2 }} />
        <DialogTitle sx={{ mt: .3 }} id="conversion-dialog-title">
          {"Convert SBOL 3.1 File"}
        </DialogTitle>
      </Box>
      <DialogContent>
        <DialogContentText id="conversion-dialog-description" sx={{ mb: 2 }}>
          The SBOL 3.1 file has been successfully downloaded. Would you like to convert this file into another format? You can select multiple options.
        </DialogContentText>
        <FormGroup>
          <FormControlLabel
            control={<Checkbox checked={selectedFormats.fasta} onChange={handleCheckboxChange} name="fasta" sx={{
              '& .MuiSvgIcon-root': {
                color: 'primary.main'
              }
            }} />}
            label="Convert to FASTA"
          />
          <FormControlLabel
            control={<Checkbox checked={selectedFormats.genbank} onChange={handleCheckboxChange} name="genbank" sx={{
              '& .MuiSvgIcon-root': {
                color: 'primary.main'
              }
            }} />}
            label="Convert to GenBank"
          />
        </FormGroup>
      </DialogContent>
      <DialogActions sx={{ display: 'flex', justifyContent: 'center', p: 2, mb: 2 }}>
        <Button onClick={handleClose} color="primary" variant='outlined' fullWidth>
          No, Thanks
        </Button>
        <Button onClick={handleConfirm} color="primary" variant='contained' fullWidth disabled={!selectedFormats.fasta && !selectedFormats.genbank}>
          Convert
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default ConversionDialog;
